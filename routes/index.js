var express = require('express');
const mysql = require("mysql");
const router = express.Router();
const bcrypt = require('bcrypt')

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
                            res.json({
                                status: "SUCCESS",
                                result: result
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


module.exports = router;
