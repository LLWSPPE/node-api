const req = require("express");
const db = require("../utils/databaseConnection");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const moment = require("moment");

exports.userLogin = (req, res) => {
    let {email, password} = req.body

    if (!email || !password) {
        res.json({
            status: "ERROR", message: 'Les deux champs sont obligatoires'
        });
    } else {
        const queryFindUser = "SELECT * FROM user WHERE email = ?"
        db.query(queryFindUser, [email], (err, result) => {
                if(err){
                    res.json({
                        status: "ERROR", message: "Il y a eu une erreur. Veuillez réessayer."
                    })
                } else if (result.length > 0) {
                    let stockedPassword = result[0]['password']
                    bcrypt.compare(password, stockedPassword, (err, isMatch) =>{

                        if(isMatch){

                            //Ici est généré un nouveau token crypté de connexion, stocké dans une variable
                            let newConnectionToken = crypto.randomBytes(64).toString('hex');
                            //A chaque connexion, le token est mis à jour dans la db, car si il reste tout le temps le même un attaquant peut voler le token de quelqu'un et le réutiliser
                            const queryUpdateToken = "UPDATE user SET loginToken = ? WHERE id = ?"
                            db.query(queryUpdateToken, [newConnectionToken, result[0]["id"]], (err, data) =>{

                                if(err){
                                    res.json({
                                        status: "ERROR", message: "Il y a eu une erreur. Veuillez réessayer."
                                    })
                                } else{
                                    //Ici on change le token dans la réponse, car la variable "result" contient l'ancien token, et il faut récupérer le nouveau dans la base de données.
                                    result[0]['loginToken'] = newConnectionToken
                                    res.json({
                                        status: "SUCCESS", result: result
                                    })
                                }
                            })
                        } else {
                            res.json({
                                status: "ERROR", message: "Mot de passe incorrect."
                            })
                        }
                    })
                } else {
                    res.json({
                        status: "ERROR", message: "Aucun utilisateur n'a été trouvé."
                    })
                }
            }
        );
    }
}

exports.userRegister = (req, res) => {
    let { firstName, lastName, email, password, confirmPassword } = req.body

    let errors = []

    let emailRegexValidation = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(!firstName || !lastName || !email || !password || !confirmPassword){
        errors.push("Vous devez remplir tous les champs")
    }

    if(firstName.length < 2 || lastName.length < 2){
        errors.push("Votre nom ou prénom doit faire plus de 2 caractères")
    }

    if(!emailRegexValidation.test(email.toLowerCase())){
        errors.push("Format d'adresse mail incorrect")
    }

    else if(password.length < 8){
        errors.push("Votre mot de passe doit contenir plus de 8 caractères")
    }

    else if(password !== confirmPassword ){
        errors.push("Les mots de passe ne correspondent pas")
    }

    if(errors.length > 0){
        res.json({
            status: "ERROR",
            message: errors[0]
        })
    }
    else {
        const queryFindUser = "SELECT * FROM user WHERE email = ?"
        db.query(queryFindUser, [email], (err, user) => {
            if(err){
                res.json({
                    status: "ERROR", message: "Il y a eu une erreur. Veuillez réessayer."
                })
            } else if(user.length > 0){
                res.json({
                    status: "ERROR", message: "Cette adresse mail est déjà utilisée."
                })
            } else {
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(password, salt, function(err, hash) {

                        const queryCreateUser = "INSERT INTO user (email, password, first_name, last_name, register_date, responsable, admin, suspendu, dateDebut, dateFin) VALUES (?)"

                        db.query(queryCreateUser, [[email.toLowerCase(), hash, firstName, lastName, moment(Date.now()).format('YYYY-MM-DD'), 0, 0, 0, null, null]], (err, result) => {
                                if(err){
                                    res.json({
                                        status: "ERROR", message: "Il y a eu une erreur. Veuillez réessayer."
                                    })

                                } else {
                                    res.json({
                                        status: "SUCCESS", result: result
                                    })
                                }
                        })
                    });
                });
            }
        })
    }
}