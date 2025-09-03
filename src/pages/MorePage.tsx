import React, { useContext, useState, useEffect, useRef } from 'react';
// Fix: Corrected react-router-dom import to use namespace import to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { MorePage as MorePageType, Settings } from '../types.ts';
import { AppContext } from '../contexts/AppContext.ts';
import { AuthContext } from '../contexts/AuthContext.tsx';
import { CHALLENGES, PRAYER_METHODS, QURAN_TOTAL_PAGES } from '../constants.ts';
import GlassCard from '../components/GlassCard.tsx';
import ChallengeCard from '../components/ChallengeCard.tsx';

const SettingsCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <GlassCard>
        <h4 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><span className="text-2xl">{icon}</span> {title}</h4>
        <div className="space-y-4">
            {children}
        </div>
    </GlassCard>
);

const StatCard: React.FC<{ icon: string; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <GlassCard className={`!bg-opacity-20 ${colorClass}`}>
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
                        <span className="text-xs text-white/80 mt-2">{dayData.day}</span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};

const KhatmaProgressChart: React.FC = () => {
    const context = useContext(AppContext);
    if (!context?.stats.khatmaProgress) return null;

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
             <p className="text-sm text-white/80">صفحة</p>
        </GlassCard>
    );
};


const StatsAndChallengesPage: React.FC = () => {
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');

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
            <section id="challenges">
                <h3 className="text-2xl font-bold text-white text-center mb-4">التحديات</h3>
                <div className="space-y-4">
                    <GlassCard className="!p-2">
                        <div className="flex justify-around items-center">
                            <button onClick={() => setActiveTab('active')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'active' ? 'bg-yellow-400/80 text-green-900' : 'text-white/70 hover:bg-white/10'}`}>
                                نشطة
                            </button>
                            <button onClick={() => setActiveTab('available')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'available' ? 'bg-yellow-400/80 text-green-900' : 'text-white/70 hover:bg-white/10'}`}>
                                متاحة
                            </button>
                            <button onClick={() => setActiveTab('completed')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'completed' ? 'bg-yellow-400/80 text-green-900' : 'text-white/70 hover:bg-white/10'}`}>
                                مكتملة
                            </button>
                        </div>
                    </GlassCard>

                    {filteredChallenges.length > 0 ? (
                        filteredChallenges.map(c => <ChallengeCard key={c.id} challenge={c} />)
                    ) : (
                        <GlassCard className="text-center text-white/70">
                            لا توجد تحديات في هذا القسم حالياً.
                        </GlassCard>
                    )}
                </div>
            </section>
        </div>
    );
};


const Section: React.FC<{ title: string; icon?: string; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`p-4 bg-black/10 rounded-lg ${className}`}>
        <h4 className="text-xl font-bold mb-3 text-yellow-300 flex items-center gap-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <span>{title}</span>
        </h4>
        <div className="text-white/90 leading-relaxed space-y-2">
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
        "نظام التحديات: تحديات إيمانية محفزة لبناء عادات قوية",
        "إحصائيات متقدمة: تتبع مفصل للتقدم مع نظام نقاط تحفيزي",
        "تصميم عربي أصيل: واجهة جميلة تحترم الهوية الإسلامية",
    ];

    return (
        <GlassCard className="text-white !p-4 md:!p-6 space-y-6">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-400/20 to-transparent">
                <h3 className="font-amiri text-4xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent">مَحيّاي</h3>
                <p className="font-semibold text-lg mt-1 text-white/90">رفيقك الروحي اليومي</p>
                <p className="mt-4 max-w-2xl mx-auto text-white/80">
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
                        <p className="text-xs mt-2 opacity-80">هذا التطبيق مُهدى إليكما بكل الحب والدعاء أن يكون في ميزان حسناتنا جميعاً</p>
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
                     <p className="mt-2 text-sm opacity-80">نحن نقدر تواصلكم ونسعد بالرد على استفساراتكم واقتراحاتكم.</p>
                 </div>
            </Section>
        </GlassCard>
    );
}

const FAQItem: React.FC<{q: string, a: string}> = ({q, a}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-black/20 rounded-lg overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-right p-4 flex justify-between items-center text-white">
                <span className="font-semibold">{q}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-white/80">
                    <p>{a}</p>
                </div>
            )}
        </div>
    );
};


const SupportPage: React.FC = () => {
    const faqs = [
        {
            q: "أين يتم حفظ بياناتي؟ وهل هي آمنة؟",
            a: "يتم حفظ جميع بياناتك (صلواتك، أذكارك، تقدمك) بشكل آمن في التخزين المحلي لمتصفحك على جهازك الخاص. هذا يعني أن بياناتك لا تغادر جهازك وهي خاصة بك تمامًا."
        },
        {
            q: "هل يمكنني استخدام التطبيق على جهاز آخر؟",
            a: "حاليًا، بياناتك مرتبطة بالمتصفح الذي تستخدمه على جهازك الحالي. لا توجد مزامنة سحابية بين الأجهزة في هذه النسخة."
        },
        {
            q: "كيف يمكنني تغيير اسمي؟",
            a: "يمكنك تغيير اسمك في أي وقت من صفحة 'الإعدادات'. يتم حفظ التغييرات مباشرة."
        },
        {
            q: "كيف تعمل أوقات الأذكار؟ وهل يمكنني تخصيصها؟",
            a: "يقوم التطبيق بعرض أذكار الصباح والمساء تلقائيًا بناءً على الوقت الحالي. ولمزيد من المرونة، يمكنك الذهاب إلى 'الإعدادات' وتحديد وقت بداية أذكار الصباح والمساء بنفسك ليناسب روتينك اليومي."
        },
        {
            q: "كيف يتم حساب أوقات الصلاة؟",
            a: "يتم جلب أوقات الصلاة تلقائيًا بناءً على موقع جهازك التقريبي عبر واجهة برمجية موثوقة (api.aladhan.com). يمكنك التأكد من دقتها مع مسجدك المحلي."
        },
        {
            q: "كيف تعمل الإحصائيات والنقاط؟",
            a: "تُحسب نقاطك بناءً على إنجازاتك اليومية: 10 نقاط لكل صلاة في وقتها، 15 نقطة لكل مجموعة أذكار مكتملة، ونقطتان لكل صفحة تقرأها من القرآن. 'الأيام المتتالية' تزداد كل يوم تكمل فيه 3 صلوات على الأقل. يتم تحديث باقي الإحصائيات تلقائيًا بناءً على أدائك."
        },
        {
            q: "وجدت خطأ في محتوى التطبيق، كيف أبلغ عنه؟",
            a: "نعتذر عن أي خطأ قد تجده. يرجى مراسلتنا فورًا عبر البريد الإلكتروني الموضح أدناه مع تفاصيل الخطأ، وسنعمل على تصحيحه في أقرب وقت ممكن. جزاكم الله خيرًا."
        }
    ];

    return (
        <div className="space-y-6">
            <GlassCard className="text-white space-y-4">
                <h3 className="font-amiri text-2xl text-center">الأسئلة الشائعة</h3>
                <div className="space-y-3">
                    {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
                </div>
            </GlassCard>
            <GlassCard className="text-white space-y-4 text-center">
                <h3 className="font-amiri text-2xl">بحاجة للمزيد من المساعدة؟</h3>
                <p>إذا لم تجد إجابة لسؤالك، أو كان لديك اقتراح لتطوير التطبيق، لا تتردد في التواصل معنا.</p>
                <div className="p-4 bg-black/20 rounded-lg">
                    <p>للتواصل عبر البريد الإلكتروني:</p>
                    <a href="mailto:support@tech-bokra.com" className="font-bold text-yellow-300 tracking-wider">support@tech-bokra.com</a>
                </div>
            </GlassCard>
        </div>
    );
}

const SettingsPage: React.FC = () => {
    const context = useContext(AppContext);
    const authContext = useContext(AuthContext);

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
                            <label htmlFor="username" className="text-sm opacity-80 sr-only">الاسم</label>
                            <input 
                                id="username"
                                type="text" 
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder={"اكتب اسمك"}
                                className="w-full text-center text-xl font-bold bg-transparent border-0 focus:ring-0" 
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
                        <p className="text-green-300">✅ يتم استخدام موقعك الحالي لدقة المواقيت.</p>
                    )}
                    {locationError && (
                        <p className="text-yellow-300 text-sm">{locationError}</p>
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
                    <label>هدف القرآن اليومي (صفحات)</label>
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
                    <p className="text-sm opacity-80 mb-2">تخصيص أوقات الأذكار</p>
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
                    <span>تفعيل إشعارات الصلوات</span>
                    <input type="checkbox" checked={settings.notifications.prayers} onChange={e => handleSettingsChange('notifications', {...settings.notifications, prayers: e.target.checked})} className="w-6 h-6 rounded accent-yellow-400"/>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                    <span>تفعيل إشعارات الأذكار</span>
                    <input type="checkbox" checked={settings.notifications.azkar} onChange={e => handleSettingsChange('notifications', {...settings.notifications, azkar: e.target.checked})} className="w-6 h-6 rounded accent-yellow-400"/>
                </label>
            </SettingsCard>

             <div className="border-2 border-red-500/50 rounded-2xl p-4 space-y-4">
                <h4 className="text-lg font-bold text-center text-red-300">منطقة الخطر</h4>
                <button onClick={resetAllData} className="w-full bg-red-800/80 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    🗑️ إعادة تعيين بيانات العبادة
                </button>
                <button onClick={handleFullReset} className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    🔥 إعادة تعيين التطبيق بالكامل
                </button>
                 <p className="text-xs text-center text-red-300/80">هذه الإجراءات نهائية ولا يمكن التراجع عنها.</p>
            </div>
        </div>
    )
}


const MorePage: React.FC = () => {
    const { page } = ReactRouterDOM.useParams<{ page: MorePageType }>();

    const availablePages: MorePageType[] = ['stats', 'challenges', 'about', 'support', 'settings'];
    const currentPage = page && availablePages.includes(page) ? page : 'stats';


    const pageComponents: Record<MorePageType, React.ComponentType> = {
        stats: StatsAndChallengesPage,
        challenges: StatsAndChallengesPage,
        about: AboutPage,
        support: SupportPage,
        settings: SettingsPage,
    };

    const pageTitles: Record<MorePageType, string> = {
        stats: '📊 الإحصائيات والتحديات',
        challenges: '📊 الإحصائيات والتحديات',
        about: 'ℹ️ عن التطبيق',
        support: '🆘 الدعم والأسئلة الشائعة',
        settings: '⚙️ الإعدادات',
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