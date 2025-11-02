import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'SAR' | 'AED' | 'USD' | 'EUR' | 'INR' | 'PKR';

interface SalesCurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getCurrencyIcon: (currency?: Currency) => string;
  getCurrencyName: (currency?: Currency, language?: 'ar' | 'en') => string;
}

const SalesCurrencyContext = createContext<SalesCurrencyContextType | undefined>(undefined);

export const useSalesCurrency = () => {
  const context = useContext(SalesCurrencyContext);
  if (context === undefined) {
    throw new Error('useSalesCurrency must be used within a SalesCurrencyProvider');
  }
  return context;
};

interface SalesCurrencyProviderProps {
  children: ReactNode;
}

export const SalesCurrencyProvider: React.FC<SalesCurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Load from localStorage or default to SAR
    const savedCurrency = localStorage.getItem('salesCurrency') as Currency;
    return savedCurrency || 'SAR';
  });

  // Save to localStorage when currency changes
  useEffect(() => {
    localStorage.setItem('salesCurrency', currency);
  }, [currency]);

  // Listen for storage changes (for cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'salesCurrency' && e.newValue) {
        setCurrencyState(e.newValue as Currency);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('salesCurrency', newCurrency);
  };

  const getCurrencyIcon = (curr?: Currency): string => {
    const currToUse = curr || currency;
    switch (currToUse) {
      case 'SAR':
        return 'ر.س';
      case 'AED':
        return 'د.إ';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'INR':
        return '₹';
      case 'PKR':
        return '₨';
      default:
        return 'ر.س';
    }
  };

  const getCurrencyName = (curr?: Currency, language: 'ar' | 'en' = 'ar'): string => {
    const currToUse = curr || currency;
    
    if (language === 'en') {
      switch (currToUse) {
        case 'SAR':
          return 'Saudi Riyal';
        case 'AED':
          return 'UAE Dirham';
        case 'USD':
          return 'US Dollar';
        case 'EUR':
          return 'Euro';
        case 'INR':
          return 'Indian Rupee';
        case 'PKR':
          return 'Pakistani Rupee';
        default:
          return 'Saudi Riyal';
      }
    } else {
      switch (currToUse) {
        case 'SAR':
          return 'ريال سعودي';
        case 'AED':
          return 'درهم إماراتي';
        case 'USD':
          return 'دولار أمريكي';
        case 'EUR':
          return 'يورو';
        case 'INR':
          return 'روبية هندية';
        case 'PKR':
          return 'روبية باكستانية';
        default:
          return 'ريال سعودي';
      }
    }
  };

  return (
    <SalesCurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        getCurrencyIcon,
        getCurrencyName,
      }}
    >
      {children}
    </SalesCurrencyContext.Provider>
  );
};

