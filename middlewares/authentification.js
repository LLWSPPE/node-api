const mysql = require("mysql")

const db = mysql.createConnection({
    user: "nathans2_llwsgroup",
    host: "mysql.host696235.onetsolutions.network",
    password: "ipssi2022?",
    database: "nathans2_llws",
});

    const isSessionTokenValid = (req, res, next) => {

        console.log('ARRIVE DANS MIDDLEWARE 1')
        //On récupère le sessionToken passé en paramètre
        let loginToken = req.body.loginToken || req.query.loginToken

        //Si le token est nul alors on retourne une erreur
        if(!loginToken){
            res.json({
                status: "ERROR",
                message: "Jeton de session invalide"
            })

        }
        else {
            //Sinon on recherche dans la base de données un utilisateur qui possède ce token
            db.query("SELECT * FROM user WHERE loginToken = ?", [loginToken], (err, result) =>{
                if(result.length > 0){
                    //Si une occurence est trouvée, on passe à la suite (la route peut etre executée)
                    req.token = loginToken
                    next();
                } else {
                    //Sinon on renvoie une erreur
                    res.json({
                        status: "ERROR",
                        message: "Jeton de session invalide"
                    })
                }
            })
        }
    };

    const userHasRole = (role) => {

        return function(req, res, next){
            //Avant de passer à cette étape, on vérifie que le middleware précédent est valide
            isSessionTokenValid(req, res, function (){
                //Si le middleware nous envoie bien à la suite (next) on continue
                console.log('ARRIVE DANS MIDDLEWARE 2')
                //On recherche de nouveau l'utilisateur avec le login token
                db.query("SELECT * FROM user WHERE loginToken = ?", [req.token], (err, result) =>{

                    if(result.length > 0){
                        //On regarde la permission demandée dans le paramètre 'role'
                        if(role === 'admin' && result[0]['admin'] === 1 || role === 'responsable' && result[0]['responsable'] === 1){
                            return next()
                        } else {
                            //Sinon on retourne une erreur
                            res.json({
                                status: "ERROR",
                                message: "Vous n'avez pas la permission pour cela."
                            })
                        }
                    }
                })
            })
        }
    };

    module.exports = {
        isSessionTokenValid: isSessionTokenValid,
        userHasRole: userHasRole
    }

