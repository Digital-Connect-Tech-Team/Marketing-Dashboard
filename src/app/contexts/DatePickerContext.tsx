'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Mode = 'date' | 'month' | 'quarter' | 'year';

interface DatePickerContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  selected: any;
  setSelected: (value: any) => void;
}

const DatePickerContext = createContext<DatePickerContextType | undefined>(
  undefined
);

export function DatePickerProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('date');
  const [selected, setSelected] = useState<any>(null);

  return (
    <DatePickerContext.Provider
      value={{ mode, setMode, selected, setSelected }}
    >
      {children}
    </DatePickerContext.Provider>
  );
}

export function useDatePicker() {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error('useDatePicker must be used within a DatePickerProvider');
  }
  return context;
}
