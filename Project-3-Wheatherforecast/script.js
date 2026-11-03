/**
 * ==========================================================================
 * AEROCAST • REAL-TIME WEATHER FORECAST & CLIMATE TELEMETRY
 * Complete ES6+ JavaScript Application
 * Stack: Fetch API, Async/Await, OpenWeatherMap API, Vanilla ES6+
 * ==========================================================================
 */

'use strict';

// ---------------------------------------------------------------------------
// 1. Application State
// ---------------------------------------------------------------------------
const state = {
  currentCity: 'London',
  currentWeatherData: null,
  forecastData: null,
  units: 'metric', // 'metric' for Celsius, 'imperial' for Fahrenheit
  isLoading: false,
  isDemoMode: false,
  apiKey: '',
  envApiKey: ''
};

// ---------------------------------------------------------------------------
// 2. DOM Elements Cache
// ---------------------------------------------------------------------------
const DOM = {
  // Search Elements
  searchForm: document.getElementById('search-form'),
  searchInput: document.getElementById('city-search-input'),
  searchBtn: document.getElementById('search-btn'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  geoBtn: document.getElementById('geo-btn'),
  quickChipsContainer: document.getElementById('quick-chips'),

  // Utilities
  unitToggleBtn: document.getElementById('unit-toggle-btn'),
  unitC: document.querySelector('.unit-c'),
  unitF: document.querySelector('.unit-f'),
  settingsBtn: document.getElementById('settings-btn'),
  footerConfigLink: document.getElementById('footer-config-link'),

  // Feedback & Loading
  statusBanner: document.getElementById('status-banner'),
  bannerTitle: document.getElementById('banner-title'),
  bannerMessage: document.getElementById('banner-message'),
  bannerCloseBtn: document.getElementById('banner-close-btn'),
  apiKeyNotice: document.getElementById('apikey-notice'),
  openApiModalBtn: document.getElementById('open-api-modal-btn'),
  demoModeBtn: document.getElementById('demo-mode-btn'),
  loadingState: document.getElementById('loading-state'),
  dashboardContent: document.getElementById('dashboard-content'),

  // Current Weather Elements
  cityName: document.getElementById('city-name'),
  countryBadge: document.getElementById('country-badge'),
  locationBadge: document.querySelector('.location-badge'),
  livePill: document.querySelector('.live-pill'),
  localDateTime: document.getElementById('local-datetime'),
  currentTemp: document.getElementById('current-temp'),
  weatherDesc: document.getElementById('weather-description'),
  feelsLikeTemp: document.getElementById('feels-like-temp'),
  highTemp: document.getElementById('high-temp'),
  lowTemp: document.getElementById('low-temp'),
  weatherIconArt: document.getElementById('weather-icon-art'),
  conditionTag: document.getElementById('condition-tag'),

  // Telemetry Metric Elements
  humidityVal: document.getElementById('humidity-val'),
  humidityMeter: document.getElementById('humidity-meter'),
  humidityDesc: document.getElementById('humidity-desc'),

  windVal: document.getElementById('wind-val'),
  windUnit: document.getElementById('wind-unit'),
  windCompass: document.getElementById('wind-compass'),
  windDirectionDesc: document.getElementById('wind-direction-desc'),

  pressureVal: document.getElementById('pressure-val'),
  pressureRating: document.getElementById('pressure-rating'),

  visibilityVal: document.getElementById('visibility-val'),
  visibilityDesc: document.getElementById('visibility-desc'),

  sunriseVal: document.getElementById('sunrise-val'),
  sunsetVal: document.getElementById('sunset-val'),
  solarProgress: document.getElementById('solar-progress'),
  solarStatus: document.getElementById('solar-status'),

  cloudVal: document.getElementById('cloud-val'),
  cloudMeter: document.getElementById('cloud-meter'),
  cloudDesc: document.getElementById('cloud-desc'),

  // 5-Day Forecast Container
  forecastContainer: document.getElementById('forecast-container'),

  // Modal Dialog Elements
  apiModal: document.getElementById('api-modal'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalApiKeyInput: document.getElementById('modal-api-key-input'),
  modalSaveKeyBtn: document.getElementById('modal-save-key-btn'),
  modalClearKeyBtn: document.getElementById('modal-clear-key-btn'),
  toggleKeyVisibilityBtn: document.getElementById('toggle-key-visibility')
};

// ---------------------------------------------------------------------------
// 3. API Key & Configuration Management (Environment Variable Driven)
// ---------------------------------------------------------------------------
const API_STORAGE_KEY = 'aerocast_owm_api_key';

/**
 * Safely reads an environment variable from global runtime contexts:
 * Node.js (process.env), window.__ENV__, or window.ENV.
 * @param {string} name 
 * @returns {string|null}
 */
function getEnvVar(name) {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    const val = process.env[name].trim();
    if (val && !val.includes('placeholder') && !val.includes('your_') && !val.includes('YOUR_')) {
      return val;
    }
  }
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[name]) {
    const val = window.__ENV__[name].trim();
    if (val && !val.includes('placeholder') && !val.includes('your_') && !val.includes('YOUR_')) {
      return val;
    }
  }
  if (typeof window !== 'undefined' && window.ENV && window.ENV[name]) {
    const val = window.ENV[name].trim();
    if (val && !val.includes('placeholder') && !val.includes('your_') && !val.includes('YOUR_')) {
      return val;
    }
  }
  return null;
}

/**
 * Retrieves the effective OpenWeatherMap API key by checking in order:
 * 1. Environment variables (VITE_OPENWEATHER_API_KEY / OPENWEATHER_API_KEY)
 * 2. Dynamically loaded local .env / api/.ENV file
 * 3. Browser localStorage (configured via UI modal)
 * 4. CONFIG.OPENWEATHER_API_KEY fallback
 * @returns {string} API Key or empty string
 */
function getActiveApiKey() {
  // 1. Direct environment variable
  const envKey = getEnvVar('VITE_OPENWEATHER_API_KEY') || getEnvVar('OPENWEATHER_API_KEY');
  if (envKey && envKey.length >= 16) {
    return envKey;
  }

  // 2. Asynchronously loaded local .env file in dev mode
  if (state.envApiKey && state.envApiKey.length >= 16) {
    return state.envApiKey;
  }

  // 3. Key stored in browser localStorage
  const storedKey = localStorage.getItem(API_STORAGE_KEY);
  if (storedKey && storedKey.trim().length >= 16) {
    return storedKey.trim();
  }

  // 4. CONFIG object from config.js
  if (typeof CONFIG !== 'undefined' && CONFIG.OPENWEATHER_API_KEY) {
    const configKey = CONFIG.OPENWEATHER_API_KEY.trim();
    if (configKey !== 'YOUR_API_KEY_HERE' && 
        configKey !== 'your_openweathermap_api_key_here' && 
        configKey.length >= 16) {
      return configKey;
    }
  }

  return '';
}

/**
 * Asynchronously attempts to read environment variables from local .env or api/.ENV
 * during local development (Live Server, Vite, static server, etc.).
 */
async function loadLocalEnvironmentVariables() {
  if (state.envApiKey) return;

  const candidatePaths = ['api/.ENV', 'api/.env', '.env'];
  for (const envPath of candidatePaths) {
    try {
      const response = await fetch(envPath);
      if (!response.ok) continue;
      const textContent = await response.text();
      const lines = textContent.split(/\r?\n/);
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        val = val.replace(/^["']|["']$/g, '').trim();

        if (
          (key === 'VITE_OPENWEATHER_API_KEY' || key === 'OPENWEATHER_API_KEY') &&
          val &&
          val !== 'your_openweathermap_api_key_here' &&
          val !== 'YOUR_API_KEY_HERE' &&
          val.length >= 16
        ) {
          state.envApiKey = val;
          return;
        }
      }
    } catch (err) {
      // Normal when opened directly as file:// or if .env is missing/secured
    }
  }
}

/**
 * Saves a new API key to localStorage.
 * @param {string} key 
 */
function saveApiKey(key) {
  const cleanKey = key.trim();
  if (cleanKey.length > 0) {
    localStorage.setItem(API_STORAGE_KEY, cleanKey);
    state.apiKey = cleanKey;
  }
}

/**
 * Removes the stored API key from localStorage.
 */
function removeStoredApiKey() {
  localStorage.removeItem(API_STORAGE_KEY);
  state.apiKey = '';
}

// ---------------------------------------------------------------------------
// 4. Weather SVG Icons Generator
// Scalable, high-definition SVG graphics rendered dynamically
// ---------------------------------------------------------------------------
function getWeatherIconSvg(iconCode, condition) {
  const code = (iconCode || '').toLowerCase();

  // Sunny / Clear Day
  if (code === '01d') {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="14" fill="url(#sunGrad)" stroke="#f59e0b" stroke-width="2"/>
        <g stroke="#fbbf24" stroke-width="3" stroke-linecap="round">
          <line x1="32" y1="6" x2="32" y2="12" />
          <line x1="32" y1="52" x2="32" y2="58" />
          <line x1="6" y1="32" x2="12" y2="32" />
          <line x1="52" y1="32" x2="58" y2="32" />
          <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" />
          <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" />
          <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" />
          <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" />
        </g>
        <defs>
          <radialGradient id="sunGrad" cx="0.4" cy="0.4" r="0.6">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="70%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#d97706"/>
          </radialGradient>
        </defs>
      </svg>
    `;
  }

  // Clear Night
  if (code === '01n') {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M44 38A18 18 0 1 1 26 20a14 14 0 0 0 18 18z" fill="url(#moonGrad)" stroke="#cbd5e1" stroke-width="1.5"/>
        <circle cx="48" cy="18" r="1.5" fill="#fef08a"/>
        <circle cx="54" cy="28" r="1.2" fill="#ffffff"/>
        <circle cx="16" cy="14" r="1.2" fill="#e2e8f0"/>
        <defs>
          <linearGradient id="moonGrad" x1="20" y1="15" x2="45" y2="45" gradientUnits="userSpaceOnUse">
            <stop stop-color="#f8fafc"/>
            <stop offset="1" stop-color="#94a3b8"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  // Few Clouds Day
  if (code === '02d') {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="10" fill="#f59e0b"/>
        <path d="M46 44H20a10 10 0 0 1-1.5-19.9A14 14 0 0 1 45 27.5 8 8 0 0 1 46 44z" fill="url(#cloudGradLight)" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
        <defs>
          <linearGradient id="cloudGradLight" x1="20" y1="20" x2="46" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#ffffff"/>
            <stop offset="1" stop-color="#cbd5e1"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  // Few Clouds Night
  if (code === '02n') {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 24A10 10 0 1 1 20 14a8 8 0 0 0 10 10z" fill="#cbd5e1"/>
        <path d="M46 44H20a10 10 0 0 1-1.5-19.9A14 14 0 0 1 45 27.5 8 8 0 0 1 46 44z" fill="url(#cloudGradDark)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <defs>
          <linearGradient id="cloudGradDark" x1="20" y1="20" x2="46" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#94a3b8"/>
            <stop offset="1" stop-color="#475569"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  // Scattered / Broken Clouds / Overcast (03d, 03n, 04d, 04n)
  if (code.startsWith('03') || code.startsWith('04')) {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M42 34H22a7 7 0 0 1-1-13.9A10 10 0 0 1 41 22a6 6 0 0 1 1 12z" fill="#64748b" opacity="0.6"/>
        <path d="M48 48H18a9 9 0 0 1-1.5-17.9A13 13 0 0 1 47 33a7 7 0 0 1 1 15z" fill="url(#overcastGrad)" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
        <defs>
          <linearGradient id="overcastGrad" x1="18" y1="25" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stop-color="#f1f5f9"/>
            <stop offset="1" stop-color="#94a3b8"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  // Shower Rain / Rain (09d, 09n, 10d, 10n)
  if (code.startsWith('09') || code.startsWith('10')) {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M48 38H18a8 8 0 0 1-1.5-15.9A12 12 0 0 1 47 25a6 6 0 0 1 1 13z" fill="url(#rainCloudGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <g stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round">
          <line x1="22" y1="44" x2="19" y2="52"/>
          <line x1="32" y1="44" x2="29" y2="52"/>
          <line x1="42" y1="44" x2="39" y2="52"/>
        </g>
        <defs>
          <linearGradient id="rainCloudGrad" x1="18" y1="18" x2="48" y2="38" gradientUnits="userSpaceOnUse">
            <stop stop-color="#cbd5e1"/>
            <stop offset="1" stop-color="#475569"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  // Thunderstorm (11d, 11n)
  if (code.startsWith('11')) {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M48 36H18a8 8 0 0 1-1.5-15.9A12 12 0 0 1 47 23a6 6 0 0 1 1 13z" fill="#334155" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
        <polygon points="34 36 26 48 33 48 29 58 41 45 34 45" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
      </svg>
    `;
  }

  // Snow (13d, 13n)
  if (code.startsWith('13')) {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M48 38H18a8 8 0 0 1-1.5-15.9A12 12 0 0 1 47 25a6 6 0 0 1 1 13z" fill="#94a3b8" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
        <g stroke="#e0f2fe" stroke-width="2" stroke-linecap="round">
          <line x1="22" y1="45" x2="22" y2="51"/>
          <line x1="19" y1="48" x2="25" y2="48"/>
          <line x1="32" y1="46" x2="32" y2="52"/>
          <line x1="29" y1="49" x2="35" y2="49"/>
          <line x1="42" y1="45" x2="42" y2="51"/>
          <line x1="39" y1="48" x2="45" y2="48"/>
        </g>
      </svg>
    `;
  }

  // Mist / Fog / Haze (50d, 50n)
  if (code.startsWith('50')) {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" opacity="0.9">
          <line x1="16" y1="22" x2="48" y2="22"/>
          <line x1="12" y1="30" x2="52" y2="30"/>
          <line x1="16" y1="38" x2="48" y2="38"/>
          <line x1="20" y1="46" x2="44" y2="46"/>
        </g>
      </svg>
    `;
  }

  // Default Fallback: OpenWeatherMap CDN Image
  return `<img src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="${condition || 'Weather condition'}" loading="lazy" />`;
}

// ---------------------------------------------------------------------------
// 5. Dynamic Background Switcher
// Sunny, Rainy, Cloudy, Night, Snowy, Thunderstorm, Mist
// ---------------------------------------------------------------------------
function updateBackgroundTheme(weatherData) {
  if (!weatherData || !weatherData.weather || !weatherData.weather[0]) return;

  const weather = weatherData.weather[0];
  const icon = weather.icon || '';
  const conditionId = weather.id;
  const isNight = icon.endsWith('n');

  // Reset theme classes
  document.body.className = '';

  // Theme Determination Logic
  if (isNight && (conditionId === 800 || conditionId === 801)) {
    // Clear / Mostly clear night
    document.body.classList.add('theme-night');
  } else if (conditionId >= 200 && conditionId < 300) {
    // Thunderstorm
    document.body.classList.add('theme-thunderstorm');
  } else if ((conditionId >= 300 && conditionId < 600)) {
    // Drizzle & Rain
    document.body.classList.add('theme-rainy');
  } else if (conditionId >= 600 && conditionId < 700) {
    // Snow
    document.body.classList.add('theme-snowy');
  } else if (conditionId >= 700 && conditionId < 800) {
    // Atmosphere: Mist, Smoke, Haze, Dust, Fog, Sand
    document.body.classList.add('theme-mist');
  } else if (conditionId === 800) {
    // Clear Sky
    document.body.classList.add(isNight ? 'theme-night' : 'theme-sunny');
  } else if (conditionId > 800) {
    // Cloudy (801 - 804)
    document.body.classList.add(isNight ? 'theme-night' : 'theme-cloudy');
  } else {
    // Default fallback
    document.body.classList.add('theme-sunny');
  }
}

// ---------------------------------------------------------------------------
// 6. Timezone-Adjusted Formatter
// Formats timestamps accurately based on the target city's timezone offset
// ---------------------------------------------------------------------------
function formatLocalCityTime(utcTimestampSec, timezoneOffsetSec, options = {}) {
  // Convert UTC timestamp in seconds to city local time in milliseconds
  // OpenWeatherMap timezone is the shift in seconds from UTC
  const cityDate = new Date((utcTimestampSec + timezoneOffsetSec) * 1000);

  if (options.timeOnly) {
    // 24-hour / 12-hour formatting using UTC methods since we pre-shifted
    let hours = cityDate.getUTCHours();
    const minutes = String(cityDate.getUTCMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // '0' becomes '12'
    return `${hours}:${minutes} ${ampm}`;
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = days[cityDate.getUTCDay()];
  const monthName = months[cityDate.getUTCMonth()];
  const dateNum = String(cityDate.getUTCDate()).padStart(2, '0');
  const year = cityDate.getUTCFullYear();

  let hours = cityDate.getUTCHours();
  const minutes = String(cityDate.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${dayName}, ${dateNum} ${monthName} ${year} • ${hours}:${minutes} ${ampm}`;
}

/**
 * Converts wind degree into a 16-point compass cardinal direction
 * @param {number} deg 
 * @returns {string} Direction (e.g. "NNE", "SSW")
 */
function getWindCardinalDirection(deg) {
  if (typeof deg !== 'number') return 'Variable';
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

// ---------------------------------------------------------------------------
// 7. Render Current Weather Data to UI
// ---------------------------------------------------------------------------
function renderCurrentWeather(data) {
  if (!data) return;

  const { name, sys, main, weather, wind, visibility, timezone, clouds } = data;
  const condition = weather[0] || {};
  const isCelsius = state.units === 'metric';
  const tempUnit = isCelsius ? '°C' : '°F';
  const speedUnit = isCelsius ? 'm/s' : 'mph';

  // City & Country
  DOM.cityName.textContent = name || 'Unknown City';
  DOM.countryBadge.textContent = (sys && sys.country) ? sys.country : '--';

  // City Local Date & Time
  const nowUtcSec = Math.floor(Date.now() / 1000);
  DOM.localDateTime.textContent = formatLocalCityTime(nowUtcSec, timezone || 0);

  // Temperatures
  DOM.currentTemp.textContent = `${Math.round(main.temp)}${tempUnit}`;
  DOM.feelsLikeTemp.textContent = `${Math.round(main.feels_like)}${tempUnit}`;
  DOM.highTemp.textContent = `${Math.round(main.temp_max)}${tempUnit}`;
  DOM.lowTemp.textContent = `${Math.round(main.temp_min)}${tempUnit}`;

  // Weather Description & Visual Icon
  DOM.weatherDesc.textContent = condition.description || 'Clear Sky';
  DOM.conditionTag.textContent = condition.main || 'Clear';
  DOM.weatherIconArt.innerHTML = getWeatherIconSvg(condition.icon, condition.description);

  // Telemetry: Humidity
  const humidity = main.humidity ?? 0;
  DOM.humidityVal.textContent = humidity;
  DOM.humidityMeter.style.width = `${Math.min(100, Math.max(0, humidity))}%`;
  if (humidity < 35) {
    DOM.humidityDesc.textContent = 'Dry air • Low moisture';
  } else if (humidity <= 65) {
    DOM.humidityDesc.textContent = 'Comfortable moisture level';
  } else {
    DOM.humidityDesc.textContent = 'High humidity • Moist air';
  }

  // Telemetry: Wind Speed & Direction
  const windSpeed = wind?.speed ?? 0;
  const windDeg = wind?.deg ?? 0;
  DOM.windVal.textContent = windSpeed.toFixed(1);
  DOM.windUnit.textContent = speedUnit;
  DOM.windCompass.querySelector('.compass-needle').style.transform = `rotate(${windDeg}deg)`;
  DOM.windDirectionDesc.textContent = `Direction: ${getWindCardinalDirection(windDeg)} (${windDeg}°)`;

  // Telemetry: Atmospheric Pressure
  const pressure = main.pressure ?? 1013;
  DOM.pressureVal.textContent = pressure;
  if (pressure > 1020) {
    DOM.pressureRating.textContent = 'High Pressure • Fair & Stable';
  } else if (pressure < 1005) {
    DOM.pressureRating.textContent = 'Low Pressure • Unsettled / Stormy';
  } else {
    DOM.pressureRating.textContent = 'Normal Atmospheric Pressure';
  }

  // Telemetry: Visibility
  const visMeters = visibility ?? 10000;
  const visKm = (visMeters / 1000).toFixed(1);
  DOM.visibilityVal.textContent = visKm;
  if (visMeters >= 10000) {
    DOM.visibilityDesc.textContent = 'Excellent • Completely Clear';
  } else if (visMeters >= 5000) {
    DOM.visibilityDesc.textContent = 'Good Visibility';
  } else if (visMeters >= 2000) {
    DOM.visibilityDesc.textContent = 'Moderate • Light Haze';
  } else {
    DOM.visibilityDesc.textContent = 'Low Visibility • Caution';
  }

  // Telemetry: Solar Cycle (Sunrise / Sunset)
  if (sys && sys.sunrise && sys.sunset) {
    const sunriseStr = formatLocalCityTime(sys.sunrise, timezone || 0, { timeOnly: true });
    const sunsetStr = formatLocalCityTime(sys.sunset, timezone || 0, { timeOnly: true });
    DOM.sunriseVal.textContent = sunriseStr;
    DOM.sunsetVal.textContent = sunsetStr;

    // Solar progress bar
    const totalDaylight = sys.sunset - sys.sunrise;
    const currentDaylightProg = nowUtcSec - sys.sunrise;
    if (totalDaylight > 0) {
      const percentage = Math.min(100, Math.max(0, (currentDaylightProg / totalDaylight) * 100));
      DOM.solarProgress.style.width = `${percentage}%`;
      if (nowUtcSec < sys.sunrise) {
        DOM.solarStatus.textContent = 'Before sunrise (Night)';
      } else if (nowUtcSec > sys.sunset) {
        DOM.solarStatus.textContent = 'After sunset (Night)';
      } else {
        DOM.solarStatus.textContent = `${Math.round(percentage)}% of daylight elapsed`;
      }
    }
  }

  // Telemetry: Cloud Cover
  const cloudPercent = clouds?.all ?? 0;
  DOM.cloudVal.textContent = cloudPercent;
  DOM.cloudMeter.style.width = `${cloudPercent}%`;
  if (cloudPercent <= 15) {
    DOM.cloudDesc.textContent = 'Clear sky • Low opacity';
  } else if (cloudPercent <= 50) {
    DOM.cloudDesc.textContent = 'Partly cloudy sky';
  } else if (cloudPercent <= 80) {
    DOM.cloudDesc.textContent = 'Broken cloud layer';
  } else {
    DOM.cloudDesc.textContent = 'Overcast sky';
  }
}

// ---------------------------------------------------------------------------
// 8. Process and Render 5-Day Weather Forecast
// Strictly uses Array.map() to generate forecast cards dynamically
// ---------------------------------------------------------------------------
/**
 * Processes OpenWeatherMap 40-item forecast array into 5 daily summaries
 * @param {Array} forecastList 
 * @param {number} timezoneOffset 
 * @returns {Array} 5 distinct daily objects
 */
function processForecastData(forecastList, timezoneOffset = 0) {
  if (!Array.isArray(forecastList) || forecastList.length === 0) return [];

  // Group items by local calendar date (YYYY-MM-DD)
  const groupedByDay = new Map();

  forecastList.forEach(item => {
    // Shift item dt by timezone to get city's local calendar day
    const localDate = new Date((item.dt + timezoneOffset) * 1000);
    const dateKey = `${localDate.getUTCFullYear()}-${String(localDate.getUTCMonth() + 1).padStart(2, '0')}-${String(localDate.getUTCDate()).padStart(2, '0')}`;

    if (!groupedByDay.has(dateKey)) {
      groupedByDay.set(dateKey, []);
    }
    groupedByDay.get(dateKey).push(item);
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Current city date string for today check
  const nowCityDate = new Date((Math.floor(Date.now() / 1000) + timezoneOffset) * 1000);
  const todayKey = `${nowCityDate.getUTCFullYear()}-${String(nowCityDate.getUTCMonth() + 1).padStart(2, '0')}-${String(nowCityDate.getUTCDate()).padStart(2, '0')}`;

  const dailySummaries = [];

  groupedByDay.forEach((readings, dateKey) => {
    // Min & Max temperatures across the entire day
    const tempsMin = readings.map(r => r.main.temp_min);
    const tempsMax = readings.map(r => r.main.temp_max);
    const minTemp = Math.min(...tempsMin);
    const maxTemp = Math.max(...tempsMax);

    // Pick midday reading (~12:00 UTC or closest) to represent weather condition and icon
    let middayReading = readings.find(r => {
      const h = new Date((r.dt + timezoneOffset) * 1000).getUTCHours();
      return h >= 11 && h <= 14;
    });
    if (!middayReading) {
      middayReading = readings[Math.floor(readings.length / 2)] || readings[0];
    }

    const firstItem = readings[0];
    const itemDate = new Date((firstItem.dt + timezoneOffset) * 1000);
    const isToday = dateKey === todayKey;

    const condition = middayReading.weather && middayReading.weather[0]
      ? middayReading.weather[0]
      : { main: 'Clear', description: 'Clear', icon: '01d' };

    dailySummaries.push({
      dateKey,
      isToday,
      dayName: isToday ? 'Today' : daysOfWeek[itemDate.getUTCDay()],
      dateStr: `${itemDate.getUTCDate()} ${monthNames[itemDate.getUTCMonth()]}`,
      tempMin: minTemp,
      tempMax: maxTemp,
      condition: condition.description || condition.main,
      iconCode: condition.icon,
      pop: Math.round((middayReading.pop || 0) * 100)
    });
  });

  // Return the first 5 days
  return dailySummaries.slice(0, 5);
}

/**
 * Renders the 5-day forecast cards using Array.map()
 * @param {Object} forecastData 
 */
function renderForecastUI(forecastData) {
  if (!forecastData || !forecastData.list) {
    DOM.forecastContainer.innerHTML = '<div class="forecast-empty-state">No forecast telemetry available.</div>';
    return;
  }

  const timezone = forecastData.city?.timezone || 0;
  const dailyForecasts = processForecastData(forecastData.list, timezone);
  const tempUnit = state.units === 'metric' ? '°' : '°';

  // REQUIREMENT SATISFIED: Use JavaScript Array.map() to generate forecast cards dynamically
  const forecastCardsHtml = dailyForecasts.map(day => {
    const popBadge = day.pop > 10
      ? `<span class="forecast-pop-badge" title="Precipitation Probability">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
             <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
           </svg>
           ${day.pop}%
         </span>`
      : '';

    return `
      <article class="forecast-card ${day.isToday ? 'today' : ''}" aria-label="Forecast for ${day.dayName}, ${day.dateStr}">
        <div class="forecast-day-name">${day.dayName}</div>
        <div class="forecast-date-str">${day.dateStr}</div>
        <div class="forecast-icon-box" title="${day.condition}">
          ${getWeatherIconSvg(day.iconCode, day.condition)}
        </div>
        <div class="forecast-condition-name">${day.condition}</div>
        <div class="forecast-temp-range">
          <span class="forecast-max-temp" title="Max Temperature">${Math.round(day.tempMax)}${tempUnit}</span>
          <span class="forecast-min-temp" title="Min Temperature">${Math.round(day.tempMin)}${tempUnit}</span>
        </div>
        ${popBadge}
      </article>
    `;
  }).join('');

  DOM.forecastContainer.innerHTML = forecastCardsHtml;
}

// ---------------------------------------------------------------------------
// 8.5. Demo / Simulation Mode Engine
// Enables immediate preview of all 7 dynamic weather themes, metric cards, 
// and Array.map()-generated 5-day forecasts without requiring an active key.
// Explicitly labeled as "DEMO PREVIEW" so it is never displayed as live data.
// ---------------------------------------------------------------------------
function loadDemoSimulation(cityName = 'London') {
  state.isDemoMode = true;
  state.currentCity = cityName;

  if (DOM.livePill) {
    DOM.livePill.textContent = 'DEMO PREVIEW';
    DOM.livePill.classList.add('demo');
  }
  if (DOM.locationBadge) {
    DOM.locationBadge.classList.add('demo');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const isC = state.units === 'metric';

  const demoProfiles = {
    'London': {
      name: 'London',
      country: 'GB',
      temp: isC ? 21 : 70,
      feels_like: isC ? 20 : 68,
      temp_min: isC ? 16 : 61,
      temp_max: isC ? 23 : 73,
      weather: [{ id: 800, main: 'Clear', description: 'Sunny & Clear Skies', icon: '01d' }],
      humidity: 58,
      wind: { speed: isC ? 4.2 : 9.4, deg: 210 },
      pressure: 1016,
      visibility: 10000,
      clouds: { all: 15 },
      timezone: 0,
      sunrise: nowSec - 28000,
      sunset: nowSec + 15000,
      forecast: [
        { dayName: 'Today', dateStr: '01 Nov', tempMax: isC ? 23 : 73, tempMin: isC ? 16 : 61, condition: 'Sunny', iconCode: '01d', pop: 0 },
        { dayName: 'Mon', dateStr: '02 Nov', tempMax: isC ? 21 : 70, tempMin: isC ? 15 : 59, condition: 'Partly Cloudy', iconCode: '02d', pop: 15 },
        { dayName: 'Tue', dateStr: '03 Nov', tempMax: isC ? 19 : 66, tempMin: isC ? 14 : 57, condition: 'Light Rain', iconCode: '10d', pop: 60 },
        { dayName: 'Wed', dateStr: '04 Nov', tempMax: isC ? 18 : 64, tempMin: isC ? 13 : 55, condition: 'Overcast', iconCode: '04d', pop: 25 },
        { dayName: 'Thu', dateStr: '05 Nov', tempMax: isC ? 20 : 68, tempMin: isC ? 14 : 57, condition: 'Scattered Clouds', iconCode: '03d', pop: 10 }
      ]
    },
    'Tokyo': {
      name: 'Tokyo',
      country: 'JP',
      temp: isC ? 16 : 61,
      feels_like: isC ? 15 : 59,
      temp_min: isC ? 12 : 54,
      temp_max: isC ? 18 : 64,
      weather: [{ id: 800, main: 'Clear', description: 'Clear Midnight Skies', icon: '01n' }],
      humidity: 52,
      wind: { speed: isC ? 3.1 : 6.9, deg: 45 },
      pressure: 1019,
      visibility: 10000,
      clouds: { all: 10 },
      timezone: 32400,
      sunrise: nowSec - 14000,
      sunset: nowSec + 24000,
      forecast: [
        { dayName: 'Today', dateStr: '01 Nov', tempMax: isC ? 18 : 64, tempMin: isC ? 12 : 54, condition: 'Clear Night', iconCode: '01n', pop: 0 },
        { dayName: 'Mon', dateStr: '02 Nov', tempMax: isC ? 19 : 66, tempMin: isC ? 13 : 55, condition: 'Clear Sky', iconCode: '01d', pop: 0 },
        { dayName: 'Tue', dateStr: '03 Nov', tempMax: isC ? 17 : 63, tempMin: isC ? 12 : 54, condition: 'Few Clouds', iconCode: '02d', pop: 10 },
        { dayName: 'Wed', dateStr: '04 Nov', tempMax: isC ? 16 : 61, tempMin: isC ? 11 : 52, condition: 'Broken Clouds', iconCode: '04d', pop: 20 },
        { dayName: 'Thu', dateStr: '05 Nov', tempMax: isC ? 18 : 64, tempMin: isC ? 12 : 54, condition: 'Clear Sky', iconCode: '01d', pop: 5 }
      ]
    },
    'New York': {
      name: 'New York',
      country: 'US',
      temp: isC ? 13 : 55,
      feels_like: isC ? 12 : 54,
      temp_min: isC ? 10 : 50,
      temp_max: isC ? 15 : 59,
      weather: [{ id: 501, main: 'Rain', description: 'Moderate Rain & Mist', icon: '10d' }],
      humidity: 86,
      wind: { speed: isC ? 5.8 : 13.0, deg: 120 },
      pressure: 1009,
      visibility: 7000,
      clouds: { all: 92 },
      timezone: -18000,
      sunrise: nowSec - 32000,
      sunset: nowSec + 11000,
      forecast: [
        { dayName: 'Today', dateStr: '01 Nov', tempMax: isC ? 15 : 59, tempMin: isC ? 10 : 50, condition: 'Moderate Rain', iconCode: '10d', pop: 85 },
        { dayName: 'Mon', dateStr: '02 Nov', tempMax: isC ? 14 : 57, tempMin: isC ? 9 : 48, condition: 'Heavy Rain', iconCode: '10d', pop: 90 },
        { dayName: 'Tue', dateStr: '03 Nov', tempMax: isC ? 16 : 61, tempMin: isC ? 11 : 52, condition: 'Cloudy', iconCode: '04d', pop: 30 },
        { dayName: 'Wed', dateStr: '04 Nov', tempMax: isC ? 18 : 64, tempMin: isC ? 12 : 54, condition: 'Partly Cloudy', iconCode: '02d', pop: 10 },
        { dayName: 'Thu', dateStr: '05 Nov', tempMax: isC ? 19 : 66, tempMin: isC ? 13 : 55, condition: 'Sunny', iconCode: '01d', pop: 0 }
      ]
    },
    'Sydney': {
      name: 'Sydney',
      country: 'AU',
      temp: isC ? 25 : 77,
      feels_like: isC ? 26 : 79,
      temp_min: isC ? 19 : 66,
      temp_max: isC ? 27 : 81,
      weather: [{ id: 800, main: 'Clear', description: 'Sunny Coastal Breeze', icon: '01d' }],
      humidity: 48,
      wind: { speed: isC ? 4.9 : 11.0, deg: 160 },
      pressure: 1017,
      visibility: 10000,
      clouds: { all: 12 },
      timezone: 39600,
      sunrise: nowSec - 18000,
      sunset: nowSec + 25000,
      forecast: [
        { dayName: 'Today', dateStr: '01 Nov', tempMax: isC ? 27 : 81, tempMin: isC ? 19 : 66, condition: 'Sunny', iconCode: '01d', pop: 0 },
        { dayName: 'Mon', dateStr: '02 Nov', tempMax: isC ? 28 : 82, tempMin: isC ? 20 : 68, condition: 'Sunny', iconCode: '01d', pop: 5 },
        { dayName: 'Tue', dateStr: '03 Nov', tempMax: isC ? 26 : 79, tempMin: isC ? 18 : 64, condition: 'Few Clouds', iconCode: '02d', pop: 15 },
        { dayName: 'Wed', dateStr: '04 Nov', tempMax: isC ? 24 : 75, tempMin: isC ? 17 : 63, condition: 'Scattered Clouds', iconCode: '03d', pop: 20 },
        { dayName: 'Thu', dateStr: '05 Nov', tempMax: isC ? 26 : 79, tempMin: isC ? 18 : 64, condition: 'Sunny', iconCode: '01d', pop: 0 }
      ]
    },
    'Oslo': {
      name: 'Oslo',
      country: 'NO',
      temp: isC ? -2 : 28,
      feels_like: isC ? -6 : 21,
      temp_min: isC ? -5 : 23,
      temp_max: isC ? 0 : 32,
      weather: [{ id: 601, main: 'Snow', description: 'Winter Snowfall', icon: '13d' }],
      humidity: 82,
      wind: { speed: isC ? 3.5 : 7.8, deg: 340 },
      pressure: 1021,
      visibility: 4500,
      clouds: { all: 88 },
      timezone: 3600,
      sunrise: nowSec - 25000,
      sunset: nowSec + 12000,
      forecast: [
        { dayName: 'Today', dateStr: '01 Nov', tempMax: isC ? 0 : 32, tempMin: isC ? -5 : 23, condition: 'Snowfall', iconCode: '13d', pop: 75 },
        { dayName: 'Mon', dateStr: '02 Nov', tempMax: isC ? 1 : 34, tempMin: isC ? -4 : 25, condition: 'Light Snow', iconCode: '13d', pop: 65 },
        { dayName: 'Tue', dateStr: '03 Nov', tempMax: isC ? -1 : 30, tempMin: isC ? -6 : 21, condition: 'Freezing Fog', iconCode: '50d', pop: 20 },
        { dayName: 'Wed', dateStr: '04 Nov', tempMax: isC ? 2 : 36, tempMin: isC ? -3 : 27, condition: 'Overcast', iconCode: '04d', pop: 30 },
        { dayName: 'Thu', dateStr: '05 Nov', tempMax: isC ? 0 : 32, tempMin: isC ? -4 : 25, condition: 'Snow', iconCode: '13d', pop: 70 }
      ]
    },
    'Paris': {
      name: 'Paris',
      country: 'FR',
      temp: isC ? 17 : 63,
      feels_like: isC ? 16 : 61,
      temp_min: isC ? 13 : 55,
      temp_max: isC ? 19 : 66,
      weather: [{ id: 803, main: 'Clouds', description: 'Broken Clouds & Overcast', icon: '04d' }],
      humidity: 64,
      wind: { speed: isC ? 3.8 : 8.5, deg: 230 },
      pressure: 1015,
      visibility: 9000,
      clouds: { all: 65 },
      timezone: 3600,
      sunrise: nowSec - 26000,
      sunset: nowSec + 13000,
      forecast: [
        { dayName: 'Today', dateStr: '01 Nov', tempMax: isC ? 19 : 66, tempMin: isC ? 13 : 55, condition: 'Broken Clouds', iconCode: '04d', pop: 20 },
        { dayName: 'Mon', dateStr: '02 Nov', tempMax: isC ? 18 : 64, tempMin: isC ? 12 : 54, condition: 'Light Rain', iconCode: '10d', pop: 50 },
        { dayName: 'Tue', dateStr: '03 Nov', tempMax: isC ? 17 : 63, tempMin: isC ? 11 : 52, condition: 'Overcast', iconCode: '04d', pop: 30 },
        { dayName: 'Wed', dateStr: '04 Nov', tempMax: isC ? 20 : 68, tempMin: isC ? 14 : 57, condition: 'Partly Cloudy', iconCode: '02d', pop: 10 },
        { dayName: 'Thu', dateStr: '05 Nov', tempMax: isC ? 21 : 70, tempMin: isC ? 15 : 59, condition: 'Sunny', iconCode: '01d', pop: 0 }
      ]
    },
    'Dubai': {
      name: 'Dubai',
      country: 'AE',
      temp: isC ? 32 : 90,
      feels_like: isC ? 34 : 93,
      temp_min: isC ? 26 : 79,
      temp_max: isC ? 34 : 93,
      weather: [{ id: 800, main: 'Clear', description: 'Sunny & Warm Atmosphere', icon: '01d' }],
      humidity: 38,
      wind: { speed: isC ? 4.1 : 9.2, deg: 310 },
      pressure: 1011,
      visibility: 10000,
      clouds: { all: 5 },
      timezone: 14400,
      sunrise: nowSec - 20000,
      sunset: nowSec + 18000,
      forecast: [
        { dayName: 'Today', dateStr: '01 Nov', tempMax: isC ? 34 : 93, tempMin: isC ? 26 : 79, condition: 'Sunny', iconCode: '01d', pop: 0 },
        { dayName: 'Mon', dateStr: '02 Nov', tempMax: isC ? 35 : 95, tempMin: isC ? 27 : 81, condition: 'Sunny', iconCode: '01d', pop: 0 },
        { dayName: 'Tue', dateStr: '03 Nov', tempMax: isC ? 33 : 91, tempMin: isC ? 25 : 77, condition: 'Clear Sky', iconCode: '01d', pop: 0 },
        { dayName: 'Wed', dateStr: '04 Nov', tempMax: isC ? 32 : 90, tempMin: isC ? 25 : 77, condition: 'Clear Sky', iconCode: '01d', pop: 0 },
        { dayName: 'Thu', dateStr: '05 Nov', tempMax: isC ? 33 : 91, tempMin: isC ? 26 : 79, condition: 'Sunny', iconCode: '01d', pop: 0 }
      ]
    }
  };

  const profile = demoProfiles[cityName] || demoProfiles['London'];

  const currentData = {
    name: profile.name,
    sys: { country: profile.country, sunrise: profile.sunrise, sunset: profile.sunset },
    main: {
      temp: profile.temp,
      feels_like: profile.feels_like,
      temp_min: profile.temp_min,
      temp_max: profile.temp_max,
      humidity: profile.humidity,
      pressure: profile.pressure
    },
    weather: profile.weather,
    wind: profile.wind,
    visibility: profile.visibility,
    clouds: profile.clouds,
    timezone: profile.timezone
  };

  renderCurrentWeather(currentData);
  updateBackgroundTheme(currentData);
  updateQuickChipsHighlight(profile.name);

  // Use Array.map() for forecast cards
  const tempUnit = state.units === 'metric' ? '°' : '°';
  const forecastCardsHtml = profile.forecast.map(day => `
    <article class="forecast-card ${day.dayName === 'Today' ? 'today' : ''}" aria-label="Forecast for ${day.dayName}, ${day.dateStr}">
      <div class="forecast-day-name">${day.dayName}</div>
      <div class="forecast-date-str">${day.dateStr}</div>
      <div class="forecast-icon-box" title="${day.condition}">
        ${getWeatherIconSvg(day.iconCode, day.condition)}
      </div>
      <div class="forecast-condition-name">${day.condition}</div>
      <div class="forecast-temp-range">
        <span class="forecast-max-temp" title="Max Temperature">${Math.round(day.tempMax)}${tempUnit}</span>
        <span class="forecast-min-temp" title="Min Temperature">${Math.round(day.tempMin)}${tempUnit}</span>
      </div>
      ${day.pop > 10 ? `<span class="forecast-pop-badge" title="Precipitation Probability"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>${day.pop}%</span>` : ''}
    </article>
  `).join('');

  DOM.forecastContainer.innerHTML = forecastCardsHtml;

  showBanner(
    'Demo Mode Active',
    `Displaying simulated telemetry for ${profile.name} (${profile.weather[0].description}). Click other city chips (e.g. Tokyo for Night, Oslo for Snowy, New York for Rainy) to preview dynamic themes! To query live global data, configure an API key.`,
    'info'
  );
}

// ---------------------------------------------------------------------------
// 9. API Integration (Fetch API + Async / Await + Error Handling)
// ---------------------------------------------------------------------------
/**
 * Fetches real-time weather and 5-day forecast for a city name
 * @param {string} cityName 
 */
async function fetchWeatherByCity(cityName) {
  const query = (cityName || '').trim();
  if (!query) {
    showBanner('Invalid Input', 'Please enter a valid city name.', 'warning');
    return;
  }

  const apiKey = getActiveApiKey();
  if (!apiKey) {
    showApiKeyNotice(true);
    showBanner('API Key Missing', 'OpenWeatherMap API Key is required to fetch live weather data. Click "Configure Key" to proceed.', 'warning');
    return;
  }

  hideBanner();
  showApiKeyNotice(false);
  setLoadingState(true);

  try {
    const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) 
      ? CONFIG.API_BASE_URL 
      : 'https://api.openweathermap.org/data/2.5';

    const units = state.units;

    // Asynchronous Fetch with Promise.all for fast concurrent retrieval
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`${baseUrl}/weather?q=${encodeURIComponent(query)}&units=${units}&appid=${apiKey}`),
      fetch(`${baseUrl}/forecast?q=${encodeURIComponent(query)}&units=${units}&appid=${apiKey}`)
    ]);

    // Handle HTTP status errors gracefully
    if (!weatherRes.ok) {
      handleApiHttpError(weatherRes.status, query);
      return;
    }

    if (!forecastRes.ok) {
      handleApiHttpError(forecastRes.status, query);
      return;
    }

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    // Cache to state
    state.currentCity = weatherData.name;
    state.currentWeatherData = weatherData;
    state.forecastData = forecastData;

    // Render Data to UI
    renderCurrentWeather(weatherData);
    renderForecastUI(forecastData);
    updateBackgroundTheme(weatherData);

    // Update active quick chip highlight
    updateQuickChipsHighlight(weatherData.name);

  } catch (error) {
    console.error('Fetch error:', error);
    showBanner(
      'Network Connection Error',
      'Unable to connect to OpenWeatherMap API servers. Please check your internet connection and try again.',
      'error'
    );
  } finally {
    setLoadingState(false);
  }
}

/**
 * Fetches real-time weather using geographic coordinates (HTML5 Geolocation)
 * @param {number} lat 
 * @param {number} lon 
 */
async function fetchWeatherByCoordinates(lat, lon) {
  const apiKey = getActiveApiKey();
  if (!apiKey) {
    showApiKeyNotice(true);
    showBanner('API Key Missing', 'OpenWeatherMap API Key is required to fetch live telemetry.', 'warning');
    return;
  }

  hideBanner();
  setLoadingState(true);

  try {
    const baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) 
      ? CONFIG.API_BASE_URL 
      : 'https://api.openweathermap.org/data/2.5';

    const units = state.units;

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`${baseUrl}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`),
      fetch(`${baseUrl}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`)
    ]);

    if (!weatherRes.ok || !forecastRes.ok) {
      handleApiHttpError(weatherRes.status || forecastRes.status, 'your location');
      return;
    }

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    state.currentCity = weatherData.name;
    state.currentWeatherData = weatherData;
    state.forecastData = forecastData;

    renderCurrentWeather(weatherData);
    renderForecastUI(forecastData);
    updateBackgroundTheme(weatherData);
    updateQuickChipsHighlight(weatherData.name);

  } catch (error) {
    console.error('Geolocation weather fetch error:', error);
    showBanner('Network Error', 'Failed to retrieve weather for your coordinates. Please try again.', 'error');
  } finally {
    setLoadingState(false);
  }
}

/**
 * Handles API HTTP error responses with specific, friendly feedback
 * @param {number} statusCode 
 * @param {string} locationName 
 */
function handleApiHttpError(statusCode, locationName) {
  if (statusCode === 404) {
    showBanner(
      'City Not Found',
      `Could not locate "${locationName}". Please verify the city spelling (e.g. "Tokyo", "London", "New York") and try again.`,
      'error'
    );
  } else if (statusCode === 401) {
    showApiKeyNotice(true);
    showBanner(
      'OpenWeatherMap Key Pending Activation or Invalid (HTTP 401)',
      'Your OpenWeatherMap API key returned HTTP 401 Unauthorized. Newly generated free keys can take 10 to 30 minutes to activate on OpenWeatherMap servers, or the key may be invalid. Showing Demo Mode below so you can test all features and themes right away!',
      'warning'
    );
    // Auto-load demo mode so the dashboard is immediately functional while the key activates
    loadDemoSimulation(state.currentCity || 'London');
  } else if (statusCode === 429) {
    showBanner(
      'Rate Limit Exceeded',
      'OpenWeatherMap free tier request limit reached (60 calls/minute). Please wait a moment before searching again.',
      'warning'
    );
  } else {
    showBanner(
      'Telemetry Service Unavailable',
      `OpenWeatherMap returned HTTP status ${statusCode}. Please try again later.`,
      'error'
    );
  }
}

// ---------------------------------------------------------------------------
// 10. UI Helpers: Loading, Banner, & Chips
// ---------------------------------------------------------------------------
function setLoadingState(isLoading) {
  state.isLoading = isLoading;
  if (isLoading) {
    DOM.loadingState.classList.remove('hidden');
    DOM.dashboardContent.style.opacity = '0.45';
    DOM.searchBtn.disabled = true;
  } else {
    DOM.loadingState.classList.add('hidden');
    DOM.dashboardContent.style.opacity = '1';
    DOM.searchBtn.disabled = false;
  }
}

function showBanner(title, message, type = 'error') {
  DOM.statusBanner.className = `status-banner ${type}`;
  DOM.bannerTitle.textContent = title;
  DOM.bannerMessage.textContent = message;
  DOM.statusBanner.classList.remove('hidden');
  DOM.statusBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideBanner() {
  DOM.statusBanner.classList.add('hidden');
}

function showApiKeyNotice(visible) {
  if (visible) {
    DOM.apiKeyNotice.classList.remove('hidden');
  } else {
    DOM.apiKeyNotice.classList.add('hidden');
  }
}

function updateQuickChipsHighlight(cityName) {
  const chips = DOM.quickChipsContainer.querySelectorAll('.chip-btn');
  chips.forEach(chip => {
    if (chip.getAttribute('data-city').toLowerCase() === (cityName || '').toLowerCase()) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

// ---------------------------------------------------------------------------
// 11. Event Listeners & Interactions
// ---------------------------------------------------------------------------
function setupEventListeners() {
  // 1. Search Form Submission (Click & Enter)
  DOM.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = DOM.searchInput.value.trim();
    if (query) {
      const apiKey = getActiveApiKey();
      if (!apiKey && state.isDemoMode) {
        // In demo mode without API key, try to load demo city or prompt
        loadDemoSimulation(query);
      } else {
        fetchWeatherByCity(query);
      }
    }
  });

  // 1.5. Demo Mode Trigger Button
  if (DOM.demoModeBtn) {
    DOM.demoModeBtn.addEventListener('click', () => {
      loadDemoSimulation(state.currentCity || 'London');
    });
  }

  // 2. Clear Search Input Button
  DOM.searchInput.addEventListener('input', () => {
    if (DOM.searchInput.value.length > 0) {
      DOM.clearSearchBtn.classList.add('visible');
    } else {
      DOM.clearSearchBtn.classList.remove('visible');
    }
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.classList.remove('visible');
    DOM.searchInput.focus();
  });

  // 3. Geolocation Button
  DOM.geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showBanner('Geolocation Unsupported', 'Your browser does not support geolocation.', 'warning');
      return;
    }

    setLoadingState(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoordinates(latitude, longitude);
      },
      (error) => {
        setLoadingState(false);
        console.warn('Geolocation error:', error);
        showBanner(
          'Location Access Denied',
          'Please allow location access in your browser or search for your city name manually.',
          'warning'
        );
      },
      { timeout: 10000 }
    );
  });

  // 4. Quick Location Chips
  DOM.quickChipsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip-btn');
    if (!chip) return;
    const city = chip.getAttribute('data-city');
    if (city) {
      DOM.searchInput.value = city;
      DOM.clearSearchBtn.classList.add('visible');
      const apiKey = getActiveApiKey();
      if (!apiKey && (state.isDemoMode || !state.currentWeatherData)) {
        loadDemoSimulation(city);
      } else {
        fetchWeatherByCity(city);
      }
    }
  });

  // 5. Temperature Unit Toggle (°C / °F)
  DOM.unitToggleBtn.addEventListener('click', () => {
    state.units = state.units === 'metric' ? 'imperial' : 'metric';

    if (state.units === 'metric') {
      DOM.unitC.classList.add('active');
      DOM.unitF.classList.remove('active');
    } else {
      DOM.unitC.classList.remove('active');
      DOM.unitF.classList.add('active');
    }

    // Refresh weather data with new units
    if (state.isDemoMode) {
      loadDemoSimulation(state.currentCity || 'London');
    } else if (state.currentCity) {
      fetchWeatherByCity(state.currentCity);
    }
  });

  // 6. Alert Banner Close Button
  DOM.bannerCloseBtn.addEventListener('click', hideBanner);

  // 7. API Modal Toggle & Handlers
  const openModal = () => {
    DOM.apiModal.classList.remove('hidden');
    DOM.modalApiKeyInput.value = getActiveApiKey();
    DOM.modalApiKeyInput.focus();
  };

  const closeModal = () => {
    DOM.apiModal.classList.add('hidden');
  };

  DOM.settingsBtn.addEventListener('click', openModal);
  DOM.openApiModalBtn.addEventListener('click', openModal);
  DOM.footerConfigLink.addEventListener('click', openModal);
  DOM.modalCloseBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside card
  DOM.apiModal.addEventListener('click', (e) => {
    if (e.target === DOM.apiModal) {
      closeModal();
    }
  });

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !DOM.apiModal.classList.contains('hidden')) {
      closeModal();
    }
    // Keyboard shortcut '/' to focus search
    if (e.key === '/' && document.activeElement !== DOM.searchInput && DOM.apiModal.classList.contains('hidden')) {
      e.preventDefault();
      DOM.searchInput.focus();
    }
  });

  // Toggle API Key password visibility
  DOM.toggleKeyVisibilityBtn.addEventListener('click', () => {
    const isPassword = DOM.modalApiKeyInput.type === 'password';
    DOM.modalApiKeyInput.type = isPassword ? 'text' : 'password';
  });

  // Modal Save Key Button
  DOM.modalSaveKeyBtn.addEventListener('click', () => {
    const key = DOM.modalApiKeyInput.value.trim();
    if (!key) {
      showBanner('Input Required', 'Please enter a valid API key string.', 'warning');
      return;
    }
    saveApiKey(key);
    state.isDemoMode = false;
    if (DOM.livePill) {
      DOM.livePill.textContent = 'LIVE';
      DOM.livePill.classList.remove('demo');
    }
    if (DOM.locationBadge) {
      DOM.locationBadge.classList.remove('demo');
    }
    closeModal();
    showApiKeyNotice(false);
    fetchWeatherByCity(state.currentCity || 'London');
  });

  // Modal Clear Key Button
  DOM.modalClearKeyBtn.addEventListener('click', () => {
    removeStoredApiKey();
    DOM.modalApiKeyInput.value = '';
    showApiKeyNotice(true);
    showBanner('API Key Cleared', 'Stored API key was removed. Please configure a key to fetch live data.', 'info');
    closeModal();
  });
}

// ---------------------------------------------------------------------------
// 12. Application Initialization
// ---------------------------------------------------------------------------
async function initApp() {
  setupEventListeners();

  // Dynamically load environment variables from local .env / api/.ENV if available
  await loadLocalEnvironmentVariables();

  const activeKey = getActiveApiKey();
  const defaultCity = (typeof CONFIG !== 'undefined' && CONFIG.DEFAULT_CITY)
    ? CONFIG.DEFAULT_CITY
    : 'London';

  if (!activeKey) {
    // Show setup banner and initial prompt
    showApiKeyNotice(true);
    // Render an informative placeholder state
    DOM.cityName.textContent = defaultCity;
    DOM.countryBadge.textContent = 'API KEY REQUIRED';
    DOM.currentTemp.textContent = '--°';
    DOM.weatherDesc.textContent = 'Configure OpenWeatherMap Key';
    DOM.conditionTag.textContent = 'Setup';
    DOM.weatherIconArt.innerHTML = getWeatherIconSvg('01d', 'Setup');
    DOM.forecastContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; background: rgba(255,255,255,0.05); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.2);">
        <p style="color: #cbd5e1; font-size: 1rem; margin-bottom: 0.5rem; font-weight: 600;">Live Forecast Ready to Connect</p>
        <p style="color: #94a3b8; font-size: 0.85rem;">Click the <strong>"Configure Key"</strong> button above or copy <code>.env.example</code> to <code>.env</code> with your free OpenWeatherMap API key.</p>
      </div>
    `;
  } else {
    // Fetch live weather immediately for default city
    fetchWeatherByCity(defaultCity);
  }
}

// Start app once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { initApp(); });
} else {
  initApp();
}

