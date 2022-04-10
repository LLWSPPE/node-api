const mysql = require('mysql')

const db = mysql.createConnection({
    /*
    user: "nathans2_llwsgroup",
    host: "mysql.host696235.onetsolutions.network",
    password: "ipssi2022?",
    database: "nathans2_llws",
     */
    user: "root",
    host: "localhost",
    password: "",
    database: "llws",
});

db.connect(function(error) {
    if (error) {
        console.error('Erreur lors de la connexion avec la base de données : ' + error.stack);
        return;
    }

    console.log('Connecté à la base de données [THREAD] : ' + db.threadId);
});

module.exports = db