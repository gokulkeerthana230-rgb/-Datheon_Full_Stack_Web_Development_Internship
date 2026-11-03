# AeroCast • Real-Time Weather Forecast & Climate Telemetry

An executive-grade, fully functional, and mobile-responsive **Real-Time Weather Forecast & Climate Telemetry Dashboard** built with vanilla modern web technologies. AeroCast allows users to search any city worldwide to view live atmospheric conditions, astronomical cycle telemetry, and a dynamic 5-day meteorological forecast.

---

## 🔒 Security & Environment Configuration

This project enforces strict security practices to ensure secrets and credentials are never exposed:

1. **Environment Variables**: API keys are read from environment variables (`OPENWEATHER_API_KEY` or `VITE_OPENWEATHER_API_KEY`).
2. **Git Ignored Secrets**: `.env`, `.env.*`, `api/.ENV`, and local overrides are explicitly listed in `.gitignore` and are **never** committed or uploaded to GitHub.
3. **Safe Template**: `.env.example` is tracked with safe placeholder values only.
4. **Clean Git History**: Zero secret tokens or keys are present in any tracked files or Git commits.

### Setting Up Environment Variables

1. Copy the example environment template:
   ```bash
   # On macOS / Linux:
   cp .env.example .env

   # On Windows (PowerShell):
   Copy-Item .env.example .env
   ```

2. Open `.env` (or `api/.ENV`) and assign your free OpenWeatherMap API key:
   ```env
   OPENWEATHER_API_KEY=your_actual_32_character_api_key_here
   VITE_OPENWEATHER_API_KEY=your_actual_32_character_api_key_here
   ```

3. Verify `.env` is ignored by Git before committing:
   ```bash
   git status
   # Ensure .env and api/.ENV do NOT appear under "Untracked files"
   ```

---

## 🌟 Key Features

### 1. City Search & Telemetry Discovery
- **Global Search:** Instant lookup for any city worldwide with automatic name and country code resolution.
- **Form Controls:** Dedicated search button with Enter key submission and one-click input clearing.
- **Geolocation Integration:** Instant "My Location" button utilizing HTML5 Geolocation to query coordinates.
- **Quick-Search Chips:** Fast access to trending cities (London, Tokyo, New York, Paris, Sydney, Dubai, Singapore).
- **Graceful Error Handling:** Polite alerts for unknown cities (404), inactive API keys (401), rate limits (429), or network dropouts.

### 2. Comprehensive Real-Time Weather Metrics
- **Dynamic Temperature:** Displayed in Celsius (°C) with an instant toggle for Fahrenheit (°F).
- **Condition Tag & Visuals:** Live condition badges (Clear, Rain, Clouds, Snow, Thunderstorm, Mist) and vector art.
- **Feels-Like Metric:** Perceived temperature based on humidity and wind factors.
- **Humidity Meter:** Relative humidity percentage with comfort ratings (Dry, Comfortable, High Moisture).
- **Wind Telemetry:** Calibrated speed (m/s or mph) accompanied by a 16-point cardinal compass needle (`rotate(deg)`).
- **Barometric Pressure:** Atmospheric pressure (hPa) categorized against standard sea-level pressure.
- **Visibility Index:** Horizon visibility in kilometers with qualitative safety ratings.
- **Solar Cycle Progress:** Accurate local sunrise and sunset timings calculated using the city's UTC timezone offset, accompanied by a daytime elapsed progress gauge.
- **Cloud Coverage:** Opacity percentage indicator with styled progress bar.

### 3. Five-Day Meteorological Forecast
- **Dynamic Cards Generation:** **Generated exclusively using JavaScript `Array.map()`** as required.
- **Card Telemetry:**
  - Day name (Today / Mon / Tue, etc.) and formatted date.
  - High-resolution SVG weather visual matching condition.
  - Weather condition description (e.g. "Scattered Clouds", "Light Rain").
  - Daily minimum and maximum temperature spans.
  - Probability of precipitation (POP %) badge when rain is expected.

### 4. Dynamic Weather Ambient Backgrounds
The dashboard background dynamically transitions smoothly according to active meteorological conditions:
- **Sunny / Clear:** Radiant warm amber and crystal azure sky gradient (`body.theme-sunny`).
- **Rainy / Drizzle:** Cool slate and midnight ocean blue gradient (`body.theme-rainy`).
- **Cloudy / Overcast:** Atmospheric neutral slate-grey gradient (`body.theme-cloudy`).
- **Night:** Obsidian deep space, midnight indigo & violet starry theme (`body.theme-night`).
- **Snowy / Winter:** Crisp arctic ice, frosty silver and winter blue gradient (`body.theme-snowy`).
- **Thunderstorm:** Electric storm violet & deep lightning dark (`body.theme-thunderstorm`).
- **Mist / Fog:** Atmospheric soft pearl and misty grey (`body.theme-mist`).

---

## 🛠️ Technology Stack

This application is strictly built using the requested stack with zero heavy framework bloat:
- **HTML5:** Semantic markup (`<header>`, `<main>`, `<section>`, `<article>`, `<dialog>`).
- **CSS3:** Modern CSS with custom variables, CSS Flexbox and Grid layouts, Glassmorphism backdrop-blur filters, and smooth keyframe animations.
- **JavaScript (ES6+):** Vanilla JavaScript, Modular architecture, Object state, and `Array.map()`.
- **Fetch API & Async/Await:** Asynchronous data retrieval with `Promise.all` and comprehensive `try...catch` error handling.
- **OpenWeatherMap API:** Live Current Weather (`/weather`) & 5-Day / 3-Hour Forecast (`/forecast`) endpoints.

---

## 📂 Project Structure

```plaintext
task-3-wheather forecast/
├── .gitignore          # Prevents .env and secrets from being committed/pushed
├── .env.example        # Tracked template with placeholder variables
├── .env                # Local secrets file (gitignored, never committed)
├── api/
│   ├── .env.example    # API directory template
│   └── .ENV            # Local secrets file (gitignored, never committed)
├── index.html          # Main semantic HTML structure & UI components
├── style.css           # Modern responsive design, themes & animations
├── script.js           # Core application logic, API fetching & state management
├── config.js           # Configuration reading from environment variables
└── README.md           # Comprehensive setup instructions & security documentation
```

---

## 🔑 How to Obtain an OpenWeatherMap API Key

A free OpenWeatherMap API key is required to retrieve real-time global weather data.

### Step 1: Sign up for a Free Account
1. Open [OpenWeatherMap Sign-Up](https://home.openweathermap.org/users/sign_up) in your browser.
2. Enter your username, email, and password. Check the terms and create your account.
3. Check your email inbox and verify your email address.

### Step 2: Retrieve your API Key
1. Log into your dashboard and navigate to the **API keys** tab: [home.openweathermap.org/api_keys](https://home.openweathermap.org/api_keys).
2. Copy your 32-character hexadecimal key (e.g. `d14b87c4a169b3f...`).

> **Note:** Newly created free OpenWeatherMap keys typically require **10 to 30 minutes** to propagate through OpenWeatherMap's global cache servers before they accept live requests.

---

## 🚀 Running the Project Locally

### Method 1: Using VS Code Live Server (Recommended)
1. Open the project folder in VS Code.
2. Right-click on `index.html` and select **"Open with Live Server"**.
3. The dashboard will launch in your browser at `http://127.0.0.1:5500`.

### Method 2: Using Node.js or Python
```bash
# Using npx (Node.js):
npx serve .

# Or using Python 3:
python -m http.server 8000
```
Open `http://localhost:8000` in your browser.

---

## 🛡️ Git Security Verification & Safe Secret Removal

### 1. Verifying Files Before Committing
Run this command to verify that Git ignores your `.env` files:
```bash
git check-ignore -v .env api/.ENV
```
If `.gitignore` is working properly, it will print the line in `.gitignore` that ignores each file.

### 2. Checking if Secrets Were Ever Committed to Git History
To inspect Git history for any historical mention of a secret API key:
```bash
# Search commit diffs for the secret key string
git log -S "your_secret_key" --all -p

# Search for any commit modifying .env files
git log --all --full-history -- "**.env*"
```

### 3. How to Safely Remove Secrets from Git History (If Previously Committed)
If a secret was accidentally committed to Git in the past, follow these steps immediately:

1. **Rotate/Revoke the Compromised Key First**:
   - Go to [OpenWeatherMap API Keys](https://home.openweathermap.org/api_keys).
   - Generate a brand-new key and delete the old one. Once a key has been committed, treat it as permanently compromised.

2. **Purge the File from Git Cache (if committed in recent unpushed commit)**:
   ```bash
   git rm --cached .env api/.ENV
   git commit -m "chore: remove sensitive .env from tracking"
   ```

3. **Purge from Entire Git Commit History (using `git filter-repo` or BFG)**:
   ```bash
   # Install git-filter-repo (recommended by Git):
   pip install git-filter-repo

   # Remove .env from all historical commits:
   git filter-repo --invert-paths --path .env --path api/.ENV

   # Or replace literal secret strings across all commits:
   git filter-repo --replace-text expressions.txt
   ```

4. **Force-Push Cleaned Branches to Remote**:
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```
