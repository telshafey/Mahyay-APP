import { createContext, useContext } from 'react';
import { PrayerTimesContextType } from '../types';

const initialContext: PrayerTimesContextType = {
    prayerTimes: {},
    nextPrayer: {
        prayer: null,
        countdown: '00:00:00',
        isNextDay: false,
    },
    coordinates: null,
    locationError: null,
    detectLocation: async () => {},
    isPrayerTimesLoading: true,
    apiHijriDate: null,
};

export const PrayerTimesContext = createContext<PrayerTimesContextType>(initialContext);

export const usePrayerTimesContext = (): PrayerTimesContextType => {
    const context = useContext(PrayerTimesContext);
    if (context === null) {
        throw new Error("usePrayerTimesContext must be used within a PrayerTimesProvider.");
    }
    return context;
};
