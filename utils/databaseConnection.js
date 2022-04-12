const mysql = require('mysql')
require('dotenv').config()

const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect(function(error) {
    if (error) {
        console.error('Erreur lors de la connexion avec la base de données : ' + error.stack);
        return;
    }

    console.log('Connecté à la base de données [THREAD] : ' + db.threadId);
});

module.exports = db