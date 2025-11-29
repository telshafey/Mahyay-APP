import { createContext, useContext } from 'react';
import { PrayerTimesContextType } from '../types';

export const PrayerTimesContext = createContext<PrayerTimesContextType | null>(null);

export const usePrayerTimesContext = (): PrayerTimesContextType => {
    const context = useContext(PrayerTimesContext);
    if (context === null) {
        throw new Error("usePrayerTimesContext must be used within a PrayerTimesProvider.");
    }
    return context;
};