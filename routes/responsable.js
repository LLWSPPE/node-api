const express = require('express');
const fs = require("fs");
const router = express.Router();
const { userHasRole } = require('../middlewares/authentification')
const db = require('../utils/databaseConnection')
const bcrypt = require("bcrypt");
const moment = require("moment");
const ResponsableController = require('../controllers/responsable.controller')

router.post('/user/addBudget', ResponsableController.addBudget)
router.post('/user/addRole', ResponsableController.addRole)
router.post('/user/removeRole', ResponsableController.removeRole)
router.post('/user/edit', ResponsableController.editUser)





module.exports = router;