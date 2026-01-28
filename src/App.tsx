import React, { useEffect, useState } from 'react';
import {
  fetchCoordsByQuery,
  fetchWeatherByCoords,
  Unit,
  wmoToEmoji,
  wmoToText
} from './lib/weatherService';

import {
  loadLocations,
  loadTheme,
  loadUnits,
  saveLocations,
  saveTheme,
  saveUnits,
  Units as UnitsT,
  Theme
} from './lib/storage';

type Tab = 'hourly' | 'daily';

export default function App() {
  const [units, setUnits] = useState<UnitsT>(loadUnits());
  const [theme, setTheme] = useState<Theme>(loadTheme());
  const [tab, setTab] = useState<Tab>('daily');

  const [query, setQuery] = useState('');
  const [locationLabel, setLocationLabel] = useState('Detecting location…');
  const [saved, setSaved] = useState<string[]>(loadLocations());

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== Theme =====
  useEffect(() => {
    saveTheme(theme);
    document.body.className =
      theme === 'dark'
        ? 'min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white'
        : 'min-h-screen bg-gray-100 text-gray-900';
  }, [theme]);

  useEffect(() => {
    saveUnits(units);
  }, [units]);

  // ===== STRICT AREA RESOLUTION (NO CITY BIAS) =====
  async function resolveUserArea(lat: number, lon: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=18&lat=${lat}&lon=${lon}`
      );
      const json = await res.json();
      const a = json.address || {};

      return (
        a.suburb ||
        a.locality ||
        a.neighbourhood ||
        a.village ||
        a.town ||
        a.municipality ||
        a.city ||
        'Your Area'
      );
    } catch {
      return 'Your Area';
    }
  }

  // ===== INITIAL GEOLOCATION =====
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setLoading(true);

          const { latitude, longitude } = pos.coords;

          const area = await resolveUserArea(latitude, longitude);
          const fx = await fetchWeatherByCoords(
            latitude,
            longitude,
            units as Unit
          );

          setData(fx);
          setLocationLabel(area);
        } catch {
          setError('Unable to load weather for your area');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location permission denied');
      },
      { enableHighAccuracy: true }
    );
  }, [units]);

  // ===== SEARCH =====
  async function handleSearch(label?: string) {
    const searchTerm = label || query.trim();
    if (!searchTerm) return;

    try {
      setLoading(true);
      const geo = await fetchCoordsByQuery(searchTerm);
      if (!geo) {
        setError('Location not found');
        return;
      }

      const fx = await fetchWeatherByCoords(
        geo.lat,
        geo.lon,
        units as Unit
      );

      const areaName = geo.label.split(',')[0];
      setData(fx);
      setLocationLabel(areaName);
    } catch {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  }

  // ===== SAVE / REMOVE =====
  function saveCurrentLocation() {
    if (!locationLabel) return;
    const next = Array.from(new Set([locationLabel, ...saved]));
    setSaved(next);
    saveLocations(next);
  }

  function removeSaved(label: string) {
    const next = saved.filter((l) => l !== label);
    setSaved(next);
    saveLocations(next);
  }

  const unitSymbol = units === 'metric' ? '°C' : '°F';
  const speedUnit = units === 'metric' ? 'km/h' : 'mph';

  const hourLabel = (i: number) =>
    `${String(i).padStart(2, '0')}–${String(i + 1).padStart(2, '0')}`;

  const dayLabel = (d: string) =>
    new Date(d).toLocaleDateString('en-ZA', { weekday: 'short' });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="glass rounded-2xl px-6 py-4 flex flex-wrap justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">React Weather App</h1>

        <div className="flex gap-2 flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location"
            className="px-3 py-2 rounded-lg text-gray-900"
          />
          <button
            onClick={() => handleSearch()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            Search
          </button>
          <button
            onClick={() =>
              setUnits(units === 'metric' ? 'imperial' : 'metric')
            }
            className="px-3 py-2 rounded-lg bg-black/30"
          >
            {unitSymbol}
          </button>
          <button
            onClick={() =>
              setTheme(theme === 'dark' ? 'light' : 'dark')
            }
            className="px-3 py-2 rounded-lg bg-black/30"
          >
            {theme}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setTab('hourly')}
          className={`px-5 py-2 rounded-full ${
            tab === 'hourly' ? 'bg-white/20' : 'bg-black/20'
          }`}
        >
          Hourly
        </button>
        <button
          onClick={() => setTab('daily')}
          className={`px-5 py-2 rounded-full ${
            tab === 'daily'
              ? 'bg-blue-600 text-white'
              : 'bg-black/20'
          }`}
        >
          Daily
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Weather Card */}
        <div className="glass rounded-2xl p-6">
          <div className="text-sm opacity-80 mb-1">
            {locationLabel}
          </div>

          <div className="text-5xl font-bold mb-1">
            {data?.current?.temperature ?? '—'}
            {unitSymbol}
          </div>

          <div className="mb-2">
            {wmoToText(data?.current?.weatherCode)}
          </div>

          <div className="text-sm opacity-80 mb-4">
            Humidity {data?.current?.humidity ?? '—'}% · Wind{' '}
            {data?.current?.wind ?? '—'} {speedUnit}
          </div>

          <div className="flex gap-3 overflow-x-auto">
            {(tab === 'daily' ? data?.daily : data?.hourly)
              ?.slice(0, tab === 'daily' ? 7 : 12)
              .map((item: any, i: number) => (
                <div
                  key={i}
                  className="bg-black/20 rounded-xl px-4 py-3 min-w-[110px] text-center"
                >
                  <div className="text-sm opacity-80 mb-1">
                    {tab === 'daily'
                      ? dayLabel(item.date)
                      : hourLabel(i)}
                  </div>
                  <div className="text-xl">
                    {wmoToEmoji(item.code)}
                  </div>
                  <div className="text-sm">
                    {tab === 'daily'
                      ? `${Math.round(item.max)}${unitSymbol} / ${Math.round(
                          item.min
                        )}${unitSymbol}`
                      : `${Math.round(item.temp)}${unitSymbol}`}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Saved */}
        <div className="glass rounded-2xl p-5">
          <div className="flex justify-between mb-3">
            <span className="text-sm opacity-80">Saved Areas</span>
            <button
              onClick={saveCurrentLocation}
              className="text-sm bg-white/20 px-2 py-1 rounded"
            >
              Save
            </button>
          </div>

          <div className="space-y-2">
            {saved.map((label) => (
              <div
                key={label}
                onClick={() => handleSearch(label)}
                className="cursor-pointer flex justify-between items-center bg-black/20 rounded-lg px-3 py-2 hover:bg-black/30"
              >
                <span className="truncate">{label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSaved(label);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="mt-4">Loading…</div>}
      {error && <div className="mt-2 text-red-400">{error}</div>}
    </div>
  );
}
