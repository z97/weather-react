import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// Importing images
import sunny from './images/sunny.png';
import cloudy from './images/cloudy.png';
import rainy from './images/rainy.png';
import snowy from './images/snowy.png';
import misty from './images/misty.png';
import defaultImage from './images/default.png';

const Container = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const WeatherImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const WeatherInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const WeatherDetail = styled.div`
  margin-top: 10px;
`;

const HourlyForecast = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
`;

const DailyForecast = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
`;

const ForecastItem = styled.div`
  text-align: center;
`;

const Button = styled.button`
  background: none;
  border: none;
  color: blue;
  cursor: pointer;
  text-align: center;
  &:hover {
    text-decoration: underline;
  }
`;

function App() {
  const [forecast, setForecast] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState(null);
  const [geoCity, setGeoCity] = useState('');

  useEffect(() => {
    const fetchGeoIP = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        const { latitude, longitude, city } = response.data;
        setGeoCity(city);
        getForecastByCoordinates(latitude, longitude);
      } catch (error) {
        console.error('Error fetching GeoIP data:', error);
      }
    };
    fetchGeoIP();
  }, []);

  const getForecastByCoordinates = async (latitude, longitude) => {
    const apiKey = 'process.env.API_KEY';  // Replace with your RapidAPI key
    const apiUrl = `https://open-weather13.p.rapidapi.com/city/fivedaysforcast/${latitude}/${longitude}&units=metric`;

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'open-weather13.p.rapidapi.com',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch weather data: ${response.statusText}`);
      }

      const data = await response.json();

      // Check if the list property exists
      if (!data.list) {
        throw new Error('Invalid response structure');
      }

      setForecast(data.list);
      setCurrentWeather(data.list[0]); // Assuming the first item in the list is the current weather
      setSelectedDate(formatDate(new Date(data.list[0].dt * 1000))); // Initialize selected date
      setError(null);
    } catch (error) {
      setError(error.message);
      setForecast(null);
      setCurrentWeather(null);
    }
  };

  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'long' };
    return date.toLocaleDateString(undefined, options);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const getFilteredForecast = () => {
    return forecast.filter((day) =>
      formatDate(new Date(day.dt * 1000)) === selectedDate
    );
  };

  const getWeatherImage = (description) => {
    switch (description.toLowerCase()) {
      case 'clear sky':
        return sunny;
      case 'few clouds':
      case 'scattered clouds':
      case 'broken clouds':
      case 'overcast clouds':
        return cloudy;
      case 'shower rain':
      case 'rain':
      case 'thunderstorm':
        return rainy;
      case 'snow':
        return snowy;
      case 'mist':
        return misty;
      default:
        return defaultImage;
    }
  };

  return (
    <Container>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {currentWeather && (
        <div>
          <WeatherImage src={getWeatherImage(currentWeather.weather[0].description)} alt="Weather" />
          <CurrentWeather>
            <WeatherInfo>
              <h2>{geoCity}</h2>
              <div>{Math.round(currentWeather.main.temp)}°C</div>
              <WeatherDetail>Feels like: {Math.round(currentWeather.main.feels_like)}°C</WeatherDetail>
            </WeatherInfo>
            <WeatherInfo>
              <div>{currentWeather.weather[0].description}</div>
              <WeatherDetail>Humidity: {currentWeather.main.humidity}%</WeatherDetail>
              <WeatherDetail>Wind: {currentWeather.wind.speed} km/h</WeatherDetail>
            </WeatherInfo>
          </CurrentWeather>
        </div>
      )}
      {forecast && (
        <>
          <HourlyForecast>
            {getFilteredForecast().map((hour, index) => (
              <ForecastItem key={index}>
                <div>{new Date(hour.dt * 1000).getHours()}:00</div>
                <div>{Math.round(hour.main.temp)}°C</div>
              </ForecastItem>
            ))}
          </HourlyForecast>
          <DailyForecast>
            {[...new Set(forecast.map((day) => formatDate(new Date(day.dt * 1000))))].map((date, index) => (
              <ForecastItem key={index}>
                <Button onClick={() => handleDateClick(date)}>
                  <div>{date}</div>
                  <div>
                    {Math.round(forecast.find((day) => formatDate(new Date(day.dt * 1000)) === date).main.temp_max)}/
                    {Math.round(forecast.find((day) => formatDate(new Date(day.dt * 1000)) === date).main.temp_min)}°C
                  </div>
                </Button>
              </ForecastItem>
            ))}
          </DailyForecast>
        </>
      )}
    </Container>
  );
}

export default App;
