var express = require('express');
const mysql = require("mysql");
const router = express.Router();

//connexion bdd sql
const db = mysql.createConnection({
  user: "nathans2_llwsgroup",
  host: "mysql.host696235.onetsolutions.network",
  password: "ipssi2022?",
  database: "nathans2_llws",
});

router.get('/index', (req, res) =>{
  console.log('SALUT')
  db.query(
      "SELECT * FROM cotations",
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

//login trader
router.post('/login', (req, res)=> {
  const mail = req.body.mail;
  const mdp = req.body.mdp;
  db.query(
    "SELECT * FROM user WHERE email = ? AND password = ?",
    [mail, mdp],
    (err, result) => {
      
      if (err) {
        res.send({err: err});
      }
        if (result.length > 0) {
          res.send(result);
        } else {
          res.send({message: "authentification invalide"});
        }
      }
  );
});


module.exports = router;
