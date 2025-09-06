import { supabase } from '../supabase';

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

export async function getSubscription(): Promise<PushSubscription | null> {
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

export async function subscribeUser(): Promise<PushSubscription> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported by this browser.');
    }
    if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID public key not configured.');
    }

    let registration;
    try {
        registration = await navigator.serviceWorker.getRegistration();
    } catch (error) {
        if (error instanceof DOMException && error.name === 'SecurityError') {
            throw new Error('لا يمكن تفعيل الإشعارات في بيئة التشغيل هذه بسبب قيود الأمان.');
        }
        console.error('Failed to get service worker registration:', error);
        throw new Error('فشل الوصول إلى عامل الخدمة (Service Worker).');
    }
    
    if (!registration) {
        throw new Error('Service worker is not registered. Cannot subscribe.');
    }

    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
        console.log('User is already subscribed.');
        return subscription;
    }

    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any, // Cast to handle TS lib conflicts
    });

    // Send subscription to the backend
    const { error } = await supabase.from('push_subscriptions').insert({
        subscription_data: subscription.toJSON(), // Use toJSON() to get a plain object
    });

    if (error) {
        console.error('Failed to save subscription to Supabase:', error);
        // If saving fails, we should unsubscribe the user to avoid inconsistent state.
        await subscription.unsubscribe();
        throw new Error('Failed to save push subscription to the server.');
    }

    console.log('User subscribed successfully.');
    return subscription;
}

export async function unsubscribeUser(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported, cannot unsubscribe.');
        return;
    }

    let registration;
    try {
        registration = await navigator.serviceWorker.getRegistration();
    } catch(error) {
        if (error instanceof DOMException && error.name === 'SecurityError') {
            console.warn('Cannot access service worker registration due to security policy. Unsubscribe failed.', error.message);
        } else {
            console.error('Failed to get service worker registration during unsubscribe:', error);
        }
        return;
    }
    
    if (!registration) {
        console.log('No service worker registered, cannot unsubscribe.');
        return;
    }
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        // Remove subscription from the backend first
        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('subscription_data->>endpoint', subscription.endpoint);
        
        if (error) {
            console.error('Failed to delete subscription from Supabase:', error);
            // We proceed to unsubscribe locally anyway
        }

        // Unsubscribe from push manager
        const successful = await subscription.unsubscribe();
        if (successful) {
            console.log('User unsubscribed successfully.');
        } else {
            console.error('Failed to unsubscribe user locally.');
        }
    } else {
        console.log('User was not subscribed.');
    }
}