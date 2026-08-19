'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { QuoteItem } from '@/types';

interface QuoteState {
  items: QuoteItem[];
  isOpen: boolean;
}

type QuoteAction =
  | { type: 'ADD_ITEM'; payload: Omit<QuoteItem, 'id'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_OBSERVATION'; payload: { id: string; observation: string } }
  | { type: 'CLEAR_QUOTE' }
  | { type: 'TOGGLE_DRAWER'; payload?: boolean }
  | { type: 'LOAD_ITEMS'; payload: QuoteItem[] };

interface QuoteContextType extends QuoteState {
  addItem: (item: Omit<QuoteItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateObservation: (id: string, observation: string) => void;
  clearQuote: () => void;
  toggleDrawer: (open?: boolean) => void;
  itemCount: number;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId
      );

      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: newItems };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, id: generateId() }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'UPDATE_OBSERVATION':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, observation: action.payload.observation }
            : item
        ),
      };
    case 'CLEAR_QUOTE':
      return { ...state, items: [] };
    case 'TOGGLE_DRAWER':
      return {
        ...state,
        isOpen: action.payload !== undefined ? action.payload : !state.isOpen,
      };
    case 'LOAD_ITEMS':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

const STORAGE_KEY = 'labtech-quote';

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quoteReducer, {
    items: [],
    isOpen: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        dispatch({ type: 'LOAD_ITEMS', payload: items });
      }
    } catch (error) {
      console.error('Error loading quote from localStorage:', error);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving quote to localStorage:', error);
    }
  }, [state.items]);

  const addItem = (item: Omit<QuoteItem, 'id'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const updateObservation = (id: string, observation: string) => {
    dispatch({ type: 'UPDATE_OBSERVATION', payload: { id, observation } });
  };

  const clearQuote = () => {
    dispatch({ type: 'CLEAR_QUOTE' });
  };

  const toggleDrawer = (open?: boolean) => {
    dispatch({ type: 'TOGGLE_DRAWER', payload: open });
  };

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <QuoteContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        updateObservation,
        clearQuote,
        toggleDrawer,
        itemCount,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}
