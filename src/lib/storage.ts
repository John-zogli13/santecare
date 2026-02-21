export interface SleepEntry {
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  wakeUps: number;
  fatigue: 'low' | 'medium' | 'high';
  status: 'good' | 'warning' | 'danger';
}

export interface HydrationEntry {
  date: string;
  weight: number;
  activity: 'sedentary' | 'moderate' | 'intense';
  temperature: 'cold' | 'normal' | 'hot';
  consumed: number;
  needed: number;
  status: 'good' | 'warning' | 'danger';
}

export interface CardioEntry {
  date: string;
  age: number;
  weight: number;
  height: number;
  bmi: number;
  systolic: number;
  diastolic: number;
  smoking: 'none' | 'occasional' | 'regular';
  exercise: 'none' | '1-2' | '3+';
  riskFactors: number;
  status: 'good' | 'warning' | 'danger';
  factors: { label: string; status: 'good' | 'warning' | 'danger' }[];
}

export interface FoodEntry {
  date: string;
  time: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  portion: string;
}

const STORAGE_KEYS = {
  sleep: 'health_sleep',
  hydration: 'health_hydration',
  cardio: 'health_cardio',
  food: 'health_food',
  disclaimer: 'health_disclaimer_accepted',
  goal: 'health_goal',
};

function getEntries<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveEntry<T extends { date: string }>(key: string, entry: T) {
  const entries = getEntries<T>(key);
  entries.push(entry);
  // Keep last 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const filtered = entries.filter(e => new Date(e.date) >= cutoff);
  localStorage.setItem(key, JSON.stringify(filtered));
}

export function saveSleepEntry(entry: SleepEntry) {
  saveEntry(STORAGE_KEYS.sleep, entry);
}

export function getSleepEntries(): SleepEntry[] {
  return getEntries<SleepEntry>(STORAGE_KEYS.sleep);
}

export function saveHydrationEntry(entry: HydrationEntry) {
  saveEntry(STORAGE_KEYS.hydration, entry);
}

export function getHydrationEntries(): HydrationEntry[] {
  return getEntries<HydrationEntry>(STORAGE_KEYS.hydration);
}

export function saveCardioEntry(entry: CardioEntry) {
  saveEntry(STORAGE_KEYS.cardio, entry);
}

export function getCardioEntries(): CardioEntry[] {
  return getEntries<CardioEntry>(STORAGE_KEYS.cardio);
}

export function saveFoodEntry(entry: FoodEntry) {
  saveEntry(STORAGE_KEYS.food, entry);
}

export function getFoodEntries(): FoodEntry[] {
  return getEntries<FoodEntry>(STORAGE_KEYS.food);
}

export function getTodayFoodEntries(): FoodEntry[] {
  const today = new Date().toISOString().split('T')[0];
  return getFoodEntries().filter(e => e.date === today);
}

export function isDisclaimerAccepted(): boolean {
  return localStorage.getItem(STORAGE_KEYS.disclaimer) === 'true';
}

export function acceptDisclaimer() {
  localStorage.setItem(STORAGE_KEYS.disclaimer, 'true');
}

export function getGoal(): string | null {
  return localStorage.getItem(STORAGE_KEYS.goal);
}

export function setGoal(goal: string) {
  localStorage.setItem(STORAGE_KEYS.goal, goal);
}

export function getLatestEntry<T>(entries: T[]): T | null {
  return entries.length > 0 ? entries[entries.length - 1] : null;
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getTodayEntries<T extends { date: string }>(entries: T[]): T[] {
  const today = getToday();
  return entries.filter(e => e.date === today);
}

export function getLast7DaysEntries<T extends { date: string }>(entries: T[]): T[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return entries.filter(e => new Date(e.date) >= cutoff);
}
