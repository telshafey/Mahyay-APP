
import { useState, useEffect, useCallback, useMemo } from 'react';
import { PRAYERS, PRAYER_NAMES_API_MAP, PRAYER_LOCATIONS, Prayer, PrayerTimeData, PrayerTimesContextType, Settings, ApiHijriDate } from '@mahyay/core';

export const usePrayerTimes = (settings: Settings, setApiHijriDate: (date: ApiHijriDate | null) => void): Omit<PrayerTimesContextType, 'apiHijriDate'> => {
    const [prayerTimes, setPrayerTimes] = useState<{ [key: string]: string }>({});
    const [coordinates, setCoordinates] = useState<{ latitude: number, longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isPrayerTimesLoading, setIsPrayerTimesLoading] = useState(true);
    const [countdown, setCountdown] = useState('');

    const detectLocation = useCallback(async () => {
        if (!navigator.geolocation) {
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
                console.warn("Location access denied or unavailable", error);
            }
        );
    }, []);

    useEffect(() => {
        detectLocation();
    }, [detectLocation]);

    // Helper to apply fallback times
    const applyFallback = useCallback(() => {
        const fallbackLocation = PRAYER_LOCATIONS.find(loc => loc.id === (settings.defaultLocationId || 'cairo_egypt')) || PRAYER_LOCATIONS[0];
        if (fallbackLocation) {
            const fallbackTimes = Object.fromEntries(
                PRAYERS.map(p => {
                    const apiName = (PRAYER_NAMES_API_MAP as any)[p.name];
                    return [p.name, fallbackLocation.times[apiName] || '??:??'];
                })
            );
            setPrayerTimes(fallbackTimes);
        }
        setApiHijriDate(null);
        setLocationError(null);
    }, [settings.defaultLocationId, setApiHijriDate]);

    useEffect(() => {
        let isMounted = true;

        const fetchPrayerTimes = async () => {
            setIsPrayerTimesLoading(true);
            
            // Use Direct API URL to avoid 404 on local/vercel proxy
            const baseUrl = 'https://api.aladhan.com/v1';
            let apiUrl = '';
            
            if (coordinates) {
                const date = new Date().toISOString().split('T')[0];
                apiUrl = `${baseUrl}/timings/${date}?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&method=${settings.prayerMethod}`;
            } else if (settings.city && settings.country) {
                apiUrl = `${baseUrl}/timingsByCity?city=${encodeURIComponent(settings.city)}&country=${encodeURIComponent(settings.country)}&method=${settings.prayerMethod}`;
            } else {
                 applyFallback();
                 if (isMounted) setIsPrayerTimesLoading(false);
                 return;
            }

            try {
                // Short timeout to fallback quickly if offline
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(apiUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`Status: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.code !== 200 || !data.data?.timings) {
                     throw new Error('Invalid Data Structure');
                }
                
                if (isMounted) {
                    setApiHijriDate(data.data.date.hijri);
                    const timings: PrayerTimeData = data.data.timings;
                    const formattedTimes = Object.fromEntries(
                        PRAYERS.map(p => {
                            const apiName = (PRAYER_NAMES_API_MAP as any)[p.name];
                            return [p.name, timings[apiName]?.split(' ')[0] || '??:??'];
                        })
                    );
                    setPrayerTimes(formattedTimes);
                    setLocationError(null);
                }

            } catch (err) {
                console.warn("Prayer times fetch failed (using fallback):", err);
                if (isMounted) {
                    applyFallback();
                }
            } finally {
                if(isMounted) setIsPrayerTimesLoading(false);
            }
        };

        fetchPrayerTimes();
        
        return () => { isMounted = false; };

    }, [coordinates, settings.city, settings.country, settings.prayerMethod, settings.defaultLocationId, setApiHijriDate, applyFallback]);

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
