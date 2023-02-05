const handleSignin = (db, bcrypt) => (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json('incorrect form submission');
  }
  db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);

      query = 'users.*, (SELECT COUNT(*) FROM Mentor_Mentee_Relationship WHERE Mentor_Mentee_Relationship.mentee_id = users.id) AS signups_total';

      if (isValid) {
        return db.select(db.raw(query))
          .from('users')
          .where('email', '=', email)
          .then(user => {console.log(user)
            res.json(user[0])
          })
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => {
      res.status(400).json('wrong credentials' + err)
    })
}

module.exports = {
  handleSignin: handleSignin
}
