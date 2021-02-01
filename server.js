const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');

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

app.get('/', (req, res) => {
  res.send('success')
})

app.post('/signin', (req, res) => {
  const { email, name, password } = req.body;
  database.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(response => {
      const isValid = bcrypt.compareSync(password, response[0].hash);
      if(isValid) {
        return database.select('*').from('users').where('email', '=', email)
        .then(user => {
          res.json(user[0])
        })
        .catch(err => res.status(400).json('unable to sign in'))
      } else {
        res.status(400).json('Wrong credentials.')
      }
    })
    .catch(err => res.status(400).json('Wrong credentials.'))
})

app.post('/register', (req, res) => { register.handleRegister(req, res, database, bcrypt) })

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  database.select('*').from('users').where({id})
    .then(user => {
        if(user.length) {
          res.json(user[0])
        } else {
          res.status(400).json('Not found.')
        }
      })
    .catch(err => res.status(400).json('Error retrieving user.'))
})

app.put('/image', (req, res) => {
  const { id } = req.body;
  database('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0]))
    .catch(err => res.status(400).json('Unable to get entries.'))
})

app.listen(3000, ()=>{
  console.log('app is running on port 3000')
})
