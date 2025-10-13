const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  weatherPreference: {
    type: String,
    default: ''
  },
  weatherData: {
    temperature: Number,
    condition: String,
    description: String,
    humidity: Number,
    windSpeed: Number,
    feelsLike: Number,
    forecast: [{
      day: String,
      temp: Number,
      tempMin: Number,
      tempMax: Number,
      condition: String,
      icon: String
    }]
  },
  packingItems: [{
    name: {
      type: String,
      required: true
    },
    packed: {
      type: Boolean,
      default: false
    },
    suggested: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      default: 'general'
    }
  }],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Destination', DestinationSchema);