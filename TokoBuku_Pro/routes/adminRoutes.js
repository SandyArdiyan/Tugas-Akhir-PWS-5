const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');
const { cekLogin, cekAdmin } = require('../middleware/authMiddleware');

// Proteksi Ganda (Harus Login & Harus Admin)
router.use(cekLogin, cekAdmin); 

router.get('/', controller.dashboard);
router.get('/add-book', controller.formAddBook);
router.post('/add-book', controller.processAddBook);

module.exports = router;