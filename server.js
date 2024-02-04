const express = require('express');
const bodyParser = require('body-parser'); // latest version of exressJS now comes with Body-Parser!
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const users = require('./controllers/users.js')
const mentors = require('./controllers/mentors.js');
const signups = require('./controllers/signups.js');
const admin = require('./controllers/admin.js')
const verifyToken = require('./controllers/roles.js');
const userclaims = require('./controllers/userclaims.js');


// Constants for capacities
const MAX_MENTOR_CAPACITY = 3; // Max number of mentees a mentor can have
const MAX_MENTEE_CHOICES = 3;  // Max number of mentors a mentee can sign up for

require('dotenv').config();
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const NODE_ENV = process.env.NODE_ENV;

console.log(`DATABASE_URL: ${DATABASE_URL}, DATABASE_NAME: ${DATABASE_NAME}, DATABASE_PASSWORD: ${DATABASE_PASSWORD} NODE_ENV: ${NODE_ENV}`);

const dbConfig = {
  client: 'pg',
  connection: {
    host: process.env.DATABASE_URL,
    user: 'akhilz',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  }
};

// Add SSL configuration in production environment
if (process.env.NODE_ENV === 'production') {
  dbConfig.connection.ssl = { rejectUnauthorized: false };
}

const db = knex(dbConfig);

const app = express();

app.use(cors())
app.use(express.json()); // latest version of exressJS now comes with Body-Parser!
app.use((req, res, next) => {
  console.log(`API called: ${req.method} ${req.path}`);
  next(); // Continue to the next middleware or route handler
});


app.get('/', (req, res) => { res.send('it is working') })
app.get('/user', verifyToken(), userclaims.maybeSetUserClaims(db), (req, res) => { users.handleUserGet(req, res, db) })
app.get('/allowed', verifyToken(), userclaims.maybeSetUserClaims(db), (req, res) => { users.isMenteeAllowListed(req, res, db) })

app.post('/user', verifyToken(), userclaims.maybeSetUserClaims(db), (req, res) => { users.createUser(req, res, db) })
app.post('/userclaims', verifyToken(), (req, res) => { userclaims.maybeSetUserClaims(req, res, db) })

app.get('/mentors', verifyToken(), userclaims.maybeSetUserClaims(db), async (req, res) => {
  try {
    await mentors.getMentorsForMenteeId(req, res, db, MAX_MENTEE_CHOICES, MAX_MENTOR_CAPACITY);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
app.post('/signup', verifyToken(), async (req, res) => {
  const { mentorId } = req.body;

  try {
    const { uid: menteeId } = req.user;
    const result = await signups.signupMenteeForMentor(db, menteeId, mentorId, MAX_MENTEE_CHOICES, MAX_MENTOR_CAPACITY);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error during signup', error: error.message });
  }
});
app.get('/download-report', verifyToken(), async (req, res) => {
  admin.downloadSignups(req, res, db)
});
app.get('/statistics', verifyToken(), async (req, res) => {
  admin.getStatistics(req, res, db)
});
// app.get('/mentors', (req, res) => { mentors.getMentors(req, res, db) })
// app.get('/mentors/:menteeId', (req, res) => { mentorsForMentee.getMentorsForMentee(req, res, db) })

app.listen(3000, () => {
  console.log('app is running on port 3000');
})