
const getMentors = (req, res, db) => {
    db.select('id', 'name', 'email').from('mentors')
        .then(data => {
            if (data.length) {
                res.json(data)
              } else {
                res.status(400).json('No mentors!')
              }
        })
        .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = {
    getMentors
}