
import { createContext } from 'react';
import { AppContextType } from '../types.ts';

export const AppContext = createContext<AppContextType | null>(null);