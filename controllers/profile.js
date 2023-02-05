const handleProfileGet = (req, res, db) => {
  const { id } = req.params;
  db.select(db.raw('users.*, (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentee_id = users.id) AS signups_total')).from('users').where({id})
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('Not found')
      }
    })
    .catch(err => res.status(400).json('error getting user'))
}

module.exports = {
  handleProfileGet
}

/**
 * SELECT users.*, (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentee_id = users.id) AS signups_total FROM users;
 */