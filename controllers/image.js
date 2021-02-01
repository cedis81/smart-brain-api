const Clarifai = require('clarifai');

const app = new Clarifai.App({
 apiKey: 'a2bf24b4f4b04ecba27fcf7d840de3e1'
});

const handleApiCall = (req, res) => {
  app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => {
      res.json(data)
    })
    .catch(err => res.status(400).json('Unable to connect with API.'))
}

const handleImage = (req, res, database) => {
  const { id } = req.body;
  database('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0]))
    .catch(err => res.status(400).json('Unable to get entries.'))
}

module.exports = {
  handleImage,
  handleApiCall
};
