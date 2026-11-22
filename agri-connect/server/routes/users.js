const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
const { protect, restrictTo } = require('../middleware/auth');

/* ── Farmer dashboard stats ────────────────────────────── */
router.get('/farmer/dashboard', protect, restrictTo('farmer'), async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user._id });
    res.json({
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.orderStatus === 'placed').length,
      completedOrders: orders.filter(o => o.orderStatus === 'delivered').length,
      totalEarnings: req.user.earnings || 0,
      rating: req.user.rating || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Buyer dashboard stats ─────────────────────────────── */
router.get('/buyer/dashboard', protect, restrictTo('buyer'), async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id });
    const totalSpent = orders
      .filter(o => o.paymentStatus === 'released')
      .reduce((s, o) => s + o.totalPrice, 0);
    res.json({
      totalOrders: orders.length,
      activeOrders: orders.filter(o => !['delivered', 'cancelled', 'rejected'].includes(o.orderStatus)).length,
      totalSpent: parseFloat(totalSpent.toFixed(2))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── WMO code helpers ──────────────────────────────────── */
const wmoLabel = code => {
  if (code === 0) return 'Clear Sky';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 9) return 'Overcast';
  if (code <= 19) return 'Foggy';
  if (code <= 29) return 'Drizzle';
  if (code <= 39) return 'Light Rain';
  if (code <= 49) return 'Fog';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 84) return 'Rain Showers';
  if (code <= 94) return 'Thunderstorm';
  return 'Heavy Thunderstorm';
};

const wmoIcon = code => {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 9) return '🌫️';
  if (code <= 39) return '🌦️';
  if (code <= 49) return '🌫️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '❄️';
  if (code <= 84) return '🌦️';
  if (code <= 94) return '⛈️';
  return '🌩️';
};

/* ── Farmer smart advisory — live weather via Open-Meteo ── */
router.get('/farmer/advisory', protect, restrictTo('farmer'), async (req, res) => {
  try {
    const lat = req.query.lat || '20.5937';
    const lon = req.query.lon || '78.9629';
    const locationName = req.query.locationName || 'India';

    const { data } = await axios.get(
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weathercode,windspeed_10m,uv_index' +
      '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,windspeed_10m_max' +
      '&forecast_days=7&timezone=Asia%2FKolkata',
      { timeout: 6000 }
    );

    const c = data.current;
    const daily = data.daily;

    const dayLabels = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    const forecast = daily.time.slice(0, 7).map((date, i) => ({
      day: dayLabels[i],
      date: new Date(date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      condition: wmoLabel(daily.weathercode[i]),
      icon: wmoIcon(daily.weathercode[i]),
      high: Math.round(daily.temperature_2m_max[i]),
      low: Math.round(daily.temperature_2m_min[i]),
      rain: daily.precipitation_sum[i],
      wind: Math.round(daily.windspeed_10m_max[i]),
      uvIndex: daily.uv_index_max[i]
    }));

    const alerts = [];
    if (daily.weathercode[1] >= 80) alerts.push('⛈️ Heavy rain/storm tomorrow — secure equipment');
    else if (daily.weathercode[1] >= 60) alerts.push('🌧️ Rain expected tomorrow — cover or harvest ripe crops');
    if (c.temperature_2m > 38) alerts.push('🌡️ Heat wave today — irrigate crops and provide shade');
    if (c.relative_humidity_2m > 85) alerts.push('💧 High humidity — watch for fungal disease');
    if (c.uv_index > 8) alerts.push('☀️ Very high UV — avoid midday sun exposure');
    if (daily.precipitation_sum[1] === 0 && daily.precipitation_sum[2] === 0)
      alerts.push('🏜️ No rain next 2 days — consider irrigation');

    res.json({
      location: locationName,
      weather: {
        temperature: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        condition: wmoLabel(c.weathercode),
        icon: wmoIcon(c.weathercode),
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.windspeed_10m),
        uvIndex: Math.round(c.uv_index),
        precipitation: c.precipitation,
        high: Math.round(daily.temperature_2m_max[0]),
        low: Math.round(daily.temperature_2m_min[0]),
        forecast
      },
      cropRecommendations: ['Tomato', 'Spinach', 'Maize'],
      marketPriceTrends: [
        { crop: 'Tomato', price: 45, trend: 'up' },
        { crop: 'Potato', price: 22, trend: 'down' },
        { crop: 'Onion', price: 35, trend: 'stable' }
      ],
      alerts
    });
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.json({
      location: 'Unknown',
      weather: {
        temperature: null, feelsLike: null, condition: 'Unavailable',
        icon: '❓', humidity: null, windSpeed: null, uvIndex: null,
        precipitation: null, high: null, low: null, forecast: []
      },
      cropRecommendations: ['Tomato', 'Spinach', 'Maize'],
      marketPriceTrends: [
        { crop: 'Tomato', price: 45, trend: 'up' },
        { crop: 'Potato', price: 22, trend: 'down' },
        { crop: 'Onion', price: 35, trend: 'stable' }
      ],
      alerts: ['⚠️ Weather data temporarily unavailable']
    });
  }
});

module.exports = router;
