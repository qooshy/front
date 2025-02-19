const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

const db = new sqlite3.Database('./films.db', (err) => {
    if (err) {
        console.error("Erreur de connexion à la base de données SQLite :", err);
    } else {
        console.log("Connexion à la base de données SQLite réussie !");
    }
});

db.run(`CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT,
    genre TEXT,
    annee INTEGER,
    note REAL
)`, (err) => {
    if (err) {
        console.error("Erreur lors de la création de la table 'films':", err);
    } else {
        // Vérifie si la table est vide
        db.get("SELECT COUNT(*) as count FROM films", (err, row) => {
            if (err) {
                console.error("Erreur lors du comptage des enregistrements:", err);
                return;
            }

            // S'il n'y a aucun film, on importe depuis le JSON
            if (row.count === 0) {
                console.log("Table 'films' vide. Import des données depuis films.json...");

                const jsonPath = path.join(__dirname, '../public', 'films.json');
                fs.readFile(jsonPath, 'utf8', (err, data) => {
                    if (err) {
                        console.error("Erreur lors de la lecture du fichier JSON:", err);
                        return;
                    }

                    let films;
                    try {
                        films = JSON.parse(data);
                    } catch (parseErr) {
                        console.error("Erreur de parsing du JSON:", parseErr);
                        return;
                    }

                    films.forEach(film => {
                        const insertQuery = `
                            INSERT INTO films (titre, genre, annee, note)
                            VALUES (?, ?, ?, ?)
                        `;

                        db.run(
                            insertQuery,
                            [
                                film.nom || 'Inconnu',
                                film.genre || 'Inconnu',
                                film.dateDeSortie || 0,
                                film.note || 0
                            ],
                            function(err) {
                                if (err) {
                                    console.error("Erreur lors de l'ajout du film:", err);
                                } else {
                                    console.log(`Film inséré: ${film.nom}`);
                                }
                            }
                        );
                    });
                });
            }
        });
    }
});


app.use(cors());

app.use(express.json());

app.post('/ajouter-film', (req, res) => {
    const { titre, genre, annee, note } = req.body;
    if (!titre || !genre || !annee || !note) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    const query = `INSERT INTO films (titre, genre, annee, note) VALUES (?, ?, ?, ?)`;
    db.run(query, [titre, genre, annee, note], function(err) {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de l'ajout du film" });
        }

        const jsonPath = path.join(__dirname, '../public', 'films.json');
        fs.readFile(jsonPath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Erreur lors de la lecture du fichier JSON" });
            }

            let films = JSON.parse(data);
            const newFilm = {
                nom: titre,
                dateDeSortie: annee,
                realisateur: "Inconnu", 
                notePublic: note,
                note: note,
                compagnie: "Inconnue", 
                description: "Description non disponible", 
                origine: "Inconnue", 
                lienImage: "img/default.jpg" 
            };

            films.push(newFilm);

            fs.writeFile(jsonPath, JSON.stringify(films, null, 2), 'utf8', (err) => {
                if (err) {
                    return res.status(500).json({ error: "Erreur lors de l'écriture dans le fichier JSON" });
                }
                res.json({ message: "Film ajouté avec succès", id: this.lastID });
            });
        });
    });
});
app.use(express.static(path.join(__dirname, '../public')));

app.get('/films', (req, res) => {
    db.all("SELECT * FROM films", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(rows); 
        res.json(rows);
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/public/films.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'films.json'));
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
