const express = require('express');
const fs = require("fs");
const router = express.Router();
const { userHasRole } = require('../middlewares/authentification')
const db = require('../utils/databaseConnection')
const moment = require('moment')
const AdminController = require('../controllers/admin.controller')


router.post('/cotations/post', AdminController.cotationsASauvegarder)
router.get('/cotations/update', AdminController.updateCotations);
router.get('/users', AdminController.getUsers)
router.get('/user/:id', AdminController.getSpecificUser)


module.exports = router;