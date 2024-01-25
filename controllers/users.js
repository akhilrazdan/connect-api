const admin = require('./firebaseAdmin');

// This function updates the user's role in the database and Firebase custom claims
const updateUserRole = async (uid, email, newRoleId) => {
    await db('users').where({ uid }).update({ email, role_id: newRoleId });
    const newClaims = { role: newRoleId === 2 ? 'student' : 'guest' };
    await admin.auth().setCustomUserClaims(uid, newClaims);
};

const handleUserGet = async (req, res, db) => {
    const { uid, email } = req.user; // Extracted from verified ID token by your middleware
    try {
        const users = await db.select('*').from('users').where({ uid });
        const isExistingUser = users.length > 0;

        if (isExistingUser) {
            const currentRoleId = users[0].role_id;
            const mentees = await db.select('*').from('mentees').where({ email });
            const isMentee = mentees.length > 0;
            const newRoleId = isMentee ? 2 : 1; // '2' for mentee, '1' for guest

            if (currentRoleId !== newRoleId) {
                await updateUserRole(uid, email, newRoleId);
            }
            res.json({ ...users[0], role_id: newRoleId });
        } else {
            // User does not exist, create a new user with default role 'guest'
            const newUser = await db('users').insert({
                uid, email, role_id: 1, joined: new Date()
            }).returning('*');

            // Set custom claims for new user
            await admin.auth().setCustomUserClaims(uid, { role: 'guest' });
            res.json(newUser[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(400).json('Error processing request');
    }
};


const createUser = (req, res, db) => {
    const { uid, email } = req.user;
    const { name } = req.body;
    if (!email || !name) {
        return res.status(400).json('incorrect form submission; Name or email missing');
    }

    // Default role_id for guest
    let role_id = 1;

    // Check if the email exists in the MENTEES table
    db.select('*').from('mentees').where({ email })
        .then(mentee => {
            if (mentee.length) {
                // Email exists in MENTEES, set role_id for student
                role_id = 2;
            }

            // Insert user into USERS table with determined role_id
            return db('users')
                .returning('*')
                .insert({
                    uid: uid,
                    email: email,
                    name: name,
                    role_id: role_id, // Use the determined role_id
                    joined: new Date()
                })
                .then(user => {
                    // Respond with user details
                    res.json(user[0]);
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).json('unable to register: ' + err);
                });
        })
        .catch(err => {
            console.log(err);
            res.status(400).json('error checking mentees');
        });
};

module.exports = {
    handleUserGet,
    createUser
}