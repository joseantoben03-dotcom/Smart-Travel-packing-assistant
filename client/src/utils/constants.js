export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

export const WEATHER_CONDITIONS = {
  CLEAR: 'Clear',
  CLOUDS: 'Clouds',
  RAIN: 'Rain',
  SNOW: 'Snow',
  THUNDERSTORM: 'Thunderstorm',
  DRIZZLE: 'Drizzle',
  MIST: 'Mist'
};

export const PACKING_CATEGORIES = {
  DOCUMENTS: 'documents',
  CLOTHING: 'clothing',
  FOOTWEAR: 'footwear',
  ELECTRONICS: 'electronics',
  TOILETRIES: 'toiletries',
  ACCESSORIES: 'accessories',
  GENERAL: 'general'
};