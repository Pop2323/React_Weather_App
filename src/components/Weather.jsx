import React, { useEffect, useState, useCallback, useMemo } from 'react';
import './Weather.css';
import windIcon from '../assets/wind.png';
import humidityIcon from '../assets/humidity.png';
import 'animate.css';
import debounce from 'lodash/debounce';

const Weather = () => {
    const [weather, setWeather] = useState(null);
    const [city, setCity] = useState('');
    const [inputCity, setInputCity] = useState('');
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);

    const search = useCallback(
        async (location) => {
            setLoading(true);
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${import.meta.env.VITE_API_KEY}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('City not found');
                const data = await response.json();
                setWeather({
                    city: data.name,
                    country: data.sys.country,
                    temperature: Math.floor(data.main.temp),
                    description: data.weather[0].description,
                    icon: data.weather[0].icon,
                    humidity: data.main.humidity,
                    wind: data.wind.speed,
                });
            } catch (error) {
                console.error('Error fetching weather data:', error);
                setWeather(null);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        if (city) {
            search(city);
        }
    }, [city, search]);

    const handleSearch = useCallback(() => {
        if (inputCity) {
            setCity(inputCity);
        }
    }, [inputCity]);

    const fetchCities = useCallback(async () => {
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries');
            const data = await response.json();
            const allCities = data.data.flatMap(country => country.cities.map(city => `${city}, ${country.country}`));
            setCities(allCities);
        } catch (error) {
            console.error('Error fetching cities data:', error);
        }
    }, []);

    useEffect(() => {
        fetchCities();
    }, [fetchCities]);

    const debouncedInputChange = useMemo(
        () => debounce((value) => setInputCity(value), 300),
        []
    );

    useEffect(() => {
        return () => {
            debouncedInputChange.cancel();
        };
    }, [debouncedInputChange]);

    return (
        <div className="weather">
            <div>
                <h1 className="title animate__animated animate__fadeIn">Weather</h1>
                <p className="subtitle">Find the weather in your city or country</p>
            </div>
            <div className="search">
                <input
                    type="text"
                    placeholder="Enter city or country name"
                    list="cities"
                    onChange={(e) => debouncedInputChange(e.target.value)}
                />
                <datalist id="cities">
                    {cities.map((city, idx) => (
                        <option key={idx} value={city} />
                    ))}
                </datalist>
                <button onClick={handleSearch}>Search</button>
            </div>
            {loading ? (
                <div className="spinner"></div>
            ) : (
                weather && (
                    <div className="weather-info animate__animated animate__fadeIn">
                        <h2 className="city">{weather.city}, {weather.country}</h2>
                        <img
                            className="animate-icon animate__animated animate__fadeInLeft"
                            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                            alt={weather.description}
                        />
                        <div className="weather-details">
                            <p className="temperature">Temperature: {weather.temperature}°C</p>
                            <p className="description">Description: {weather.description}</p>
                            <p className="humidity">
                                <img src={humidityIcon} alt="humidity icon" /> Humidity: {weather.humidity}%
                            </p>
                            <p className="wind">
                                <img src={windIcon} alt="wind icon" /> Wind: {weather.wind} m/s
                            </p>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default Weather;
