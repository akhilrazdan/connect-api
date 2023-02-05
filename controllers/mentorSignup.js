const mentors = require('./mentors')

const handleMentorSignup = (req, res, db) => {
  const { mentee, mentor } = req.body
  console.log("adding " + mentee + " to mentor " + mentor)
  db.raw('select add_mentor_mentee_relationship(?,?)', [mentee, mentor])
    .then(results => {
      if (results.rowCount) {
        mentors.getMentors(res, db)
        console.log(results.rows)
      } else {
        console.log("Error adding mentee to mentor")
        res.status(400).json('Not found')
      }
    })
    .catch(err => {
      res.status(400).json(err.message);
    })
}

module.exports = {
  handleMentorSignup
}