const form = document.getElementById('weather-form');
const result = document.getElementById('weather-result');
const locationButton = document.getElementById('get-location');
const locationResult = document.getElementById('location-result');
const forecastResult = document.getElementById('forecast-result');

// Replace with your OpenWeatherMap API key
const apiKey = '080ced48b4afb2386dadc38930631535';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

// Fetch Weather by City
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('city').value.trim();

    if (!city) {
        result.textContent = 'Please enter a city name.';
        return;
    }

    try {
        result.textContent = 'Fetching weather data...';
        const response = await fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric`);

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        displayWeather(data, result);
        fetchForecast(city);
    } catch (error) {
        result.textContent = error.message;
    }
});

// Fetch Weather by Live Location
locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        locationResult.textContent = 'Geolocation is not supported by your browser.';
        return;
    }

    locationResult.textContent = 'Fetching your location...';

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
            const response = await fetch(`${apiUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);

            if (!response.ok) {
                throw new Error('Could not fetch weather for your location');
            }

            const data = await response.json();
            displayWeather(data, locationResult);
            fetchForecastByCoordinates(latitude, longitude);
        } catch (error) {
            locationResult.textContent = error.message;
        }
    }, () => {
        locationResult.textContent = 'Unable to retrieve your location.';
    });
});

// Fetch 5-day Weather Forecast by City
async function fetchForecast(city) {
    try {
        const response = await fetch(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error('Forecast data not found');
        }

        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        forecastResult.textContent = error.message;
    }
}

// Fetch 5-day Weather Forecast by Coordinates
async function fetchForecastByCoordinates(lat, lon) {
    try {
        const response = await fetch(`${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error('Forecast data not found');
        }

        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        forecastResult.textContent = error.message;
    }
}

// Display Weather Data
function displayWeather(data, element) {
    const { name, main, weather } = data;
    element.innerHTML = `
        <h3>${name}</h3>
        <p><strong>Temperature:</strong> ${main.temp} °C</p>
        <p><strong>Condition:</strong> ${weather[0].description}</p>
        <p><strong>Humidity:</strong> ${main.humidity}%</p>
    `;
}

// Display Upcoming Weather Forecast
function displayForecast(data) {
    const forecast = data.list.filter(item => item.dt_txt.includes('12:00:00')); // Get data for 12:00 PM each day
    forecastResult.innerHTML = forecast.map(item => {
        const date = new Date(item.dt * 1000);
        const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        return `
            <div class="forecast-item">
                <h3>${dateString}</h3>
                <p class="date">${dateString}</p>
                <p><strong>Temperature:</strong> ${item.main.temp} °C</p>
                <p><strong>Condition:</strong> ${item.weather[0].description}</p>
            </div>
        `;
    }).join('');
}
