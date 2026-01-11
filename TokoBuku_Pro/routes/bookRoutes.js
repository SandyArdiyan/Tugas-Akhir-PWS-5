const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookController');
const { cekLogin } = require('../middleware/authMiddleware');

router.get('/', cekLogin, controller.home);
router.post('/buy/:id', cekLogin, controller.buy);
router.post('/topup', cekLogin, controller.topup);
router.get('/redeem', cekLogin, controller.pageRedeem);
router.post('/redeem', cekLogin, controller.processRedeem);

module.exports = router;