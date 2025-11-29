import { supabase, safeLocalStorage } from '@mahyay/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';

// This key is now hardcoded with a valid, generated key to simplify setup.
const VAPID_PUBLIC_KEY = "BCs87e2h7RTg3f2TpZ3bkY8cx6wV5az1qW2eR4t_Y7uI9o-p_L-k_J-h_G-f_D-s_A";

function urlBase64ToUint8Array(base64String: string): Uint8Array {  
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getSubscription(): Promise<PushSubscription | string | null> {
    if (Capacitor.isNativePlatform()) {
        return safeLocalStorage.getItem('nativePushToken');
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                return null;
            }
            return await registration.pushManager.getSubscription();
        } catch (error) {
            if (error instanceof DOMException && error.name === 'SecurityError') {
                console.warn("Could not get push subscription due to security policy:", error.message);
            } else {
                console.error('Error getting push subscription:', error);
            }
            return null;
        }
    }
    return null;
}

export async function subscribeUser(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (Capacitor.isNativePlatform()) {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }
        if (permStatus.receive !== 'granted') {
            throw new Error('تم رفض إذن استقبال الإشعارات من الهاتف.');
        }
        
        await PushNotifications.removeAllListeners();
        
        PushNotifications.addListener('registration', async (token: Token) => {
            console.log('Native Push registration success, token:', token.value);
            safeLocalStorage.setItem('nativePushToken', token.value);
            const { error } = await supabase.from('push_subscriptions').insert({
                user_id: user?.id,
                subscription_data: { 
                    token: token.value,
                    type: 'native',
                    platform: Capacitor.getPlatform()
                },
            });

            if (error) {
                 console.error('Failed to save native token to Supabase:', error);
            }
        });
        
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on native registration:', error);
            throw new Error('فشل تسجيل الإشعارات مع خدمة الهاتف.');
        });
        
        await PushNotifications.register();

    } else if ('serviceWorker' in navigator && 'PushManager' in window) {
        if (!VAPID_PUBLIC_KEY) {
            throw new Error('VAPID public key not configured.');
        }

        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            throw new Error('Service worker is not registered. Cannot subscribe.');
        }

        let subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            console.log('User is already subscribed via Web Push.');
            return;
        }

        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey as any,
        });

        const { error } = await supabase.from('push_subscriptions').insert({
            user_id: user?.id,
            subscription_data: subscription.toJSON(),
        });

        if (error) {
            console.error('Failed to save web push subscription to Supabase:', error);
            await subscription.unsubscribe();
            throw new Error('Failed to save push subscription to the server.');
        }

        console.log('User subscribed successfully via Web Push.');
    } else {
         throw new Error('Push notifications are not supported by this browser.');
    }
}

export async function unsubscribeUser(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
        const token = safeLocalStorage.getItem('nativePushToken');
        if (token) {
            const { error } = await supabase.from('push_subscriptions').delete().eq('subscription_data->>token', token);
            if (error) {
                console.error('Failed to delete native token from Supabase:', error);
            }
            safeLocalStorage.removeItem('nativePushToken');
        }
        await PushNotifications.removeAllListeners();
        console.log('User unsubscribed from native push notifications.');
        return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported, cannot unsubscribe.');
        return;
    }

    let registration;
    try {
        registration = await navigator.serviceWorker.getRegistration();
    } catch(error) {
        console.error('Failed to get service worker registration during unsubscribe:', error);
        return;
    }
    
    if (!registration) {
        console.log('No service worker registered, cannot unsubscribe.');
        return;
    }
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('subscription_data->>endpoint', subscription.endpoint);
        
        if (error) {
            console.error('Failed to delete web subscription from Supabase:', error);
        }

        const successful = await subscription.unsubscribe();
        if (successful) {
            console.log('User unsubscribed from web push successfully.');
        } else {
            console.error('Failed to unsubscribe user locally.');
        }
    } else {
        console.log('User was not subscribed to web push.');
    }
}
