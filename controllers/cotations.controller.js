const req = require("express");
const db = require("../utils/databaseConnection");
const moment = require("moment");


let dateClotureJourPrecedent = moment('2022-04-08').subtract(1, 'days').format('YYYY-MM-DD')

exports.getCotations = (req, res) => {

    const queryGetCotations = "SELECT * FROM cotations INNER JOIN company_labels ON cotations.isin_code = company_labels.isin_code WHERE stock_date = ?"
    db.query(queryGetCotations, dateClotureJourPrecedent,(err, result) => {
            if(err) {
                res.json({
                    status: "ERROR",  message: "Il y a eu une erreur. Veuillez réessayer." + err
                })
            }
            else if (result.length > 0) {
                res.json({
                    status: "SUCCESS", result: result
                });
            }
            else {
                res.json({
                    status: "ERROR", result: "Aucune cotation n'a été trouvée pour la date d'aujourd'hui"
                });
            }

        }
    );
}

exports.achatCotations = (req, res) => {

    let { userToken, isinCode, quantity } = req.body

    if(quantity <= 0){
        res.json({
            status: "ERROR", message: "La quantité achetée ne peut pas être inférieure ou égale à 0"
        })
    }
    else {
        const queryFindUserByToken = 'SELECT * FROM user WHERE loginToken = ?'
        db.query(queryFindUserByToken, userToken, (error, user) =>{

            if(error){ res.json({ status: "ERROR", message: "Token de session invalide" })}

            else if(user.length > 0) {
                const queryFindCotations = 'SELECT * FROM cotations WHERE isin_code = ? AND stock_date = ?'
                db.query(queryFindCotations, [isinCode, dateClotureJourPrecedent], (error, cotation) =>{
                    if(error){
                        res.json({
                            status: "ERROR", message: "Il y a eu une erreur " + error
                        })
                    }
                    else if(cotation.length > 0){

                        let prixTotal = parseFloat(quantity) * parseFloat(cotation[0]['stock_closing_value'])

                        if(parseFloat(user[0]['budget'])-parseFloat(prixTotal) < 0){
                            res.json({
                                status: "ERROR", message: "Vous n'avez pas assez de fonds pour acheter cela "
                            })
                        }
                        else {
                            const queryInsererCotations = 'INSERT INTO cotations_mouvements (user_id, type_mouvement, isin_code, quantite, date_mouvement, montant) VALUES (?)'
                            db.query(queryInsererCotations, [[user[0]["id"], "BUY", isinCode, quantity, moment(Date.now()).format('YYYY-MM-DD'), prixTotal]], (error, result) =>{
                                if(error){
                                    res.json({
                                        status: "ERROR", message: "Il y a eu une erreur " + error
                                    })
                                }
                                else {
                                    let budgetFinal = Math.round((parseFloat(user[0]['budget'])-prixTotal) * 100) / 100
                                    const queryUpdateBudget = 'UPDATE user SET budget = ? WHERE id = ?'

                                    db.query(queryUpdateBudget, [budgetFinal, user[0]["id"]], (err, result)=>{
                                        if(error){
                                            res.json({
                                                status: "ERROR", message: "Il y a eu une erreur : " + error
                                            })
                                        }
                                        else {
                                            const queryPortefeuille = 'SELECT * FROM user_portefeuille WHERE user_id = ? AND isin_code = ?'
                                            db.query(queryPortefeuille, [user[0]['id'], isinCode], (error, portefeuille) =>{
                                                if(error){
                                                    res.json({
                                                        status: "ERROR", message: "Il y a eu une erreur " + error
                                                    })
                                                }
                                                else if(portefeuille.length <= 0){
                                                    const queryNouveauPortefeuille = 'INSERT INTO user_portefeuille (user_id, isin_code, quantite) VALUES(?)'
                                                    db.query(queryNouveauPortefeuille, [[user[0]['id'], isinCode, quantity]], (error, result) =>{
                                                        if(error){
                                                            res.json({
                                                                status: "ERROR", message: "Il y a eu une erreur : " + error
                                                            })
                                                        }
                                                        else {
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
                                                    const queryUpdatePortefeuille = 'UPDATE user_portefeuille SET quantite = ? WHERE id = ? AND isin_code=?'

                                                    db.query(queryUpdatePortefeuille, [quantiteFinale, portefeuille[0]['id'], isinCode], (error, result) =>{
                                                        if(error){
                                                            res.json({
                                                                status: "ERROR", message: "Il y a eu une erreur " + error
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
                                    })
                                }
                            })
                        }

                    }
                    else {
                        res.json({
                            status: "ERROR", message: "Aucune cotation trouvée"
                        })
                    }
                })
            }
        })
    }
}

exports.venteCotations = (req, res) => {
    let { userToken, isinCode, quantity } = req.body

    if(quantity <= 0){
        res.json({
            status: "ERROR", message: "La quantité ne peut pas être inférieure ou égale à 0"
        })
    }
    else {
        const queryFindUserByToken = 'SELECT * FROM user WHERE loginToken = ?'
        db.query(queryFindUserByToken, userToken, (error, user)=>{
            if(error){
                res.json({
                    status: "ERROR", message: "Il y a eu une erreur." + error
                })
            }
            else {
                const queryUserPortefeuille = 'SELECT * FROM user_portefeuille WHERE user_id = ? AND isin_code = ?'
                db.query(queryUserPortefeuille, [user[0]["id"], isinCode], (error, portefeuille) =>{
                    if(error){
                        res.json({
                            status: "ERROR", message: "Il y a eu une erreur." + error
                        })
                    }
                    else if(portefeuille.length > 0){

                        let quantiteRestante = parseInt(portefeuille[0]['quantite']) - parseInt(quantity)

                        if(quantiteRestante < 0){
                            res.json({
                                status: "ERROR", message: "Vous n'avez pas assez d'actions."
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
                                        status: "ERROR", message: "Il y a eu une erreur." + error
                                    })
                                }
                                else {
                                    const queryFindCotations = 'SELECT * FROM cotations WHERE isin_code = ? AND stock_date = ?'
                                    db.query(queryFindCotations, [isinCode, dateClotureJourPrecedent], (error, cotation) =>{
                                        if(error){
                                            res.json({
                                                status: "ERROR", message: "Il y a eu une erreur." + error
                                            })
                                        }
                                        else {

                                            let montantVente = parseFloat(cotation[0]['stock_closing_value']) * parseFloat(quantity)
                                            let budgetFinal = Math.round((parseFloat(user[0]['budget']) + montantVente) * 100) / 100;
                                            const queryUpdateBudget = 'UPDATE user SET budget = ? WHERE id = ?'

                                            db.query(queryUpdateBudget, [budgetFinal, user[0]['id']], (error)=>{
                                                if(error){
                                                    res.json({
                                                        status: "ERROR", message: "Il y a eu une erreur." + error
                                                    })
                                                }
                                                else {
                                                    const queryNewMouvement = 'INSERT INTO cotations_mouvements (user_id, type_mouvement, isin_code, quantite, date_mouvement, montant) VALUES(?)'
                                                    db.query(queryNewMouvement, [[user[0]['id'], "SELL", isinCode, quantity, moment(Date.now()).format('YYYY-MM-DD'), montantVente]],
                                                        (error) => {
                                                            if(error){
                                                                res.json({
                                                                    status: "ERROR", message: "Il y a eu une erreur." + error
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
                            status: "ERROR", message: "Vous ne possédez aucune action chez cette société."
                        })
                    }
                })
            }
        })
    }
}

exports.getHistory = (req, res) => {
    let { isinCode } = req.params
    const queryFindCotation = 'SELECT * FROM cotations WHERE isin_code = ? ORDER BY stock_date'

    db.query(queryFindCotation, isinCode, (error, result) =>{
        if(error){
            res.json({
                status: "ERROR", message: "Il y a eu une erreur veuillez réessayer"
            })
        }
        else {
            let valeurs = []
            for(let i = 0; i < result.length; i++){
                valeurs.push(result[i]["stock_closing_value"])
            }

            let plusGrande = Math.max(...valeurs)

            res.json({
                status: "SUCCESS", result: result
            })
        }
    })

}

exports.getEnterprises = (req, res) => {
    const queryGetEnterprises = "SELECT full_name,company_labels.isin_code,ticker_code,stock_date,stock_opening_value,stock_closing_value,stock_highest_value,stock_lowest_value,stock_volume FROM company_labels INNER JOIN cotations ON company_labels.isin_code = cotations.isin_code"

    db.query(queryGetEnterprises, (err, result) => {

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
}
