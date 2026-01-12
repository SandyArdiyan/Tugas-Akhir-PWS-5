const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Route Dashboard Admin
// Menggunakan authMiddleware.cekAdmin (sesuai file middleware kamu)
router.get('/', authMiddleware.cekAdmin, adminController.dashboard);

module.exports = router;