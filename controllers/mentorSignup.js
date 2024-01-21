const mentors = require('./mentors')
const mentorsForMentee = require('./mentorsForMentee')

const handleMentorSignup = (req, res, db) => {
  const { mentee: menteeUid, mentor } = req.body
  console.log("adding " + menteeUid + " to mentor " + mentor)
  db.raw('select add_mentor_mentee_relationship(?,?)', [menteeUid, mentor])
    .then(results => {
      if (results.rowCount) {
        mentorsForMentee.getMentorsForMentee({
          params: {
            menteeId: menteeUid
          }
        }, res, db)
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