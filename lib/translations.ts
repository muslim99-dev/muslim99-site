/**
 * TRANSLATIONS
 * ------------------------------------------------------------------
 * Every entry mirrors api.alquran.cloud's own translation-edition
 * catalog (format=text&type=translation), spot-checked live against
 * the API before being added. `author` uses the edition's englishName
 * where the source provides one; a few very old/anonymous editions
 * only have a language label there, in which case the source's own
 * `name` field is used instead — never a guessed name.
 *
 * A few entries (id prefixed "qdc.") aren't in alquran.cloud's catalog
 * at all and are instead fetched live from quran.com's own translation
 * resources by numeric id — see getQuranComTranslation in quranApi.ts.
 */

export type TranslationEdition = {
  id: string;
  author: string;
  language: string;
};

export const TRANSLATIONS: TranslationEdition[] = [
  { id: "az.mammadaliyev", author: "Vasim Mammadaliyev and Ziya Bunyadov", language: "Azerbaijani" },
  { id: "az.musayev", author: "Alikhan Musayev", language: "Azerbaijani" },
  { id: "bn.bengali", author: "Muhiuddin Khan", language: "Bengali" },
  { id: "cs.hrbek", author: "Preklad I. Hrbek", language: "Czech" },
  { id: "cs.nykl", author: "A. R. Nykl", language: "Czech" },
  { id: "de.aburida", author: "Abu Rida Muhammad ibn Ahmad ibn Rassoul", language: "German" },
  { id: "de.bubenheim", author: "A. S. F. Bubenheim and N. Elyas", language: "German" },
  { id: "de.khoury", author: "Adel Theodor Khoury", language: "German" },
  { id: "de.zaidan", author: "Amir Zaidan", language: "German" },
  { id: "dv.divehi", author: "Office of the President of Maldives", language: "Divehi" },
  { id: "en.ahmedali", author: "Ahmed Ali", language: "English" },
  { id: "en.ahmedraza", author: "Ala Hazrat Imam Ahmed Raza Khan", language: "English" },
  { id: "en.arberry", author: "A. J. Arberry", language: "English" },
  { id: "en.asad", author: "Muhammad Asad", language: "English" },
  { id: "en.daryabadi", author: "Abdul Majid Daryabadi", language: "English" },
  { id: "en.hilali", author: "Muhammad Taqi-ud-Din al-Hilali and Muhammad Muhsin Khan", language: "English" },
  { id: "en.pickthall", author: "Mohammed Marmaduke William Pickthall", language: "English" },
  { id: "en.qaribullah", author: "Hasan al-Fatih Qaribullah and Ahmad Darwish", language: "English" },
  { id: "en.sahih", author: "Saheeh International", language: "English" },
  { id: "en.sarwar", author: "Muhammad Sarwar", language: "English" },
  { id: "en.yusufali", author: "Abdullah Yusuf Ali", language: "English" },
  { id: "fa.ayati", author: "AbdolMohammad Ayati", language: "Persian" },
  { id: "fa.fooladvand", author: "Mohammad Mahdi Fooladvand", language: "Persian" },
  { id: "fa.ghomshei", author: "Mahdi Elahi Ghomshei", language: "Persian" },
  { id: "fa.makarem", author: "Naser Makarem Shirazi", language: "Persian" },
  { id: "fr.hamidullah", author: "Muhammad Hamidullah", language: "French" },
  { id: "ha.gumi", author: "Abubakar Mahmoud Gumi", language: "Hausa" },
  { id: "hi.hindi", author: "Suhel Farooq Khan and Saifur Rahman Nadwi", language: "Hindi" },
  { id: "id.indonesian", author: "Bahasa Indonesia", language: "Indonesian" },
  { id: "it.piccardo", author: "Hamza Roberto Piccardo", language: "Italian" },
  { id: "ja.japanese", author: "Japanese", language: "Japanese" },
  { id: "ko.korean", author: "Korean", language: "Korean" },
  { id: "ku.asan", author: "Burhan Muhammad-Amin", language: "Kurdish" },
  { id: "ml.abdulhameed", author: "Cheriyamundam Abdul Hameed and Kunhi Mohammed Parappoor", language: "Malayalam" },
  { id: "nl.keyzer", author: "Salomo Keyzer", language: "Dutch" },
  { id: "no.berg", author: "Einar Berg", language: "Norwegian" },
  { id: "pl.bielawskiego", author: "Józefa Bielawskiego", language: "Polish" },
  { id: "pt.elhayek", author: "Samir El-Hayek", language: "Portuguese" },
  { id: "ro.grigore", author: "George Grigore", language: "Romanian" },
  { id: "ru.kuliev", author: "Elmir Kuliev", language: "Russian" },
  { id: "ru.osmanov", author: "Magomed-Nuri Osmanovich Osmanov", language: "Russian" },
  { id: "ru.porokhova", author: "V. Porokhova", language: "Russian" },
  { id: "sd.amroti", author: "Taj Mehmood Amroti", language: "Sindhi" },
  { id: "so.abduh", author: "Mahmud Muhammad Abduh", language: "Somali" },
  { id: "sq.ahmeti", author: "Sherif Ahmeti", language: "Albanian" },
  { id: "sq.mehdiu", author: "Feti Mehdiu", language: "Albanian" },
  { id: "sq.nahi", author: "Hasan Efendi Nahi", language: "Albanian" },
  { id: "sv.bernstrom", author: "Knut Bernström", language: "Swedish" },
  { id: "sw.barwani", author: "Ali Muhsin Al-Barwani", language: "Swahili" },
  { id: "ta.tamil", author: "Jan Turst Foundation", language: "Tamil" },
  { id: "tg.ayati", author: "AbdolMohammad Ayati", language: "Tajik" },
  { id: "th.thai", author: "King Fahad Quran Complex", language: "Thai" },
  { id: "tr.ates", author: "Suleyman Ates", language: "Turkish" },
  { id: "tr.bulac", author: "Alİ Bulaç", language: "Turkish" },
  { id: "tr.diyanet", author: "Diyanet Isleri", language: "Turkish" },
  { id: "tr.golpinarli", author: "Abdulbaki Golpinarli", language: "Turkish" },
  { id: "tr.ozturk", author: "Yasar Nuri Ozturk", language: "Turkish" },
  { id: "tr.vakfi", author: "Diyanet Vakfi", language: "Turkish" },
  { id: "tr.yazir", author: "Elmalili Hamdi Yazir", language: "Turkish" },
  { id: "tr.yildirim", author: "Suat Yildirim", language: "Turkish" },
  { id: "tr.yuksel", author: "Edip Yüksel", language: "Turkish" },
  { id: "tt.nugman", author: "Yakub Ibn Nugman", language: "Tatar" },
  { id: "ug.saleh", author: "Muhammad Saleh", language: "Uyghur" },
  { id: "ur.ahmedali", author: "Ahmed Ali", language: "Urdu" },
  { id: "ur.jalandhry", author: "Fateh Muhammad Jalandhry", language: "Urdu" },
  { id: "ur.jawadi", author: "Syed Zeeshan Haider Jawadi", language: "Urdu" },
  { id: "ur.kanzuliman", author: "Ala Hazrat Imam Ahmed Raza Khan (Kanzul Eman)", language: "Urdu" },
  { id: "ur.qadri", author: "Tahir ul Qadri", language: "Urdu" },
  { id: "uz.sodik", author: "Muhammad Sodik Muhammad Yusuf", language: "Uzbek" },
  { id: "en.maududi", author: "Abul Ala Maududi", language: "English" },
  { id: "en.shakir", author: "Mohammad Habib Shakir", language: "English" },
  { id: "es.cortes", author: "Julio Cortes", language: "Spanish" },
  { id: "fa.ansarian", author: "Hussain Ansarian", language: "Persian" },
  { id: "bg.theophanov", author: "Tzvetan Theophanov", language: "Bulgarian" },
  { id: "bs.mlivo", author: "Mustafa Mlivo", language: "Bosnian" },
  { id: "fa.bahrampour", author: "Abolfazl Bahrampour", language: "Persian" },
  { id: "es.asad", author: "Muhammad Asad - Abdurrasak Pérez", language: "Spanish" },
  { id: "fa.khorramshahi", author: "Baha'oddin Khorramshahi", language: "Persian" },
  { id: "fa.mojtabavi", author: "Sayyed Jalaloddin Mojtabavi", language: "Persian" },
  { id: "hi.farooq", author: "Muhammad Farooq Khan and Muhammad Ahmed", language: "Hindi" },
  { id: "id.muntakhab", author: "Muhammad Quraish Shihab et al.", language: "Indonesian" },
  { id: "ms.basmeih", author: "Abdullah Muhammad Basmeih", language: "Malay" },
  { id: "ru.abuadel", author: "Abu Adel", language: "Russian" },
  { id: "ru.krachkovsky", author: "Ignaty Yulianovich Krachkovsky", language: "Russian" },
  { id: "ru.muntahab", author: "Ministry of Awqaf, Egypt", language: "Russian" },
  { id: "ru.sablukov", author: "Gordy Semyonovich Sablukov", language: "Russian" },
  { id: "ur.junagarhi", author: "Muhammad Junagarhi", language: "Urdu" },
  { id: "ur.maududi", author: "Abul A'ala Maududi", language: "Urdu" },
  { id: "zh.jian", author: "Ma Jian", language: "Chinese" },
  { id: "zh.majian", author: "Ma Jian", language: "Chinese" },
  { id: "fa.khorramdel", author: "Mostafa Khorramdel", language: "Persian" },
  { id: "fa.moezzi", author: "Mohammad Kazem Moezzi", language: "Persian" },
  { id: "bs.korkut", author: "Besim Korkut", language: "Bosnian" },
  { id: "si.naseemismail", author: "Naseem Isamil and Masoor Maulana, Kaleel", language: "Sinhala" },
  { id: "quran-buck", author: "Buck", language: "Arabic" },
  { id: "zh.mazhonggang", author: "马仲刚", language: "Chinese" },
  { id: "ba.mehanovic", author: "Quran translation by Muhamed Mehanovic", language: "Bosnian" },
  { id: "en.itani", author: "Clear Qur'an by Talal Itani", language: "English" },
  { id: "my.ghazi", author: "Translation by Ghazi Muhammed Hashim", language: "Burmese" },
  { id: "en.mubarakpuri", author: "Mubarakpuri", language: "English" },
  { id: "am.sadiq", author: "Sadiq & Sani Habib", language: "Amharic" },
  { id: "ber.mensur", author: "At Mensur", language: "Berber" },
  { id: "bn.hoque", author: "Zohurul Hoque", language: "Bengali" },
  { id: "en.qarai", author: "Qarai", language: "English" },
  { id: "en.wahiduddin", author: "Wahiduddin Khan", language: "English" },
  { id: "es.bornez", author: "Bornez", language: "Spanish" },
  { id: "es.garcia", author: "Garcia", language: "Spanish" },
  { id: "ur.najafi", author: "Muhammad Hussain Najafi", language: "Urdu" },
  { id: "fa.gharaati", author: "Mohsen Gharaati", language: "Persian" },
  { id: "fa.sadeqi", author: "Mohammad Sadeqi Tehrani", language: "Persian" },
  { id: "fa.safavi", author: "Mohammad Reza Safavi", language: "Persian" },
  { id: "id.jalalayn", author: "Tafsir Jalalayn", language: "Indonesian" },
  { id: "ml.karakunnu", author: "Karakunnu & Elayavoor", language: "Malayalam" },
  { id: "nl.leemhuis", author: "Leemhuis", language: "Dutch" },
  { id: "nl.siregar", author: "Siregar", language: "Dutch" },
  { id: "ps.abdulwali", author: "Abdul Wali", language: "Pashto" },
  { id: "ru.kuliev-alsaadi", author: "Kuliev & as-Saadi", language: "Russian" },
  { id: "ce.magomedov", author: "Chechen by Magomedov", language: "Chechen" },
  { id: "qdc.158", author: "Dr. Israr Ahmad (Bayan-ul-Quran)", language: "Urdu" },
];

export const DEFAULT_TRANSLATION_ID = "en.sahih";

export function findTranslation(id: string): TranslationEdition {
  return TRANSLATIONS.find((t) => t.id === id) ?? TRANSLATIONS.find((t) => t.id === DEFAULT_TRANSLATION_ID)!;
}
