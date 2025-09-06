import { useState, useEffect, useCallback, useMemo } from 'react';
import { PRAYERS, PRAYER_NAMES_API_MAP } from '../constants';
import { Prayer, PrayerTimeData, PrayerTimesContextType } from '../types';
import { useAppContext } from '../contexts/AppContext';

export const usePrayerTimes = (): PrayerTimesContextType => {
    const { settings } = useAppContext();
    const [prayerTimes, setPrayerTimes] = useState<{ [key: string]: string }>({});
    const [coordinates, setCoordinates] = useState<{ latitude: number, longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isPrayerTimesLoading, setIsPrayerTimesLoading] = useState(true);
    const [countdown, setCountdown] = useState('');

    const detectLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setLocationError("المتصفح أو بيئة التشغيل لا تدعم تحديد الموقع. سيتم استخدام مواقيت القاهرة الافتراضية.");
            setCoordinates({ latitude: 30.0444, longitude: 31.2357 }); // Cairo fallback
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds
            maximumAge: 0,
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationError(null);
            },
            (error) => {
                let message = "لم نتمكن من تحديد موقعك. سيتم استخدام مواقيت القاهرة الافتراضية.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = "تم رفض إذن الوصول للموقع. لتحديد المواقيت بدقة، يرجى تفعيل إذن الموقع للتطبيق من إعدادات جهازك.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = "معلومات الموقع غير متاحة حاليًا. يرجى التحقق من تفعيل GPS والمحاولة مرة أخرى.";
                        break;
                    case error.TIMEOUT:
                        message = "انتهى وقت طلب تحديد الموقع. يرجى المحاولة في مكان به إشارة أفضل.";
                        break;
                }
                setLocationError(message);
                setCoordinates({ latitude: 30.0444, longitude: 31.2357 }); // Cairo fallback
            },
            options
        );
    }, []);

    useEffect(() => {
        detectLocation();
    }, [detectLocation]);

    useEffect(() => {
        const fetchPrayerTimes = async () => {
            if (!coordinates) return;
            setIsPrayerTimesLoading(true);
            try {
                const date = new Date();
                const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
                const response = await fetch(`https://api.aladhan.com/v1/timings/${dateString}?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&method=${settings.prayerMethod}`);
                if (!response.ok) {
                    throw new Error('فشل في جلب أوقات الصلاة. يرجى التحقق من اتصالك بالإنترنت.');
                }
                const data = await response.json();
                if (data.code !== 200) {
                    throw new Error(data.data || 'حدث خطأ من المصدر.');
                }

                const timings: PrayerTimeData = data.data.timings;
                
                const formattedTimes = Object.fromEntries(
                    PRAYERS.map(p => {
                        const apiName = PRAYER_NAMES_API_MAP[p.name];
                        return [p.name, timings[apiName]];
                    })
                );
                
                setPrayerTimes(formattedTimes);

            } catch (err) {
                const message = err instanceof Error ? err.message : "خطأ غير معروف أثناء جلب أوقات الصلاة.";
                console.error("Prayer Times Fetch Error:", err);
                setLocationError(message);
            } finally {
                setIsPrayerTimesLoading(false);
            }
        };

        if (coordinates) {
            fetchPrayerTimes();
        }
    }, [coordinates, settings.prayerMethod]);

    const nextPrayer = useMemo(() => {
        const now = new Date();
        let nextPrayerInfo: { prayer: Prayer | null; time: Date; isNextDay: boolean } = { prayer: null, time: new Date(), isNextDay: false };

        if (Object.keys(prayerTimes).length === 0) {
            return { prayer: null, time: null, countdown: '00:00:00', isNextDay: false };
        }

        const todayPrayerTimes = PRAYERS.map(p => {
            const timeStr = prayerTimes[p.name];
            if (!timeStr) return null;
            const [hours, minutes] = timeStr.split(':').map(Number);
            const time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            return { prayer: p, time };
        }).filter((p): p is { prayer: Prayer; time: Date } => Boolean(p))
          .sort((a,b) => a.time.getTime() - b.time.getTime());

        for (const pt of todayPrayerTimes) {
            if (pt.time > now) {
                nextPrayerInfo = { ...pt, isNextDay: false };
                break;
            }
        }

        if (!nextPrayerInfo.prayer && todayPrayerTimes.length > 0) {
            const firstPrayerTomorrow = todayPrayerTimes[0];
            const tomorrowTime = new Date(firstPrayerTomorrow.time);
            tomorrowTime.setDate(tomorrowTime.getDate() + 1);
            nextPrayerInfo = { prayer: firstPrayerTomorrow.prayer, time: tomorrowTime, isNextDay: true };
        }
        
        return nextPrayerInfo;
    }, [prayerTimes]);

     useEffect(() => {
        const timer = setInterval(() => {
            if (!nextPrayer.time) {
                setCountdown('...');
                return;
            }

            const now = new Date().getTime();
            const difference = nextPrayer.time.getTime() - now;

            if (difference > 0) {
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            } else {
                setCountdown("حان الآن");
                // Potentially trigger a refresh of prayer times for the new day
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [nextPrayer]);


    return {
        prayerTimes,
        nextPrayer: { prayer: nextPrayer.prayer, countdown, isNextDay: nextPrayer.isNextDay },
        coordinates,
        locationError,
        detectLocation,
        isPrayerTimesLoading
    };
};