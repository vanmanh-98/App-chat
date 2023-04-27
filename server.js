var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('userinfo.sqlite');
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    password TEXT,
    acc TEXT
  )
    `, (err) => {
        if (err) {
            console.error(err.message);
        }
    console.log('Table created.');
});

const testName = "manh";
const testPass = "123456";
const testAcc = "@gmail.com";
addUsertodb(testName, testAcc, testPass);
app.get('/', function(req, res){
    res.sendfile('index.html');
  });
  
  io.on('connection', function(socket){
    console.log('user connected');
    socket.on('sign up', addUsertodb(username, acc, password));

    socket.on('sign in', handleSignIn(password, acc));
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });
  
  http.listen(3000, function(){
    console.log('listening on *:3000');
  });


  function addUsertodb(uName, uAcc, uPass){
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) {
          console.error(err.message);
        }
        rows.forEach((row) => {
          console.log(row.id, row.name, row.password, row.acc);
          if(row.acc != uAcc){
            db.run(`
            INSERT INTO users (name, password, acc)
            VALUES (?, ?, ?)
            `, [uName, uPass, uAcc], function(err) {
            if (err) {
            console.error(err.message);
            }
            console.log(`Row(s) inserted: ${this.changes}`);
            });
          }else{
            console.log('-----------------acc was registered-------------')
          }
        });
    });
  }

  function handleSignIn(password, acc){
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) {
          console.error(err.message);
        }
        rows.forEach((row) => {
          console.log(row.id, row.name, row.password, row.acc);
          if(row.acc === acc){
            if(row.password == password){
                socket.on('chat message', function(msg){
                    io.emit('chat message', msg);
                });
            }else{
                io.emit('sign in fail', 'In correct password');
            }
          }
          else{
            io.emit('sign in fail', 'Acc has not been registered');
          }
        });
    });
  }