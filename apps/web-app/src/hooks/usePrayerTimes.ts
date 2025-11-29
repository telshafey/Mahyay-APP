import { useState, useEffect, useCallback, useMemo } from 'react';
import { PRAYERS, PRAYER_NAMES_API_MAP, PRAYER_LOCATIONS } from '@mahyay/core';
import { Prayer, PrayerTimeData, PrayerTimesContextType, Settings, ApiHijriDate } from '@mahyay/core';

export const usePrayerTimes = (settings: Settings, setApiHijriDate: (date: ApiHijriDate | null) => void): Omit<PrayerTimesContextType, 'apiHijriDate'> => {
    const [prayerTimes, setPrayerTimes] = useState<{ [key: string]: string }>({});
    const [coordinates, setCoordinates] = useState<{ latitude: number, longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isPrayerTimesLoading, setIsPrayerTimesLoading] = useState(true);
    const [countdown, setCountdown] = useState('');

    const detectLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setLocationError("المتصفح لا يدعم تحديد الموقع. سيتم استخدام الإعدادات اليدوية.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationError(null);
            },
            (error) => {
                let message = "لم نتمكن من تحديد موقعك. سيتم استخدام الإعدادات اليدوية.";
                if (error.code === error.PERMISSION_DENIED) {
                    message = "تم رفض إذن الوصول للموقع. يرجى تفعيله أو استخدام الإعدادات اليدوية.";
                }
                setLocationError(message);
            }
        );
    }, []);

    useEffect(() => {
        detectLocation();
    }, [detectLocation]);

    useEffect(() => {
        const fetchPrayerTimes = async () => {
            setIsPrayerTimesLoading(true);
            
            let apiUrl = '';
            if (coordinates) {
                apiUrl = `/api/prayer-times?lat=${coordinates.latitude}&lon=${coordinates.longitude}&method=${settings.prayerMethod}`;
            } else if (settings.city && settings.country) {
                apiUrl = `/api/prayer-times?city=${encodeURIComponent(settings.city)}&country=${encodeURIComponent(settings.country)}&method=${settings.prayerMethod}`;
            } else {
                 setLocationError("الرجاء تحديد موقعك أو إدخال المدينة والدولة في الإعدادات.");
                 setIsPrayerTimesLoading(false);
                 return;
            }

            try {
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("API_NOT_FOUND");
                    }
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const responseText = await response.text();
                if (!responseText) throw new Error("Empty response");
                
                const data = JSON.parse(responseText);
                
                if (data.code !== 200 || !data.data?.timings) {
                     throw new Error('Invalid data format');
                }
                
                setApiHijriDate(data.data.date.hijri);

                const timings: PrayerTimeData = data.data.timings;
                
                const formattedTimes = Object.fromEntries(
                    PRAYERS.map(p => {
                        const apiName = (PRAYER_NAMES_API_MAP as any)[p.name];
                        return [p.name, timings[apiName]?.split(' ')[0] || '??:??'];
                    })
                );
                setPrayerTimes(formattedTimes);
                if (!coordinates) setLocationError(null);

            } catch (err) {
                const message = err instanceof Error ? err.message : "Unknown error";
                console.warn("Prayer Times Fetch Warning:", message);
                
                // Fallback to default Cairo times
                const fallbackLocation = PRAYER_LOCATIONS.find(loc => loc.id === 'cairo_egypt');
                if (fallbackLocation) {
                    const fallbackTimes = Object.fromEntries(
                        PRAYERS.map(p => {
                            const apiName = (PRAYER_NAMES_API_MAP as any)[p.name];
                            return [p.name, fallbackLocation.times[apiName] || '??:??'];
                        })
                    );
                    setPrayerTimes(fallbackTimes);
                }

                if (message === "API_NOT_FOUND") {
                    setLocationError("خدمة المواقيت غير متوفرة حالياً. تم استخدام توقيت القاهرة الافتراضي.");
                } else {
                    setLocationError(`تعذر جلب المواقيت الدقيقة. تم استخدام التوقيت الافتراضي.`);
                }

                setApiHijriDate(null);
            } finally {
                setIsPrayerTimesLoading(false);
            }
        };

        if (coordinates || (settings.city && settings.country)) {
            fetchPrayerTimes();
        }

    }, [coordinates, settings.city, settings.country, settings.prayerMethod, setApiHijriDate]);

    const nextPrayer = useMemo(() => {
        const now = new Date();
        let nextPrayerInfo: { prayer: Prayer | null; time: Date; isNextDay: boolean } = { prayer: null, time: new Date(), isNextDay: false };

        if (Object.keys(prayerTimes).length === 0) {
            return { prayer: null, time: new Date(), countdown: '00:00:00', isNextDay: false };
        }

        const todayPrayerTimes = PRAYERS.map(p => {
            const timeStr = prayerTimes[p.name];
            if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
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
        isPrayerTimesLoading,
    };
};