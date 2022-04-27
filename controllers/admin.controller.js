const express = require('express');
const fs = require("fs");
const db = require('../utils/databaseConnection')
const moment = require('moment')

exports.cotationsASauvegarder = (req, res) => {
    //Génération d'un titre de fichier sous la forme : "CotationsANNEEMOISJOUR.txt"
    let titreFichier = "Cotations"+moment(Date.now()).format('YYYYMMDD');

    //La liste des cotations passée dans le corps de la requête
    let cotationsTexte = req.body.cotations

    //WriteFile regarde si un fichier porte déjà ce nom, si il n'y en a pas il le crée. Puis on écrit les cotations.
    fs.writeFile(__dirname+'/../uploads/cotations/'+titreFichier+".txt", cotationsTexte, function (err) {
        if (err) {
            res.json({
                status: "ERROR", message: "Il y a eu une erreur"
            })
        }
        console.log('Le fichier des cotations du jour a été créé et/ou modifié');
        res.json({
            status: "SUCCESS", message: "Le fichier des cotations du jour a été créé et/ou modifié, vous pouvez désormais les mettre à jour en cliquant sur le bouton : Mettre à jour"
        })
    });
}

exports.updateCotations = (req, res) => {
    //Génération d'un titre de fichier sous la forme : "CotationsANNEEMOISJOUR.txt"
    let titreFichier = "Cotations"+moment(Date.now()).format('YYYYMMDD')+".txt";

    //On lit le fichier dans /uploads/cotations qui porte le titre correspondant aux cotations du jour.
    fs.readFile('./uploads/cotations/'+titreFichier, 'utf8' , (err, data) => {
        if (err) {
            res.json({
                status: "ERROR",
                message: "Il y a eu une erreur" + err
            })
        }

        else {
            // On sépare chaque ligne les unes des autres, chaque ligne est mise dans le tableau cotationsArray
            let cotationsArray = data.split('\n')

            // On re sépare chaque ligne du tableau et on crée un sous-tableau qui contient les informations d'une cotations
            let subArray = []

            //On sépare chaque termes d'une ligne pour créer des sous tableau.
            for(let i = 0; i < cotationsArray.length-1; i++) {
                subArray.push(cotationsArray[i].split(';'))
            }

            for(let i = 0; i < subArray.length; i++){
                subArray[i][1] = moment(subArray[i][1], "DD/MM/YYYY").format("YYYY-MM-DD");
            }

            //On génère le SQL
            let sqlQuery = "INSERT INTO cotations (isin_code, stock_date, stock_opening_value, stock_closing_value, stock_highest_value, stock_lowest_value, stock_volume) VALUES ?"
            let values = subArray


            db.query(sqlQuery, [values], function (err, result) {
                if (err) {
                    res.json({
                        status: "ERROR", message: "Il y a eu une erreur"
                    })
                }
                else{
                    res.json({
                        status: "SUCCESS", message: "Les cotations ont été mises à jour"
                    })
                    console.log("Nombre de lignes insérées: " + result.affectedRows);
                }
            });
        }
    })
}

exports.getUsers = (req, res) => {

    const queryGetUsers = 'SELECT * FROM user'
    db.query(queryGetUsers, (err, result) => {

        //Nous pourrions utiliser une librairie ou autre pour omettre d'envoyer le mot de passe qui est une donnée sensible.
        if(err) {
            res.json({
                status: "SUCCESS", result: "Il y a eu une erreur. Veuillez réessayer."
            })
        }
        else{
            res.json({
                status: "SUCCESS", result: result
            })
        }

    })
}

exports.getSpecificUser = (req, res) => {
    let { id } = req.params
    const queryFindUser = 'SELECT * FROM user WHERE id = ?'

    db.query(queryFindUser, [id], (err, result) =>{
        if(err) {
            res.json({
                status: "SUCCESS",
                result: "Il y a eu une erreur. Veuillez réessayer."
            })
        }
        else if(result.length > 0){
            res.json({
                status: "SUCCESS", result: result
            })
        }
        else {
            res.json({
                status: "ERROR", message: "Aucun utilisateur n'a été trouvé."
            })
        }
    })
}