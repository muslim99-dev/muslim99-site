/**
 * Generates data/tafsir-editions.json — display metadata (title, author,
 * language, script direction, type) for every edition served by the
 * tafsir API (TAFSIR_API_URL). The API itself only returns slugs; its
 * dataset is the spa5k/tafsir_api collection, whose editions.json carries
 * the names/authors/languages (originally from quran.com / QUL). Editions
 * the API adds later still work on the site — they just fall back to a
 * title derived from the slug until this script is re-run.
 *
 * Usage:  node scripts/build-tafsir-editions.mjs
 */
import fs from "node:fs";
import path from "node:path";

const API = process.env.TAFSIR_API_URL || "https://gold-owl-974382.hostingersite.com";
const META_URL = "https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/editions.json";
const OUT = path.join(process.cwd(), "data", "tafsir-editions.json");

// Present in the API but not in spa5k's list.
const EXTRA = {
  "kashf-al-asrar-tafsir": {
    name: "Kashf al-Asrar",
    author_name: "Rashid al-Din Maybudi (tr. William Chittick)",
    language_name: "english"
  }
};

// spa5k's list often repeats the title as the author and is inconsistent
// in naming; these are the standard titles/authors of the works. Authors
// are left blank where the attribution isn't certain.
const OVERRIDES = {
  "abu-bakr-jabir-al-jazairi": ["Aysar al-Tafasir", "Abu Bakr Jabir al-Jaza'iri"],
  "adwa-al-bayan": ["Adwa' al-Bayan", "Muhammad al-Amin al-Shinqiti"],
  "al-bahr-al-muhit": ["Al-Bahr al-Muhit", "Abu Hayyan al-Gharnati"],
  "al-basit": ["Al-Tafsir al-Basit", "Al-Wahidi"],
  "al-dur-al-masun-lil-samin-al-halabi": ["Al-Durr al-Masun", "Al-Samin al-Halabi"],
  "al-durr-al-manthur": ["Al-Durr al-Manthur", "Jalal al-Din al-Suyuti"],
  "al-i-rab-al-muyassar": ["Al-I'rab al-Muyassar", ""],
  "al-jadwal-fi-i-rab-al-quran": ["Al-Jadwal fi I'rab al-Qur'an", "Mahmud Safi"],
  "al-kashshaf-al-zamakhshari": ["Al-Kashshaf", "Al-Zamakhshari"],
  "al-lubab-fi-ulum-al-kitab": ["Al-Lubab fi 'Ulum al-Kitab", "Ibn 'Adil al-Hanbali"],
  "al-muharrar-al-wajiz-ibn-atiyyah": ["Al-Muharrar al-Wajiz", "Ibn 'Atiyyah"],
  "al-muyassar-fi-al-gharib": ["Al-Muyassar fi Gharib al-Qur'an", ""],
  "al-nashr-li-ibn-al-jazari": ["Al-Nashr fi al-Qira'at al-'Ashr", "Ibn al-Jazari"],
  "al-qira-at-al-mawsoo-ah-al-qur-aniyyah": ["Al-Qira'at (Al-Mawsu'ah al-Qur'aniyyah)", ""],
  "al-wajiz-wahidi": ["Al-Wajiz", "Al-Wahidi"],
  "alrab-al-quran-li-da-as": ["I'rab al-Qur'an", "Al-Da''as, Hamidan & Al-Qasim"],
  "ar-tafseer-tahrir-al-tanwir": ["Al-Tahrir wa al-Tanwir", "Muhammad al-Tahir ibn 'Ashur"],
  "ar-tafsir-al-mukhtasar": ["Al-Mukhtasar fi Tafsir al-Qur'an", "Tafsir Center for Quranic Studies"],
  "ar-tafsir-al-tha-alibi": ["Tafsir al-Tha'alibi", ""],
  "ar-tafsir-al-tha-alibi-527": ["Tafsir al-Tha'alibi (second edition)", ""],
  "ar-tafsir-as-saadi": ["Taysir al-Karim al-Rahman (Tafsir al-Sa'di)", "'Abd al-Rahman al-Sa'di"],
  "asseraj-fi-bayan-gharib-alquran": ["Al-Siraj fi Bayan Gharib al-Qur'an", "Muhammad al-Khudayri"],
  "ayah-dependency-graphs": ["Ayah Dependency Graphs", ""],
  "fath-al-bayan-li-al-qanuji": ["Fath al-Bayan fi Maqasid al-Qur'an", "Siddiq Hasan Khan al-Qannauji"],
  "fath-al-qadir-al-shawkani": ["Fath al-Qadir", "Al-Shawkani"],
  "i-rab-al-quran-li-al-darwish": ["I'rab al-Qur'an wa Bayanuh", "Muhyi al-Din al-Darwish"],
  "jamia-al-bayan-aliji": ["Jami' al-Bayan", "Al-Iji"],
  "mahasin-al-ta-wil-al-qasimi": ["Mahasin al-Ta'wil", "Jamal al-Din al-Qasimi"],
  "mawsoo-at-al-tafsir-al-ma-thoor": ["Mawsu'at al-Tafsir al-Ma'thur", ""],
  "nazam-al-durar-al-biqa-i": ["Nazm al-Durar", "Burhan al-Din al-Biqa'i"],
  "tadabbur-wa-amal": ["Tadabbur wa 'Amal", ""],
  "tafsir-abi-al-su-ood": ["Irshad al-'Aql al-Salim", "Abu al-Su'ud"],
  "tafsir-al-alusi": ["Ruh al-Ma'ani", "Al-Alusi"],
  "tafsir-al-baydawi": ["Anwar al-Tanzil", "Al-Baydawi"],
  "tafsir-al-mawardi": ["Al-Nukat wa al-'Uyun", "Al-Mawardi"],
  "tafsir-al-nasafi": ["Madarik al-Tanzil", "Al-Nasafi"],
  "tafsir-al-razi": ["Mafatih al-Ghayb", "Fakhr al-Din al-Razi"],
  "tafsir-al-sam-ani": ["Tafsir al-Sam'ani", "Abu al-Muzaffar al-Sam'ani"],
  "tafsir-al-samarqandi": ["Bahr al-'Ulum", "Abu al-Layth al-Samarqandi"],
  "tafsir-ibn-abi-hatim": ["Tafsir Ibn Abi Hatim", "Ibn Abi Hatim al-Razi"],
  "tafsir-ibn-abi-zamanin": ["Tafsir Ibn Abi Zamanin", "Ibn Abi Zamanin"],
  "tafsir-ibn-al-jawzi": ["Zad al-Masir", "Ibn al-Jawzi"],
  "tafsir-ibn-al-qayyim": ["Tafsir Ibn al-Qayyim", "Ibn Qayyim al-Jawziyyah"],
  "tafsir-ibn-juzay": ["Al-Tashil li 'Ulum al-Tanzil", "Ibn Juzayy al-Kalbi"],
  "tafsir-ibn-uthaymeen": ["Tafsir Ibn 'Uthaymin", "Muhammad ibn Salih al-'Uthaymin"],
  "tafsir-makhi": ["Al-Hidayah ila Bulugh al-Nihayah", "Makki ibn Abi Talib"],
  "tahlil-kalimat-al-qur-an": ["Tahlil Kalimat al-Qur'an", ""],
  "en-al-jalalayn": ["Tafsir al-Jalalayn", "Jalal al-Din al-Mahalli & Jalal al-Din al-Suyuti"],
  "tafsir-al-jalalayn": ["Tafsir al-Jalalayn (second English edition)", "Jalal al-Din al-Mahalli & Jalal al-Din al-Suyuti"],
  "en-al-qushairi-tafsir": ["Lata'if al-Isharat", "Abu al-Qasim al-Qushayri"],
  "en-asbab-al-nuzul-by-al-wahidi": ["Asbab al-Nuzul", "Al-Wahidi"],
  "en-kashani-tafsir": ["Tafsir al-Kashani", "'Abd al-Razzaq al-Kashani"],
  "en-kashf-al-asrar-tafsir": ["Kashf al-Asrar", "Rashid al-Din Maybudi"],
  "kashf-al-asrar-tafsir": ["Kashf al-Asrar (alternate text)", "Rashid al-Din Maybudi"],
  "en-tafsir-al-tustari": ["Tafsir al-Tustari", "Sahl al-Tustari"],
  "en-tafsir-ibn-abbas": ["Tanwir al-Miqbas min Tafsir Ibn 'Abbas", "Attributed to Ibn 'Abbas"],
  "en-tafsir-al-mukhtasar": ["Al-Mukhtasar in Interpreting the Noble Qur'an", "Tafsir Center for Quranic Studies"],
  "tazkirul-quran-en": ["Tazkirul Quran", "Maulana Wahiduddin Khan"],
  "tazkiru-quran-ur": ["Tazkirul Quran", "Maulana Wahiduddin Khan"],
  "tafseer-ibn-e-kaseer-urdu": ["Tafsir Ibn Kathir", "Hafiz Ibn Kathir"],
  "tafsir-bayan-ul-quran": ["Bayan ul Quran", "Dr. Israr Ahmad"],
  "ur-tafsir-bayan-ul-quran": ["Bayan ul Quran (second edition)", "Dr. Israr Ahmad"],
  "tafsir-fe-zalul-quran-syed-qatab": ["Fi Zilal al-Qur'an", "Sayyid Qutb"],
  "ru-tafsir-ibne-kahtir": ["Tafsir Ibn Kathir", "Hafiz Ibn Kathir"],
  "tr-tafsir-ibne-kathir": ["Tafsir Ibn Kathir", "Hafiz Ibn Kathir"],
  "in-tafsir-jalalayn": ["Tafsir al-Jalalayn", "Jalal al-Din al-Mahalli & Jalal al-Din al-Suyuti"],
  "tafisr-fathul-majid-bn": ["Tafsir Fathul Majid", "AbdulRahman Bin Hasan Al-Alshaikh"],
  "kurd-tafsir-rebar": ["Rebar Kurdish Tafsir", ""],
  "ar-tafseer-al-qurtubi": ["Al-Jami' li-Ahkam al-Qur'an (Tafsir al-Qurtubi)", "Al-Qurtubi"],
  "ar-tafseer-al-saddi": ["Tafsir As-Sa'di", "'Abd al-Rahman al-Sa'di"],
  "ru-tafseer-al-saddi": ["Tafsir As-Sa'di", "'Abd al-Rahman al-Sa'di"],
  "ar-tafseer-tanwir-al-miqbas": ["Tanwir al-Miqbas min Tafsir Ibn 'Abbas", "Attributed to Ibn 'Abbas"],
  "ar-tafsir-al-baghawi": ["Ma'alim al-Tanzil (Tafsir al-Baghawi)", "Al-Baghawi"],
  "ar-tafsir-al-tabari": ["Jami' al-Bayan (Tafsir al-Tabari)", "Ibn Jarir al-Tabari"],
  "ar-tafsir-al-wasit": ["Al-Tafsir al-Wasit", ""],
  "ar-tafsir-al-jalalayn": ["Tafsir al-Jalalayn", "Jalal al-Din al-Mahalli & Jalal al-Din al-Suyuti"],
  "ar-tafsir-muyassar": ["Al-Tafsir al-Muyassar", "King Fahd Qur'an Printing Complex"],
  "bn-tafseer-ibn-e-kaseer": ["Tafsir Ibn Kathir", "Hafiz Ibn Kathir (Tawheed Publication)"],
  "en-tazkirul-quran": ["Tazkirul Quran", "Maulana Wahiduddin Khan"],
  "ur-tazkirul-quran": ["Tazkirul Quran", "Maulana Wahiduddin Khan"]
};

const LANGUAGE_FIX = { "central khmer": "Khmer", fulah: "Fulani", uighur: "Uyghur", kurdish: "Kurdish", azeri: "Azerbaijani" };
const RTL = new Set(["Arabic", "Urdu", "Persian", "Pashto", "Kurdish", "Uyghur"]);

function typeOf(slug) {
  if (/mokhtasar|mukhtasar/.test(slug)) return "Concise (Al-Mukhtasar)";
  if (/i-rab|irab|alrab|jadwal|dependency-graphs|dur-al-masun/.test(slug)) return "Grammar & I'rab";
  if (/qira-at|nashr/.test(slug)) return "Qira'at (Recitations)";
  if (/gharib|tahlil-kalimat/.test(slug)) return "Vocabulary (Gharib)";
  if (/asbab-al-nuzul/.test(slug)) return "Occasions of Revelation";
  return "Tafsir";
}

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const meta = await (await fetch(META_URL)).json();
const bySlug = Object.fromEntries((Array.isArray(meta) ? meta : meta.editions).map((e) => [e.slug, e]));
const { editions } = await (await fetch(`${API}/api/editions`)).json();

const out = await Promise.all(editions.map(async (e) => {
  const m = bySlug[e.slug] ?? EXTRA[e.slug];
  if (!m) console.warn(`No metadata for ${e.slug}`);
  const raw = (m?.language_name ?? "arabic").toLowerCase();
  const language = LANGUAGE_FIX[raw] ?? titleCase(raw);
  let name = (m?.name ?? titleCase(e.slug.replace(/-/g, " "))).trim();
  let author = (m?.author_name ?? "").trim();
  if (OVERRIDES[e.slug]) [name, author] = OVERRIDES[e.slug];
  else if (/mokhtasar|mukhtasar/.test(e.slug)) [name, author] = ["Al-Mukhtasar in Interpreting the Noble Qur'an", "Tafsir Center for Quranic Studies"];
  else if (/saadi/.test(e.slug)) [name, author] = ["Tafsir As-Sa'di", "'Abd al-Rahman al-Sa'di"];
  if (author === name) author = "";
  // An edition whose every surah reports zero commentary is empty on the server.
  const { surahs: counts } = await (await fetch(`${API}/api/editions/${e.slug}/surahs`)).json();
  const known = counts.filter((c) => typeof c.ayahs_with_tafsir === "number");
  const empty = known.length === counts.length && known.every((c) => c.ayahs_with_tafsir === 0);
  return {
    slug: e.slug,
    name,
    author,
    language,
    dir: RTL.has(language) ? "rtl" : "ltr",
    type: typeOf(e.slug),
    surahs: e.total_surahs,
    ...(empty ? { empty: true } : {})
  };
}));

fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
const langs = new Set(out.map((e) => e.language));
console.log(`Wrote ${out.length} editions in ${langs.size} languages to ${path.relative(process.cwd(), OUT)}`);
const empty = out.filter((e) => e.empty).map((e) => e.slug);
if (empty.length) console.log(`Empty on the server (hidden on the site): ${empty.join(", ")}`);
