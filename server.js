const express = require('express');
const bodyParser = require('body-parser'); // latest version of exressJS now comes with Body-Parser!
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const mentorSignup = require('./controllers/mentorSignup.js');
const mentors = require('./controllers/mentors.js');
const mentorsForMentee = require('./controllers/mentorsForMentee.js');


const db = knex({
  // connect to your own database here:
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'akhilz',
    password: '',
    database: 'smart-brain'
  }
});

const app = express();

app.use(cors())
app.use(express.json()); // latest version of exressJS now comes with Body-Parser!

app.get('/', (req, res) => { res.send('it is working') })
app.post('/signin', signin.handleSignin(db, bcrypt))
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) })
app.put('/image', (req, res) => { image.handleImage(req, res, db) })
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) })
app.post('/mentorSignup', (req, res) => { mentorSignup.handleMentorSignup(req, res, db) })
// app.get('/mentors', (req, res) => { mentors.getMentors(req, res, db) })
app.get('/mentors/:menteeId', (req, res) => { mentorsForMentee.getMentorsForMentee(req, res, db) })

app.listen(3000, () => {
  console.log('app is running on port 3000');
})