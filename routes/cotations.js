const express = require('express');
const router = express.Router();
const db = require('../utils/databaseConnection')
const moment = require('moment')
const CotationsController = require('../controllers/cotations.controller')


const { isSessionTokenValid, userHasRole} = require('../middlewares/authentification')


router.get('/get', CotationsController.getCotations)
router.post('/buy',CotationsController.achatCotations)
router.post('/sell', CotationsController.venteCotations)
router.get('/entreprise', CotationsController.getEnterprises)
router.get('/historique/:isinCode', CotationsController.getHistory)


module.exports = router;

