const { json } = require('body-parser');
const admin = require('./firebaseAdmin');

// This function updates the user's role in the database and Firebase custom claims
const updateUserRole = async (uid, email, newRoleId) => {
    await db('users').where({ uid }).update({ email, role_id: newRoleId });
    const newClaims = { role: newRoleId === 2 ? 'mentee' : 'guest' };
    await admin.auth().setCustomUserClaims(uid, newClaims);
};

const handleUserGet = async (req, res, db) => {
    const { uid, email } = req.user; // Extracted from verified ID token by your middleware
    try {
        console.log(`handleUserGet ${JSON.stringify(req.body)}`)
        const users = await db.select('*').from('users').where({ uid });
        const isExistingUser = users.length > 0;

        if (isExistingUser) {
            res.json({ ...users[0], role_id: newRoleId });
        } else {
            // User does not exist, create a new user with default role 'guest'
            res.status(404).json('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(400).json('Error processing request');
    }
};


const createUser = (req, res, db) => {
    console.log(`handleUserCreate ${JSON.stringify(req.body)}`)
    const { uid, email } = req.user;
    const { name } = req.body;
    if (!email || !name) {
        return res.status(400).json('incorrect form submission; Name or email missing');
    }

    // Insert user into USERS table with determined role_id
    return db('users')
        .returning('*')
        .insert({
            uid: uid,
            email: email,
            name: name,
            joined: new Date()
        })
        .then(user => {
            // Respond with user details
            console.log(`Inserted user with ${uid}, ${name}, ${email}`)
            res.json(user[0]);

        })
        .catch(err => {
            console.log(err);
            res.status(400).json('unable to register: ' + err);
        });
};

module.exports = {
    handleUserGet,
    createUser
}