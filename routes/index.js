var express = require('express');
const mysql = require("mysql");
const app = express();
app.use(express.json());
const router = express.Router();
const cors = require("cors");
const PORT = process.env.PORT || 9000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
app.use(cors());

//connexion bdd sql
const db = mysql.createConnection({
  user: "nathans2_llwsgroup",
  host: "mysql.host696235.onetsolutions.network",
  password: "ipssi2022?",
  database: "nathans2_llws",
});


//login trader
app.post('/login', (req, res)=> {
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
