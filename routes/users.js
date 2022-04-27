const express = require('express');
const router = express.Router();
const mysql = require("mysql")
const db = require('../utils/databaseConnection')
const UserController = require('../controllers/user.controller')


/* GET users listing. */
router.get('/portefeuille/:userId', UserController.getUserWallet);
router.get('/:userId/mouvements/:type?', UserController.getUserOperations);

module.exports = router;
