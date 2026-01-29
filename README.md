# React Weather Application   (Vite + TypeScript + Tailwind)

A responsive weather forecasting web application built using **React (TypeScript)**, **Vite**, and **Tailwind CSS**.  
The application consumes third-party APIs to provide real-time, hourly, and daily weather information based on the user’s current location or searched areas.

---

## Features

- **Location-based weather forecasting**
  - Automatically detects the user’s current geographical location using the browser’s Geolocation API
  - Resolves the user’s exact area (suburb/locality/town) using OpenStreetMap Nominatim
  - Displays weather data specific to the detected user area

- **Search functionality**
  - Allows users to search for any location manually
  - Retrieves and displays weather data for searched locations

- **Weather information**
  - Current weather conditions (temperature, humidity, wind speed)
  - Hourly weather forecast (up to 12 hours)
  - Daily weather forecast (up to 7 days)

- **Saved locations**
  - Users can save frequently accessed locations
  - Saved locations persist using `localStorage`
  - Users can switch between saved locations or remove them

- **Offline access**
  - Weather data is cached locally
  - Cached weather data is displayed when the user is offline
  - Ensures the application remains usable without an internet connection

- **Customisation**
  - Toggle between Celsius (°C) and Fahrenheit (°F)
  - Toggle between Light and Dark themes
  - User preferences persist across sessions

- **User Interface**
  - Clean, intuitive, and responsive design
  - Frosted-glass UI styling
  - Optimised for different screen sizes

---

## Technologies Used

- **React** with **TypeScript**
- **Vite** for fast development and build tooling
- **Tailwind CSS** for styling and responsive design
- **Open-Meteo API** for weather data 
- **OpenStreetMap Nominatim API** for geolocation and reverse geocoding
- **localStorage** for data persistence and offline support

---



## Instalation & Running the project
```bash
npm install
npm run dev


npm run build
npm run preview
```
