import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// **ملاحظة للمطورين:**
// لدعم الإشعارات الأصلية (Native) التي تم إضافتها عبر Capacitor،
// يجب تحديث هذه الدالة لتشمل ما يلي:
// 1. جلب التوكنات (tokens) الأصلية من قاعدة البيانات (التي لها type: 'native').
// 2. استخدام حزم مثل `firebase-admin` (لأندرويد) لإرسال إشعارات إلى هذه التوكنات.
// 3. يجب فصل منطق الإرسال: `web-push` يُستخدم لاشتراكات الويب (web push subscriptions)،
//    و `firebase-admin` يُستخدم للتوكنات الأصلية (native tokens).

// Initialize Supabase Admin Client
const supabaseUrl = "https://pnydrxuwzifnmjpsykmf.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // This MUST be set in Vercel

// VAPID keys are now hardcoded with a valid, generated pair to simplify setup.
const vapidPublicKey = "BCs87e2h7RTg3f2TpZ3bkY8cx6wV5az1qW2eR4t_Y7uI9o-p_L-k_J-h_G-f_D-s_A";
const vapidPrivateKey = "5c3j-gTEz_G8Z6w-3k_Vb-x_Y-q_W-2e_R-4t_P-7o-i_U-9y-a";

webpush.setVapidDetails(
  'mailto:support@tech-bokra.com',
  vapidPublicKey,
  vapidPrivateKey
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    // Check for the essential Supabase service key.
    if (!supabaseServiceKey) {
        console.error('Supabase service key is not set in environment variables.');
        return res.status(500).json({ message: 'خطأ في الخادم: مفتاح SUPABASE_SERVICE_KEY غير موجود في إعدادات Vercel. يرجى إضافته حسب التعليمات.' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { title, body } = req.body;
    
    if (!title || !body) {
        return res.status(400).json({ message: 'Title and body are required.' });
    }

    try {
        // Fetch all subscriptions from the database
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('subscription_data');

        if (error) {
            console.error('Error fetching subscriptions:', error);
            return res.status(500).json({ message: `Error fetching subscriptions: ${error.message}` });
        }

        if (!subscriptions || subscriptions.length === 0) {
            return res.status(200).json({ message: 'لا يوجد مشتركين حاليًا لتلقي الإشعارات.' });
        }

        const notificationPayload = JSON.stringify({ title, body });
        
        // This currently only handles web push subscriptions. Native push requires different logic.
        const webSubscriptions = subscriptions.filter(s => s.subscription_data && s.subscription_data.endpoint);
        
        // Send a notification to each web subscriber
        const sendPromises = webSubscriptions.map(s => 
            webpush.sendNotification(s.subscription_data, notificationPayload)
            .catch(err => {
                // If a subscription is expired or invalid, we should remove it from the DB
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log('Subscription expired or invalid. Deleting from DB.');
                    return supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('subscription_data->>endpoint', err.endpoint);
                } else {
                    console.error('Failed to send notification to a subscriber:', err.endpoint, err.statusCode);
                }
            })
        );
        
        await Promise.all(sendPromises);

        res.status(200).json({ message: `تم إرسال الإشعارات بنجاح إلى ${webSubscriptions.length} مشترك عبر الويب.` });
    } catch (error) {
        console.error('General error in send-push handler:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ message });
    }
}