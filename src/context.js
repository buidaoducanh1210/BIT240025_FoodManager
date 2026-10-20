import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { FoodStore } from './core/store';
import { STUDENT_ID, DEFAULT_API_URL } from './config';
import { translate } from './i18n';
const Context = createContext(null);
export const store = STUDENT_ID ? new FoodStore(AsyncStorage, STUDENT_ID, DEFAULT_API_URL) : null;
export function FoodProvider({ children }) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => {
    let alive = true;
    store.initialize().then(() => { if (alive) NetInfo.fetch().then(state => store.setOnline(Boolean(state.isConnected && state.isInternetReachable !== false))); });
    const unsubscribe = NetInfo.addEventListener(state => store.setOnline(Boolean(state.isConnected && state.isInternetReachable !== false)));
    const timer = setInterval(() => store.sync(), 15000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') NetInfo.fetch().then(net => store.setOnline(Boolean(net.isConnected && net.isInternetReachable !== false))); });
    return () => { alive = false; unsubscribe(); clearInterval(timer); listener.remove(); };
  }, []);
  const language = snapshot.data.Settings.Language;
  return <Context.Provider value={{ ...snapshot, store, language, t: (key, values) => translate(language, key, values),
    dishes: snapshot.data.Dish.filter(item => !item.Deleted), categories: snapshot.data.DishCategory.filter(item => !item.Deleted) }}>{children}</Context.Provider>;
}
export const useFood = () => useContext(Context);
