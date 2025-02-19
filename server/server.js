const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./films.db', (err) => {
    if (err) {
        console.error("Erreur de connexion à la base de données SQLite :", err);
    } else {
        console.log("Connexion à la base de données SQLite réussie !");
    }
});

// Création de la table films (si elle n'existe pas déjà)
db.run(`CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT,
    genre TEXT,
    annee INTEGER,
    note REAL
)`);


// Configuration de CORS pour permettre l'accès à partir du client
app.use(cors());

// Servir le dossier 'public' pour les fichiers statiques (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, '../public')));

// Charger le fichier JSON avec les films
// Nous utilisons ici une méthode différente pour envoyer le fichier JSON
app.get('/films.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'films.json'));
});

// Rediriger "/" vers "films.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/films.html'));
});

// Route pour tester la réponse JSON
app.get('/public/films.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'films.json'));
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
