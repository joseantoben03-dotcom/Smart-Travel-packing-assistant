import React from 'react';
import { Cloud, Sun, CloudRain, Droplets, Wind, RefreshCw } from 'lucide-react';

const WeatherCard = ({ destination }) => {
  const { weatherData } = destination;
  
  if (!weatherData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="h-12 w-12 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-12 w-12 text-gray-500" />;
      case 'rain':
        return <CloudRain className="h-12 w-12 text-blue-500" />;
      default:
        return <Cloud className="h-12 w-12 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Weather Forecast</h3>
        <RefreshCw className="h-4 w-4 text-gray-400" />
      </div>

      <div className="text-sm text-gray-600 mb-4">
        {destination.city}, {destination.country}
      </div>

      {/* Current Weather */}
      <div className="flex items-center space-x-4 mb-6">
        {getWeatherIcon(weatherData.condition)}
        <div>
          <div className="text-3xl font-bold text-gray-900">
            {weatherData.temperature}°C
          </div>
          <div className="text-gray-600 capitalize">
            {weatherData.description || weatherData.condition}
          </div>
          <div className="text-sm text-gray-500">
            Feels like {weatherData.feelsLike}°C
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-600">{weatherData.humidity}% Humidity</span>
        </div>
        <div className="flex items-center space-x-2">
          <Wind className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{weatherData.windSpeed} km/h Wind</span>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {weatherData.forecast && weatherData.forecast.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-600 mb-1">{day.day}</div>
                <div className="flex justify-center mb-1">
                  {getWeatherIcon(day.condition)}
                </div>
                <div className="text-xs text-gray-900 font-medium">{day.temp}°</div>
                <div className="text-xs text-gray-500">{day.tempMin}°</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;