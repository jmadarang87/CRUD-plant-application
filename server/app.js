// bring in express and mysql
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
// set up express server
const app = express();

// create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'PASSWORD',
    db: 'plantys'
});

// connect to database 
db.connect((err) => {
    if (err) {
        if (err) throw err;
    }
    console.log('MySql is Connected!');
});
app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    let sql = "INSERT INTO planty.plants (plantName, plantDescription)"
    res.send("Hello, World!");
});

// create db
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE plantys';
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Database created');
    })
});

// create table
app.get('/createplantstable', (req, res) => {
    let sql = `CREATE TABLE IF NOT EXISTS plantys.plants (id int(15) NOT NULL PRIMARY KEY AUTO_INCREMENT, name varchar(255) NOT NULL, description varchar(255) ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Plants Table Created');
    })
});
app.get("/api/plants/search=:term", (req, res) => {
    const searchTerm = "%" + req.params.term + "%";
    console.log(searchTerm);
    let sql = "SELECT * FROM plantys.plants WHERE name LIKE ?"
    db.query(sql, [searchTerm], (err, result) => {
        console.log(searchTerm);
        console.log(result);
        res.send(result);
        if (err) console.log(err);
    });
});
app.get('/api/plants', (req, res) => {
    let sql = "SELECT * FROM plantys.plants"
    db.query(sql, (err, result) => {
        console.log(typeof result);
        console.log(result);
        res.send(result);
    });
});

app.get('/api/plants/waternow', (req, res) => {
    let sql = "SELECT * FROM plantys.plants WHERE DATEDIFF(now(), lastWatered) > 5";
    db.query(sql, (err, result) => {
        console.log(result);
        res.send(result);
    });
});



app.post("/api/add", (req, res) => {
    const plantName = req.body.plantName;
    const plantDescription = req.body.plantDescription;
    const plantLastWatered = req.body.plantLastWatered;
    let sql = "INSERT INTO plantys.plants (name, description, lastWatered) VALUES (?,?,?)"
    db.query(sql, [plantName, plantDescription, plantLastWatered], (err, result) => {
        res.send(result);
        if (err) console.log(err);
    });
});

app.patch("/api/edit/:id", (req, res) => {
    console.log(req.body);
    const id = req.body.id;
    const plantName = req.body.plantName;
    const plantDescription = req.body.plantDescription;
    const plantLastWatered = req.body.plantLastWatered;
    let sql = 'UPDATE plantys.plants SET description = ?, name = ?, lastWatered = ? WHERE id = ?;';
    db.query(sql, [plantName, plantDescription, plantLastWatered, id], (err, result) => {
        console.log(result);
        if (err) console.log(err);
    });
    res.send("Plant Updated!!");
});

app.delete("/api/delete/:id", (req, res) => {
    const id = req.params.id;
    let sql = "DELETE FROM plantys.plants WHERE id = ?"
    db.query(sql, id, (err, result) => {
        console.log(result);
        if (err) console.log(err);
    });
    res.send("Plant Deleted!!");
});

// start server
app.listen('3003', () => {
    console.log('Server on 3003')
});
