// API Key OpenCage
const openCageApiKey = '5d77e78600e84515bcac45d2f49d9192';

document.getElementById('search-btn').addEventListener('click', function () {
    const cityName = document.getElementById('city-input').value;
    if (!cityName) {
        alert('Please enter a city name');
        return;
    }

    // Tampilkan loading screen
    showLoading();

    //Dapatkan latitude dan longitude dari nama kota menggunakan OpenCage Geocoder
    const geocoderUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cityName)}&key=${openCageApiKey}`;

    fetch(geocoderUrl) // Fetch data dari OpenCage
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json(); // Parse JSON response
        })
        .then(data => {
            if (data.results.length === 0) {
                throw new Error('City not found');
            }

            // Ambil latitude dan longitude dari hasil geocoding
            const latitude = data.results[0].geometry.lat;
            const longitude = data.results[0].geometry.lng;

            // Ambil data cuaca menggunakan Open-Meteo
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`;

            return fetch(weatherUrl);
        })
        .then(response => { // Handle response dari API cuaca
            if (!response.ok) {
                throw new Error('Failed to fetch weather data. Please try again later.');
            }
            return response.json(); // Parse JSON response
        })
        .then(data => { // Handle data cuaca yang sudah di-parse
            // Menampilkan data cuaca
            displayWeather(data); 
        })
        .catch(error => {
            // Menangani error
            console.error('Error:', error);
            document.getElementById('weather-info').innerHTML = `<p style="color: red;">${error.message}</p>`;
        })
        .finally(() => {
            // Sembunyikan loading screen dan kosongkan input box
            hideLoading();
            document.getElementById('city-input').value = '';
        });
});

// Fungsi untuk menampilkan loading screen
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('weather-info').innerHTML = ''; // Kosongkan hasil sebelumnya
}

// Fungsi untuk menyembunyikan loading screen
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Fungsi untuk menampilkan data cuaca
function displayWeather(data) {
    // Link json nya : https://api.open-meteo.com/v1/forecast?latitude=-6.2146&longitude=106.8451&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto
    const weatherInfo = document.getElementById('weather-info');
    const dailyData = data.daily;

    let weatherHTML = '<h2>Daily Weather</h2>';
    dailyData.time.forEach((date, index) => {
        const maxTemp = dailyData.temperature_2m_max[index];
        const minTemp = dailyData.temperature_2m_min[index];
        const precipitation = dailyData.precipitation_sum[index];
        const windSpeed = dailyData.windspeed_10m_max[index];
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // Menampilkan ikon berdasarkan cuaca
        let weatherClass = 'sunny'; // Default: cerah
        if (precipitation > 5) {
            weatherClass = 'rainy'; // Hujan
        } else if (precipitation > 0 && precipitation <= 5) {
            weatherClass = 'cloudy'; // Berawan
        } else if (windSpeed > 20) {
            weatherClass = 'stormy'; // Badai
        } else if (maxTemp < 0) {
            weatherClass = 'snowy'; // Salju
        }

        weatherHTML += `
            <div class="weather-day ${weatherClass}">
                <h3>${formattedDate}</h3>
                <p><strong>Max Temperature:</strong> ${maxTemp}°C</p>
                <p><strong>Min Temperature:</strong> ${minTemp}°C</p>
                <p><strong>Precipitation:</strong> ${precipitation} mm</p>
                <p><strong>Wind Speed:</strong> ${windSpeed} km/h</p>
            </div>
        `;
    });

    weatherInfo.innerHTML = weatherHTML;
}