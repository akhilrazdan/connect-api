
const handleUserGet = (req, res, db) => {
    const { uid } = req.params;

    // Check if the id is provided
    if (!uid) {
        return res.status(400).json('No UID provided');
    }

    db.select('*').from('users').where({ uid })
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(404).json('User not found');
            }
        })
        .catch(err => {
            console.log(err);
            res.status(400).json('Error getting user');
        });
};

const handleUserPost = (req, res, db) => {
    const { uid, email, name } = req.body;
    if (!email || !name) {
        return res.status(400).json('incorrect form submission');
    }

    // Check if the email exists in the MENTEES table
    db.select('*').from('mentees').where({ email })
        .then(mentee => {
            if (mentee.length) {
                // Email exists in MENTEES, proceed with inserting into USERS table
                return db('users')
                    .returning('*')
                    .insert({
                        uid: uid,
                        email: email,
                        name: name,
                        track_id: mentee[0].track_id,
                        joined: new Date()
                    })
                    .then(user => {
                        // Respond with user details and track_id
                        res.json({ ...user[0], track_id: mentee[0].track_id });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(400).json('unable to register: ' + err);
                    });
            } else {
                // Email does not exist in MENTEES
                res.status(400).json('email not found in mentees');
            }
        })
        .catch(err => {
            console.log(err);
            res.status(400).json('error checking mentees');
        });
}

module.exports = {
    handleUserGet,
    handleUserPost
}