const express = require('express');
const fs = require("fs");
const router = express.Router();

/*
    Cette route utilise une fonction qui récupère le fichier de cotation dans /uploads/cotations.
    Elle assigne chaque ligne à un tableau, et chaque ligne dans ce tebleau génère une requête SQL INSERT dans la table 'cotations'
 */

router.get('/cotations/update', function(req, res, next) {
    fs.readFile('./uploads/cotations/Cotations20220331.txt', 'utf8' , (err, data) => {
        if (err) {
            console.error(err)
            return
        }

        // On sépare chaque ligne les unes des autres, chaque ligne est mise dans le tableau cotationsArray
        let cotationsArray = data.split('\n')

        // On re sépare chaque ligne du tableau et on crée un sous-tableau qui contient les informations d'une cotations
        let subArray = []

        //On sépare chaque termes d'une ligne pour créer des sous tableau.
        for(let i = 0; i < cotationsArray.length-1; i++) {
            subArray.push(cotationsArray[i].split(';'))
        }

        //On génère le SQL
        let sqlQuery = "INSERT INTO cotations (isin_code, stock_date, stock_opening_value, stock_closing_value, stock_highest_value, stock_lowest_value, stock_volume) VALUES ?"
        let values = subArray

        db.query(sqlQuery, [values], function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });

        res.json({
            status: "SUCCESS",
            result: subArray
        })
    })
});

module.exports = router;