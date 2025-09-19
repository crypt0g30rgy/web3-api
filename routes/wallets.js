const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.post('/', walletController.createWallet);
router.get('/:address/balance', walletController.getBalance);
router.post('/send', walletController.sendETH);

module.exports = router;