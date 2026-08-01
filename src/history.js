import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@tic_tac_toe_history';
const MAX_ITEMS = 50;

export const saveGameResult = async (entry) => {
  try {
    const history = await loadHistory();
    const record = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      ...entry,
    };
    history.unshift(record);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ITEMS)));
  } catch (e) {
    // ignore storage errors
  }
};

export const loadHistory = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore storage errors
  }
};
