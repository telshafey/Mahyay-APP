import { useState, useEffect, useCallback, useMemo } from 'react';
import { PRAYERS, PRAYER_NAMES_API_MAP } from '../constants';
import { Prayer, PrayerTimeData, PrayerTimesContextType, Settings, ApiHijriDate, PrayerLocation } from '../types';
import { useAppContext } from '../contexts/AppContext';

const getDateKey = (date: Date): string => date.toISOString().split('T')[0];

export const usePrayerTimes = (settings: Settings, setApiHijriDate: (date: ApiHijriDate | null) => void): Omit<PrayerTimesContextType, 'apiHijriDate'> => {
    const { prayerLocations } = useAppContext();
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
                setLocationError(null); // Clear previous errors
            },
            (error) => {
                let message = "لم نتمكن من تحديد موقعك. سيتم استخدام الإعدادات اليدوية (المدينة/الدولة).";
                if (error.code === error.PERMISSION_DENIED) {
                    message = "تم رفض إذن الوصول للموقع. لتحديد المواقيت بدقة، يرجى تفعيل إذن الموقع للتطبيق أو استخدام الإعدادات اليدوية.";
                }
                setLocationError(message);
            }
        );
    }, []);

    useEffect(() => {
        detectLocation();
    }, [detectLocation]);


    const applyFallbackTimes = useCallback(() => {
        const fallbackLocationId = settings.defaultLocationId || 'cairo_egypt';
        const fallbackLocation = prayerLocations.find(loc => loc.id === fallbackLocationId);
        
        if (fallbackLocation) {
            const fallbackTimes = Object.fromEntries(
                PRAYERS.map(p => {
                    const apiName = PRAYER_NAMES_API_MAP[p.name];
                    return [p.name, fallbackLocation.times[apiName] || '??:??'];
                })
            );
            setPrayerTimes(fallbackTimes);
        } else {
             setPrayerTimes({});
        }
        setApiHijriDate(null);
    }, [settings.defaultLocationId, prayerLocations, setApiHijriDate]);


    useEffect(() => {
        const fetchPrayerTimes = async () => {
            setIsPrayerTimesLoading(true);
            
            let apiUrl = '';
            if (coordinates) {
                apiUrl = `/aladhan-api/timings/${getDateKey(new Date())}?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&method=${settings.prayerMethod}`;
            } else if (settings.city && settings.country) {
                apiUrl = `/aladhan-api/timingsByCity?city=${encodeURIComponent(settings.city)}&country=${encodeURIComponent(settings.country)}&method=${settings.prayerMethod}`;
            } else {
                 setLocationError("الرجاء تحديد موقعك أو إدخال المدينة والدولة في الإعدادات.");
                 applyFallbackTimes();
                 setIsPrayerTimesLoading(false);
                 return;
            }

            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                     throw new Error(`حدث خطأ في الخادم (Status: ${response.status})`);
                }

                const data = await response.json();
                
                if (data.code !== 200 || !data.data?.timings) {
                     throw new Error('صيغة المواقيت في الاستجابة غير متوقعة.');
                }
                
                setApiHijriDate(data.data.date.hijri);

                const timings: PrayerTimeData = data.data.timings;
                
                const formattedTimes = Object.fromEntries(
                    PRAYERS.map(p => {
                        const apiName = PRAYER_NAMES_API_MAP[p.name];
                        return [p.name, timings[apiName]?.split(' ')[0] || '??:??'];
                    })
                );
                setPrayerTimes(formattedTimes);
                if (!coordinates) setLocationError(null);

            } catch (err) {
                const message = err instanceof Error ? err.message : "خطأ غير معروف أثناء جلب البيانات.";
                console.error("Data Fetch Error:", message);
                setLocationError(`فشل جلب المواقيت. سيتم استخدام الموقع الاحتياطي.`);
                applyFallbackTimes();
            } finally {
                setIsPrayerTimesLoading(false);
            }
        };

        fetchPrayerTimes();

    }, [coordinates, settings.city, settings.country, settings.prayerMethod, setApiHijriDate, applyFallbackTimes]);

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