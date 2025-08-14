import React, { useContext, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MorePage as MorePageType, Settings, UserChallenge } from '../types.ts';
import { AppContext } from '../contexts/AppContext.ts';
import { AuthContext } from '../contexts/AuthContext.tsx';
import { CHALLENGES } from '../constants.ts';
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

const StatsAndChallengesPage: React.FC = () => {
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');

    if (!context) return null;

    const { stats } = context;
    const filteredChallenges = CHALLENGES.filter(c => c.status === activeTab);

    const statItems = [
        { label: "نقاط الإنجاز", value: stats.totalPoints, icon: "🌟", color: "bg-yellow-500" },
        { label: "أيام متتالية", value: stats.streak, icon: "🔥", color: "bg-orange-500" },
        { label: "صلوات هذا الأسبوع", value: stats.weeklyPrayers, icon: "🕌", color: "bg-green-500" },
        { label: "صلوات هذا الشهر", value: stats.monthlyPrayers, icon: "🗓️", color: "bg-teal-500" },
        { label: "إجمالي الصفحات المقروؤة", value: stats.quranPages, icon: "📖", color: "bg-sky-500" },
        { label: "مجموعات الأذكار المكتملة", value: stats.completedAzkar, icon: "📿", color: "bg-purple-500" },
    ];

    return (
        <div className="space-y-10">
            <section id="stats">
                <h3 className="text-2xl font-bold text-white text-center mb-4">الإحصائيات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        "متابعة شاملة للصلوات: أوقات الصلوات الخمس مع السنن والنوافل",
        "أذكار مع الأدلة: أذكار يومية كاملة مع النصوص الشرعية والأحاديث",
        "تتبع القرآن الكريم: متابعة قراءة القرآن مع إمكانية تحديد الأهداف",
        "نظام التحديات: تحديات إيمانية محفزة لبناء عادات قوية",
        "إحصائيات متقدمة: تتبع مفصل للتقدم مع نظام نقاط تحفيزي",
        "تصميم عربي أصيل: واجهة جميلة تحترم الهوية الإسلامية",
        "يعمل بدون إنترنت: جميع الميزات متاحة محلياً على جهازك"
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
            q: "كيف يمكنني التسجيل بدون حساب جوجل؟",
            a: "يمكنك بسهولة إنشاء حساب جديد باستخدام بريدك الإلكتروني وكلمة مرور من خلال صفحة تسجيل الدخول. اختر 'أنشئ حساباً' وأدخل بياناتك للبدء."
        },
        {
            q: "هل يمكنني تغيير اسمي أو صورتي الشخصية؟",
            a: "نعم. يمكنك تغيير صورتك الرمزية في أي وقت من صفحة 'الإعدادات'. أما تغيير الاسم، فهو متاح حاليًا للحسابات التي تم إنشاؤها باستخدام البريد الإلكتروني فقط."
        },
        {
            q: "كيف تعمل أوقات الأذكار؟ وهل يمكنني تخصيصها؟",
            a: "يقوم التطبيق بعرض أذكار الصباح والمساء تلقائيًا بناءً على الوقت الحالي. ولمزيد من المرونة، يمكنك الذهاب إلى 'الإعدادات' وتحديد وقت بداية أذكار الصباح والمساء بنفسك ليناسب روتينك اليومي."
        },
        {
            q: "كيف يتم حساب أوقات الصلاة؟",
            a: "يتم جلب أوقات الصلاة تلقائيًا بناءً على موقع جهازك التقريبي عبر واجهة برمجية موثوقة (api.aladhan.com) باستخدام طريقة حساب الهيئة المصرية العامة للمساحة. يمكنك التأكد من دقتها مع مسجدك المحلي."
        },
        {
            q: "هل يمكنني استخدام التطبيق بدون انترنت؟",
            a: "نعم! يمكنك تسجيل جميع عباداتك اليومية بدون الحاجة لاتصال بالإنترنت. يتم حفظ بياناتك محليًا على جهازك. ستحتاج إلى اتصال بالإنترنت فقط لتحديث أوقات الصلاة."
        },
        {
            q: "كيف يتم تخزين بياناتي؟ وهل هي آمنة؟",
            a: "بياناتك الشخصية وبيانات عبادتك تُحفظ بشكل آمن ومشفر على جهازك فقط. نحن لا نجمع أو نطلع على أي من بياناتك الخاصة. خصوصيتك هي أولويتنا القصوى."
        },
        {
            q: "كيف تعمل الإحصائيات والنقاط؟",
            a: "تُحسب نقاطك بناءً على إنجازاتك اليومية: 10 نقاط لكل صلاة في وقتها، 15 نقطة لكل مجموعة أذكار مكتملة، ونقطتان لكل صفحة تقرأها من القرآن. 'الأيام المتتالية' تزداد كل يوم تكمل فيه 3 صلوات على الأقل. يتم تحديث باقي الإحصائيات تلقائيًا بناءً على أدائك."
        },
        {
            q: "ما هي التحديات وكيف أشارك فيها؟",
            a: "التحديات هي أهداف إيمانية مصممة لتحفيزك على بناء عادات إيجابية. يمكنك متابعة التحديات النشطة من الصفحة الرئيسية ومن صفحة 'الإحصائيات والتحديات'. عند إكمال تحدٍ ما، ستحصل على نقاط إنجاز."
        },
        {
            q: "ما هي ميزة المجتمع وكيف تعمل؟",
            a: "ميزة المجتمع تتيح لك التواصل مع الأصدقاء والعائلة لمشاركة تقدمكم الروحي وتحفيز بعضكم البعض. يمكنك إنشاء مجموعات، دعوة الأصدقاء، ورؤية أنشطة وإحصائيات أعضاء المجموعة (بعد موافقتهم عبر إعدادات المشاركة). هذه الميزة تهدف إلى خلق بيئة إيجابية ومشجعة على الطاعة."
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
    
    if(!context || !authContext?.user) return null;

    const { settings, updateSettings, resetAllData, importData } = context;
    const { user, updateUserProfile, deleteAccount, updateUserProfilePicture } = authContext;
    const [userName, setUserName] = useState(user.name || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const isEmailUser = user.id.startsWith('email_');

    const handleSettingsChange = (key: keyof Settings, value: any) => {
        updateSettings({ [key]: value });
    };

    const handleGoalChange = (change: number) => {
        const newGoal = Math.max(1, (settings.quranGoal || 10) + change);
        handleSettingsChange('quranGoal', newGoal);
    }

    const handleReset = () => {
        const confirmMsg = "⚠️ تحذير! هل أنت متأكد من أنك تريد مسح جميع بياناتك؟ لا يمكن التراجع عن هذا الإجراء.";
        if(window.confirm(confirmMsg)) {
            resetAllData();
            alert("تم مسح البيانات بنجاح.");
        }
    }

    const handleDeleteAccount = () => {
        const confirmMsg = "⚠️ تحذير! هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك نهائياً ولا يمكن استعادتها.";
        if(window.confirm(confirmMsg)) {
            deleteAccount();
        }
    }
    
    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (userName.trim() === user.name) return;
        updateUserProfile(userName.trim());
    }

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importData(file);
        }
    };

    return (
        <div className="space-y-6 text-white">
            <GlassCard>
                 <div className="flex flex-col items-center text-center gap-4">
                     <button onClick={updateUserProfilePicture} className="relative group cursor-pointer" aria-label="تغيير الصورة الرمزية">
                         <img src={user.picture || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white/50 object-cover shadow-lg"/>
                         <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <span className="text-white text-3xl">✏️</span>
                         </div>
                     </button>
                    <form onSubmit={handleProfileUpdate} className="w-full max-w-sm space-y-4">
                        <div>
                            <label htmlFor="username" className="text-sm opacity-80 sr-only">الاسم</label>
                            <input 
                                id="username"
                                type="text" 
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full text-center text-xl font-bold bg-transparent border-0 focus:ring-0" 
                                disabled={!isEmailUser} 
                            />
                        </div>
                        <div>
                            <label htmlFor="useremail" className="text-sm opacity-80 sr-only">البريد الإلكتروني</label>
                            <input id="useremail" type="email" value={user.email || 'غير متوفر (زائر)'} className="w-full text-center text-sm bg-transparent border-0 opacity-60 focus:ring-0" disabled />
                        </div>
                        {isEmailUser && (
                            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50" disabled={userName.trim() === user.name}>
                                حفظ التعديلات
                            </button>
                        )}
                    </form>
                 </div>
            </GlassCard>
            
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

             <SettingsCard title="إدارة البيانات" icon="💾">
                <p className="text-sm opacity-80">يمكنك حفظ نسخة احتياطية من بياناتك أو استيرادها.</p>
                <div className="grid grid-cols-2 gap-4">
                    <button disabled className="w-full bg-gray-500 text-white/70 font-bold py-2 px-4 rounded-lg cursor-not-allowed">
                        📥 تصدير البيانات
                    </button>
                    <button disabled className="w-full bg-gray-500 text-white/70 font-bold py-2 px-4 rounded-lg cursor-not-allowed">
                        📤 استيراد البيانات
                    </button>
                </div>
                <p className="text-xs text-center text-yellow-300/80 mt-2">ميزة تصدير واستيراد البيانات قيد التطوير حالياً.</p>
            </SettingsCard>

             <div className="border-2 border-red-500/50 rounded-2xl p-4 space-y-4">
                <h4 className="text-lg font-bold text-center text-red-300">منطقة الخطر</h4>
                <button onClick={handleReset} className="w-full bg-red-800/80 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    🗑️ إعادة تعيين كل البيانات
                </button>
                <button onClick={handleDeleteAccount} className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    🔥 حذف الحساب
                </button>
                 <p className="text-xs text-center text-red-300/80">هذه الإجراءات نهائية ولا يمكن التراجع عنها.</p>
            </div>
        </div>
    )
}


const MorePage: React.FC = () => {
    const { page } = useParams<{ page: MorePageType }>();

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