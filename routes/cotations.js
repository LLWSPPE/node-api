const express = require('express');
const router = express.Router();
const mysql = require('mysql')

const fs = require('fs')


const db = mysql.createConnection({
    user: "nathans2_llwsgroup",
    host: "mysql.host696235.onetsolutions.network",
    password: "ipssi2022?",
    database: "nathans2_llws",
});

router.get('/', (req, res) => {
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


module.exports = router;
