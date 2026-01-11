const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.get('/login', controller.formLogin);
router.post('/login', controller.prosesLogin);
router.get('/register', controller.formRegister);
router.post('/register', controller.prosesRegister);
router.get('/logout', controller.logout);

module.exports = router;