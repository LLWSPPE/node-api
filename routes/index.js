const express = require('express');
const mysql = require("mysql");
const router = express.Router();
const bcrypt = require('bcrypt')
const moment = require('moment')
const crypto = require('crypto')

//connexion bdd sql
const db = mysql.createConnection({
  user: "nathans2_llwsgroup",
  host: "mysql.host696235.onetsolutions.network",
  password: "ipssi2022?",
  database: "nathans2_llws",
});

router.get('/index', (req, res) =>{
})

//login trader
router.post('/login', (req, res)=> {

  let {email, password} = req.body

    if (!email || !password) {
        res.json({
            status: "ERROR",
            message: 'Les deux champs sont obligatoires'
        });
    } else {
        db.query("SELECT * FROM user WHERE email = ?", [email], (err, result) => {
                if (err) {
                    res.send({err: err});
                }
                if (result.length > 0) {

                    let stockedPassword = result[0]['password']

                    bcrypt.compare(password, stockedPassword, (err, isMatch) =>{

                        if(isMatch){

                            //Ici est généré un nouveau token crypté de connexion, stocké dans une variable
                            let newConnectionToken = crypto.randomBytes(64).toString('hex');

                            //A chaque connexion, le token est mis à jour dans la db, car si il reste tout le temps le même un attaquant peut voler le token de quelqu'un et le réutiliser
                            db.query("UPDATE user SET loginToken = ? WHERE id = ?", [newConnectionToken, result[0]["id"]], (err, data) =>{
                                if(err) throw err

                                //Ici on change le token dans la réponse, car la variable "result" contient l'ancien token, et il faut récupérer le nouveau dans la base de données.
                                result[0]['loginToken'] = newConnectionToken
                                res.json({
                                    status: "SUCCESS",
                                    result: result
                                })
                            })
                        } else {
                            res.json({
                                status: "ERROR",
                                message: "Mot de passe incorrect."
                            })
                        }
                    })
                } else {
                    res.json({
                        status: "Error",
                        message: "Aucun utilisateur n'a été trouvé."
                    })
                }
            }
        );
    }

});

router.post('/register', (req, res) =>{
    let { firstName, lastName, mailAddress, password, confirmPassword } = req.body

    if(!firstName || !lastName || !mailAddress || !password || !confirmPassword){
        res.json({
            status: "ERROR",
            message: "Vous devez remplir tous les champs"
        })
    }

    else if(firstName.length < 2 || lastName.length < 2){
        res.json({
            status: "ERROR",
            message: "Votre nom ou prénom doit faire plus de 2 caractères"
        })
    }

    else if(password.length < 8){
        res.json({
            status: "ERROR",
            message: "Votre mot de passe doit contenir plus de 8 caractères"
        })
    }

    else if(password !== confirmPassword ){
        res.json({
            status: "ERROR",
            message: "Les mots de passe ne correspondent pas"
        })
    }
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                db.query(
                    "INSERT INTO user (email, password, first_name, last_name, register_date, responsable, admin, suspendu, dateDebut, dateFin) VALUES (?)",
                    [[mailAddress, hash, firstName, lastName, moment(Date.now()).format('YYYY-MM-DD'), 0, 0, 0, null, null]],
                    function(err, result) {
                        if(err) throw err
                        res.json({
                            status: "SUCCESS",
                            result: result
                        })
                    })
            });
        });




})


module.exports = router;
