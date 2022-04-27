const req = require("express");
const db = require("../utils/databaseConnection");
const moment = require("moment");

exports.addBudget = (req, res) => {
    let { userId, budgetToAdd } = req.body

    if(isNaN(userId) || isNaN(budgetToAdd)){
        res.json({
            status: "ERROR", message: "Format incorrect"
        })
    }
    else if(budgetToAdd <= 0){
        res.json({
            status: "ERROR", message: "Le budget alloué ne peut pas être inférieur ou égal à 0"
        })
    }
    else {
        const queryFindUser = 'SELECT * FROM user WHERE id = ?'
        db.query(queryFindUser, [userId], (err, result) => {

            if(err) {
                res.json({
                    status: "ERROR", result: "Il y a eu une erreur. Veuillez réessayer."
                })
            } else if(result.length > 0){

                let amount = Math.round((parseFloat(result[0]["budget"]) + parseFloat(budgetToAdd)) * 100) / 100;
                const queryUpdateBudget = "UPDATE user SET budget = ? WHERE id = ?"

                db.query(queryUpdateBudget, [amount, userId], (err, result) =>{
                    if(err) throw err
                    res.json({
                        status: "SUCCESS", message: "Vous avez alloué un budget supplémentaire de " + Math.round((parseFloat(budgetToAdd)) * 100) / 100 + " euros"
                    })
                })

            } else {
                res.json({
                    status: "ERROR", message: "Aucun utilisateur n'a été trouvé"
                })
            }

        })
    }
}

exports.addRole = (req, res) => {
    let { userId, roleToAdd } = req.body

    if(isNaN(userId)){
        res.json({
            status: "ERROR", message: "Format incorrect"
        })
    } else {
        const queryFindUser = 'SELECT * FROM user WHERE id = ?'
        db.query(queryFindUser, [userId], (err, result) => {
            if(err) {
                res.json({
                    status: "ERROR", message: "Il y a eu une erreur. Veuillez réessayer."
                })
            } else if(result.length > 0){
                if(result[0][roleToAdd] === 1){
                    res.json({
                        status: "ERROR", message: `Cet utilisateur possède déjà le rôle : ${roleToAdd}`
                    })
                } else {
                    const queryUpdateRole = `UPDATE user SET ${roleToAdd} = 1 WHERE id = ?`
                    db.query(queryUpdateRole, [userId], (err, result) =>{
                        if(err) {
                            res.json({
                                status: "ERROR", message: "Il y a eu une erreur. Veuillez réessayer."
                            })
                        }
                        else {
                            res.json({
                                status: "SUCCESS", message: `Le rôle : ${roleToAdd} a bien été attribué.`
                            })
                        }
                    })
                }
            } else {
                res.json({
                    status: "ERROR", message: "Aucun utilisateur n'a été trouvé"
                })
            }
        })
    }
}

exports.removeRole = (req, res) => {
    let { userId, roleToRemove } = req.body

    if(isNaN(userId)){
        res.json({
            status: "ERROR", message: "Format incorrect"
        })
    } else {
        const queryFindUser = 'SELECT * FROM user WHERE id = ?'
        db.query(queryFindUser, [userId], (err, result) => {
            if(err) {
                res.json({
                    status: "ERROR", message: "Il y a eu une erreur. Veuillez réessayer."
                })
            }
            else if(result.length > 0){
                if(result[0][roleToRemove] === 0){
                    res.json({
                        status: "ERROR", message: `Cet utilisateur ne possède pas le rôle : ${roleToRemove}`
                    })
                }
                else {
                    const queryRemoveRole = `UPDATE user SET ${roleToRemove} = 0 WHERE id = ?`
                    db.query(queryRemoveRole, [userId], (err, result) =>{
                        if(err) {
                            res.json({
                                status: "ERROR", message: "Il y a eu une erreurpr. Veuillez réessayer."
                            })
                        }
                        else {
                            res.json({
                                status: "SUCCESS",
                                message: `Le rôle : ${roleToRemove} a bien été retiré pour cet utilisateur`
                            })
                        }

                    })
                }
            }
            else {
                res.json({
                    status: "ERROR",
                    message: "Aucun utilisateur n'a été trouvé"
                })
            }

        })
    }
}

exports.editUser = (req, res) => {
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
        const queryFindUser = "SELECT * FROM user WHERE id = ?"
        db.query(queryFindUser, [userId], (err, user) => {
            if(err){
                res.json({
                    status: "ERROR", message: "Il y a eu une erreur. Veuillez réessayer."
                })
            }
            else if(user.length <= 0){
                res.json({
                    status: "ERROR",
                    message: "Cet utilisateur n'existe pas."
                })
            }
            else {
                const queryFindUserByEmail = "SELECT * FROM user WHERE email = ?"
                db.query(queryFindUserByEmail, email, (err, result) => {
                    if(err) {
                        res.json ({
                            status: "ERROR", message: "Erreur "
                        })
                    }
                    if(result[0]['id'] !== parseInt(userId)){
                        res.json({
                            status: "ERROR", message: "Cet adresse mail est déjà utilisée."
                        })
                    }
                    else {
                        const queryUpdateInfos = "UPDATE user SET first_name = ?, last_name = ?, email = ? WHERE id = ?"
                        db.query(queryUpdateInfos, [firstName, lastName, email.toLowerCase(), userId], (err, result) => {
                            if(err){
                                res.json({
                                    status: "ERROR", message: "Il y a eu une erreur. Veuillez réessayer."
                                })
                            }
                            else {
                                res.json({
                                    status: "SUCCESS", message: "Les informations de cet utilisateur ont bien été modifiées."
                                })
                            }
                        })
                    }

                })
            }
        })
    }
}