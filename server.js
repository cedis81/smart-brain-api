const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

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
  res.send(database.users)
})

app.post('/signin', (req, res) => {
  bcrypt.compare(req.body.password, '$2a$10$9Z9UGD8MUz8cyIoJOOWcjum0Fetw05Qm9Fiyd8C5X6gEQ98pep3jC', function(err, res) {
    console.log('sign in guess', res)
  });
  if (req.body.email === database.users[0].email &&
      req.body.password === database.users[0].password) {
    res.json(database.users[0]);
  } else {
    res.status(400).json('error logging in')
  }
})

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  // bcrypt.hash(password, null, null, function(err, hash) {
  //   console.log(err);
  //   console.log(hash);
  // });
  const hash = bcrypt.hashSync(password);
  database.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
      return trx('users')
        .returning('*')
        .insert({
          email: loginEmail[0],
          name: name,
          joined: new Date()
        })
        .then(user => {
          res.json(user[0])
        })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err => res.status(400).json('Unable to register.'))
})

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

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(3000, ()=>{
  console.log('app is running on port 3000')
})
