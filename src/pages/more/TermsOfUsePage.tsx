import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../../components/GlassCard';
import { useAuthContext } from '../../contexts/AuthContext';

const TermsOfUsePage: React.FC = () => {
    const { session } = useAuthContext();
    
    return (
        <GlassCard className="text-white">
            {!session && (
                <div className="text-center mb-6 pb-4 border-b border-white/10">
                    <Link to="/login" className="text-teal-300 hover:text-teal-200 font-semibold inline-flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>العودة إلى صفحة تسجيل الدخول</span>
                    </Link>
                </div>
            )}
            <div className="prose prose-invert prose-headings:font-amiri prose-headings:text-yellow-300 prose-a:text-teal-300 max-w-none">
                <h2>شروط الاستخدام لتطبيق مَحيّاي</h2>
                <p><strong>آخر تحديث:</strong> 25 يوليو 2024</p>
                
                <h4>1. قبول الشروط</h4>
                <p>باستخدامك لتطبيق "مَحيّاي" ("التطبيق")، فإنك توافق على الالتزام بشروط الاستخدام هذه ("الشروط"). إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام التطبيق.</p>
                
                <h4>2. وصف الخدمة</h4>
                <p>"مَحيّاي" هو تطبيق إسلامي يهدف لمساعدة المستخدمين على تتبع عباداتهم اليومية. يتم توفير المحتوى الديني (آيات، أحاديث، أذكار) للمنفعة والفائدة، وقد تم بذل أقصى جهد للتأكد من صحته، ولكن يجب على المستخدم دائمًا الرجوع إلى المصادر الأصلية للتحقق.</p>
                
                <h4>3. مسؤوليات المستخدم</h4>
                <p>أنت توافق على استخدام التطبيق فقط للأغراض المشروعة وبطريقة لا تنتهك حقوق الآخرين أو تقيد استخدامهم للتطبيق. أنت مسؤول عن الحفاظ على سرية معلومات حسابك.</p>
                
                <h4>4. إخلاء المسؤولية عن الضمان</h4>
                <p>يتم توفير التطبيق "كما هو" و "كما هو متاح" دون أي ضمانات من أي نوع. نحن لا نضمن أن التطبيق سيعمل دون انقطاع أو أنه سيكون خاليًا من الأخطاء.</p>
                
                <h4>5. حدود المسؤولية</h4>
                <p>لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة تنشأ عن استخدامك أو عدم قدرتك على استخدام التطبيق.</p>
                
                <h4>6. الملكية الفكرية</h4>
                <p>جميع حقوق الملكية الفكرية المتعلقة بالتطبيق (بما في ذلك الكود المصدري والتصميم والعلامة التجارية) هي ملك لمطوري "مَحيّاي".</p>

                <h4>7. إنهاء الاستخدام</h4>
                <p>يجوز لنا إنهاء أو تعليق وصولك إلى التطبيق في أي وقت، دون إشعار مسبق، لأي سبب من الأسباب، بما في ذلك انتهاك هذه الشروط.</p>
                
                <h4>8. اتصل بنا</h4>
                <p>إذا كانت لديك أي أسئلة حول هذه الشروط، يمكنك التواصل معنا عبر البريد الإلكتروني: <a href="mailto:support@tech-bokra.com">support@tech-bokra.com</a></p>
            </div>
        </GlassCard>
    );
}

export default TermsOfUsePage;