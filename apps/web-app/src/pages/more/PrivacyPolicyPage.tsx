import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../../components/GlassCard';
import { useAuthContext } from '@mahyay/core';

const PrivacyPolicyPage: React.FC = () => {
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
                <h2>سياسة الخصوصية لتطبيق مَحيّاي</h2>
                <p><strong>آخر تحديث:</strong> 25 يوليو 2024</p>

                <h4>1. مقدمة</h4>
                <p>نحن في تطبيق "مَحيّاي" نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيف نتعامل مع معلوماتك الشخصية. باستخدامك للتطبيق، فإنك توافق على الممارسات الموضحة في هذه السياسة.</p>

                <h4>2. البيانات التي نجمعها</h4>
                <p>عند إنشاء حساب، نقوم بجمع وتخزين البيانات التالية:</p>
                <ul>
                    <li><strong>البريد الإلكتروني:</strong> يستخدم لتسجيل الدخول وإعادة تعيين كلمة المرور.</li>
                    <li><strong>بيانات الملف الشخصي:</strong> مثل الاسم والصورة الرمزية التي يتم جلبها من حسابك أو التي تقدمها.</li>
                    <li><strong>بيانات الاستخدام:</strong> سجلات عباداتك (الصلوات، الأذكار، قراءة القرآن) وأهدافك الشخصية. يتم ربط هذه البيانات بحسابك وتخزينها بأمان على خوادمنا.</li>
                </ul>

                <h4>3. تخزين البيانات</h4>
                <p>يتم تخزين جميع بياناتك بشكل آمن على خوادم Supabase. نحن نستخدم أفضل الممارسات الأمنية لحماية معلوماتك من الوصول غير المصرح به.</p>

                <h4>4. استخدام البيانات</h4>
                <p>تُستخدم بياناتك للأغراض التالية فقط:</p>
                <ul>
                    <li>مزامنة بياناتك عبر أجهزة متعددة.</li>
                    <li>عرض إحصائياتك وتقدمك داخل التطبيق.</li>
                    <li>تشغيل الميزات الأساسية للتطبيق.</li>
                </ul>

                <h4>5. مشاركة البيانات وخدمات الطرف الثالث</h4>
                <p>نحن لا نبيع أو نشارك بياناتك الشخصية مع أي طرف ثالث. ومع ذلك، يستخدم التطبيق خدمات طرف ثالث ضرورية لعمله:</p>
                <ul>
                    <li><strong>Aladhan API:</strong> للحصول على مواقيت الصلاة.</li>
                    <li><strong>Google Gemini API:</strong> لتشغيل الميزات المعززة بالذكاء الاصطناعي. يتم إرسال استفساراتك فقط بشكل مجهول إلى الخدمة لمعالجتها.</li>
                </ul>

                <h4>6. التحكم في بياناتك</h4>
                <p>لديك السيطرة الكاملة على بياناتك. يمكنك طلب حذف حسابك وجميع بياناتك المرتبطة به في أي وقت عن طريق التواصل مع الدعم.</p>

                <h4>7. اتصل بنا</h4>
                <p>إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يمكنك التواصل معنا عبر البريد الإلكتروني: <a href="mailto:support@tech-bokra.com">support@tech-bokra.com</a></p>
            </div>
        </GlassCard>
    );
}
export default PrivacyPolicyPage;
