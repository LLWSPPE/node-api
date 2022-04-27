const req = require("express");
const db = require("../utils/databaseConnection");
const moment = require("moment");

exports.getUserWallet = (req, res) => {
    let { userId } = req.params

    const queryWallet = 'SELECT user_portefeuille.id, user_portefeuille.user_id, user_portefeuille.isin_code, user_portefeuille.quantite, company_labels.full_name, cotations.stock_closing_value FROM user_portefeuille INNER JOIN company_labels ON user_portefeuille.isin_code = company_labels.isin_code INNER JOIN cotations ON cotations.isin_code = company_labels.isin_code WHERE user_portefeuille.user_id = ? GROUP BY isin_code'
    db.query(queryWallet, userId, (error, result) =>{
        if(error){
            res.json({
                status: "ERROR", message: "Il y a eu une erreur veuillez réessayer"
            })
        }
        else {
            res.json({
                status: "SUCCESS", result: result
            })
        }
    })
}

exports.getUserOperations = (req, res) => {
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
                status: "ERROR", message: "Il y a eu une erreur veuillez réessayer" + error
            })
        }
        res.json({
            status: "SUCCESS", mouvements: mouvements
        })
    })

}