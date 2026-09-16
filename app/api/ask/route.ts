import { NextRequest, NextResponse } from "next/server";
import { searchQuran, attachTafsir, searchHadith } from "@/lib/rag";
import { askGroq } from "@/lib/groq";
import { TAFSIRS } from "@/lib/tafsir";
import { getHadithBooks } from "@/lib/hadith";
import { TRANSLATIONS } from "@/lib/translations";
import { RECITERS } from "@/lib/reciters";
import { TRANSLATION_VOICES } from "@/lib/translationVoices";

export async function POST(req: NextRequest) {
  let question: string;
  let language: string;
  try {
    const body = await req.json();
    question = String(body.question ?? "").trim();
    language = String(body.language ?? "English").trim().slice(0, 40) || "English";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!question) return NextResponse.json({ error: "Question is required" }, { status: 400 });
  if (question.length > 1000) return NextResponse.json({ error: "Question is too long" }, { status: 400 });

  let sources: Awaited<ReturnType<typeof searchQuran>> = [];
  let enriched: Awaited<ReturnType<typeof attachTafsir>> = [];
  let hadithMatches: Awaited<ReturnType<typeof searchHadith>> = [];
  try {
    [sources, hadithMatches] = await Promise.all([searchQuran(question, 5), searchHadith(question, 4)]);
    enriched = await attachTafsir(sources);
  } catch {
    sources = [];
    enriched = [];
    hadithMatches = [];
  }

  const quranContext = enriched.length
    ? enriched
        .map((v) => {
          const base = `[Quran ${v.surahNumber}:${v.numberInSurah}, ${v.surahName}] "${v.text}"`;
          return v.tafsir ? `${base}\nTafsir (Ibn Kathir, Arabic): ${v.tafsir}` : base;
        })
        .join("\n\n")
    : "(No specific Quran verses matched this question in the search.)";

  const hadithContext = hadithMatches.length
    ? hadithMatches.map((h) => `[Hadith: ${h.bookName} #${h.hadithnumber}] "${h.text}"`).join("\n\n")
    : "(No specific hadiths matched this question in the search.)";

  const context = `${quranContext}\n\n${hadithContext}`;

  const tafsirLibrary = TAFSIRS.map((t) => `${t.name} — ${t.author}`).join("; ");

  let hadithLibrary = "(couldn't load the hadith book list right now)";
  try {
    const books = await getHadithBooks();
    hadithLibrary = books.map((b) => b.name).join(", ");
  } catch {
    // keep the fallback string
  }

  // Prompt instructions alone weren't reliable enough — the model correctly
  // declined an unavailable-book question once, then hallucinated an answer
  // for the same topic on a later request. So this is enforced in code, not
  // just asked for: a tiny, narrowly-scoped call ONLY extracts whether the
  // question names a specific tafsir/scholar (nothing else, no content), and
  // that name is checked against the real library with plain string
  // matching. If it doesn't match, the main content-generating call never
  // runs for that source at all — there's no path left for the model to
  // improvise an answer about a book we don't have.
  let namedSource: string | null = null;
  try {
    const raw = await askGroq(
      [
        {
          role: "system",
          content:
            'Output exactly one line, nothing else: "SOURCE: <name>" if the user names one specific tafsir book, hadith collection (e.g. Sahih Bukhari), Quran translation/translator (e.g. Kanz-ul-Iman, Yusuf Ali), reciter/qari, or Islamic scholar/commentator, and is asking whether it\'s available or about its content/views. Otherwise output "SOURCE: NONE" (general Quran/Hadith/fiqh questions with no specific named source count as NONE).'
        },
        { role: "user", content: question }
      ],
      { maxTokens: 150, temperature: 0, reasoningEffort: "low" }
    );
    const match = raw.match(/SOURCE:\s*(.+)/i);
    const name = match?.[1]?.trim();
    namedSource = name && name.toUpperCase() !== "NONE" ? name : null;
  } catch (err) {
    console.error("classification call failed:", err);
    namedSource = null;
  }

  // Rather than dumping the full 118-translation / 152-reciter lists into
  // every single prompt (which bloated requests enough to make the model
  // run out of its token budget on reasoning and return nothing), only the
  // specific item actually matched here — if any — gets handed to the main
  // call as a small, targeted fact.
  let matchedSourceInfo: string | null = null;

  if (namedSource) {
    // Comparing whole strings after stripping everything but letters/digits
    // handles spelling variants that a naive substring check misses — e.g.
    // "Kanz-ul-Iman" (hyphens, "Iman") vs. the stored id "ur.kanzuliman" or
    // the display name "...(Kanzul Eman)" (no hyphens, "Eman"). Checking
    // only the first word of a name (the old logic) matched "Ala" against
    // everything and missed the part that actually identifies the source.
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const needle = clean(namedSource);
    const matchWord = (...fields: string[]) =>
      needle.length >= 4 &&
      fields.some((f) => {
        const c = clean(f);
        return c.length >= 4 && (c.includes(needle) || needle.includes(c));
      });

    const matchedTafsir = TAFSIRS.find((t) => matchWord(t.name, t.author, t.slug));
    const matchedHadithBook = hadithLibrary.split(", ").find((b) => matchWord(b));
    const matchedTranslation = TRANSLATIONS.find((t) => matchWord(t.author, t.id));
    const matchedReciter = RECITERS.find((r) => matchWord(r.name, r.id));
    const matchedVoice = TRANSLATION_VOICES.find((v) => matchWord(v.narrator, v.id));

    const isKnown = !!(matchedTafsir || matchedHadithBook || matchedTranslation || matchedReciter || matchedVoice);

    if (matchedTafsir) matchedSourceInfo = `Tafsir "${matchedTafsir.name}" by ${matchedTafsir.author} IS available on this app.`;
    else if (matchedHadithBook) matchedSourceInfo = `The hadith collection "${matchedHadithBook}" IS available on this app.`;
    else if (matchedTranslation)
      matchedSourceInfo = `The Quran translation by ${matchedTranslation.author} (${matchedTranslation.language}) IS available on this app.`;
    else if (matchedReciter) matchedSourceInfo = `The reciter "${matchedReciter.name}" IS available on this app.`;
    else if (matchedVoice)
      matchedSourceInfo = `The translation-narration voice "${matchedVoice.narrator}" (${matchedVoice.language}) IS available on this app.`;

    if (!isKnown) {
      try {
        const decline = await askGroq(
          [
            {
              role: "system",
              content: `Translate this exact sentence into ${language} (or write it in ${language} if translation isn't literal), and output ONLY that translated sentence, nothing else: "I'm sorry, but I don't have this book/source/reciter/translation in my verified library — please ask about the Quran, Hadith, or something else this app actually provides."`
            }
          ],
          { maxTokens: 300, temperature: 0, reasoningEffort: "low" }
        );
        return NextResponse.json({ answer: decline.trim(), sources: [] });
      } catch {
        return NextResponse.json({
          answer: "I'm sorry, but I don't have this book/source/reciter/translation in my verified library.",
          sources: []
        });
      }
    }
  }

  const systemPrompt = `You are the "Ask" assistant on Muslim99, an Islamic companion app. You ONLY answer questions about Islam — the Quran, Hadith, tafsir, fiqh, Islamic history, the Prophets, worship and spiritual practice (prayer, fasting, zakat, hajj, dua, dhikr), Islamic ethics, or the Muslim99 app itself.

If the question is NOT about one of those topics (e.g. math, general trivia, coding, unrelated small talk, other religions' unrelated topics, etc.), do not answer it. Instead, reply with a brief, polite one- or two-sentence message in ${language} explaining that you're focused on Islamic topics and inviting them to ask something about the Quran, Hadith, or Islamic practice instead. Do not lecture or over-explain — just redirect briefly and warmly.

CRITICAL — never guess at facts you cannot verify, especially book titles, author names, publication details, or attributions. This app's whole design principle is that content is fetched from verified sources, never fabricated, and you must follow that same rule. If you are asked to identify or describe a specific book/scholar/source and you are not confident of the exact facts (author's full name, dates, etc.), say plainly that you don't have verified information on it rather than producing a plausible-sounding guess — a wrong guess dressed up as fact is worse than admitting you don't know.

This app's own tafsir library (the only tafsir commentary this app actually provides, each independently verified for public-domain/safe licensing status) is: ${tafsirLibrary}. If asked whether a specific tafsir book is available here, or to identify its author, check against this exact list — if it's not on the list, say this app doesn't currently provide it and that you don't have independently verified authorship details to share, rather than inventing an author name.

This app's Hadith library (real collections it actually provides, each in multiple languages) is: ${hadithLibrary}. This is real data the app has — never claim the app has "no hadith data" or "no specific data about hadith books" when these collections do exist; if asked whether a hadith book is available, check this list and say yes/no accurately. A live keyword search of Sahih al-Bukhari and Sahih Muslim's actual text (see the retrieved hadiths below) runs for every question, so when it finds real matches, cite and use them — but if nothing relevant was retrieved for this specific question, don't invent a hadith's wording or grading; say so and suggest the user browse the app's Hadith section (which also has 8 more collections beyond these two) for the exact text.

This app also provides many Quran translations (many languages, with translator attribution), many reciters/qaris for audio, and a handful of separate translation-narration audio voices. You don't have the full lists of those memorized in this conversation, so for a specific one: ${matchedSourceInfo ?? "no specific one was confirmed as available for this question — say you're not certain rather than guessing whether it's available."} Never invent whether a specific translation, reciter, or narration voice exists — only state it's available if told so above, and otherwise say you're not sure and suggest checking the app's Quran/Reciters pages directly.

You still don't have retrieved verse-by-verse translation TEXT for this specific question unless it appears in the retrieved verses below — so don't invent specific translated wording of a verse from a named translator unless it's actually in the retrieved context.

For questions that ARE in scope: ground your answer ONLY in the verses, tafsir, and hadiths retrieved below. Cite each Quran verse you actually use in the exact format "SurahNumber:AyahNumber" (e.g. 2:45) — never invent a reference, and never write a number in that digit:digit shape for anything other than a verse you are actually citing from the list. Cite each hadith you actually use in the exact format "BookName #Number" (e.g. "Sahih al-Bukhari #1") exactly as it appears in the retrieved list below — never invent a hadith number or wording that isn't in the retrieved list; if no hadith was retrieved that's relevant, don't mention specific hadith numbers/wording at all, just say the app's Hadith section has more on this. The Arabic tafsir excerpts (classical commentary by Ibn Jarir/Ibn Kathir-style scholars, via the retrieved list) are there to deepen and correctly contextualize your explanation of a verse — read and use them even though they're in Arabic, but always write your actual answer in ${language}; never quote the raw Arabic tafsir text back at the user untranslated. If the retrieved verses/hadiths aren't actually relevant to this particular in-scope question, ignore them and don't cite anything — don't force a connection. Keep answers concise and clear. If a question calls for a qualified scholar's ruling (fiqh edge cases, personal fatwas), say so instead of presenting your own guess as authoritative.

Respond in ${language} in all cases, regardless of what language the question, the retrieved verses, or the tafsir excerpts below are in — while keeping the Surah:Ayah and "BookName #Number" citation formats unchanged (untranslated).

Write in PLAIN TEXT only — the chat UI does not render markdown, so never use **bold**, *italic*, # headers, or markdown bullet/numbered lists. Use plain line breaks and a simple "- " or "1." prefix for lists if needed, with no asterisks or hash symbols anywhere.

Retrieved verses, tafsir, and hadiths (from a live Quran search + classical tafsir + hadith search, may or may not be relevant):
${context}`;

  try {
    const answer = await askGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ]);

    // The model decides which retrieved verses/hadiths are actually
    // relevant — it may ignore all of them (e.g. an unrelated question)
    // even though the search found something. Only show what it actually
    // cited, rather than everything the keyword search happened to match.
    const citedRefs = new Set((answer.match(/\d{1,3}:\d{1,3}/g) ?? []));
    const citedSources = sources.filter((s) => citedRefs.has(`${s.surahNumber}:${s.numberInSurah}`));

    const citedHadithNumbers = new Set((answer.match(/#(\d+)/g) ?? []).map((m) => m.slice(1)));
    const citedHadiths = hadithMatches.filter((h) => citedHadithNumbers.has(String(h.hadithnumber)));

    // Belt-and-suspenders: strip any markdown the model wrote anyway, since
    // the chat UI renders plain text and literal "**word**" looks broken.
    const plainAnswer = answer.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#+\s*/gm, "").replace(/\*(.+?)\*/g, "$1");

    return NextResponse.json({ answer: plainAnswer, sources: citedSources, hadithSources: citedHadiths });
  } catch {
    return NextResponse.json({ error: "The assistant is temporarily unavailable." }, { status: 502 });
  }
}
