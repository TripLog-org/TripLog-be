const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const tripRoutes = require('./trips');
const placeRoutes = require('./places');
const photoRoutes = require('./photos');
const recommendationRoutes = require('./recommendations');
const settingsRoutes = require('./settings');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trips', tripRoutes);
router.use('/places', placeRoutes);
router.use('/photos', photoRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
