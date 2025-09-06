import { createContext, useContext } from 'react';
import { AppContextType } from '../types';

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === null) {
        throw new Error("useAppContext must be used within an AppContextProvider. Make sure your component is a child of AppContextProvider.");
    }
    return context;
};