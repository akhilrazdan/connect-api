
const handleUserGet = (req, res, db) => {
    const { id } = req.params;

    // Check if the id is provided
    if (!id) {
        return res.status(400).json('No ID provided');
    }

    db.select('*').from('users').where({ id })
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
    const { id, email, name } = req.body;
    if (!email || !name) {
        return res.status(400).json('incorrect form submission');
    }

    db('users')
        .returning('*')
        .insert({
            id: id,
            email: email,
            name: name,
            joined: new Date()
        })
        .then(user => {
            res.json(user[0]);
        })
        .catch(err => {
            console.log(err)
            res.status(400).json('unable to register: ' + err)
        });
}

module.exports = {
    handleUserGet,
    handleUserPost
}