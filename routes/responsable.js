const express = require('express');
const fs = require("fs");
const router = express.Router();
const { userHasRole } = require('../middlewares/authentification')
const db = require('../utils/databaseConnection')

router.post('/user/addBudget', [userHasRole('responsable')], (req, res) =>{
    let { userId, budgetToAdd } = req.body

    if(isNaN(userId) || isNaN(budgetToAdd)){
        res.json({
            status: "EROR",
            message: "Format incorrect"
        })
    }
    else if(budgetToAdd <= 0){
        res.json({
            status: "ERROR",
            message: "Le budget alloué ne doit pas être inférieur ou égal à 0"
        })
    } else {
        db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {

            if(err) {
                res.json({
                    status: "SUCCESS",
                    result: "Il y a eu une erreur. Veuillez réessayer."
                })
            } else if(result.length > 0){
                console.log(parseFloat(budgetToAdd))
                db.query("UPDATE user SET budget = ? WHERE id = ?", [result[0]["budget"]+parseFloat(budgetToAdd).toFixed(2), userId], (err, result) =>{
                    if(err) throw err
                    res.json({
                        status: "SUCCESS",
                        message: "Vous avez alloué un budget supplémentaire de " + budgetToAdd + " euros"
                    })
                })

            } else {
                res.json({
                    status: "ERROR",
                    message: "Aucun utilisateur n'a été trouvé"
                })
            }

        })
    }
})

router.post('/user/promote', [userHasRole('responsable')], (req, res) =>{
    let { userId } = req.body

    if(isNaN(userId)){
        res.json({
            status: "EROR",
            message: "Format incorrect"
        })
    } else {
        db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {
            if(err) {
                res.json({
                    status: "SUCCESS",
                    result: "Il y a eu une erreur. Veuillez réessayer."
                })
            } else if(result.length > 0){
                if(result[0]["responsable"] === 1){
                    res.json({
                        status: "ERROR",
                        message: "Cet utilisateur a déjà été promu responsable"
                    })
                } else {
                    db.query('UPDATE user SET responsable = 1 WHERE id = ?', [userId], (err, result) =>{
                        if(err) throw err
                        res.json({
                            status: "SUCCESS",
                            message: "Cet utilisateur a été promu responsable"
                        })
                    })
                }
            } else {
                res.json({
                    status: "ERROR",
                    message: "Aucun utilisateur n'a été trouvé"
                })
            }


        })
    }
})

router.post('/user/revoke', [userHasRole('responsable')], (req, res) =>{
    let { userId } = req.body

    if(isNaN(userId)){
        res.json({
            status: "EROR",
            message: "Format incorrect"
        })
    } else {
        db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {
            if(err) {
                res.json({
                    status: "SUCCESS",
                    result: "Il y a eu une erreur. Veuillez réessayer."
                })
            } else if(result.length > 0){
                if(result[0]["responsable"] === 0){
                    res.json({
                        status: "ERROR",
                        message: "Cet utilisateur n'est pas un responsable"
                    })
                } else {
                    db.query('UPDATE user SET responsable = 0 WHERE id = ?', [userId], (err, result) =>{
                        if(err) throw err
                        res.json({
                            status: "SUCCESS",
                            message: "Cet utilisateur a évu ses droits de responsable révoqués."
                        })
                    })
                }
            } else {
                res.json({
                    status: "ERROR",
                    message: "Aucun utilisateur n'a été trouvé"
                })
            }


        })
    }
})




module.exports = router;