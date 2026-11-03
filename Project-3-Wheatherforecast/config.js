/**
 * Real-Time Weather Forecast & Climate Telemetry Dashboard
 * Configuration File
 *
 * Environment Variable Support:
 * - Reads VITE_OPENWEATHER_API_KEY or OPENWEATHER_API_KEY from environment variables:
 *   process.env, window.__ENV__, or window.ENV.
 * - For local development, copy .env.example to .env and insert your free key.
 *
 * SECURITY:
 * - NEVER commit actual secret API keys to GitHub or version control.
 * - Keep .env listed in .gitignore and only commit .env.example with placeholders.
 */

function getEnvironmentVariable(name) {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name].trim();
  }
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[name]) {
    return window.__ENV__[name].trim();
  }
  if (typeof window !== 'undefined' && window.ENV && window.ENV[name]) {
    return window.ENV[name].trim();
  }
  return null;
}

const CONFIG = {
  // Reads from VITE_OPENWEATHER_API_KEY or OPENWEATHER_API_KEY environment variables,
  // falling back to placeholder if neither is set.
  OPENWEATHER_API_KEY: getEnvironmentVariable('VITE_OPENWEATHER_API_KEY')
    || getEnvironmentVariable('OPENWEATHER_API_KEY')
    || 'YOUR_API_KEY_HERE',

  // Default city loaded when dashboard opens
  DEFAULT_CITY: 'London',

  // Default temperature units: 'metric' (Celsius, m/s) or 'imperial' (Fahrenheit, mph)
  DEFAULT_UNITS: 'metric',

  // OpenWeatherMap API Base Endpoints
  API_BASE_URL: 'https://api.openweathermap.org/data/2.5',

  // Forecast Days Count (5-day forecast)
  FORECAST_DAYS: 5
};

// Freeze configuration to prevent accidental modification
Object.freeze(CONFIG);
