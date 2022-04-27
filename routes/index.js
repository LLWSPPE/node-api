const express = require('express');
const mysql = require("mysql");
const router = express.Router();
const bcrypt = require('bcrypt')
const moment = require('moment')
const crypto = require('crypto')
const db = require('../utils/databaseConnection')
const AuthController = require('../controllers/auth.controller')

//login trader
router.post('/login', AuthController.userLogin);
router.post('/register', AuthController.userRegister)


module.exports = router;
