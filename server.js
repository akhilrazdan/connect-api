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
const users = require('./controllers/users.js')
const mentors = require('./controllers/mentors.js');
const mentorsForMentee = require('./controllers/mentorsForMentee.js');
const signups = require('./controllers/signups.js')

// Constants for capacities
const MAX_MENTOR_CAPACITY = 3; // Max number of mentees a mentor can have
const MAX_MENTEE_CHOICES = 3;  // Max number of mentors a mentee can sign up for

require('dotenv').config();
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

console.log(`DATABASE_URL: ${DATABASE_URL}, DATABASE_NAME: ${DATABASE_NAME}, DATABASE_PASSWORD: ${DATABASE_PASSWORD}`);

const db = knex({
  // connect to your own database here:
  client: 'pg',
  connection: {
    // postgres://akhilz:XKT74yP5FQLlSo1fLXOhShT8J4s4TilC@dpg-cfg52ig2i3mg6pb1dcj0-a/connections
    // postgres://akhilz:XKT74yP5FQLlSo1fLXOhShT8J4s4TilC@dpg-cfg52ig2i3mg6pb1dcj0-a.oregon-postgres.render.com/connections
    // dpg-cfg52ig2i3mg6pb1dcj0-a.oregon-postgres.render.com
    host: DATABASE_URL,
    user: 'akhilz',
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME
    // ssl: { rejectUnauthorized: false }
  }
});

const app = express();

app.use(cors())
app.use(express.json()); // latest version of exressJS now comes with Body-Parser!

app.get('/', (req, res) => { res.send('it is working') })
// app.post('/signin', signin.handleSignin(db, bcrypt))
// app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.post('/user', (req, res) => { users.handleUserPost(req, res, db) })
app.get('/user/:uid', (req, res) => { users.handleUserGet(req, res, db) })
app.put('/image', (req, res) => { image.handleImage(req, res, db) })
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) })
app.post('/mentorSignup', (req, res) => { mentorSignup.handleMentorSignup(req, res, db) })
app.get('/mentors', async (req, res) => {
  try {
    await mentors.getMentorsForMenteeId(req, res, db, MAX_MENTOR_CAPACITY);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
app.post('/signup', async (req, res) => {
  const { menteeId, mentorId } = req.body;

  try {
    const result = await signups.signupMenteeForMentor(db, menteeId, mentorId, MAX_MENTEE_CHOICES, MAX_MENTOR_CAPACITY);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error during signup', error: error.message });
  }
});
// app.get('/mentors', (req, res) => { mentors.getMentors(req, res, db) })
// app.get('/mentors/:menteeId', (req, res) => { mentorsForMentee.getMentorsForMentee(req, res, db) })

app.listen(3000, () => {
  console.log('app is running on port 3000');
})