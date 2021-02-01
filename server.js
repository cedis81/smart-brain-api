const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signIn = require('./controllers/signIn');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const database = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    // user : '',
    // password : '',
    database : 'smart-brain'
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { res.send('success') })
app.post('/signin', (req, res) => { signIn.handleSignIn(req, res, database, bcrypt) })
app.post('/register', (req, res) => { register.handleRegister(req, res, database, bcrypt) })
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, database) })
app.put('/image', (req, res) => { image.handleImage(req, res, database) })
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) })

app.listen(3000, ()=>{
  console.log('app is running on port 3000')
})
