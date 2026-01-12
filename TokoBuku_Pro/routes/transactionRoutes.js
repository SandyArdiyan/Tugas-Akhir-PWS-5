const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Route Beli
router.post('/buy/:id', transactionController.buyBook);

module.exports = router;