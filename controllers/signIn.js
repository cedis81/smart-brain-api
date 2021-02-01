const handleSignIn = (req, res, database, bcrypt) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json('Incorrect form submission.');
  }
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
}

module.exports = {
  handleSignIn
};
