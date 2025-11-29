import type { VercelRequest, VercelResponse } from '@vercel/node';

// **ملاحظة للمطورين:**
// تم تعطيل الاتصال بقاعدة البيانات وإرسال الإشعارات الفعلية في هذا الملف مؤقتًا.
// عند إعادة تفعيل قاعدة البيانات، يجب إعادة تفعيل الشيفرة التي تم تعليقها.

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    const { title, body } = req.body;
    
    if (!title || !body) {
        return res.status(400).json({ message: 'Title and body are required.' });
    }

    console.log(`[MOCK PUSH] Received push notification request: Title - "${title}", Body - "${body}"`);

    // Return a mock success response indicating that this is a development/decoupled mode.
    res.status(200).json({ message: 'وضع التطوير: تم استلام طلب الإشعار بنجاح. لن يتم إرسال أي شيء فعليًا.' });
}
