const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const Destination = require('../models/Destination');

const router = express.Router();

// Weather-based packing suggestions
const getPackingSuggestions = (weatherData) => {
  const suggestions = [];
  
  // Basic essentials
  suggestions.push(
    { name: 'Passport/ID', category: 'documents', suggested: true },
    { name: 'Wallet & Money', category: 'documents', suggested: true },
    { name: 'Phone & Charger', category: 'electronics', suggested: true }
  );

  const temp = weatherData.temperature;
  
  if (temp > 25) {
    suggestions.push(
      { name: 'Light clothing', category: 'clothing', suggested: true },
      { name: 'Shorts', category: 'clothing', suggested: true },
      { name: 'T-shirts', category: 'clothing', suggested: true },
      { name: 'Sandals', category: 'footwear', suggested: true },
      { name: 'Sunscreen', category: 'toiletries', suggested: true },
      { name: 'Hat', category: 'accessories', suggested: true }
    );
  } else if (temp < 10) {
    suggestions.push(
      { name: 'Warm jacket', category: 'clothing', suggested: true },
      { name: 'Sweaters', category: 'clothing', suggested: true },
      { name: 'Long pants', category: 'clothing', suggested: true },
      { name: 'Boots', category: 'footwear', suggested: true },
      { name: 'Gloves', category: 'accessories', suggested: true },
      { name: 'Scarf', category: 'accessories', suggested: true }
    );
  } else {
    suggestions.push(
      { name: 'Light jacket', category: 'clothing', suggested: true },
      { name: 'Long pants', category: 'clothing', suggested: true },
      { name: 'Comfortable shoes', category: 'footwear', suggested: true }
    );
  }

  if (weatherData.condition && weatherData.condition.toLowerCase().includes('rain')) {
    suggestions.push(
      { name: 'Umbrella', category: 'accessories', suggested: true },
      { name: 'Rain jacket', category: 'clothing', suggested: true }
    );
  }

  return suggestions;
};

// Get weather data from OpenWeatherMap API with better error handling
const getWeatherData = async (city, country) => {
  try {
    const API_KEY = process.env.WEATHER_API_KEY;
    
    if (!API_KEY || API_KEY === 'your-openweather-api-key') {
      console.log('No valid weather API key found, using mock data');
      return getMockWeatherData(city, country);
    }

    console.log(`Fetching weather data for ${city}, ${country}`);
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric`,
      { timeout: 5000 }
    );
    
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=${API_KEY}&units=metric`,
      { timeout: 5000 }
    );

    const current = response.data;
    const forecast = forecastResponse.data;

    // Process 5-day forecast
    const dailyForecast = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 5; i++) {
      if (forecast.list[i * 8]) {
        const item = forecast.list[i * 8];
        const date = new Date(item.dt * 1000);
        dailyForecast.push({
          day: days[date.getDay()],
          temp: Math.round(item.main.temp),
          tempMin: Math.round(item.main.temp_min),
          tempMax: Math.round(item.main.temp_max),
          condition: item.weather[0].main,
          icon: item.weather[0].icon
        });
      }
    }

    return {
      temperature: Math.round(current.main.temp),
      condition: current.weather[0].main,
      description: current.weather[0].description,
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6), // Convert m/s to km/h
      feelsLike: Math.round(current.main.feels_like),
      forecast: dailyForecast
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    return getMockWeatherData(city, country);
  }
};

// Generate different mock weather data based on city
const getMockWeatherData = (city, country) => {
  // Create a simple hash of city name to generate consistent but different data
  const hash = city.toLowerCase().split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const temperatures = [15, 22, 28, 8, 18, 25, 12, 30, 20, 14];
  const conditions = ['Clear', 'Clouds', 'Rain', 'Clear', 'Clouds'];
  const descriptions = ['clear sky', 'few clouds', 'light rain', 'sunny', 'partly cloudy'];
  
  const tempIndex = Math.abs(hash) % temperatures.length;
  const condIndex = Math.abs(hash) % conditions.length;
  
  const baseTemp = temperatures[tempIndex];
  const condition = conditions[condIndex];
  const description = descriptions[condIndex];
  
  console.log(`Using mock weather data for ${city}, ${country}: ${baseTemp}°C, ${condition}`);
  
  return {
    temperature: baseTemp,
    condition: condition,
    description: description,
    humidity: 50 + (Math.abs(hash) % 30),
    windSpeed: 10 + (Math.abs(hash) % 20),
    feelsLike: baseTemp + (Math.abs(hash) % 5) - 2,
    forecast: [
      { day: 'Sat', temp: baseTemp, tempMin: baseTemp - 5, tempMax: baseTemp + 5, condition: condition, icon: '01d' },
      { day: 'Sun', temp: baseTemp + 2, tempMin: baseTemp - 3, tempMax: baseTemp + 7, condition: 'Clouds', icon: '02d' },
      { day: 'Mon', temp: baseTemp - 1, tempMin: baseTemp - 6, tempMax: baseTemp + 4, condition: condition, icon: '01d' },
      { day: 'Tue', temp: baseTemp + 3, tempMin: baseTemp - 2, tempMax: baseTemp + 8, condition: 'Rain', icon: '10d' },
      { day: 'Wed', temp: baseTemp + 1, tempMin: baseTemp - 4, tempMax: baseTemp + 6, condition: 'Clouds', icon: '03d' }
    ]
  };
};

// @route    POST api/destinations
// @desc     Create a destination
// @access   Private
router.post('/', auth, async (req, res) => {
  try {
    const { city, country, startDate, endDate, weatherPreference } = req.body;

    console.log(`Creating destination: ${city}, ${country}`);

    // Get weather data
    const weatherData = await getWeatherData(city, country);
    
    // Generate packing suggestions based on weather
    const packingItems = getPackingSuggestions(weatherData);

    const destination = new Destination({
      user: req.user.id,
      city,
      country,
      startDate,
      endDate,
      weatherPreference,
      weatherData,
      packingItems
    });

    const savedDestination = await destination.save();
    res.json(savedDestination);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/destinations
// @desc     Get all user destinations
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const destinations = await Destination.find({ user: req.user.id }).sort({ date: -1 });
    res.json(destinations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/destinations/:id
// @desc     Get destination by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ msg: 'Destination not found' });
    }

    if (destination.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(destination);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Destination not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/destinations/:id
// @desc     Update a destination
// @access   Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { city, country, startDate, endDate, weatherPreference } = req.body;
    
    let destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ msg: 'Destination not found' });
    }

    if (destination.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Check if city or country changed - if so, update weather data
    const locationChanged = destination.city !== city || destination.country !== country;
    let weatherData = destination.weatherData;
    let packingItems = destination.packingItems;

    if (locationChanged) {
      console.log(`Location changed for destination ${req.params.id}: ${city}, ${country}`);
      // Get new weather data
      weatherData = await getWeatherData(city, country);
      
      // Keep existing packing items but add new suggestions
      const newSuggestions = getPackingSuggestions(weatherData);
      const existingItemNames = packingItems.map(item => item.name.toLowerCase());
      
      // Add only new suggestions that don't already exist
      newSuggestions.forEach(suggestion => {
        if (!existingItemNames.includes(suggestion.name.toLowerCase())) {
          packingItems.push(suggestion);
        }
      });
    }

    // Update destination fields
    destination.city = city;
    destination.country = country;
    destination.startDate = startDate;
    destination.endDate = endDate;
    destination.weatherPreference = weatherPreference;
    destination.weatherData = weatherData;
    destination.packingItems = packingItems;

    const updatedDestination = await destination.save();
    res.json(updatedDestination);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/destinations/:id
// @desc     Delete a destination
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ msg: 'Destination not found' });
    }

    if (destination.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Destination.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Destination removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Destination not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;