const express = require('express');
const fs = require("fs");
const router = express.Router();
const { userHasRole } = require('../middlewares/authentification')
const db = require('../utils/databaseConnection')
const bcrypt = require("bcrypt");
const moment = require("moment");

router.post('/user/addBudget', (req, res) =>{
    let { userId, budgetToAdd } = req.body

    if(isNaN(userId) || isNaN(budgetToAdd)){
        res.json({
            status: "ERROR",
            message: "Format incorrect"
        })
    }
    else if(budgetToAdd <= 0){
        res.json({
            status: "ERROR",
            message: "Le budget alloué ne peut pas être inférieur ou égal à 0"
        })
    } else {
        db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {

            if(err) {
                res.json({
                    status: "ERROR",
                    result: "Il y a eu une erreur. Veuillez réessayer."
                })
            } else if(result.length > 0){

                let amount = Math.round((parseFloat(result[0]["budget"]) + parseFloat(budgetToAdd)) * 100) / 100;

                db.query("UPDATE user SET budget = ? WHERE id = ?", [amount, userId], (err, result) =>{
                    if(err) throw err
                    res.json({
                        status: "SUCCESS",
                        message: "Vous avez alloué un budget supplémentaire de " + Math.round((parseFloat(budgetToAdd)) * 100) / 100 + " euros"
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

router.post('/user/promote', (req, res) =>{
    let { userId } = req.body

    if(isNaN(userId)){
        res.json({
            status: "ERROR",
            message: "Format incorrect"
        })
    } else {
        db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {
            if(err) {
                res.json({
                    status: "ERROR",
                    message: "Il y a eu une erreur. Veuillez réessayer."
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

router.post('/user/revoke', (req, res) =>{
    let { userId } = req.body

    if(isNaN(userId)){
        res.json({
            status: "ERROR",
            message: "Format incorrect"
        })
    } else {
        db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {
            if(err) {
                res.json({
                    status: "ERROR",
                    message: "Il y a eu une erreur. Veuillez réessayer."
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
                            message: "Cet utilisateur a vu ses droits de responsable révoqués."
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

router.post('/user/suspension', (req, res) =>{
    let { userId } = req.body

    if(isNaN(userId)){
        res.json({
            status: "ERROR",
            message: "Format incorrect"
        })
    } else {
        db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {
            if(err) {
                res.json({
                    status: "ERROR",
                    message: "Il y a eu une erreur. Veuillez réessayer."
                })
            } else if(result.length > 0){
                if(result[0]["suspendu"] === 1){
                    res.json({
                        status: "ERROR",
                        message: "Cet utilisateur est déjà suspendu"
                    })
                } else {
                    db.query('UPDATE user SET suspendu = 1 WHERE id = ?', [userId], (err, result) =>{
                        if(err) throw err
                        res.json({
                            status: "SUCCESS",
                            message: "Cet utilisateur a été suspendu. Il ne peut plus faire d'action sur le marché."
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

router.post('/user/rehabilitate', (req, res) =>{
    let { userId } = req.body

    if(isNaN(userId)){
        res.json({
            status: "ERROR",
            message: "Format incorrect"
        })
    } else {
        db.query('SELECT * FROM user WHERE id = ?', [userId], (err, result) => {
            if(err) {
                res.json({
                    status: "ERROR",
                    message: "Il y a eu une erreur. Veuillez réessayer."
                })
            } else if(result.length > 0){
                if(result[0]["suspendu"] === 0){
                    res.json({
                        status: "ERROR",
                        message: "Cet utilisateur n'a pas été suspendu"
                    })
                } else {
                    db.query('UPDATE user SET suspendu = 0 WHERE id = ?', [userId], (err, result) =>{
                        if(err) throw err
                        res.json({
                            status: "SUCCESS",
                            message: "Cet utilisateur a été réhabilité et peut recommencer à trader."
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

router.post('/user/edit', (req, res) =>{
    let { firstName, lastName, email, userId } = req.body

    let errors = []

    let emailRegexValidation = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(!firstName || !lastName || !email){
        errors.push("Vous devez remplir tous les champs")
    }

    if(firstName.length < 2 || lastName.length < 2){
        errors.push("Votre nom ou prénom doit faire plus de 2 caractères")
    }

    if(!emailRegexValidation.test(email.toLowerCase())){
        errors.push("Format d'adresse mail incorrect")
    }

    if(errors.length > 0){
        res.json({
            status: "ERROR",
            message: errors[0]
        })
    }
    else {
        db.query("SELECT * FROM user WHERE email = ?", [email], (err, user) => {
            if(err){
                res.json({
                    status: "ERROR",
                    message: "Il y a eu une erreur. Veuillez réessayer."
                })
            } else if(user.length > 0 && user[0]["id"] !== userId){
                res.json({
                    status: "ERROR",
                    message: "Cette adresse mail est déjà utilisée."
                })
            }
            else {
               db.query("UPDATE user SET first_name = ?, last_name = ?, email = ? WHERE id = ?", [firstName, lastName, email.toLowerCase(), userId], (err, result) => {
                   if(err){
                       res.json({
                           status: "ERROR",
                           message: "Il y a eu une erreur. Veuillez réessayer."
                       })
                   } else {
                       res.json({
                           status: "SUCCESS",
                           message: "Les informations de cet utilisateur ont bien été modifiées."
                       })
                   }
               })
            }
        })
    }
})




module.exports = router;