import { useState, useEffect, useCallback, useMemo } from 'react';
import { PRAYERS, PRAYER_NAMES_API_MAP } from '../constants';
import { Prayer, PrayerTimeData, PrayerTimesContextType } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export const usePrayerTimes = (): PrayerTimesContextType => {
    const { settings } = useAppContext();
    const [prayerTimes, setPrayerTimes] = useState<{ [key: string]: string }>({});
    const [coordinates, setCoordinates] = useState<{ latitude: number, longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isPrayerTimesLoading, setIsPrayerTimesLoading] = useState(true);
    const [countdown, setCountdown] = useState('');

    const detectLocation = useCallback(async () => {
        const cairoFallback = () => {
             setCoordinates({ latitude: 30.0444, longitude: 31.2357 }); // Cairo fallback
        };

        if (Capacitor.isNativePlatform()) {
             try {
                let permissionStatus = await Geolocation.checkPermissions();
                if (permissionStatus.location !== 'granted') {
                    permissionStatus = await Geolocation.requestPermissions();
                }

                if (permissionStatus.location === 'granted') {
                    const position = await Geolocation.getCurrentPosition({
                        enableHighAccuracy: true,
                        timeout: 10000,
                    });
                    setCoordinates({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setLocationError(null);
                } else {
                    setLocationError("تم رفض إذن الوصول للموقع من إعدادات الهاتف. سيتم استخدام مواقيت القاهرة الافتراضية.");
                    cairoFallback();
                }
            } catch (error) {
                console.error("Capacitor Geolocation error:", error);
                setLocationError("لم نتمكن من تحديد موقعك عبر خدمات الهاتف. سيتم استخدام مواقيت القاهرة الافتراضية.");
                cairoFallback();
            }
        } else {
            if (!navigator.geolocation) {
                setLocationError("المتصفح لا يدعم تحديد الموقع. سيتم استخدام مواقيت القاهرة الافتراضية.");
                cairoFallback();
                return;
            }

            const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

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
                    cairoFallback();
                },
                options
            );
        }
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
                
                const response = await fetch(`/api/prayer-times?lat=${coordinates.latitude}&lon=${coordinates.longitude}&method=${settings.prayerMethod}&date=${dateString}`);
                
                const responseText = await response.text();

                if (!response.ok) {
                    let errorMessage = `خطأ من الخادم (Status: ${response.status}).`;
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.details || errorData.error || responseText;
                    } catch (e) {
                        errorMessage = responseText || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.warn("Could not parse prayer times response directly. Attempting to extract JSON...", { rawResponse: responseText });
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch && jsonMatch[0]) {
                        try {
                            data = JSON.parse(jsonMatch[0]);
                        } catch (finalParseError) {
                            console.error("Failed to parse extracted JSON from prayer times response.", { extracted: jsonMatch[0], error: finalParseError });
                            throw new Error('استجابة غير صالحة من خادم مواقيت الصلاة بعد محاولة التنظيف.');
                        }
                    } else {
                        throw new Error('لم يتم العثور على JSON صالح في استجابة خادم مواقيت الصلاة.');
                    }
                }

                if (data.code !== 200 || !data.data || !data.data.timings) {
                    throw new Error(data.data || 'استجابة غير متوقعة من خادم مواقيت الصلاة.');
                }

                const timings: PrayerTimeData = data.data.timings;
                
                const formattedTimes = Object.fromEntries(
                    PRAYERS.map(p => {
                        const apiName = PRAYER_NAMES_API_MAP[p.name];
                         if (!timings[apiName]) {
                            console.warn(`Prayer time for '${p.name}' (API key: '${apiName}') not found in response.`);
                            return [p.name, '??:??'];
                        }
                        return [p.name, timings[apiName]];
                    })
                );
                
                setPrayerTimes(formattedTimes);

            } catch (err) {
                const message = err instanceof Error ? err.message : "خطأ غير معروف أثناء جلب أوقات الصلاة.";
                console.error("Prayer Times Fetch Error:", message);
                const userFriendlyError = message.includes('Failed to fetch') 
                    ? 'فشل الاتصال بخادم مواقيت الصلاة. يرجى التحقق من اتصالك بالإنترنت.'
                    : `حدث خطأ أثناء تحميل المواقيت: ${message}`;
                setLocationError(userFriendlyError);
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