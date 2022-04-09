const express = require('express');
const router = express.Router();
const db = require('../utils/databaseConnection')


const { isSessionTokenValid, userHasRole} = require('../middlewares/authentification')


router.get('/get', (req, res) => {
    db.query("SELECT * FROM cotations INNER JOIN company_labels ON cotations.isin_code = company_labels.isin_code", (err, result) => {
        if(err) {
            res.json({
                status: "ERROR",
                message: "Il y a eu une erreur. Veuillez réessayer."
            })
        } else if (result.length > 0) {
                res.json({
                    status: "SUCCESS",
                    result: result
                });
          } else {
            res.json({
                status: "ERROR",
                result: "Aucune cotation n'a été trouvée pour la date d'aujourd'hui"
            });
        }

        }
    );
})


module.exports = router;

