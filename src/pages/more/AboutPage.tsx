import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../../components/GlassCard';
import Section from '../../components/more/Section';

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

             <Section title="معلومات قانونية وتواصل" icon="⚖️">
                 <div className="text-center space-y-3">
                     <div className="flex justify-center items-center gap-4">
                         <Link to="/more/terms" className="font-semibold text-yellow-300 hover:text-yellow-200">شروط الاستخدام</Link>
                         <span className="text-white/50">|</span>
                         <Link to="/more/privacy" className="font-semibold text-yellow-300 hover:text-yellow-200">سياسة الخصوصية</Link>
                     </div>
                     <p>📧 للدعم والاستفسارات:</p>
                     <a href="mailto:support@tech-bokra.com" className="font-bold text-lg text-yellow-300 tracking-wider">support@tech-bokra.com</a>
                 </div>
            </Section>
        </GlassCard>
    );
}

export default AboutPage;
