const express = require('express');
const router = express.Router();
const db = require('../utils/databaseConnection')
const moment = require('moment')


const { isSessionTokenValid, userHasRole} = require('../middlewares/authentification')

let dateClotureJourPrecedent = moment('2022-04-08').subtract(1, 'days').format('YYYY-MM-DD')

router.get('/get', (req, res) => {

    db.query("SELECT * FROM cotations INNER JOIN company_labels ON cotations.isin_code = company_labels.isin_code WHERE stock_date = ?", dateClotureJourPrecedent,(err, result) => {
        if(err) { res.json({ status: "ERROR",  message: "Il y a eu une erreur. Veuillez réessayer." + err }) }
        else if (result.length > 0) {
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

router.post('/buy',(req, res)=>{

    let { userToken, isinCode, quantity } = req.body

    if(quantity <= 0){
        res.json({
            status: "ERROR",
            message: "La quantité achetée ne peut pas être inférieure ou égale à 0"
        })
    }

    else {

        db.query('SELECT * FROM user WHERE loginToken = ?', userToken, (error, user) =>{

            if(error){ res.json({ status: "ERROR", message: "Token de session invalide" })}

            else if(user.length > 0) {

                db.query('SELECT * FROM cotations WHERE isin_code = ? AND stock_date = ?', [isinCode, dateClotureJourPrecedent], (error, cotation) =>{
                    if(error){ res.json({
                            status: "ERROR",
                            message: "Il y a eu une erreur " + error
                        })
                    }
                    else if(cotation.length > 0){

                        let prixTotal = parseFloat(quantity) * parseFloat(cotation[0]['stock_closing_value'])

                        if(parseFloat(user[0]['budget'])-parseFloat(prixTotal) < 0){
                            res.json({
                                status: "ERROR",
                                message: "Vous n'avez pas assez de fonds pour acheter cela "
                            })
                        }
                        else {
                             db.query('INSERT INTO cotations_mouvements (user_id, type_mouvement, isin_code, quantite, date_mouvement, montant) VALUES (?)', [[user[0]["id"], "BUY", isinCode, quantity, moment(Date.now()).format('YYYY-MM-DD'), prixTotal]], (error, result) =>{
                                if(error){
                                    res.json({
                                        status: "ERROR",
                                        message: "Il y a eu une erreur " + error
                                    })
                                }
                                else {
                                    let budgetFinal = Math.round((parseFloat(user[0]['budget'])-prixTotal) * 100) / 100
                                    db.query('UPDATE user SET budget = ? WHERE id = ?', [budgetFinal, user[0]["id"]], (err, result)=>{
                                        if(error){
                                            res.json({
                                                status: "ERROR",
                                                message: "{2] Il y a eu une erreur " + error
                                            })
                                        }
                                        else {
                                            db.query('SELECT * FROM user_portefeuille WHERE user_id = ? AND isin_code = ?', [user[0]['id'], isinCode], (error, portefeuille) =>{
                                                if(error){
                                                    res.json({
                                                        status: "ERROR",
                                                        message: "Il y a eu une erreur " + error
                                                    })
                                                }
                                                else if(portefeuille.length <= 0){
                                                    db.query('INSERT INTO user_portefeuille (user_id, isin_code, quantite) VALUES(?)', [[user[0]['id'], isinCode, quantity]], (error, result) =>{
                                                        if(error){
                                                            res.json({
                                                                status: "ERROR",
                                                                message: "Il y a eu une erreur " + error
                                                            })
                                                        }
                                                        else{
                                                            res.json({
                                                                status: "SUCCESS",
                                                                message: "Vous avez acheté : " + quantity + " titres pour une somme de : " + prixTotal.toString() + "€",
                                                                budgetFinal: budgetFinal.toString()
                                                            })
                                                        }
                                                    })
                                                }
                                                else {
                                                    let quantiteFinale = parseInt(portefeuille[0]['quantite'])+parseInt(quantity)
                                                    db.query('UPDATE user_portefeuille SET quantite = ? WHERE id = ? AND isin_code=?', [quantiteFinale, portefeuille[0]['id'], isinCode], (error, result) =>{
                                                        if(error){
                                                            res.json({
                                                                status: "ERROR",
                                                                message: "Il y a eu une erreur " + error
                                                            })
                                                        }
                                                        else{
                                                            res.json({
                                                                status: "SUCCESS",
                                                                message: "Vous avez acheté : " + quantity + " titres pour une somme de : " + prixTotal.toString() + "€",
                                                                budgetFinal: budgetFinal.toString()
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    } )
                                }
                            })
                        }

                    } else{
                        res.json({
                            status: "ERROR",
                            message: "Aucune cotation trouvée"
                        })
                    }


                })


            }


        })
    }
})

router.post('/sell', (req, res) =>{

    let { userToken, isinCode, quantity } = req.body

    if(quantity <= 0){
        res.json({
            status: "ERROR",
            message: "La quantité ne peut pas être inférieure ou égale à 0"
        })
    }

    else {
        db.query('SELECT * FROM user WHERE loginToken = ?', userToken, (error, user)=>{
            if(error){
                res.json({
                    status: "ERROR",
                    message: "Il y a eu une erreur." + error
                })
            }
            else {
                db.query('SELECT * FROM user_portefeuille WHERE user_id = ? AND isin_code = ?', [user[0]["id"], isinCode], (error, portefeuille) =>{
                    if(error){
                        res.json({
                            status: "ERROR",
                            message: "Il y a eu une erreur." + error
                        })
                    }
                    else if(portefeuille.length > 0){

                        let quantiteRestante = parseInt(portefeuille[0]['quantite']) - parseInt(quantity)

                        if(quantiteRestante < 0){
                            res.json({
                                status: "ERROR",
                                message: "Vous n'avez pas assez d'actions."
                            })
                        }
                        else {

                            let requete = "";
                            let valeurs = []

                            if(quantiteRestante === 0){
                                requete = "DELETE FROM user_portefeuille WHERE id = ?"
                                valeurs = [portefeuille[0]['id']]
                            }
                            else{
                                requete = "UPDATE user_portefeuille SET quantite = ? WHERE id = ?"
                                valeurs = [quantiteRestante, portefeuille[0]['id']]
                            }

                            db.query(requete, valeurs, (error) =>{
                                if(error){
                                    res.json({
                                        status: "ERROR",
                                        message: "Il y a eu une erreur." + error
                                    })
                                }
                                else {
                                    db.query('SELECT * FROM cotations WHERE isin_code = ? AND stock_date = ?', [isinCode, dateClotureJourPrecedent], (error, cotation) =>{
                                        if(error){
                                            res.json({
                                                status: "ERROR",
                                                message: "Il y a eu une erreur." + error
                                            })
                                        }
                                        else {

                                            let montantVente = parseFloat(cotation[0]['stock_closing_value']) * parseFloat(quantity)
                                            let budgetFinal = Math.round((parseFloat(user[0]['budget']) + montantVente) * 100) / 100;

                                            db.query('UPDATE user SET budget = ? WHERE id = ?', [budgetFinal, user[0]['id']], (error)=>{
                                                if(error){
                                                    res.json({
                                                        status: "ERROR",
                                                        message: "Il y a eu une erreur." + error
                                                    })
                                                }
                                                else {
                                                    db.query('INSERT INTO cotations_mouvements (user_id, type_mouvement, isin_code, quantite, date_mouvement, montant) VALUES(?)',
                                                        [[user[0]['id'], "SELL", isinCode, quantity, moment(Date.now()).format('YYYY-MM-DD'), montantVente]],
                                                        (error) =>{

                                                        if(error){
                                                            res.json({
                                                                status: "ERROR",
                                                                message: "Il y a eu une erreur." + error
                                                            })
                                                        }
                                                        else {
                                                            res.json({
                                                                status: "SUCCESS",
                                                                message: "Vous avez vendu : " + quantity + " actions, pour un gain de " + montantVente.toString() + "€",
                                                                budgetAChanger: budgetFinal.toString()
                                                            })
                                                        }

                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }

                    }
                    else {
                        res.json({
                            status: "ERROR",
                            message: "Vous ne possédez aucune action chez cette société."
                        })
                    }
                })
            }
        })
    }




})

router.get('/entreprise', (req, res) => {
    db.query(
        "SELECT full_name,ticker_code,stock_date,stock_opening_value,stock_closing_value,stock_highest_value,stock_lowest_value,stock_volume FROM company_labels INNER JOIN cotations ON company_labels.isin_code = cotations.isin_code",
        (err, result) => {

            if (err) {
                res.json({err: err});
            }
            if (result.length > 0) {
                res.json(result);
            } else {
                res.json({message: "erreur"});
            }
        }
    );
})


module.exports = router;

