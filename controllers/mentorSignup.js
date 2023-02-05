
const handleMentorSignup = (req, res, db) => {
    const { mentee, mentor } = req.body;
    db.raw('select add_mentor_mentee_relationship(?,?)', [mentor, mentee])
        .then(results => {
            if (results.rowCount) {
              res.json("Success")
            } else {
              res.status(400).json('Not found')
            }
        })
        .catch(err => {
            console.log(err);
            res.status(400).json(err.detail);
        })
}

module.exports = {
    handleMentorSignup
}