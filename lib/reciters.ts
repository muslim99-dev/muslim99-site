/**
 * RECITERS
 * ------------------------------------------------------------------
 * Every entry here was checked against the islamic.network audio CDN
 * before being added (see scripts/verify-reciters — the identifiers
 * come from api.alquran.cloud's own edition list, cross-checked with
 * a live HTTP request per reciter so nothing in this list is broken).
 *
 * mode "ayah": the CDN has one audio file per verse for this reciter,
 * so tapping a single verse's play button plays exactly that verse
 * (see ayahAudioUrl in lib/quranApi.ts), and autoplay can chain verse
 * to verse.
 *
 * mode "surah": only one audio file per surah exists for this reciter
 * (true for the large majority of reciters, including many well-known
 * ones) — tapping any verse's play button plays the full surah from
 * the beginning with that reciter's voice (see surahAudioUrl).
 *
 * timingRecitationId: for a handful of reciters, quran.com's backend
 * (api.qurancdn.com) publishes exact per-verse timestamps for the
 * full-surah recording, keyed by their own numeric recitation id.
 * Where present, the surah reader uses these to track and highlight
 * the current verse in real time even though it's one continuous
 * audio file — see getSurahTiming in lib/quranApi.ts.
 */

export type ReciterMode = "ayah" | "surah";

export type Reciter = {
  id: string;
  name: string;
  arabic: string;
  mode: ReciterMode;
  timingRecitationId?: number;
};

export const RECITERS: Reciter[] = [
  { id: "ar.abdulazizazzahrani", name: "Abdul Aziz az-Zahrani", arabic: "عبد العزيز الزهراني", mode: "surah" },
  { id: "ar.abdulbariaththubaity", name: "Abdul Bari ath-Thubaity", arabic: "عبد الباري الثبيتي", mode: "surah" },
  { id: "ar.abdulbarimohammed", name: "Abdul Bari Mohammed", arabic: "عبد الباري محمد", mode: "surah" },
  { id: "ar.abdulbasitmujawwad", name: "Abdul Basit Abdus-Samad (Mujawwad)", arabic: "عبد الباسط عبد الصمد (مجوَّد)", mode: "surah", timingRecitationId: 1 },
  { id: "qdc.abdulbasitmurattal", name: "Abdul Basit Abdus-Samad (Murattal)", arabic: "عبد الباسط عبد الصمد (مرتَّل)", mode: "surah", timingRecitationId: 2 },
  { id: "ar.abdulkareemalhazmi", name: "Abdul Kareem al-Hazmi", arabic: "عبد الكريم الحازمي", mode: "surah" },
  { id: "ar.abdulmohsenalharthy", name: "Abdul Mohsen al-Harthy", arabic: "عبد المحسن الحارثي", mode: "surah" },
  { id: "ar.abdulmunimabdulmubdi", name: "Abdul Munim Abdul Mubdi", arabic: "عبد المنعم عبد المبدئ", mode: "surah" },
  { id: "ar.abdulwadoodhaneef", name: "Abdul Wadood Haneef", arabic: "عبد الودود حنيف", mode: "surah" },
  { id: "ar.abdullahkhulaifi", name: "Abdullah al-Khulaifi", arabic: "عبد الله الخليفي", mode: "surah" },
  { id: "ar.abdullahalmatrood", name: "Abdullah al-Matrood", arabic: "عبد الله المطرود", mode: "surah" },
  { id: "ar.abdullahawadaljuhani", name: "Abdullah Awad al-Juhani", arabic: "عبد الله عواد الجهني", mode: "surah" },
  { id: "ar.abdullahkhayat", name: "Abdullah Khayat", arabic: "عبد الله خياط", mode: "surah" },
  { id: "ar.abdurrasheedsufiabialhaarithanalkasaaee", name: "Abdur-Rasheed Sufi (Abul-Harith from al-Kisa'i)", arabic: "عبد الرشيد صوفي (أبو الحارث عن الكسائي)", mode: "surah" },
  { id: "ar.abdurrasheedsufiaddoorianabiamr", name: "Abdur-Rasheed Sufi (ad-Doori from Abu Amr)", arabic: "عبد الرشيد صوفي (الدوري عن أبي عمرو)", mode: "surah" },
  { id: "ar.abdurrasheedsufisoosi", name: "Abdur-Rasheed Sufi (as-Soosi)", arabic: "عبد الرشيد صوفي (السوسي)", mode: "surah" },
  { id: "ar.abdurrasheedsufishubahanasim", name: "Abdur-Rasheed Sufi (Shu'bah from Asim)", arabic: "عبد الرشيد صوفي (شعبة عن عاصم)", mode: "surah" },
  { id: "ar.abuabdullahmuniraltounsi", name: "Abu Abdullah Munir at-Tounsi", arabic: "أبو عبد الله منير التونسي", mode: "surah" },
  { id: "ar.abubakraldhabi", name: "Abu Bakr adh-Dhabi", arabic: "أبو بكر الذهبي", mode: "surah" },
  { id: "ar.shaatree", name: "Abu Bakr Ash-Shaatree", arabic: "أبو بكر الشاطري", mode: "ayah" },
  { id: "ar.adilkalbani", name: "Adil al-Kalbani", arabic: "عادل الكلباني", mode: "surah" },
  { id: "ar.ahmadalhawashy", name: "Ahmad al-Hawashy", arabic: "أحمد الحواشي", mode: "surah" },
  { id: "ar.ahmadkhaderaltarabulsi", name: "Ahmad Khader at-Tarabulsi", arabic: "أحمد خضر الطرابلسي", mode: "surah" },
  { id: "ar.ahmadsulaiman", name: "Ahmad Sulaiman", arabic: "أحمد سليمان", mode: "surah" },
  { id: "ar.ahmedalajmi", name: "Ahmed al-Ajmi", arabic: "أحمد العجمي", mode: "surah" },
  { id: "ar.ahmedalhammad", name: "Ahmed al-Hammad", arabic: "أحمد الحماد", mode: "surah" },
  { id: "ar.ahmedalmisbahi", name: "Ahmed al-Misbahi", arabic: "أحمد المصباحي", mode: "surah" },
  { id: "ar.ahmedamir", name: "Ahmed Amir", arabic: "أحمد عامر", mode: "surah" },
  { id: "ar.ahmedajamy", name: "Ahmed ibn Ali al-Ajamy", arabic: "أحمد بن علي العجمي", mode: "ayah" },
  { id: "ar.ahmedmohamedsalama", name: "Ahmed Mohamed Salama", arabic: "أحمد محمد سلامة", mode: "surah" },
  { id: "ar.ahmedsaber", name: "Ahmed Saber", arabic: "أحمد صابر", mode: "surah" },
  { id: "ar.alashryomran", name: "al-Ashry Omran", arabic: "العشري عمران", mode: "surah" },
  { id: "ar.alfatehmuhammadzubair", name: "al-Fateh Muhammad Zubair", arabic: "الفاتح محمد الزبير", mode: "surah" },
  { id: "ar.alhusaynialazazi", name: "al-Husayni al-Azazi", arabic: "الحسيني العزازي", mode: "surah" },
  { id: "ar.alhusaynialazazichildren", name: "al-Husayni al-Azazi (with children)", arabic: "الحسيني العزازي (مع الأطفال)", mode: "surah" },
  { id: "ar.obeikan", name: "al-Obeikan", arabic: "العبيكان", mode: "surah" },
  { id: "ar.alzainmohamedahmed", name: "al-Zain Mohamed Ahmed", arabic: "الزين محمد أحمد", mode: "surah" },
  { id: "ar.alafasy", name: "Alafasy", arabic: "مشاري العفاسي", mode: "ayah" },
  { id: "ar.aliabdurrahmanalhuthaify", name: "Ali Abdur-Rahman al-Huthaify", arabic: "علي عبد الرحمن الحذيفي", mode: "surah" },
  { id: "ar.aliabdurrahmanalhuthaifyqaloon", name: "Ali Abdur-Rahman al-Huthaify (Qaloon)", arabic: "علي عبد الرحمن الحذيفي (قالون)", mode: "surah" },
  { id: "ar.alihajjajsouissi", name: "Ali Hajjaj Souissi", arabic: "علي حجاج السويسي", mode: "surah" },
  { id: "ar.aymanswed", name: "Ayman Swed", arabic: "أيمن سويد", mode: "surah" },
  { id: "ar.azizalili", name: "Aziz Alili", arabic: "عزيز عليلي", mode: "surah" },
  { id: "ar.basselabdulrahmanraoui", name: "Bassel Abdul-Rahman ar-Raoui", arabic: "باسل عبد الرحمن الراوي", mode: "surah" },
  { id: "ar.benkirane", name: "Benkirane", arabic: "بنكيران", mode: "surah" },
  { id: "ar.darwishfarajdarwishalattar", name: "Darwish Faraj Darwish al-Attar", arabic: "درويش فرج درويش العطار", mode: "surah" },
  { id: "ar.emadalmansary", name: "Emad al-Mansary", arabic: "عماد المنصري", mode: "surah" },
  { id: "ar.ezzatsabri", name: "Ezzat Sabri", arabic: "عزت صبري", mode: "surah" },
  { id: "ar.faresabbad", name: "Fares Abbad", arabic: "فارس عباد", mode: "surah" },
  { id: "ar.fouadalkhamiri", name: "Fouad al-Khamiri", arabic: "فؤاد الخامري", mode: "surah" },
  { id: "ar.hamadsinan", name: "Hamad Sinan", arabic: "حمد سنان", mode: "surah" },
  { id: "ar.hamdyalsayedtolbasaad", name: "Hamdy al-Sayed Tolba Saad", arabic: "حمدي السيد طلبة سعد", mode: "surah" },
  { id: "ar.haniarrifai", name: "Hani ar-Rifai", arabic: "هاني الرفاعي", mode: "surah", timingRecitationId: 5 },
  { id: "ar.hasanhashem", name: "Hasan Hashem", arabic: "حسن هاشم", mode: "surah" },
  { id: "ar.hassansaleh", name: "Hassan Saleh", arabic: "حسن صالح", mode: "surah" },
  { id: "ar.hatemfarid", name: "Hatem Farid", arabic: "حاتم فريد", mode: "surah" },
  { id: "ar.hudhaify", name: "Hudhaify", arabic: "علي بن عبدالرحمن الحذيفي", mode: "ayah" },
  { id: "ar.husary", name: "Husary", arabic: "محمود خليل الحصري", mode: "ayah" },
  { id: "qdc.husarymuallim", name: "Husary (Muallim, verse-repeat)", arabic: "محمود خليل الحصري (المعلم)", mode: "surah", timingRecitationId: 12 },
  { id: "ar.husarymujawwad", name: "Husary (Mujawwad)", arabic: "محمود خليل الحصري (المجود)", mode: "ayah" },
  { id: "ar.ibrahimaldossari", name: "Ibrahim ad-Dossari", arabic: "إبراهيم الدوسري", mode: "surah" },
  { id: "ar.ibrahimalakhdar", name: "Ibrahim al-Akhdar", arabic: "إبراهيم الأخضر", mode: "surah" },
  { id: "ar.ibrahimaljormy", name: "Ibrahim al-Jormy", arabic: "إبراهيم الجرمي", mode: "surah" },
  { id: "ar.ilhantok", name: "Ilhan Tok", arabic: "إلهان توك", mode: "surah" },
  { id: "ar.imadzuhairhafez", name: "Imad Zuhair Hafez", arabic: "عماد زهير حافظ", mode: "surah" },
  { id: "ar.jamaanalosaimi", name: "Jamaan al-Osaimi", arabic: "جمعان العصيمي", mode: "surah" },
  { id: "ar.jamalshakerabdullah", name: "Jamal Shaker Abdullah", arabic: "جمال شاكر عبد الله", mode: "surah" },
  { id: "ar.jazzaalswaileh", name: "Jazza al-Swaileh", arabic: "جزاع الصويلح", mode: "surah" },
  { id: "ar.kamel", name: "Kamel", arabic: "كامل", mode: "surah" },
  { id: "ar.khaledalqahtani", name: "Khaled al-Qahtani", arabic: "خالد القحطاني", mode: "surah" },
  { id: "ar.khaledbarakat", name: "Khaled Barakat", arabic: "خالد بركات", mode: "surah" },
  { id: "ar.khalidabdulkafi", name: "Khalid Abdul-Kafi", arabic: "خالد عبد الكافي", mode: "surah" },
  { id: "ar.khalidaljalil", name: "Khalid al-Jalil", arabic: "خالد الجليل", mode: "surah" },
  { id: "ar.khalidalmohanna", name: "Khalid al-Mohanna", arabic: "خالد المهنا", mode: "surah" },
  { id: "ar.khalifaaltunaiji", name: "Khalifa at-Tunaiji", arabic: "خليفة الطنيجي", mode: "surah" },
  { id: "ar.laayounelkouchi", name: "Laayoun el-Kouchi", arabic: "العيون الكوشي", mode: "surah" },
  { id: "ar.lesaintcorantraduitenfrancais", name: "Le Saint Coran traduit en français", arabic: "القرآن الكريم مترجمًا بالفرنسية", mode: "surah" },
  { id: "ar.mahermuaiqly", name: "Maher Al Muaiqly", arabic: "ماهر المعيقلي", mode: "ayah" },
  { id: "ar.mahershakhashiro", name: "Maher Shakhashiro", arabic: "ماهر شخاشيرو", mode: "surah" },
  { id: "ar.mahmoodalrifai", name: "Mahmood al-Rifai", arabic: "محمود الرفاعي", mode: "surah" },
  { id: "ar.mahmoudalialbanna", name: "Mahmoud Ali al-Banna", arabic: "محمود علي البنا", mode: "surah" },
  { id: "ar.mahmoudelsheimy", name: "Mahmoud el-Sheimy", arabic: "محمود الشيمي", mode: "surah" },
  { id: "ar.mahmoudsaaddarouich", name: "Mahmoud Saad Darouich", arabic: "محمود سعد درويش", mode: "surah" },
  { id: "ar.mahmoudsayedeltayeb", name: "Mahmoud Sayed el-Tayeb", arabic: "محمود سيد الطيب", mode: "surah" },
  { id: "ar.misharyrashidalafasy", name: "Mishary Rashid Alafasy", arabic: "مشاري راشد العفاسي", mode: "surah" },
  { id: "ar.moeedhalharthi", name: "Moeedh al-Harthi", arabic: "معيض الحارثي", mode: "surah" },
  { id: "ar.mohamedabdelaziz", name: "Mohamed Abdel-Aziz", arabic: "محمد عبد العزيز", mode: "surah" },
  { id: "ar.mohamedabdelhakimsaadalabdullah", name: "Mohamed Abdel-Hakim Saad al-Abdullah", arabic: "محمد عبد الحكيم سعد العبد الله", mode: "surah" },
  { id: "ar.mohamedaljaberyalheyani", name: "Mohamed al-Jabery al-Heyani", arabic: "محمد الجابري الحياني", mode: "surah" },
  { id: "ar.mohamedalmohisni", name: "Mohamed al-Mohisni", arabic: "محمد المحيسني", mode: "surah" },
  { id: "ar.mohamedtablawi", name: "Mohamed at-Tablawi", arabic: "محمد الطبلاوي", mode: "surah", timingRecitationId: 11 },
  { id: "ar.mohamedelkantaoui", name: "Mohamed el-Kantaoui", arabic: "محمد القنطاوي", mode: "surah" },
  { id: "ar.mohamedhassan", name: "Mohamed Hassan", arabic: "محمد حسان", mode: "surah" },
  { id: "ar.mohamedmaabad", name: "Mohamed Maabad", arabic: "محمد معبد", mode: "surah" },
  { id: "ar.mohamedosmankhan", name: "Mohamed Osman Khan", arabic: "محمد عثمان خان", mode: "surah" },
  { id: "ar.mohamedshaabanabuqarn", name: "Mohamed Shaaban Abu Qarn", arabic: "محمد شعبان أبو قرن", mode: "surah" },
  { id: "ar.mohammadismaeelalmuqaddim", name: "Mohammad Ismaeel al-Muqaddim", arabic: "محمد إسماعيل المقدم", mode: "surah" },
  { id: "ar.mohammadrachadalshareef", name: "Mohammad Rachad al-Shareef", arabic: "محمد رشاد الشريف", mode: "surah" },
  { id: "ar.mohammedbinsalehabuzaid", name: "Mohammed bin Saleh Abu Zaid", arabic: "محمد بن صالح أبو زيد", mode: "surah" },
  { id: "ar.muftahalsaltany", name: "Muftah al-Saltany", arabic: "مفتاح السلطني", mode: "surah" },
  { id: "ar.muhammadabdulkareem", name: "Muhammad Abdul-Kareem", arabic: "محمد عبد الكريم", mode: "surah" },
  { id: "ar.muhammadalaalimaldokali", name: "Muhammad al-Aalim ad-Dokali", arabic: "محمد العالم الدوكالي", mode: "surah" },
  { id: "ar.muhammadalluhaidan", name: "Muhammad al-Luhaidan", arabic: "محمد اللحيدان", mode: "surah" },
  { id: "ar.muhammadalmehysni", name: "Muhammad al-Mehysni", arabic: "محمد المحيسني", mode: "surah" },
  { id: "ar.muhammadanwarshahat", name: "Muhammad Anwar Shahat", arabic: "محمد أنور شحات", mode: "surah" },
  { id: "ar.muhammadalsubayyil", name: "Muhammad as-Subayyil", arabic: "محمد السبيل", mode: "surah" },
  { id: "ar.muhammadayyoub", name: "Muhammad Ayyoub", arabic: "محمد أيوب", mode: "ayah" },
  { id: "ar.muhammadayyub", name: "Muhammad Ayyub", arabic: "محمد أيوب", mode: "surah" },
  { id: "ar.muhammadjibreel", name: "Muhammad Jibreel", arabic: "محمد جبريل", mode: "ayah" },
  { id: "ar.muhammadsalehalimshah", name: "Muhammad Saleh Alim Shah", arabic: "محمد صالح عالم شاه", mode: "surah" },
  { id: "ar.muhammadsiddiqalminshawimujawwad", name: "Muhammad Siddiq al-Minshawi (Mujawwad)", arabic: "محمد صديق المنشاوي (مجوَّد)", mode: "surah", timingRecitationId: 8 },
  { id: "qdc.minshawimurattal", name: "Muhammad Siddiq al-Minshawi (Murattal)", arabic: "محمد صديق المنشاوي (مرتَّل)", mode: "surah", timingRecitationId: 9 },
  { id: "ar.muhammadsulaimanpatel", name: "Muhammad Sulaiman Patel", arabic: "محمد سليمان باتل", mode: "surah" },
  { id: "ar.musabilal", name: "Musa Bilal", arabic: "موسى بلال", mode: "surah" },
  { id: "ar.mustafaallahouni", name: "Mustafa al-Lahouni", arabic: "مصطفى اللاهوني", mode: "surah" },
  { id: "ar.mustafaismail", name: "Mustafa Ismail", arabic: "مصطفى إسماعيل", mode: "surah" },
  { id: "ar.mustafaraadalazzawi", name: "Mustafa Raad al-Azzawi", arabic: "مصطفى رعد العزاوي", mode: "surah" },
  { id: "ar.mustaphagharbi", name: "Mustapha Gharbi", arabic: "مصطفى غربي", mode: "surah" },
  { id: "ar.nabilarrifai", name: "Nabil ar-Rifai", arabic: "نبيل الرفاعي", mode: "surah" },
  { id: "ar.nasseralqatami", name: "Nasser al-Qatami", arabic: "ناصر القطامي", mode: "surah" },
  { id: "ar.neamahalhassan", name: "Neamah al-Hassan", arabic: "نعمة الحسن", mode: "surah" },
  { id: "ar.omaralkazabri", name: "Omar al-Kazabri", arabic: "عمر القزابري", mode: "surah" },
  { id: "ar.osamabinalialghanim", name: "Osama bin Ali al-Ghanim", arabic: "أسامة بن علي الغانم", mode: "surah" },
  { id: "ar.rachidbelalia", name: "Rachid Belalia", arabic: "رشيد بلعالية", mode: "surah" },
  { id: "ar.saberabdulhakam", name: "Saber Abdul-Hakam", arabic: "صابر عبد الحكم", mode: "surah" },
  { id: "ar.sadaqatali", name: "Sadaqat Ali", arabic: "صداقت علي", mode: "surah" },
  { id: "ar.sahlyasin", name: "Sahl Yasin", arabic: "سهل ياسين", mode: "surah" },
  { id: "ar.saidalshaalan", name: "Said ash-Shaalan", arabic: "سعيد الشعلان", mode: "surah" },
  { id: "ar.salahalbudair", name: "Salah al-Budair", arabic: "صلاح البدير", mode: "surah" },
  { id: "ar.salahalhashem", name: "Salah al-Hashem", arabic: "صلاح الهاشم", mode: "surah" },
  { id: "ar.salahbaothman", name: "Salah Ba-Othman", arabic: "صلاح باعثمان", mode: "surah" },
  { id: "ar.samirbelaachya", name: "Samir Belaachya", arabic: "سمير بلعشية", mode: "surah" },
  { id: "ar.saudalshuraim", name: "Saud ash-Shuraim", arabic: "سعود الشريم", mode: "surah", timingRecitationId: 10 },
  { id: "qdc.sudais", name: "Abdur-Rahman as-Sudais", arabic: "عبدالرحمن السديس", mode: "surah", timingRecitationId: 3 },
  { id: "ar.sayedramadan", name: "Sayed Ramadan", arabic: "سيد رمضان", mode: "surah" },
  { id: "ar.shahriarparhizgar", name: "Shahriar Parhizgar", arabic: "شهريار پرهيزگار", mode: "surah" },
  { id: "ar.sudaisshuraymnaeemsultan", name: "Sudais & Shuraym (with Naeem Sultan translation)", arabic: "السديس والشريم (مع ترجمة نعيم سلطان)", mode: "surah" },
  { id: "ar.tamerislam", name: "Tamer Islam", arabic: "تامر إسلام", mode: "surah" },
  { id: "ar.tareqabdulganidaawob", name: "Tareq Abdul-Gani Daawob", arabic: "طارق عبد الغني دعوب", mode: "surah" },
  { id: "ar.tawfeeqassayegh", name: "Tawfeeq as-Sayegh", arabic: "توفيق الصايغ", mode: "surah" },
  { id: "ar.turkiebeidalmarri", name: "Turki Ebeid al-Marri", arabic: "تركي عبيد المري", mode: "surah" },
  { id: "ar.waeldesouky", name: "Wael ad-Desouky", arabic: "وائل الدسوقي", mode: "surah" },
  { id: "ar.waelradwanqureshi", name: "Wael Radwan Qureshi", arabic: "وائل رضوان قريشي", mode: "surah" },
  { id: "ar.waleednaehi", name: "Waleed an-Naehi", arabic: "وليد الناهي", mode: "surah" },
  { id: "ar.waleedidreesalmaneese", name: "Waleed Idrees al-Maneese", arabic: "وليد إدريس المنيسي", mode: "surah" },
  { id: "ar.waleedsamiraliabdulmajidsorour", name: "Waleed Samir Ali Abdul-Majid Sorour", arabic: "وليد سمير علي عبد المجيد سرور", mode: "surah" },
  { id: "ar.walidalshatti", name: "Walid ash-Shatti", arabic: "وليد الشطي", mode: "surah" },
  { id: "ar.walidfathibashta", name: "Walid Fathi Bashta", arabic: "وليد فتحي بشتة", mode: "surah" },
  { id: "ar.yahyahawwa", name: "Yahya Hawwa", arabic: "يحيى حوى", mode: "surah" },
  { id: "ar.yassenaljazairi", name: "Yassen al-Jazairi", arabic: "ياسين الجزائري", mode: "surah" },
  { id: "ar.yasseraldossari", name: "Yasser ad-Dossari", arabic: "ياسر الدوسري", mode: "surah" },
  { id: "ar.yasseralmazroyee", name: "Yasser al-Mazroyee", arabic: "ياسر المزروعي", mode: "surah" },
  { id: "ar.yasserqureshi", name: "Yasser Qureshi", arabic: "ياسر قريشي", mode: "surah" },
  { id: "ar.yassersalama", name: "Yasser Salama", arabic: "ياسر سلامة", mode: "surah" },
  { id: "ar.yassersarhaneldeeb", name: "Yasser Sarhan el-Deeb", arabic: "ياسر سرحان الديب", mode: "surah" },
  { id: "ar.yousufalshoaey", name: "Yousuf ash-Shoaey", arabic: "يوسف الشويعي", mode: "surah" },
];

export const DEFAULT_RECITER_ID = "ar.alafasy";

export function findReciter(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS.find((r) => r.id === DEFAULT_RECITER_ID)!;
}
