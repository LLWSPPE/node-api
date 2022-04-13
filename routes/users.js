const express = require('express');
const router = express.Router();
const mysql = require("mysql")
const db = require('../utils/databaseConnection')


/* GET users listing. */
router.get('/portefeuille/:userId', function(req, res, next) {

  let { userId } = req.params

    db.query('SELECT user_portefeuille.id, user_portefeuille.user_id, user_portefeuille.isin_code, user_portefeuille.quantite, company_labels.full_name, cotations.stock_closing_value FROM user_portefeuille INNER JOIN company_labels ON user_portefeuille.isin_code = company_labels.isin_code INNER JOIN cotations ON cotations.isin_code = company_labels.isin_code WHERE user_portefeuille.user_id = ? GROUP BY isin_code', userId, (error, result) =>{
        if(error){
          res.json({
            status: "ERROR",
            message: "Il y a eu une erreur veuillez réessayer"
          })
        }
        else {

          res.json({
            status: "SUCCESS",
            result: result
          })

        }
    })


});

router.get('/:userId/mouvements/:type?', function(req, res, next) {

  let { userId, type } = req.params
  let mysqlQuery;

  if(type === '1'){
    mysqlQuery = "SELECT * FROM cotations_mouvements WHERE user_id = ? AND type_mouvement = 'BUY'"
  }
  if(type === '2'){
    mysqlQuery = "SELECT * FROM cotations_mouvements WHERE user_id = ? AND type_mouvement = 'SELL'"
  }
  if(type === undefined){
    mysqlQuery = "SELECT * FROM cotations_mouvements WHERE user_id = ?"
  }

  db.query(mysqlQuery, [userId], (error, mouvements) =>{
    if(error){
      res.json({
        status: "ERROR",
        message: "Il y a eu une erreur veuillez réessayer" + error
      })
    }
    else if(mouvements.length > 0) {

      res.json({
        status: "SUCCESS",
        mouvements: mouvements
      })

    }
    else {
      res.json({
        status: "ERROR",
        message: "Aucun mouvement trouvé."
      })
    }
  })


});

module.exports = router;
