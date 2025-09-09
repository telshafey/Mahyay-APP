import { Prayer, Nawafil, Surah, BaseChallenge, AzkarCategory, IslamicOccasion, HijriMonthInfo } from "./types";

export const QURAN_TOTAL_PAGES = 604;

export const PRAYERS: Prayer[] = [
    { name: 'الفجر', emoji: '🌅', sunnahBefore: { count: 2, evidence: 'ركعتا الفجر خير من الدنيا وما فيها (صحيح مسلم)' }, virtue: 'من صلى الفجر في جماعة فهو في ذمة الله حتى يمسي' },
    { name: 'الظهر', emoji: '☀️', sunnahBefore: { count: 4, evidence: 'أربع ركعات قبل الظهر وركعتان بعدها' }, sunnahAfter: { count: 2, evidence: 'من حافظ على أربع ركعات قبل الظهر وأربع بعدها حرمه الله على النار' }, virtue: 'تفتح فيه أبواب السماء، فأحب أن يصعد لي فيه عمل صالح' },
    { name: 'العصر', emoji: '🌇', sunnahBefore: { count: 4, evidence: 'رحم الله امرأً صلى قبل العصر أربعاً (حديث حسن)' }, virtue: 'من ترك صلاة العصر فقد حبط عمله' },
    { name: 'المغرب', emoji: '🌆', sunnahAfter: { count: 2, evidence: 'ركعتان بعد المغرب' }, virtue: 'هي صلاة الأوابين' },
    { name: 'العشاء', emoji: '🌙', sunnahAfter: { count: 2, evidence: 'ركعتان بعد العشاء' }, virtue: 'من صلى العشاء في جماعة فكأنما قام نصف الليل' },
];

export const ADDITIONAL_PRAYERS: Nawafil[] = [
    { name: 'قيام الليل', emoji: '✨', isCustom: true, evidence: "أفضل الصلاة بعد الفريضة صلاة الليل (صحيح مسلم)" },
    { name: 'صلاة الضحى', emoji: '🕊️', isCustom: false, evidence: "تجزئ عن 360 صدقة", options: [
        { count: 2, evidence: 'أقلها ركعتان' },
        { count: 4, evidence: 'من صلاها أربعاً كُفي يومه' },
        { count: 8, evidence: 'من صلاها ثماني كُتب من الأوابين' },
    ] }
];

export const PRAYER_NAMES_API_MAP: { [key: string]: string } = {
    'الفجر': 'Fajr',
    'الظهر': 'Dhuhr',
    'العصر': 'Asr',
    'المغرب': 'Maghrib',
    'العشاء': 'Isha'
};

export const PRAYER_METHODS = [
    { id: 1, name: "جامعة العلوم الإسلامية، كراتشي" },
    { id: 2, name: "الجمعية الإسلامية لأمريكا الشمالية (ISNA)" },
    { id: 3, name: "رابطة العالم الإسلامي" },
    { id: 4, name: "جامعة أم القرى، مكة المكرمة" },
    { id: 5, name: "الهيئة المصرية العامة للمساحة" },
    { id: 7, name: "معهد الجيوفيزياء، جامعة طهران" },
    { id: 8, name: "الكويت" },
    { id: 9, name: "قطر" },
    { id: 10, name: "سنغافورة" },
    { id: 11, name: "الاتحاد الإسلامي في فرنسا" },
    { id: 12, name: "تركيا - رئاسة الشؤون الدينية" },
];

export const CHALLENGES: BaseChallenge[] = [
    { id: 'c1', title: "مداومة على صلاة الضحى", description: "صلِّ صلاة الضحى (ركعتين على الأقل) لمدة 7 أيام متتالية.", icon: "🕊️", points: 200, durationDays: 7, target: 7, tracking: 'manual', relatedItem: 'prayer' },
    { id: 'c2', title: "قراءة سورة الملك قبل النوم", description: "اقرأ سورة الملك كل ليلة قبل النوم لمدة أسبوع. (المنجية من عذاب القبر)", icon: "📖", points: 150, durationDays: 7, target: 7, tracking: 'manual' },
    { id: 'c3', title: "ختمة القرآن في شهر", description: "اقرأ جزءًا واحدًا من القرآن كل يوم لمدة 30 يومًا لإكمال ختمة كاملة.", icon: "🕋", points: 1000, durationDays: 30, target: 604, tracking: 'auto', relatedItem: 'quran' },
    { id: 'c4', title: "إتمام الصلوات الخمس في جماعة", description: "صلِّ جميع الصلوات الخمس في جماعة لمدة 3 أيام متتالية.", icon: "👥", points: 250, durationDays: 3, target: 15, tracking: 'auto', relatedItem: 'prayer' },
    { id: 'c5', title: "قراءة سورة الكهف يوم الجمعة", description: "اقرأ سورة الكهف في 4 أيام جمعة متتالية.", icon: "💡", points: 300, durationDays: 28, target: 4, tracking: 'manual', relatedItem: 'surah_kahf' },
    { id: 'c6_morning', title: "المحافظة على أذكار الصباح", description: "أكمل أذكار الصباح لمدة 10 أيام متتالية.", icon: "🌅", points: 175, durationDays: 10, target: 10, tracking: 'auto', relatedItem: 'azkar_morning' },
    { id: 'c6_evening', title: "المحافظة على أذكار المساء", description: "أكمل أذكار المساء لمدة 10 أيام متتالية.", icon: "🌃", points: 175, durationDays: 10, target: 10, tracking: 'auto', relatedItem: 'azkar_evening' },
    { id: 'c7', title: "صدقة أسبوعية", description: "تصدق ولو بالقليل مرة واحدة كل أسبوع لمدة شهر.", icon: "💰", points: 200, durationDays: 28, target: 4, tracking: 'manual', relatedItem: 'charity' },
];

export const AZKAR_DATA: AzkarCategory[] = [
  {
    name: "أذكار الصباح",
    items: [
      { id: 1, category: "أذكار الصباح", text: "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ\n﴿اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾", repeat: 1, reference: "من قالها حين يصبح أجير من الجن حتى يمسي. [رواه الحاكم وصححه الألباني]", notes: "آية الكرسي" },
      { id: 2, category: "أذكار الصباح", text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ\n﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\n\nبِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\n\nبِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَهِ النَّاسِ ۞ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَ النَّاسِ﴾", repeat: 3, reference: "من قالها ثلاث مرات حين يصبح وحين يمسي كفته من كل شيء. [رواه أبو داود والترمذي]", notes: "المعوذات الثلاث" },
      { id: 3, category: "أذكار الصباح", text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ", repeat: 1, reference: "صحيح مسلم، رقم ٢٧٢٣" },
      { id: 4, category: "أذكار الصباح", text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", repeat: 1, reference: "سنن الترمذي، رقم ٣٣٩١" },
      { id: 5, category: "أذكار الصباح", text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ", repeat: 1, reference: "من قالها موقناً بها حين يصبح فمات من يومه دخل الجنة. [صحيح البخاري، رقم ٦٣٠٦]", notes: "سيد الاستغفار" },
      { id: 6, category: "أذكار الصباح", text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ. اللَّهُمَّ  إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ", repeat: 3, reference: "سنن أبي داود، رقم ٥٠٩٠" },
      { id: 7, category: "أذكار الصباح", text: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", repeat: 3, reference: "من قالها ثلاثاً لم يضره شيء. [رواه أبو داود والترمذي]" },
      { id: 8, category: "أذكار الصباح", text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ", repeat: 1, reference: "رواه الحاكم وصححه الألباني" },
      { id: 9, category: "أذكار الصباح", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", repeat: 100, reference: "من قالها مائة مرة حين يصبح وحين يمسي لم يأت أحد يوم القيامة بأفضل مما جاء به إلا أحد قال مثل ما قال أو زاد عليه. [صحيح مسلم، رقم ٢٦٩٢]" },
      { id: 10, category: "أذكار الصباح", text: "لاَ إِلَهَ إِلاَّ اللَّهُ، وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", repeat: 10, reference: "من قالها عشر مرات كانت له كعتق أربع أنفس من ولد إسماعيل. [صحيح مسلم، رقم ٢٦٩٣]" }
    ]
  },
  {
    name: "أذكار المساء",
    items: [
      { id: 11, category: "أذكار المساء", text: "أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ\n﴿اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾", repeat: 1, reference: "من قالها حين يمسي أجير من الجن حتى يصبح. [رواه الحاكم وصححه الألباني]", notes: "آية الكرسي" },
      { id: 12, category: "أذكار المساء", text: "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ\n﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\n\nبِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\n\nبِسْمِ اللهِ الرَّحْمنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَهِ النَّاسِ ۞ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَ النَّاسِ﴾", repeat: 3, reference: "من قالها ثلاث مرات حين يصبح وحين يمسي كفته من كل شيء. [رواه أبو داود والترمذي]", notes: "المعوذات الثلاث" },
      { id: 13, category: "أذكار المساء", text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ", repeat: 1, reference: "صحيح مسلم، رقم ٢٧٢٣" },
      { id: 14, category: "أذكار المساء", text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ", repeat: 1, reference: "سنن الترمذي، رقم ٣٣٩١" },
      { id: 15, category: "أذكار المساء", text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ", repeat: 1, reference: "من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة. [صحيح البخاري، رقم ٦٣٠٦]", notes: "سيد الاستغفار" },
      { id: 16, category: "أذكار المساء", text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", repeat: 3, reference: "من قالها ثلاث مرات حين يمسي لم تضره حمة تلك الليلة. [رواه الترمذي]" },
      { id: 17, category: "أذكار المساء", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", repeat: 100, reference: "صحيح مسلم، رقم ٢٦٩٢" },
    ]
  },
  {
    name: "أذكار النوم",
    items: [
      { id: 23, category: "أذكار النوم", text: "يجمع كفيه ثم ينفث فيهما فيقرأ: ﴿قُلْ هُوَ اللَّهُ أَحَدٌ...﴾، ﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...﴾، ﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ...﴾ ثم يمسح بهما ما استطاع من جسده يبدأ بهما على رأسه ووجهه وما أقبل من جسده", repeat: 3, reference: "صحيح البخاري، رقم ٥٠١٧", notes: "النفث في الكفين بالمعوذات" },
      { id: 24, category: "أذكار النوم", text: "﴿آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ...﴾ [البقرة: ٢٨٥-٢٨٦]", repeat: 1, reference: "من قرأ بالآيتين من آخر سورة البقرة في ليلة كفتاه. [صحيح البخاري، رقم ٥٠٠٩]", notes: "آخر آيتين من سورة البقرة" },
      { id: 25, category: "أذكار النوم", text: "بِاسْمِكَ رَبِّ وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ", repeat: 1, reference: "صحيح البخاري، رقم ٦٣٢٠" },
      { id: 26, category: "أذكار النوم", text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", repeat: 3, reference: "يقوله إذا وضع يده اليمنى تحت خده. [سنن الترمذي، رقم ٣٣٩٨]" },
      { id: 27, category: "أذكار النوم", text: "سُبْحَانَ اللَّهِ (٣٣ مرة)، وَالْحَمْدُ لِلَّهِ (٣٣ مرة)، وَاللَّهُ أَكْبَرُ (٣٤ مرة)", repeat: 1, reference: "من قالهن عند نومه، كان خيراً له من خادم. [صحيح البخاري، رقم ٣٧٠٥]", notes: "تسبيح فاطمة" }
    ]
  },
  {
    name: "أذكار الاستيقاظ",
    items: [
      { id: 28, category: "أذكار الاستيقاظ", text: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", repeat: 1, reference: "صحيح البخاري، رقم ٦٣١٢" },
      { id: 29, category: "أذكار الاستيقاظ", text: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي وَرَدَّ عَلَيَّ رُوحِي وَأَذِنَ لِي بِذِكْرِهِ", repeat: 1, reference: "سنن الترمذي، رقم ٣٤٠١" }
    ]
  },
  {
    name: "أذكار عامة",
    items: [
        { id: 18, category: "أذكار عامة", text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", repeat: 1, reference: "سورة البقرة، آية ٢٠١", notes: "دعاء جامع لخيري الدنيا والآخرة" },
        { id: 19, category: "أذكار عامة", text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", repeat: 1, reference: "سنن الترمذي، رقم ٣٥١٣", notes: "دعاء ليلة القدر" },
        { id: 20, category: "أذكار عامة", text: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي", repeat: 1, reference: "صحيح مسلم، رقم ٢٧٢٥", notes: "دعاء لطلب الهداية والسداد" },
        { id: 21, category: "أذكار عامة", text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى", repeat: 1, reference: "صحيح مسلم، رقم ٢٧٢١" },
        { id: 22, category: "أذكار عامة", text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", repeat: 1, reference: "سنن أبي داود، رقم ١٥٢٢", notes: "دعاء يقال دبر كل صلاة" },
        { id: 30, category: "أذكار عامة", text: "بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللهِ", repeat: 1, reference: "سنن أبي داود، رقم ٥٠٩٥", notes: "دعاء الخروج من المنزل" },
        { id: 31, category: "أذكار عامة", text: "بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا", repeat: 1, reference: "سنن أبي داود، رقم ٥٠٩٦", notes: "دعاء الدخول إلى المنزل" },
        { id: 32, category: "أذكار عامة", text: "أَعُوذُ بِاللهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ", repeat: 1, reference: "سنن أبي داود، رقم ٤٦٦", notes: "دعاء دخول المسجد" },
        { id: 33, category: "أذكار عامة", text: "بِسْمِ اللهِ وَالصَّلاَةُ وَالسَّلاَمُ عَلَى رَسُولِ اللهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", repeat: 1, reference: "صحيح مسلم، رقم ٧١٣", notes: "تكملة دعاء دخول المسجد" },
        { id: 34, category: "أذكار عامة", text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", repeat: 1, reference: "صحيح مسلم، رقم ٧١٣", notes: "دعاء الخروج من المسجد" },
        { id: 35, category: "أذكار عامة", text: "بِسْمِ اللهِ", repeat: 1, reference: "رواه أبو داود", notes: "دعاء لبس الثوب" },
    ]
  }
];

export const HIJRI_MONTHS_INFO: { [key: number]: Omit<HijriMonthInfo, 'occasions'> } = {
    1: { name: "محرم", definition: "أول شهور السنة الهجرية ومن الأشهر الحرم." },
    2: { name: "صفر", definition: "الشهر الثاني في السنة الهجرية." },
    3: { name: "ربيع الأول", definition: "شهر مولد النبي صلى الله عليه وسلم." },
    4: { name: "ربيع الآخر", definition: "الشهر الرابع في السنة الهجرية." },
    5: { name: "جمادى الأولى", definition: "الشهر الخامس في السنة الهجرية." },
    6: { name: "جمادى الآخرة", definition: "الشهر السادس في السنة الهجرية." },
    7: { name: "رجب", definition: "أحد الأشهر الحرم، شهر الإسراء والمعراج." },
    8: { name: "شعبان", definition: "شهر ترفع فيه الأعمال إلى الله." },
    9: { name: "رمضان", definition: "شهر الصيام والقرآن والعتق من النار." },
    10: { name: "شوال", definition: "شهر عيد الفطر وصيام الست من شوال." },
    11: { name: "ذو القعدة", definition: "أول الأشهر الحرم المتوالية." },
    12: { name: "ذو الحجة", definition: "شهر الحج وعيد الأضحى والأيام العشر المباركة." },
};

export const ISLAMIC_OCCASIONS: IslamicOccasion[] = [
    { id: 'o1', name: "رأس السنة الهجرية", hijriDay: 1, hijriMonth: 1, description: "بداية العام الهجري الجديد." },
    { id: 'o2', name: "يوم عاشوراء", hijriDay: 10, hijriMonth: 1, description: "يوم نجّى الله فيه موسى عليه السلام وقومه." },
    { id: 'o3', name: "المولد النبوي الشريف", hijriDay: 12, hijriMonth: 3, description: "يوم مولد خاتم الأنبياء والمرسلين محمد صلى الله عليه وسلم." },
    { id: 'o4', name: "الإسراء والمعراج", hijriDay: 27, hijriMonth: 7, description: "ليلة عظيمة أُسري فيها بالنبي من مكة إلى القدس ثم عُرج به إلى السماء." },
    { id: 'o5', name: "النصف من شعبان", hijriDay: 15, hijriMonth: 8, description: "ليلة مباركة لها فضل في بعض الأقوال." },
    { id: 'o6', name: "بداية رمضان", hijriDay: 1, hijriMonth: 9, description: "بداية شهر الصيام والقيام والقرآن." },
    { id: 'o7', name: "ليلة القدر (متوقعة)", hijriDay: 27, hijriMonth: 9, description: "خير من ألف شهر، تُلتمس في العشر الأواخر." },
    { id: 'o8', name: "عيد الفطر", hijriDay: 1, hijriMonth: 10, description: "يوم فرحة المسلمين بإتمام صيام رمضان." },
    { id: 'o9', name: "يوم عرفة", hijriDay: 9, hijriMonth: 12, description: "ركن الحج الأعظم، يوم مغفرة الذنوب والعتق من النار." },
    { id: 'o10', name: "عيد الأضحى", hijriDay: 10, hijriMonth: 12, description: "يوم النحر، ذكرى فداء إسماعيل عليه السلام." },
    { id: 'o11', name: "أيام التشريق", hijriDay: 11, hijriMonth: 12, description: "الأيام الثلاثة بعد يوم النحر، أيام أكل وشرب وذكر لله." },
];

// Data from: https://github.com/semarketir/quranjson
export const QURAN_SURAHS: Surah[] = [
  {"id":1,"name":"الفاتحة","englishName":"Al-Fatihah","ayahs":7,"revelationType":"Meccan","startPage":1},
  {"id":2,"name":"البقرة","englishName":"Al-Baqarah","ayahs":286,"revelationType":"Medinan","startPage":2},
  {"id":3,"name":"آل عمران","englishName":"Aal-E-Imran","ayahs":200,"revelationType":"Medinan","startPage":50},
  {"id":4,"name":"النساء","englishName":"An-Nisa","ayahs":176,"revelationType":"Medinan","startPage":77},
  {"id":5,"name":"المائدة","englishName":"Al-Ma'idah","ayahs":120,"revelationType":"Medinan","startPage":106},
  {"id":6,"name":"الأنعام","englishName":"Al-An'am","ayahs":165,"revelationType":"Meccan","startPage":128},
  {"id":7,"name":"الأعراف","englishName":"Al-A'raf","ayahs":206,"revelationType":"Meccan","startPage":151},
  {"id":8,"name":"الأنفال","englishName":"Al-Anfal","ayahs":75,"revelationType":"Medinan","startPage":177},
  {"id":9,"name":"التوبة","englishName":"At-Tawbah","ayahs":129,"revelationType":"Medinan","startPage":187},
  {"id":10,"name":"يونس","englishName":"Yunus","ayahs":109,"revelationType":"Meccan","startPage":208},
  {"id":11,"name":"هود","englishName":"Hud","ayahs":123,"revelationType":"Meccan","startPage":221},
  {"id":12,"name":"يوسف","englishName":"Yusuf","ayahs":111,"revelationType":"Meccan","startPage":235},
  {"id":13,"name":"الرعد","englishName":"Ar-Ra'd","ayahs":43,"revelationType":"Meccan","startPage":249},
  {"id":14,"name":"ابراهيم","englishName":"Ibrahim","ayahs":52,"revelationType":"Meccan","startPage":255},
  {"id":15,"name":"الحجر","englishName":"Al-Hijr","ayahs":99,"revelationType":"Meccan","startPage":262},
  {"id":16,"name":"النحل","englishName":"An-Nahl","ayahs":128,"revelationType":"Meccan","startPage":267},
  {"id":17,"name":"الإسراء","englishName":"Al-Isra","ayahs":111,"revelationType":"Meccan","startPage":282},
  {"id":18,"name":"الكهف","englishName":"Al-Kahf","ayahs":110,"revelationType":"Meccan","startPage":293},
  {"id":19,"name":"مريم","englishName":"Maryam","ayahs":98,"revelationType":"Meccan","startPage":305},
  {"id":20,"name":"طه","englishName":"Taha","ayahs":135,"revelationType":"Meccan","startPage":312},
  {"id":21,"name":"الأنبياء","englishName":"Al-Anbiya","ayahs":112,"revelationType":"Meccan","startPage":322},
  {"id":22,"name":"الحج","englishName":"Al-Hajj","ayahs":78,"revelationType":"Medinan","startPage":332},
  {"id":23,"name":"المؤمنون","englishName":"Al-Mu'minun","ayahs":118,"revelationType":"Meccan","startPage":342},
  {"id":24,"name":"النور","englishName":"An-Nur","ayahs":64,"revelationType":"Medinan","startPage":350},
  {"id":25,"name":"الفرقان","englishName":"Al-Furqan","ayahs":77,"revelationType":"Meccan","startPage":359},
  {"id":26,"name":"الشعراء","englishName":"Ash-Shu'ara","ayahs":227,"revelationType":"Meccan","startPage":367},
  {"id":27,"name":"النمل","englishName":"An-Naml","ayahs":93,"revelationType":"Meccan","startPage":377},
  {"id":28,"name":"القصص","englishName":"Al-Qasas","ayahs":88,"revelationType":"Meccan","startPage":385},
  {"id":29,"name":"العنكبوت","englishName":"Al-Ankabut","ayahs":69,"revelationType":"Meccan","startPage":396},
  {"id":30,"name":"الروم","englishName":"Ar-Rum","ayahs":60,"revelationType":"Meccan","startPage":404},
  {"id":31,"name":"لقمان","englishName":"Luqman","ayahs":34,"revelationType":"Meccan","startPage":411},
  {"id":32,"name":"السجدة","englishName":"As-Sajdah","ayahs":30,"revelationType":"Meccan","startPage":415},
  {"id":33,"name":"الأحزاب","englishName":"Al-Ahzab","ayahs":73,"revelationType":"Medinan","startPage":418},
  {"id":34,"name":"سبإ","englishName":"Saba","ayahs":54,"revelationType":"Meccan","startPage":428},
  {"id":35,"name":"فاطر","englishName":"Fatir","ayahs":45,"revelationType":"Meccan","startPage":434},
  {"id":36,"name":"يس","englishName":"Ya-Sin","ayahs":83,"revelationType":"Meccan","startPage":440},
  {"id":37,"name":"الصافات","englishName":"As-Saffat","ayahs":182,"revelationType":"Meccan","startPage":446},
  {"id":38,"name":"ص","englishName":"Sad","ayahs":88,"revelationType":"Meccan","startPage":453},
  {"id":39,"name":"الزمر","englishName":"Az-Zumar","ayahs":75,"revelationType":"Meccan","startPage":458},
  {"id":40,"name":"غافر","englishName":"Ghafir","ayahs":85,"revelationType":"Meccan","startPage":467},
  {"id":41,"name":"فصلت","englishName":"Fussilat","ayahs":54,"revelationType":"Meccan","startPage":477},
  {"id":42,"name":"الشورى","englishName":"Ash-Shuraa","ayahs":53,"revelationType":"Meccan","startPage":483},
  {"id":43,"name":"الزخرف","englishName":"Az-Zukhruf","ayahs":89,"revelationType":"Meccan","startPage":489},
  {"id":44,"name":"الدخان","englishName":"Ad-Dukhan","ayahs":59,"revelationType":"Meccan","startPage":496},
  {"id":45,"name":"الجاثية","englishName":"Al-Jathiyah","ayahs":37,"revelationType":"Meccan","startPage":499},
  {"id":46,"name":"الأحقاف","englishName":"Al-Ahqaf","ayahs":35,"revelationType":"Meccan","startPage":502},
  {"id":47,"name":"محمد","englishName":"Muhammad","ayahs":38,"revelationType":"Medinan","startPage":507},
  {"id":48,"name":"الفتح","englishName":"Al-Fath","ayahs":29,"revelationType":"Medinan","startPage":511},
  {"id":49,"name":"الحجرات","englishName":"Al-Hujurat","ayahs":18,"revelationType":"Medinan","startPage":515},
  {"id":50,"name":"ق","englishName":"Qaf","ayahs":45,"revelationType":"Meccan","startPage":518},
  {"id":51,"name":"الذاريات","englishName":"Adh-Dhariyat","ayahs":60,"revelationType":"Meccan","startPage":520},
  {"id":52,"name":"الطور","englishName":"At-Tur","ayahs":49,"revelationType":"Meccan","startPage":523},
  {"id":53,"name":"النجم","englishName":"An-Najm","ayahs":62,"revelationType":"Meccan","startPage":526},
  {"id":54,"name":"القمر","englishName":"Al-Qamar","ayahs":55,"revelationType":"Meccan","startPage":528},
  {"id":55,"name":"الرحمن","englishName":"Ar-Rahman","ayahs":78,"revelationType":"Medinan","startPage":531},
  {"id":56,"name":"الواقعة","englishName":"Al-Waqi'ah","ayahs":96,"revelationType":"Meccan","startPage":534},
  {"id":57,"name":"الحديد","englishName":"Al-Hadid","ayahs":29,"revelationType":"Medinan","startPage":537},
  {"id":58,"name":"المجادلة","englishName":"Al-Mujadila","ayahs":22,"revelationType":"Medinan","startPage":542},
  {"id":59,"name":"الحشر","englishName":"Al-Hashr","ayahs":24,"revelationType":"Medinan","startPage":545},
  {"id":60,"name":"الممتحنة","englishName":"Al-Mumtahanah","ayahs":13,"revelationType":"Medinan","startPage":549},
  {"id":61,"name":"الصف","englishName":"As-Saf","ayahs":14,"revelationType":"Medinan","startPage":551},
  {"id":62,"name":"الجمعة","englishName":"Al-Jumu'ah","ayahs":11,"revelationType":"Medinan","startPage":553},
  {"id":63,"name":"المنافقون","englishName":"Al-Munafiqun","ayahs":11,"revelationType":"Medinan","startPage":554},
  {"id":64,"name":"التغابن","englishName":"At-Taghabun","ayahs":18,"revelationType":"Medinan","startPage":556},
  {"id":65,"name":"الطلاق","englishName":"At-Talaq","ayahs":12,"revelationType":"Medinan","startPage":558},
  {"id":66,"name":"التحريم","englishName":"At-Tahrim","ayahs":12,"revelationType":"Medinan","startPage":560},
  {"id":67,"name":"الملك","englishName":"Al-Mulk","ayahs":30,"revelationType":"Meccan","startPage":562},
  {"id":68,"name":"القلم","englishName":"Al-Qalam","ayahs":52,"revelationType":"Meccan","startPage":564},
  {"id":69,"name":"الحاقة","englishName":"Al-Haqqah","ayahs":52,"revelationType":"Meccan","startPage":566},
  {"id":70,"name":"المعارج","englishName":"Al-Ma'arij","ayahs":44,"revelationType":"Meccan","startPage":568},
  {"id":71,"name":"نوح","englishName":"Nuh","ayahs":28,"revelationType":"Meccan","startPage":570},
  {"id":72,"name":"الجن","englishName":"Al-Jinn","ayahs":28,"revelationType":"Meccan","startPage":572},
  {"id":73,"name":"المزمل","englishName":"Al-Muzzammil","ayahs":20,"revelationType":"Meccan","startPage":574},
  {"id":74,"name":"المدثر","englishName":"Al-Muddaththir","ayahs":56,"revelationType":"Meccan","startPage":575},
  {"id":75,"name":"القيامة","englishName":"Al-Qiyamah","ayahs":40,"revelationType":"Meccan","startPage":577},
  {"id":76,"name":"الانسان","englishName":"Al-Insan","ayahs":31,"revelationType":"Medinan","startPage":578},
  {"id":77,"name":"المرسلات","englishName":"Al-Mursalat","ayahs":50,"revelationType":"Meccan","startPage":580},
  {"id":78,"name":"النبإ","englishName":"An-Naba","ayahs":40,"revelationType":"Meccan","startPage":582},
  {"id":79,"name":"النازعات","englishName":"An-Nazi'at","ayahs":46,"revelationType":"Meccan","startPage":583},
  {"id":80,"name":"عبس","englishName":"Abasa","ayahs":42,"revelationType":"Meccan","startPage":585},
  {"id":81,"name":"التكوير","englishName":"At-Takwir","ayahs":29,"revelationType":"Meccan","startPage":586},
  {"id":82,"name":"الإنفطار","englishName":"Al-Infitar","ayahs":19,"revelationType":"Meccan","startPage":587},
  {"id":83,"name":"المطففين","englishName":"Al-Mutaffifin","ayahs":36,"revelationType":"Meccan","startPage":587},
  {"id":84,"name":"الإنشقاق","englishName":"Al-Inshiqaq","ayahs":25,"revelationType":"Meccan","startPage":589},
  {"id":85,"name":"البروج","englishName":"Al-Buruj","ayahs":22,"revelationType":"Meccan","startPage":590},
  {"id":86,"name":"الطارق","englishName":"At-Tariq","ayahs":17,"revelationType":"Meccan","startPage":591},
  {"id":87,"name":"الأعلى","englishName":"Al-A'la","ayahs":19,"revelationType":"Meccan","startPage":591},
  {"id":88,"name":"الغاشية","englishName":"Al-Ghashiyah","ayahs":26,"revelationType":"Meccan","startPage":592},
  {"id":89,"name":"الفجر","englishName":"Al-Fajr","ayahs":30,"revelationType":"Meccan","startPage":593},
  {"id":90,"name":"البلد","englishName":"Al-Balad","ayahs":20,"revelationType":"Meccan","startPage":594},
  {"id":91,"name":"الشمس","englishName":"Ash-Shams","ayahs":15,"revelationType":"Meccan","startPage":595},
  {"id":92,"name":"الليل","englishName":"Al-Layl","ayahs":21,"revelationType":"Meccan","startPage":595},
  {"id":93,"name":"الضحى","englishName":"Ad-Duhaa","ayahs":11,"revelationType":"Meccan","startPage":596},
  {"id":94,"name":"الشرح","englishName":"Ash-Sharh","ayahs":8,"revelationType":"Meccan","startPage":596},
  {"id":95,"name":"التين","englishName":"At-Tin","ayahs":8,"revelationType":"Meccan","startPage":597},
  {"id":96,"name":"العلق","englishName":"Al-Alaq","ayahs":19,"revelationType":"Meccan","startPage":597},
  {"id":97,"name":"القدر","englishName":"Al-Qadr","ayahs":5,"revelationType":"Meccan","startPage":598},
  {"id":98,"name":"البينة","englishName":"Al-Bayyinah","ayahs":8,"revelationType":"Medinan","startPage":598},
  {"id":99,"name":"الزلزلة","englishName":"Az-Zalzalah","ayahs":8,"revelationType":"Medinan","startPage":599},
  {"id":100,"name":"العاديات","englishName":"Al-Adiyat","ayahs":11,"revelationType":"Meccan","startPage":599},
  {"id":101,"name":"القارعة","englishName":"Al-Qari'ah","ayahs":11,"revelationType":"Meccan","startPage":600},
  {"id":102,"name":"التكاثر","englishName":"At-Takathur","ayahs":8,"revelationType":"Meccan","startPage":600},
  {"id":103,"name":"العصر","englishName":"Al-Asr","ayahs":3,"revelationType":"Meccan","startPage":601},
  {"id":104,"name":"الهمزة","englishName":"Al-Humazah","ayahs":9,"revelationType":"Meccan","startPage":601},
  {"id":105,"name":"الفيل","englishName":"Al-Fil","ayahs":5,"revelationType":"Meccan","startPage":601},
  {"id":106,"name":"قريش","englishName":"Quraysh","ayahs":4,"revelationType":"Meccan","startPage":602},
  {"id":107,"name":"الماعون","englishName":"Al-Ma'un","ayahs":7,"revelationType":"Meccan","startPage":602},
  {"id":108,"name":"الكوثر","englishName":"Al-Kawthar","ayahs":3,"revelationType":"Meccan","startPage":602},
  {"id":109,"name":"الكافرون","englishName":"Al-Kafirun","ayahs":6,"revelationType":"Meccan","startPage":603},
  {"id":110,"name":"النصر","englishName":"An-Nasr","ayahs":3,"revelationType":"Medinan","startPage":603},
  {"id":111,"name":"المسد","englishName":"Al-Masad","ayahs":5,"revelationType":"Meccan","startPage":603},
  {"id":112,"name":"الإخلاص","englishName":"Al-Ikhlas","ayahs":4,"revelationType":"Meccan","startPage":604},
  {"id":113,"name":"الفلق","englishName":"Al-Falaq","ayahs":5,"revelationType":"Meccan","startPage":604},
  {"id":114,"name":"الناس","englishName":"An-Nas","ayahs":6,"revelationType":"Meccan","startPage":604}
];