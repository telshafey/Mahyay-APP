import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabaseUrl = "https://pnydrxuwzifnmjpsykmf.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // This MUST be set in Vercel

// VAPID keys are now hardcoded to simplify setup.
const vapidPublicKey = "BGrB_0-R_T5l-A_xI_sC4g-kZ7g_tL-8yJ_1N_fW9d_sP-5r_6B-3C_2A-1b";
const vapidPrivateKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // This is a placeholder for the actual private key

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
        
        // Send a notification to each subscriber
        const sendPromises = subscriptions.map(s => 
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

        res.status(200).json({ message: `تم إرسال الإشعارات بنجاح إلى ${subscriptions.length} مشترك.` });
    } catch (error) {
        console.error('General error in send-push handler:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ message });
    }
}
