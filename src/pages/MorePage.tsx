import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MorePage as MorePageType, Settings, PersonalGoal, GoalType } from '../types';
import { AppContext } from '../contexts/AppContext';
import { AuthContext } from '../contexts/AuthContext';
import { CHALLENGES, PRAYER_METHODS, QURAN_TOTAL_PAGES } from '../constants';
import GlassCard from '../components/GlassCard';
import ChallengeCard from '../components/ChallengeCard';
import { getGoalInspiration } from '../services/geminiService';

const SettingsCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <GlassCard>
        <h4 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><span className="text-2xl">{icon}</span> {title}</h4>
        <div className="space-y-4">
            {children}
        </div>
    </GlassCard>
);

const StatCard: React.FC<{ icon: string; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <GlassCard className={`!bg-opacity-25 ${colorClass}`}>
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-black/20 text-3xl`}>{icon}</div>
            <div>
                <p className="text-white font-semibold text-lg">{label}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
            </div>
        </div>
    </GlassCard>
);

const WeeklyPrayerChart: React.FC = () => {
    const context = useContext(AppContext);
    // Fix: Add a guard to ensure context is not null before use.
    if (!context) return null;
    const { weeklyPrayerCounts } = context;

    const maxCount = 5; // Max 5 prayers

    return (
        <GlassCard>
            <h4 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                <span className="text-2xl">📊</span> صلوات الأسبوع الماضي
            </h4>
            <div className="flex justify-around items-end h-40 gap-2 p-2">
                {weeklyPrayerCounts.map((dayData, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="w-full h-full flex items-end justify-center group relative">
                             <div className="absolute -top-6 text-xs bg-black/50 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {dayData.count}
                            </div>
                            <div
                                className="w-4/5 bg-gradient-to-t from-yellow-400 to-amber-500 rounded-t-md transition-all duration-500 ease-out"
                                style={{ height: `${(dayData.count / maxCount) * 100}%` }}
                                title={`${dayData.day}: ${dayData.count} صلوات`}
                            ></div>
                        </div>
                        <span className="text-xs font-medium text-white mt-2">{dayData.day}</span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};

const KhatmaProgressChart: React.FC = () => {
    const context = useContext(AppContext);
    // Fix: Add a guard to ensure context and nested properties are not null.
    if (!context?.stats?.khatmaProgress) return null;

    const { pagesReadInCurrent, percentage } = context.stats.khatmaProgress;
    
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <GlassCard className="!bg-sky-500 !bg-opacity-20 flex flex-col items-center justify-center">
             <h4 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                <span className="text-2xl">📖</span> تقدم الختمة الحالية
            </h4>
            <div className="relative w-40 h-40">
                <svg
                    height="100%"
                    width="100%"
                    viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                    className="transform -rotate-90"
                >
                    <circle
                        stroke="#00000033"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke="url(#progressGradient)"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, strokeLinecap: 'round', transition: 'stroke-dashoffset 0.5s ease-out' }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#0ea5e9" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{Math.round(percentage)}%</span>
                </div>
            </div>
             <p className="mt-4 text-white text-lg font-bold">{pagesReadInCurrent} / {QURAN_TOTAL_PAGES}</p>
             <p className="text-sm text-white">صفحة</p>
        </GlassCard>
    );
};


const StatsAndChallengesPage: React.FC = () => {
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');
    const challengesSectionRef = useRef<HTMLElement>(null);
    const { page } = useParams<{ page: string }>();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 'challenges' && challengesSectionRef.current) {
                challengesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
        
        return () => clearTimeout(timer);
    }, [page]);


    // Fix: Add a guard to ensure context is not null before use.
    if (!context) return null;

    const { stats } = context;
    const filteredChallenges = CHALLENGES.filter(c => c.status === activeTab);

    const statItems = [
        { label: "نقاط الإنجاز", value: stats.totalPoints, icon: "🌟", color: "bg-yellow-500" },
        { label: "أيام متتالية", value: stats.streak, icon: "🔥", color: "bg-orange-500" },
        { label: "صلوات هذا الشهر", value: stats.monthlyPrayers, icon: "🗓️", color: "bg-teal-500" },
        { label: "مجموعات الأذكار المكتملة", value: stats.completedAzkar, icon: "📿", color: "bg-purple-500" },
    ];

    return (
        <div className="space-y-10">
            <section id="stats">
                <h3 className="text-2xl font-bold text-white text-center mb-4">الإحصائيات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <WeeklyPrayerChart />
                    <KhatmaProgressChart />
                    {statItems.map(item => (
                        <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} colorClass={item.color} />
                    ))}
                </div>
            </section>
            <section id="challenges" ref={challengesSectionRef}>
                <h3 className="text-2xl font-bold text-white text-center mb-4">التحديات</h3>
                <div className="space-y-4">
                    <GlassCard className="!p-2">
                        <div className="flex justify-around items-center">
                            <button onClick={() => setActiveTab('active')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'active' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                                نشطة
                            </button>
                            <button onClick={() => setActiveTab('available')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'available' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                                متاحة
                            </button>
                            <button onClick={() => setActiveTab('completed')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'completed' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                                مكتملة
                            </button>
                        </div>
                    </GlassCard>

                    {filteredChallenges.length > 0 ? (
                        filteredChallenges.map(c => <ChallengeCard key={c.id} challenge={c} />)
                    ) : (
                        <GlassCard className="text-center text-white/80">
                            لا توجد تحديات في هذا القسم حالياً.
                        </GlassCard>
                    )}
                </div>
            </section>
        </div>
    );
};


const Section: React.FC<{ title: string; icon?: string; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`p-4 bg-black/20 rounded-lg ${className}`}>
        <h4 className="text-xl font-bold mb-3 text-yellow-300 flex items-center gap-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <span>{title}</span>
        </h4>
        <div className="text-white leading-relaxed space-y-2">
            {children}
        </div>
    </div>
);

const AboutPage: React.FC = () => {
    const features = [
        "تخزين محلي: بياناتك محفوظة بأمان على جهازك الخاص.",
        "متابعة شاملة للصلوات: أوقات الصلوات الخمس مع السنن والنوافل",
        "أذكار مع الأدلة: أذكار يومية كاملة مع النصوص الشرعية والأحاديث",
        "تتبع القرآن الكريم: متابعة قراءة القرآن مع إمكانية تحديد الأهداف",
        "أهدافك الشخصية: إضافة وتتبع أهدافك الإيمانية الخاصة",
        "نظام التحديات: تحديات إيمانية محفزة لبناء عادات قوية",
        "إحصائيات متقدمة: تتبع مفصل للتقدم مع نظام نقاط تحفيزي",
        "تصميم عربي أصيل: واجهة جميلة تحترم الهوية الإسلامية",
    ];

    return (
        <GlassCard className="text-white !p-4 md:!p-6 space-y-6">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-400/20 to-transparent">
                <h3 className="font-amiri text-4xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent">مَحيّاي</h3>
                <p className="font-semibold text-lg mt-1 text-white">رفيقك الروحي اليومي</p>
                <p className="mt-4 max-w-2xl mx-auto text-white">
                    مَحيّاي هو تطبيق إسلامي شامل مطور بعناية فائقة ليكون رفيقك الروحي اليومي، يساعدك على تنظيم عباداتك وتقوية علاقتك بالله سبحانه وتعالى من خلال واجهة عربية جميلة وميزات متقدمة.
                </p>
            </div>

            <Section title="رؤيتنا ورسالتنا" icon="🎯">
                <p>نسعى لأن نكون الرفيق الروحي الأول للمسلمين في العالم العربي، نساعدهم على الالتزام بالعبادات والأذكار وقراءة القرآن الكريم بطريقة منظمة ومحفزة، مع توفير تجربة مستخدم استثنائية تجمع بين الأصالة والحداثة.</p>
            </Section>
            
            <Section title="مميزاتنا الفريدة" icon="🌟">
                <ul className="space-y-2 list-inside">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title="فلسفة التطبيق" icon="💡">
                 <p>يؤمن تطبيق مَحيّاي بأن العبادة يجب أن تكون سهلة ومنظمة وممتعة. لذلك صممناه ليكون أكثر من مجرد تطبيق - إنه رفيق روحي يفهم احتياجاتك الإيمانية ويساعدك على تحقيق أهدافك الروحية بطريقة تدريجية ومستدامة.</p>
            </Section>

            <Section title="الإلهام" icon="📖" className="!bg-gradient-to-tr !from-yellow-900/50 !to-black/20 text-center">
                 <p className="font-amiri text-2xl font-bold">"قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ"</p>
                 <p className="text-sm text-yellow-300 mt-1">سورة الأنعام - آية 162</p>
            </Section>

            <div className="grid md:grid-cols-2 gap-4">
                 <Section title="إهداء خاص" icon="💝">
                     <div className="text-center">
                        <p className="text-5xl">👨‍👧‍👦</p>
                        <p className="mt-2">إلى أغلى ما في الوجود <br/> <strong className="text-yellow-300">عمر وحبيبة</strong></p>
                        <p className="text-xs mt-2 text-white/90">هذا التطبيق مُهدى إليكما بكل الحب والدعاء أن يكون في ميزان حسناتنا جميعاً</p>
                     </div>
                 </Section>
                 <Section title="فريق العمل" icon="👥">
                    <p>فريق من المطورين والمصممين المسلمين المتخصصين في التكنولوجيا الإسلامية، نعمل بشغف لخدمة الأمة الإسلامية وتسهيل العبادة على المسلمين في كل مكان.</p>
                 </Section>
            </div>

             <Section title="تواصل معنا" icon="📞">
                 <div className="text-center">
                     <p>📧 للدعم والاستفسارات:</p>
                     <a href="mailto:support@tech-bokra.com" className="font-bold text-lg text-yellow-300 tracking-wider">support@tech-bokra.com</a>
                     <p className="mt-2 text-sm text-white">نحن نقدر تواصلكم ونسعد بالرد على استفساراتكم واقتراحاتكم.</p>
                 </div>
            </Section>
        </GlassCard>
    );
}

const FAQItem: React.FC<{
    q: string;
    a: string;
    feedback: 'yes' | 'no' | null;
    onFeedback: (feedback: 'yes' | 'no') => void;
}> = ({ q, a, feedback, onFeedback }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-black/20 rounded-lg overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-right p-4 flex justify-between items-center text-white"
            >
                <span className="font-semibold">{q}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="p-4 pt-0 text-white/90 border-t border-white/10">
                    <p className="leading-relaxed">{a}</p>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-4">
                        {feedback === null ? (
                            <>
                                <span className="text-sm font-semibold">هل كانت هذه الإجابة مفيدة؟</span>
                                <button onClick={() => onFeedback('yes')} className="px-3 py-1 text-xs rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-300">نعم</button>
                                <button onClick={() => onFeedback('no')} className="px-3 py-1 text-xs rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300">لا</button>
                            </>
                        ) : (
                            <p className="text-sm font-semibold text-yellow-300">شكراً لتقييمك!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const SupportPage: React.FC = () => {
    const faqCategories = [
        {
            category: "أسئلة عامة",
            icon: "❓",
            faqs: [
                {
                    q: "ما هو تطبيق مَحيّاي؟",
                    a: "مَحيّاي هو تطبيق إسلامي شامل مصمم ليكون رفيقك الروحي اليومي، يساعدك على تنظيم عباداتك من صلوات وأذكار وقراءة للقرآن الكريم، مع متابعة تقدمك عبر إحصائيات وتحديات محفزة."
                },
                {
                    q: "هل التطبيق مجاني؟",
                    a: "نعم، تطبيق مَحيّاي مجاني بالكامل ويهدف لخدمة المسلمين في كل مكان. هذا العمل هو وقف لوجه الله تعالى."
                },
                 {
                    q: "وجدت خطأ في محتوى التطبيق، كيف أبلغ عنه؟",
                    a: "نعتذر عن أي خطأ قد تجده. يرجى مراسلتنا فورًا عبر البريد الإلكتروني الموضح في قسم 'تواصل معنا' مع تفاصيل الخطأ، وسنعمل على تصحيحه في أقرب وقت ممكن. جزاكم الله خيرًا."
                }
            ]
        },
        {
            category: "البيانات والخصوصية",
            icon: "🔒",
            faqs: [
                 {
                    q: "أين يتم حفظ بياناتي؟ وهل هي آمنة؟",
                    a: "يتم حفظ جميع بياناتك (صلواتك، أذكارك، تقدمك) بشكل آمن في التخزين المحلي لمتصفحك على جهازك الخاص. هذا يعني أن بياناتك لا تغادر جهازك وهي خاصة بك تمامًا."
                },
                {
                    q: "هل يمكنني استخدام التطبيق على جهاز آخر ومزامنة بياناتي؟",
                    a: "حاليًا، بياناتك مرتبطة بالمتصفح الذي تستخدمه على جهازك الحالي. لا توجد مزامنة سحابية بين الأجهزة في هذه النسخة، ولكن يمكنك استخدام ميزة 'تصدير البيانات' من لوحة التحكم لنقلها يدوياً."
                },
                {
                    q: "كيف يمكنني حذف جميع بياناتي؟",
                    a: "يمكنك الذهاب إلى 'الإعدادات' واختيار 'إعادة تعيين التطبيق بالكامل' من منطقة الخطر. هذا الإجراء سيحذف جميع بياناتك نهائيًا ولا يمكن التراجع عنه."
                }
            ]
        },
        {
            category: "ميزات التطبيق",
            icon: "⚙️",
            faqs: [
                 {
                    q: "كيف يتم حساب أوقات الصلاة؟",
                    a: "يتم جلب أوقات الصلاة تلقائيًا بناءً على موقع جهازك. إذا لم تمنح الإذن بالوصول للموقع، سيتم استخدام مواقيت القاهرة كإعداد افتراضي. يمكنك تغيير طريقة الحساب من 'الإعدادات'."
                },
                {
                    q: "كيف تعمل أوقات الأذكار؟ وهل يمكنني تخصيصها؟",
                    a: "يقوم التطبيق بعرض أذكار الصباح والمساء تلقائيًا بناءً على الوقت الحالي. ولمزيد من المرونة، يمكنك الذهاب إلى 'الإعدادات' وتحديد وقت بداية أذكار الصباح والمساء بنفسك ليناسب روتينك اليومي."
                },
                {
                    q: "كيف تعمل الإحصائيات والنقاط؟",
                    a: "تُحسب نقاطك بناءً على إنجازاتك اليومية: 10 نقاط لكل صلاة في وقتها، 15 نقطة لكل مجموعة أذكار مكتملة، ونقطتان لكل صفحة تقرأها من القرآن. 'الأيام المتتالية' تزداد كل يوم تكمل فيه 3 صلوات على الأقل."
                },
                {
                    q: "كيف أضيف هدفاً شخصياً؟",
                    a: "من القائمة المنسدلة في الأعلى أو من الصفحة الرئيسية، اختر 'أهدافي الشخصية'. هناك يمكنك إضافة هدف جديد، سواء كان هدفًا يوميًا (مثل قراءة أذكار معينة) أو هدفًا له كمية محددة (مثل قراءة كتاب)."
                }
            ]
        },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, 'yes' | 'no' | null>>({});

    const handleFeedback = (question: string, feedback: 'yes' | 'no') => {
        setHelpfulFeedback(prev => ({ ...prev, [question]: feedback }));
    };

    const filteredResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        
        const lowercasedTerm = searchTerm.toLowerCase();
        const results: { q: string, a: string }[] = [];

        faqCategories.forEach(category => {
            category.faqs.forEach(faq => {
                if (faq.q.toLowerCase().includes(lowercasedTerm) || faq.a.toLowerCase().includes(lowercasedTerm)) {
                    results.push(faq);
                }
            });
        });
        return results;
    }, [searchTerm, faqCategories]);

    return (
        <div className="space-y-6">
            <GlassCard>
                <div className="relative">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث عن سؤالك هنا..."
                        className="w-full bg-black/30 border border-white/20 rounded-full px-5 py-3 pr-12 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                     <div className="absolute top-1/2 right-4 -translate-y-1/2 text-white/80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
            </GlassCard>

            {searchTerm.trim() ? (
                <GlassCard>
                    <h3 className="font-amiri text-xl text-center mb-4 text-white">نتائج البحث</h3>
                     <div className="space-y-3">
                        {filteredResults.length > 0 ? (
                            filteredResults.map((faq, i) => (
                                <FAQItem key={`search-${i}`} q={faq.q} a={faq.a} feedback={helpfulFeedback[faq.q] || null} onFeedback={(feedback) => handleFeedback(faq.q, feedback)} />
                            ))
                        ) : (
                            <p className="text-center text-white/80 py-4">لم يتم العثور على نتائج لبحثك.</p>
                        )}
                    </div>
                </GlassCard>
            ) : (
                faqCategories.map(category => (
                    <GlassCard key={category.category}>
                        <h3 className="font-amiri text-xl text-center mb-4 text-white flex items-center justify-center gap-2"><span className="text-2xl">{category.icon}</span> {category.category}</h3>
                        <div className="space-y-3">
                            {category.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} feedback={helpfulFeedback[faq.q] || null} onFeedback={(feedback) => handleFeedback(faq.q, feedback)} />)}
                        </div>
                    </GlassCard>
                ))
            )}
            
            <GlassCard className="text-white space-y-4 text-center">
                <div className="text-5xl">📧</div>
                <h3 className="font-amiri text-2xl">بحاجة للمزيد من المساعدة؟</h3>
                <p>إذا لم تجد إجابة لسؤالك، أو كان لديك اقتراح لتطوير التطبيق، لا تتردد في التواصل معنا.</p>
                <div className="p-4 bg-black/20 rounded-lg">
                    <a href="mailto:support@tech-bokra.com" className="font-bold text-xl text-yellow-300 tracking-wider hover:text-yellow-200 transition-colors">تواصل معنا</a>
                </div>
            </GlassCard>
        </div>
    );
}

const SettingsPage: React.FC = () => {
    const context = useContext(AppContext);
    const authContext = useContext(AuthContext);

    // Fix: Add guards for both contexts.
    if (!context || !authContext) {
        return (
            <GlassCard>
                <p className="text-center text-white">جاري تحميل الإعدادات...</p>
            </GlassCard>
        );
    }
    
    const { settings, updateSettings, resetAllData, coordinates, locationError, detectLocation } = context;
    const { profile, updateUserProfile, resetProfile } = authContext;

    const [userName, setUserName] = useState(profile?.name || '');
    
    useEffect(() => {
      if (profile?.name) {
        setUserName(profile.name);
      }
    }, [profile?.name]);


    const handleSettingsChange = (key: keyof Settings, value: any) => {
        updateSettings({ [key]: value });
    };

    const handleGoalChange = (change: number) => {
        const newGoal = Math.max(1, (settings.quranGoal || 10) + change);
        handleSettingsChange('quranGoal', newGoal);
    }
    
    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || userName.trim() === profile.name || !userName.trim()) return;
        updateUserProfile(userName.trim());
        alert("تم تحديث الاسم بنجاح.");
    }
    
    const handleFullReset = () => {
        if (!window.confirm("⚠️ تحذير! هل أنت متأكد من حذف ملفك الشخصي وجميع بيانات العبادة؟ لا يمكن التراجع عن هذا الإجراء.")) return;
        resetAllData();
        resetProfile();
        alert("تم إعادة تعيين التطبيق بالكامل.");
    }

    return (
        <div className="space-y-6 text-white">
            <GlassCard>
                 <div className="flex flex-col items-center text-center gap-4">
                     <div className="relative">
                         <img 
                            src={profile?.picture} 
                            alt={profile?.name} 
                            className="w-24 h-24 rounded-full border-4 border-white/50 object-cover shadow-lg"
                         />
                     </div>
                    <form onSubmit={handleProfileUpdate} className="w-full max-w-sm space-y-4">
                        <div>
                            <label htmlFor="username" className="text-sm sr-only">الاسم</label>
                            <input 
                                id="username"
                                type="text" 
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder={"اكتب اسمك"}
                                className="w-full text-center text-xl font-bold bg-white/10 rounded-md py-1 border border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder:text-white/70" 
                            />
                        </div>
                        <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50" disabled={!profile || userName.trim() === profile?.name || !userName.trim()}>
                            حفظ الاسم
                        </button>
                    </form>
                 </div>
            </GlassCard>

            <SettingsCard title="إعدادات الموقع" icon="📍">
                <div className="text-center space-y-2">
                    {coordinates && !locationError && (
                        <p className="text-green-300 font-semibold">✅ يتم استخدام موقعك الحالي لدقة المواقيت.</p>
                    )}
                    {locationError && (
                        <p className="text-yellow-300 text-sm font-semibold">{locationError}</p>
                    )}
                    <button
                        onClick={detectLocation}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        إعادة تحديد الموقع
                    </button>
                </div>
            </SettingsCard>
            
            <SettingsCard title="إعدادات التطبيق" icon="📱">
                <div className="flex items-center justify-between">
                    <label className="font-semibold">هدف القرآن اليومي (صفحات)</label>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleGoalChange(-1)} className="w-8 h-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20">-</button>
                        <span className="text-xl font-bold text-white w-8 text-center">{settings.quranGoal}</span>
                        <button onClick={() => handleGoalChange(1)} className="w-8 h-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20">+</button>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <label htmlFor="prayer_method" className="text-sm font-semibold mb-2 block">طريقة حساب مواقيت الصلاة</label>
                    <select 
                        id="prayer_method" 
                        value={settings.prayerMethod} 
                        onChange={e => handleSettingsChange('prayerMethod', Number(e.target.value))} 
                        className="w-full mt-1 bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                        {PRAYER_METHODS.map(method => (
                            <option key={method.id} value={method.id} style={{ backgroundColor: '#2d5a47' }}>
                                {method.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/95 mb-2">تخصيص أوقات الأذكار</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="morning_azkar" className="text-sm font-semibold">بداية أذكار الصباح</label>
                            <input id="morning_azkar" type="time" value={settings.azkarMorningStart} onChange={e => handleSettingsChange('azkarMorningStart', e.target.value)} className="w-full mt-1 bg-black/30 border border-white/20 rounded-lg px-3 py-2" />
                        </div>
                         <div>
                            <label htmlFor="evening_azkar" className="text-sm font-semibold">بداية أذكار المساء</label>
                            <input id="evening_azkar" type="time" value={settings.azkarEveningStart} onChange={e => handleSettingsChange('azkarEveningStart', e.target.value)} className="w-full mt-1 bg-black/30 border border-white/20 rounded-lg px-3 py-2" />
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="الإشعارات" icon="🔔">
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold">تفعيل إشعارات الصلوات</span>
                    <input type="checkbox" checked={settings.notifications.prayers} onChange={e => handleSettingsChange('notifications', {...settings.notifications, prayers: e.target.checked})} className="w-6 h-6 rounded accent-yellow-400"/>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold">تفعيل إشعارات الأذكار</span>
                    <input type="checkbox" checked={settings.notifications.azkar} onChange={e => handleSettingsChange('notifications', {...settings.notifications, azkar: e.target.checked})} className="w-6 h-6 rounded accent-yellow-400"/>
                </label>
            </SettingsCard>

             <div className="border-2 border-red-500/50 rounded-2xl p-4 space-y-4">
                <h4 className="text-lg font-bold text-center text-red-300">منطقة الخطر</h4>
                <button onClick={() => context.resetAllData()} className="w-full bg-red-800/80 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    🗑️ إعادة تعيين بيانات العبادة والأهداف
                </button>
                <button onClick={handleFullReset} className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    🔥 إعادة تعيين التطبيق بالكامل
                </button>
                 <p className="text-xs text-center text-red-300">هذه الإجراءات نهائية ولا يمكن التراجع عنها.</p>
            </div>
        </div>
    )
}

const GOAL_ICONS = ['🎯', '📖', '🤲', '❤️', '💰', '🏃‍♂️', '🌱', '⭐', '📿', '🕌'];

const GoalsPage: React.FC = () => {
    const context = useContext(AppContext);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [goal, setGoal] = useState({ title: '', icon: GOAL_ICONS[0], type: 'daily' as GoalType, target: 1, unit: '', endDate: '' });
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
    
    const [inspiration, setInspiration] = useState<{title: string; icon: string} | null>(null);
    const [isInspiring, setIsInspiring] = useState(false);
    const [inspirationError, setInspirationError] = useState<string | null>(null);


    if (!context) return null;
    const { personalGoals, addPersonalGoal, goalProgress, updateTargetGoalProgress, toggleDailyGoalCompletion, dailyData, deletePersonalGoal } = context;
    
    const handleInspireMe = async () => {
        setIsInspiring(true);
        setInspiration(null);
        setInspirationError(null);
        const response = await getGoalInspiration();
        if (response.data) {
            setInspiration(response.data);
        } else {
            setInspirationError(response.error || "عذراً، لم نتمكن من جلب إلهام في الوقت الحالي. حاول مرة أخرى.");
            console.error("Goal Inspiration Error:", response.error);
        }
        setIsInspiring(false);
    }

    const useInspiration = () => {
        if (!inspiration) return;
        setGoal(prev => ({
            ...prev,
            title: inspiration.title,
            icon: GOAL_ICONS.includes(inspiration.icon) ? inspiration.icon : prev.icon
        }));
        setInspiration(null);
        setIsFormVisible(true);
    }


    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal.title.trim()) {
            alert('الرجاء إدخال عنوان الهدف.');
            return;
        }
        const newGoal: Omit<PersonalGoal, 'id'|'createdAt'|'isArchived'|'completedAt'> = {
            title: goal.title,
            icon: goal.icon,
            type: goal.type,
            target: goal.type === 'daily' ? 1 : Number(goal.target),
            unit: goal.unit || undefined,
            endDate: goal.endDate || undefined,
        };
        addPersonalGoal(newGoal);
        setGoal({ title: '', icon: GOAL_ICONS[0], type: 'daily', target: 1, unit: '', endDate: '' });
        setIsFormVisible(false);
    };

    const activeGoals = personalGoals.filter(g => !g.isArchived);
    const archivedGoals = personalGoals.filter(g => g.isArchived);
    const displayedGoals = activeTab === 'active' ? activeGoals : archivedGoals;

    return (
        <div className="space-y-6 text-white">
            <GlassCard className="!bg-gradient-to-tr !from-purple-500/20 !to-indigo-500/30 !border-purple-400/30">
                <div className="text-center space-y-3">
                    <h3 className="font-amiri text-xl text-white">هل تبحث عن هدف جديد؟</h3>
                    <p className="text-sm text-white/90">دع الذكاء الاصطناعي يقترح عليك هدفاً إيمانياً بسيطاً وملهمًا لتبدأ به.</p>
                    <button onClick={handleInspireMe} disabled={isInspiring} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait">
                        {isInspiring ? 'لحظات من فضلك...' : '💡 ألهمني بهدف'}
                    </button>
                    {inspiration && (
                        <div className="mt-4 p-4 bg-black/30 rounded-lg animate-fade-in text-center space-y-3">
                            <p className="text-2xl">{inspiration.icon}</p>
                            <p className="font-semibold text-lg text-white">"{inspiration.title}"</p>
                            <button onClick={useInspiration} className="bg-yellow-500 hover:bg-yellow-600 text-green-900 text-sm font-bold py-2 px-4 rounded-full transition-colors">
                                استخدام هذا الهدف
                            </button>
                        </div>
                    )}
                    {inspirationError && (
                        <div className="mt-4 p-3 bg-red-900/50 rounded-lg text-red-300 text-sm animate-fade-in">
                            {inspirationError}
                        </div>
                    )}
                </div>
            </GlassCard>

            {!isFormVisible && (
                <button onClick={() => setIsFormVisible(true)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors text-lg">
                    + إضافة هدف جديد
                </button>
            )}

            {isFormVisible && (
                <GlassCard className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-4 text-center">هدف جديد</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">عنوان الهدف</label>
                            <input type="text" value={goal.title} onChange={e => setGoal({...goal, title: e.target.value})} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2" placeholder="مثال: الاستغفار 100 مرة" />
                        </div>
                        <div>
                             <label className="block text-sm font-semibold mb-1">اختر أيقونة</label>
                             <div className="flex flex-wrap gap-2 bg-black/20 p-2 rounded-lg">
                                {GOAL_ICONS.map(icon => (
                                    <button type="button" key={icon} onClick={() => setGoal({...goal, icon})} className={`w-10 h-10 text-2xl rounded-lg transition-all ${goal.icon === icon ? 'bg-yellow-400/50 ring-2 ring-yellow-300' : 'bg-white/10'}`}>{icon}</button>
                                ))}
                             </div>
                        </div>
                         <div>
                            <label className="block text-sm font-semibold mb-1">نوع الهدف</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setGoal({...goal, type: 'daily'})} className={`flex-1 py-2 rounded-lg ${goal.type === 'daily' ? 'bg-teal-500' : 'bg-black/30'}`}>تكرار يومي</button>
                                <button type="button" onClick={() => setGoal({...goal, type: 'target'})} className={`flex-1 py-2 rounded-lg ${goal.type === 'target' ? 'bg-teal-500' : 'bg-black/30'}`}>كمية مستهدفة</button>
                            </div>
                        </div>
                        {goal.type === 'target' && (
                             <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                 <div>
                                    <label className="block text-sm font-semibold mb-1">الكمية</label>
                                    <input type="number" value={goal.target} min="1" onChange={e => setGoal({...goal, target: Number(e.target.value)})} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">الوحدة</label>
                                    <input type="text" value={goal.unit} onChange={e => setGoal({...goal, unit: e.target.value})} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2" placeholder="صفحة، مرة، جزء..."/>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold mb-1">تاريخ الانتهاء (اختياري)</label>
                            <input type="date" value={goal.endDate} onChange={e => setGoal({...goal, endDate: e.target.value})} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2" />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 font-bold py-3 rounded-lg">حفظ الهدف</button>
                            <button type="button" onClick={() => setIsFormVisible(false)} className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg">إلغاء</button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <GlassCard className="!p-2">
                <div className="flex justify-around items-center">
                    <button onClick={() => setActiveTab('active')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'active' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                        أهداف نشطة ({activeGoals.length})
                    </button>
                    <button onClick={() => setActiveTab('archived')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'archived' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                        أهداف مكتملة ({archivedGoals.length})
                    </button>
                </div>
            </GlassCard>

            {displayedGoals.length > 0 ? (
                <div className="space-y-4">
                    {displayedGoals.map(g => {
                        const isCompletedToday = g.type === 'daily' && dailyData.dailyGoalProgress[g.id];
                        const currentProgress = g.type === 'target' ? (goalProgress[g.id] || 0) : 0;
                        const progressPercentage = g.type === 'target' ? (currentProgress / g.target) * 100 : (isCompletedToday ? 100 : 0);
                        const daysRemaining = g.endDate ? Math.ceil((new Date(g.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

                        return (
                            <GlassCard key={g.id} className="relative">
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl p-3 rounded-xl bg-black/20">{g.icon}</div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-lg">{g.title}</h4>
                                        <div className="text-xs text-white/80 space-x-2 space-x-reverse">
                                            <span>{g.type === 'daily' ? 'هدف يومي' : `الهدف: ${g.target} ${g.unit || ''}`}</span>
                                            {daysRemaining !== null && daysRemaining >= 0 && <span className="text-yellow-300">| متبقي {daysRemaining} أيام</span>}
                                            {daysRemaining !== null && daysRemaining < 0 && <span className="text-red-400">| انتهى الوقت</span>}
                                        </div>
                                        <div className="w-full bg-black/20 rounded-full h-2.5 mt-2">
                                            <div className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2.5 rounded-full transition-all" style={{width: `${progressPercentage}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                                {g.type === 'daily' ? (
                                    <div className="mt-4 text-center">
                                        <button onClick={() => toggleDailyGoalCompletion(g.id)} className={`w-full py-2 rounded-lg font-semibold transition-colors ${isCompletedToday ? 'bg-teal-500' : 'bg-black/30'}`}>
                                            {isCompletedToday ? '✅ تم إنجاز اليوم' : 'إنجاز اليوم'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex items-center justify-center gap-4">
                                        <button onClick={() => updateTargetGoalProgress(g.id, currentProgress - 1)} className="w-10 h-10 rounded-full bg-white/10 text-xl hover:bg-white/20">-</button>
                                        <span className="text-xl font-bold w-20 text-center">{currentProgress} / {g.target}</span>
                                        <button onClick={() => updateTargetGoalProgress(g.id, currentProgress + 1)} className="w-10 h-10 rounded-full bg-white/10 text-xl hover:bg-white/20">+</button>
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                     <button onClick={() => {if(window.confirm('هل أنت متأكد من حذف هذا الهدف؟')) deletePersonalGoal(g.id)}} className="w-8 h-8 rounded-full bg-red-800/50 hover:bg-red-700 text-white text-xs">حذف</button>
                                </div>
                            </GlassCard>
                        )
                    })}
                </div>
            ) : (
                <GlassCard className="text-center text-white/80 py-8">
                    {activeTab === 'active' ? 'لا توجد أهداف نشطة. ابدأ بإضافة هدف جديد!' : 'لا توجد أهداف مكتملة بعد.'}
                </GlassCard>
            )}

        </div>
    );
};


const MorePage: React.FC = () => {
    const { page } = useParams<{ page: MorePageType }>();

    const availablePages: MorePageType[] = ['stats', 'challenges', 'about', 'support', 'settings', 'goals'];
    const currentPage = page && availablePages.includes(page) ? page : 'stats';


    const pageComponents: Record<MorePageType, React.ComponentType> = {
        stats: StatsAndChallengesPage,
        challenges: StatsAndChallengesPage,
        about: AboutPage,
        support: SupportPage,
        settings: SettingsPage,
        goals: GoalsPage,
    };

    const pageTitles: Record<MorePageType, string> = {
        stats: '📊 الإحصائيات والتحديات',
        challenges: '📊 الإحصائيات والتحديات',
        about: 'ℹ️ عن التطبيق',
        support: '🆘 الدعم والأسئلة الشائعة',
        settings: '⚙️ الإعدادات',
        goals: '🎯 أهدافي الشخصية'
    }

    const CurrentPage = pageComponents[currentPage];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center font-amiri">{pageTitles[currentPage]}</h2>
            {CurrentPage ? <CurrentPage /> : <p className="text-center text-white">الصفحة غير موجودة</p>}
        </div>
    );
};

export default MorePage;