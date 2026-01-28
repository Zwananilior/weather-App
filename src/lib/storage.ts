export type Units = 'metric' | 'imperial';
export type Theme = 'dark' | 'light';

const KEYS = {
  locations: 'rw.locations',
  theme: 'rw.theme',
  units: 'rw.units',
  weather: 'rw.weather'
};

// ===== Units =====
export function loadUnits(): Units {
  const v = localStorage.getItem(KEYS.units);
  return v === 'imperial' || v === 'metric' ? v : 'metric';
}

export function saveUnits(u: Units) {
  localStorage.setItem(KEYS.units, u);
}

// ===== Theme =====
export function loadTheme(): Theme {
  const v = localStorage.getItem(KEYS.theme);
  return v === 'light' || v === 'dark' ? v : 'dark';
}

export function saveTheme(t: Theme) {
  localStorage.setItem(KEYS.theme, t);
}

// ===== Saved Locations =====
export function loadLocations(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.locations) || '[]');
  } catch {
    return [];
  }
}

export function saveLocations(list: string[]) {
  localStorage.setItem(KEYS.locations, JSON.stringify(list));
}

// ===== Weather Cache (OFFLINE SUPPORT) =====
export function loadWeatherCache(): Record<
  string,
  { data: any; timestamp: number }
> {
  try {
    return JSON.parse(localStorage.getItem(KEYS.weather) || '{}');
  } catch {
    return {};
  }
}

export function saveWeatherCache(label: string, data: any) {
  const all = loadWeatherCache();
  all[label] = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(KEYS.weather, JSON.stringify(all));
}
