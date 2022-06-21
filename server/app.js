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
    res.send("Hello, World!");
});

// create db
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE plantys';
    db.query(sql, (err, result) => {
        if (err) throw err;
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

app.get('/createnotestable', (req, res) => {
    let sql = `CREATE TABLE IF NOT EXISTS plantys.notes (id INT AUTO_INCREMENT, title VARCHAR(75) NOT NULL, content TEXT NOT NULL, plantid INT NOT NULL, _created TIMESTAMP DEFAULT NOW(), PRIMARY KEY (id), FOREIGN KEY (plantid) REFERENCES plantys.plants (id));`;
    
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Notes Table Created');
    })
});

app.get('/createimagestable', (req, res) => {
    let sql = `CREATE TABLE IF NOT EXISTS plantys.images(id INT AUTO_INCREMENT,imgURL TEXT NOT NULL,plantid INT NOT NULL,PRIMARY KEY (id),FOREIGN KEY (plantid) REFERENCES plantys.plants (id));`;
    
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('Images Table Created');
    })
});


// selects all from database
app.get('/api/plants', (req, res) => {
    let sql = "SELECT * FROM plantys.plants"
    db.query(sql, (err, result) => {
        res.send(result);
    });
});

// search funcionality
app.get("/api/plantys", (req, res) => {
    let term = req.query.search;
    console.log(term);
    const searchTerm = "%" + term + "%";
    let sql = "SELECT * FROM plantys.plants WHERE name LIKE ?"
    db.query(sql, [searchTerm], (err, result) => {
        console.log(result);
        res.send(result);
        if (err) console.log(err);
    });
});

// returns plants that haven't been watered in over 5 days
app.get('/api/plants/waternow', (req, res) => {
    let sql = "SELECT * FROM plantys.plants WHERE DATEDIFF(now(), lastWatered) > 5";
    db.query(sql, (err, result) => {
        res.send(result);
    });
});

app.get('/api/plants/:id/:name', (req, res) => {
    console.log(req);
    const id = req.params.id;
    let sql = "SELECT name, description, lastWatered FROM plantys.plants WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        res.send(result);
        if (err) console.log(err);
    });
});

app.get('/api/notes/:id/:name', (req, res) => {
    console.log(req);
    const id = req.params.id;
    let sql = "SELECT notes.id, title, content, plantid, _created FROM plantys.notes WHERE plantid = ?";
    db.query(sql, [id], (err, result) => {
        res.send(result);
        if (err) console.log(err);
    });
});

app.get('/api/images/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    let sql = "SELECT imgURL FROM plantys.images WHERE plantid = ?";
    db.query(sql, [id], (err, result) => {
        res.send(result);
        console.log(result);
        if (err) console.log(err);
    });
});

// creates new plant in db
app.post("/api/add", (req, res) => {
    const plantName = req.body.plantName;
    const plantDescription = req.body.plantDescription;
    const plantLastWatered = req.body.plantLastWatered;
    let sql = "INSERT INTO plantys.plants (name, description, lastWatered) VALUES (?,?,?);"
    db.query(sql, [plantName, plantDescription, plantLastWatered], (err, result) => {
        res.send(result);
        console.log(result);
        if (err) console.log(err);
    })
});

app.post("/api/add/images", (req, res) => {
    const id = req.body.plantId;
    const plantImgUrl = req.body.plantImgUrl;
    let sql = "INSERT INTO plantys.images (imgURL, plantid) VALUES (?,?);"
    db.query(sql, [plantImgUrl, id], (err, result) => {
        res.send(result);
        console.log(result);
        if (err) console.log(err);
    })
});

app.post("/api/addNote", (req, res) => {
    const noteTitle = req.body.noteTitle;
    const noteContent = req.body.noteContent;
    const plantId = req.body.plantId;
    let sql = "INSERT INTO `plantys`.`notes` (`title`, `content`, `plantid`, `_created`) VALUES (?, ?, ?, now());"
    db.query(sql, [noteTitle, noteContent, plantId], (err, result) => {
        if (err) console.log(err);
        res.send(result);
    });
});

// delete note from plants page
app.delete("/api/addNote/delete/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    let sql = "DELETE FROM plantys.notes WHERE id = ?;"
    db.query(sql, id, (err, result) => {
        res.send(result);
        if (err) console.log(err);
    });
});

// edits plant in db
app.patch("/api/edit/:id", (req, res) => {
    const id = req.body.id;
    const plantName = req.body.plantName;
    const plantDescription = req.body.plantDescription;
    const plantLastWatered = req.body.plantLastWatered;
    let sql = 'UPDATE plantys.plants SET description = ?, name = ?, lastWatered = ? WHERE id = ?;';
    db.query(sql, [plantName, plantDescription, plantLastWatered, id], (err, result) => {
        if (err) console.log(err);
    });
    res.send("Plant Updated!!");
});

//deletes plant from db
app.delete("/api/delete/:id", (req, res) => {
    const id = req.params.id;
    let sql = "DELETE FROM plantys.images WHERE plantid = ?; DELETE FROM plantys.notes WHERE id = ?; DELETE FROM plantys.plants WHERE id = ?;"
    db.query(sql, [id, id, id], (err, result) => {
        if (err) console.log(err);
    });
    res.send("Plant Deleted!!");
});

// start server
app.listen('3003', () => {
    console.log('Server on 3003')
});
