"""
Imports the hadith collections Muslim99 didn't already have from the
HsnSaboor/hadith-api-toon dataset (https://github.com/HsnSaboor/hadith-api-toon,
built from al-hadees.com, sunnah.com and fawazahmed0/hadith-api) into
data/hadith_extra, in the same layout as data/hadith_data but with gzipped
chapter files:

  data/hadith_extra/<Collection>/collection.json
  data/hadith_extra/<Collection>/books/Book_<n>/book.json
  data/hadith_extra/<Collection>/books/Book_<n>/chapters/chap_<m>.json.gz

scripts/build-hadith-index.mjs then indexes them like the rest.

Data checks applied (see the PR / commit message for the numbers):
  - translations whose length doesn't track the Arabic (misaligned) are dropped:
    Bulugh al-Maram English, Ibn Hibban English (only 186 of 7,466 present),
    Daraqutni English in section 21;
  - Majma al-Zawa'id grades are dropped (every hadith is marked "Sahih").
Every collection carries a translation note: the Arabic is the source text;
the Urdu/English haven't been checked against a published translation and
some are machine-translated.

Usage:
  git clone --filter=blob:none --depth 1 https://github.com/HsnSaboor/hadith-api-toon
  python scripts/import-hadith-toon.py path/to/hadith-api-toon
"""
import csv, gzip, io, json, os, re, shutil, sys

csv.field_size_limit(10**9)
SRC = os.path.join(sys.argv[1] if len(sys.argv) > 1 else "hadith-api-toon", "editions")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "hadith_extra")

# toon id -> (folder / display name, Urdu name, Arabic name, author)
COLLECTIONS = {
    "sahih-ibn-khuzaymah": ("Sahih Ibn Khuzaymah", "صحیح ابن خزیمہ", "صحيح ابن خزيمة", "Imam Muhammad ibn Ishaq Ibn Khuzaymah"),
    "ibnhibban": ("Sahih Ibn Hibban", "صحیح ابن حبان", "صحيح ابن حبان", "Imam Muhammad ibn Hibban al-Busti"),
    "abdurrazzaq": ("Musannaf Abd al-Razzaq", "مصنف عبدالرزاق", "مصنف عبد الرزاق", "Imam Abd al-Razzaq al-San'ani"),
    "sunan-al-daraqutni": ("Sunan al-Daraqutni", "سنن دارقطنی", "سنن الدارقطني", "Imam Ali ibn Umar al-Daraqutni"),
    "nasai-kubra": ("Al-Sunan al-Kubra Nasai", "السنن الکبریٰ للنسائی", "السنن الكبرى للنسائي", "Imam Ahmad ibn Shu'ayb al-Nasa'i"),
    "musnad-al-tayalisi": ("Musnad al-Tayalisi", "مسند طیالسی", "مسند الطيالسي", "Imam Abu Dawud Sulayman ibn Dawud al-Tayalisi"),
    "musnad-al-bazzar": ("Musnad al-Bazzar", "مسند بزار", "مسند البزار", "Imam Ahmad ibn Amr al-Bazzar"),
    "musnad-abi-yala-al-mawsili": ("Musnad Abu Yala", "مسند ابی یعلیٰ", "مسند أبي يعلى الموصلي", "Imam Ahmad ibn Ali Abu Ya'la al-Mawsili"),
    "musnad-al-humaydi": ("Musnad al-Humaydi", "مسند حمیدی", "مسند الحميدي", "Imam Abdullah ibn al-Zubayr al-Humaydi"),
    "al-mujam-al-kabir": ("Al-Mujam al-Kabir Tabarani", "المعجم الکبیر للطبرانی", "المعجم الكبير للطبراني", "Imam Sulayman ibn Ahmad al-Tabarani"),
    "al-mujam-al-awsat": ("Al-Mujam al-Awsat Tabarani", "المعجم الاوسط للطبرانی", "المعجم الأوسط للطبراني", "Imam Sulayman ibn Ahmad al-Tabarani"),
    "sharh-maani-al-athar": ("Sharh Maani al-Athar", "شرح معانی الآثار", "شرح معاني الآثار", "Imam Abu Ja'far al-Tahawi"),
    "sharh-mushkil-al-athar": ("Sharh Mushkil al-Athar", "شرح مشکل الآثار", "شرح مشكل الآثار", "Imam Abu Ja'far al-Tahawi"),
    "al-muntaqa": ("Al-Muntaqa Ibn al-Jarud", "المنتقیٰ لابن الجارود", "المنتقى لابن الجارود", "Imam Abdullah ibn Ali Ibn al-Jarud"),
    "riyadussalihin": ("Riyad as-Salihin", "ریاض الصالحین", "رياض الصالحين", "Imam Yahya ibn Sharaf al-Nawawi"),
    "nawawi": ("Al-Arbain al-Nawawiyyah", "اربعین نووی", "الأربعون النووية", "Imam Yahya ibn Sharaf al-Nawawi"),
    "bulugh-al-maram": ("Bulugh al-Maram", "بلوغ المرام", "بلوغ المرام", "Imam Ibn Hajar al-Asqalani"),
    "alzawaid": ("Majma al-Zawaid", "مجمع الزوائد", "مجمع الزوائد ومنبع الفوائد", "Imam Nur al-Din al-Haythami"),
    "al-ahadith-al-mukhtarah": ("Al-Ahadith al-Mukhtarah", "الاحادیث المختارہ", "الأحاديث المختارة", "Imam Diya al-Din al-Maqdisi"),
}

DROP_TRANSLATION = {("bulugh-al-maram", "en", None), ("ibnhibban", "en", None), ("sunan-al-daraqutni", "en", "21")}
DROP_GRADES = {"alzawaid"}
GROUP_SECTIONS = {"sahih-ibn-khuzaymah": 25}  # sections are individual babs

NOTE = (
    "The Arabic is the original text. The Urdu and English translations come from the open "
    "Hadith API (Toon) dataset and haven't been checked against a published translation — "
    "some are machine-translated, so rely on the Arabic for exact wording."
)

MAX_CHAPTER = 40
HDR = re.compile(r"^\s*(\w[\w-]*)\[(\d+)\]\{([^}]*)\}:\s*$")
ARABIC = re.compile(r"[؀-ۿ]")


def parse(path):
    lines = open(path, encoding="utf-8").read().split("\n")
    out, meta, i = {}, {}, 0
    while i < len(lines):
        m = HDR.match(lines[i])
        if m:
            name, cols = m.group(1), m.group(3).split(",")
            j, buf = i + 1, []
            while j < len(lines) and not HDR.match(lines[j]) and not re.match(r"^\w[\w-]*:\s*$", lines[j]):
                buf.append(lines[j])
                j += 1
            rows = csv.reader(io.StringIO("\n".join(buf)), skipinitialspace=True)
            out[name] = [dict(zip(cols, r)) for r in rows if r and any(x.strip() for x in r)]
            i = j
            continue
        mm = re.match(r"^\s+([\w-]+):\s*(.*)$", lines[i])
        if mm:
            v = mm.group(2)
            if v.startswith('"') and v.endswith('"'):
                v = v[1:-1].replace('""', '"')
            meta[mm.group(1)] = v.replace('\\"', '"')
        i += 1
    out["metadata"] = meta
    return out


def clean(t):
    t = (t or "").replace("\r", "").strip()
    t = re.sub(r"\[AI[- ]translation\]", "", t).strip()
    return t


def grade(g):
    parts = []
    for p in (g or "").split("|"):
        p = p.strip()
        if p and p not in parts:
            parts.append(p)
    return " / ".join(parts)


def usable_intro(intro, book_names):
    s = (intro or "").strip()
    if not s or s in book_names:
        return False
    if re.match(r"^(كتاب|كِتَابُ|The Book|Book of|40 Hadith|Hadith an-Nawawi)", s):
        return False
    return True


def split_intro(s):
    """'<Arabic><Urdu>' as in Daraqutni ('بَابُ التَّيَمُّمِباب۔ تیمم کا بیان') -> (ar, ur)."""
    m = re.match(r"^(.*?)(باب۔.*)$", s)
    if m and m.group(1):
        return m.group(1).strip(), m.group(2).strip()
    return s, ""


def chapter_title(titles):
    shown = titles[:3]
    ar, ur, en = [], [], []
    for t in shown:
        if ARABIC.search(t):
            a, u = split_intro(t)
            ar.append(a)
            if u:
                ur.append(u)
        else:
            en.append(t)
    more = " …" if len(titles) > 3 else ""
    return {
        "arabic": (" · ".join(ar) + more) if ar else "",
        "urdu": (" · ".join(ur) + more) if ur else "",
        "english": (" · ".join(en) + more) if en else "",
    }


def build_chapters(rows, book_names):
    """rows: hadith dicts (with '_intro') in order -> list of (titles, hadiths)."""
    runs = []
    for h in rows:
        intro = h.pop("_intro")
        key = intro if usable_intro(intro, book_names) else None
        if runs and runs[-1][0] == key:
            runs[-1][1].append(h)
        else:
            runs.append([key, [h]])
    chapters = []
    for key, hs in runs:
        titles = [key] if key else []
        if chapters and len(hs) < 3 and len(chapters[-1][1]) < 15:
            chapters[-1][0].extend(titles)
            chapters[-1][1].extend(hs)
        else:
            chapters.append([titles, list(hs)])
    out = []
    for titles, hs in chapters:
        parts = [hs[i : i + MAX_CHAPTER] for i in range(0, len(hs), MAX_CHAPTER)]
        for n, part in enumerate(parts):
            t = chapter_title(titles)
            if not any(t.values()):
                t["english"] = f"Hadith {part[0]['hadith_number']}–{part[-1]['hadith_number']}"
            elif len(parts) > 1:
                t = {k: (f"{v} ({n + 1})" if v else v) for k, v in t.items()}
            out.append((t, part))
    return out


def number(s, fallback):
    m = re.search(r"\d+", s or "")
    return int(m.group()) if m else fallback


def write_json(path, data, gz=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    raw = json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    if gz:
        with gzip.open(path, "wb", compresslevel=9) as f:
            f.write(raw)
    else:
        open(path, "wb").write(raw)


def run():
    shutil.rmtree(OUT, ignore_errors=True)
    for cid, (name, name_ur, name_ar, author) in COLLECTIONS.items():
        base = os.path.join(SRC, cid)
        info = parse(os.path.join(base, "info.toon"))
        meta = info["metadata"]
        sections = sorted(info.get("sections", []), key=lambda s: int(s["id"]))
        names = {name, name_ar, meta.get("book_name", ""), "صحيح ابن خزيمة"}

        def load(sec_id):
            ar = parse(os.path.join(base, "sections", f"{sec_id}.toon")).get("hadiths", [])
            tr = {}
            for lang in ("ur", "en"):
                p = os.path.join(base, "translations", lang, "sections", f"{sec_id}.toon")
                drop = (cid, lang, None) in DROP_TRANSLATION or (cid, lang, sec_id) in DROP_TRANSLATION
                tr[lang] = {} if drop or not os.path.exists(p) else {
                    r["hadithnumber"]: clean(r.get("text")) for r in parse(p).get("hadiths", [])
                }
            rows = []
            for i, r in enumerate(ar):
                hn = r["hadithnumber"]
                h = {
                    "hadith_number": number(hn, i + 1),
                    "arabic_text": clean(r.get("arabic")),
                    "urdu_translation": tr["ur"].get(hn, ""),
                    "english_translation": tr["en"].get(hn, ""),
                    "_intro": r.get("chapter_intro", ""),
                }
                g = "" if cid in DROP_GRADES else grade(r.get("grades"))
                if g:
                    h["status"] = g
                if r.get("international_number", "").strip():
                    h["reference"] = {"international_number": r["international_number"].strip()}
                if h["arabic_text"]:
                    rows.append(h)
            return rows

        # Books: one per section, or groups of sections (each section then a chapter).
        books = []
        group = GROUP_SECTIONS.get(cid)
        if group:
            for g0 in range(0, len(sections), group):
                secs = sections[g0 : g0 + group]
                chapters = []
                for s in secs:
                    rows = load(s["id"])
                    for h in rows:
                        h.pop("_intro", None)
                    if rows:
                        chapters.append(({"arabic": s.get("name_ar", ""), "urdu": s.get("name_ur", ""), "english": s.get("name_en", "")}, rows))
                a, b = g0 + 1, g0 + len(secs)
                books.append(({"arabic": f"الأبواب {a}–{b}", "urdu": f"ابواب {a}–{b}", "english": f"Chapters {a}–{b}"}, chapters))
        else:
            for s in sections:
                rows = load(s["id"])
                if not rows:
                    continue
                title = {"arabic": s.get("name_ar", ""), "urdu": s.get("name_ur", ""), "english": s.get("name_en", "") or s.get("name", "")}
                if len(sections) == 1 or title["arabic"] in names or title["english"] == meta.get("book_name"):
                    first, last = rows[0]["hadith_number"], rows[-1]["hadith_number"]
                    title = {"arabic": "", "urdu": "", "english": f"Hadith {first}–{last}" if len(sections) > 1 else name}
                books.append((title, build_chapters(rows, names | {title["arabic"], title["english"]})))

        col_dir = os.path.join(OUT, name)
        total = 0
        for bn, (title, chapters) in enumerate(books, 1):
            n_h = sum(len(h) for _, h in chapters)
            total += n_h
            write_json(os.path.join(col_dir, "books", f"Book_{bn}", "book.json"),
                       {"number": bn, **title, "total_chapters": len(chapters), "total_hadiths": n_h})
            for cn, (ct, hs) in enumerate(chapters, 1):
                write_json(os.path.join(col_dir, "books", f"Book_{bn}", "chapters", f"chap_{cn}.json.gz"),
                           {"number": cn, **ct, "total_hadiths": len(hs), "hadiths": hs}, gz=True)
        write_json(os.path.join(col_dir, "collection.json"), {
            "name": name, "name_arabic": name_ar, "name_urdu": name_ur,
            "author": author,
            "intro": meta.get("intro_en") or meta.get("intro", ""),
            "intro_urdu": meta.get("intro_ur", ""),
            "source": "Hadith API (Toon) dataset — github.com/HsnSaboor/hadith-api-toon",
            "translation_note": NOTE,
            "total_hadiths": total, "total_books": len(books),
        })
        print(f"{name:32} {len(books):4} books {sum(len(c) for _, c in books):5} chapters {total:6} hadiths")


run()
