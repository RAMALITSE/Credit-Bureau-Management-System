// backend/src/profile.routes.simple.js
const express = require('express');
const router = express.Router();

// Simple route for testing
router.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Profile routes are working!'
  });
});

module.exports = router;