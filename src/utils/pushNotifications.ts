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
            const registration = await navigator.serviceWorker.ready;
            return registration.pushManager.getSubscription();
        } catch (error) {
            console.error('Error getting push subscription:', error);
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

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
        console.log('User is already subscribed.');
        return subscription;
    }

    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
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

    const registration = await navigator.serviceWorker.ready;
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