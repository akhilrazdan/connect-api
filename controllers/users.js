const { json } = require('body-parser');
const admin = require('./firebaseAdmin');

const handleUserGet = async (req, res, db) => {
    const { uid, email } = req.user; // Extracted from verified ID token by your middleware
    try {
        console.log(`${req.path} ${email} ${JSON.stringify(req.body)}`)
        const users = await db('users')
            .select('users.*',
                db.raw("CASE WHEN roles.role_name IS NULL THEN 'guest' ELSE roles.role_name END as role_name"),
                db.raw("CASE WHEN roles.role_id IS NULL THEN 1 ELSE roles.role_id END as role_id"))
            .leftJoin('mentees', 'users.email', '=', 'mentees.email')
            .leftJoin('roles', 'mentees.role_id', '=', 'roles.role_id')
            .where('users.uid', uid);
        const isExistingUser = users.length > 0;

        if (isExistingUser) {
            res.json({ ...users[0] });
        } else {
            res.status(404).json('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(400).json('Error processing request');
    }
};

const isMenteeAllowListed = async (req, res, db) => {
    const { email } = req.user; // Extracted from verified ID token by your middleware
    try {
        console.log(`${req.path} ${email}}`)
        const users = await db.select('*').from('mentees').where({ email });
        console.log(`${req.path} user found:  ${JSON.stringify(users)}`)
        const isMenteeAllowListed = users.length > 0 && users[0].role_id == 2;
        console.log(`${req.path} ${email}: isMenteeAllowListed ${isMenteeAllowListed}`)
        res.json({ isMenteeAllowListed });
    } catch (err) {
        console.error(err);
        res.status(400).json('Error processing request');
    }
};



const createUser = (req, res, db) => {
    console.log(`handleUserCreate ${JSON.stringify(req.body)} ${req.user}`)
    const { uid, email } = req.user;
    const { name } = req.body;
    if (!name || !email) {
        return res.status(400).json('Cannot create user: email or name missing');
    }
    if (!name) {
        console.log(`Name is missing for this request`)
    }


    // Insert user into USERS table with determined role_id
    return db('users')
        .where('uid', uid)
        .first()
        .then(user => {
            if (!user) {
                // User doesn't exist, insert them
                return db('users')
                    .insert({
                        uid: uid,
                        email: email,
                        name: name,
                        joined: new Date()
                        // Other user fields as necessary
                    })
                    // Assuming 'users' table has 'role_id' with default value 1 ('guest')
                    .returning('*');
            } else {
                // User exists, return the user data
                return Promise.resolve([user]);
            }
        }).then(userData => {
            // userData contains the user details
            // Now fetch the role information
            return db('users')
                .select('users.*',
                    db.raw('COALESCE(mentees.role_id, 1) as role_id'),
                    'roles.role_name')
                .leftJoin('mentees', 'users.email', 'mentees.email')
                .leftJoin('roles', function () {
                    this.on('mentees.role_id', '=', 'roles.role_id')
                        .orOn(db.raw('mentees.role_id IS NULL AND roles.role_id = 1'))
                })
                .where('users.uid', uid)
                .first();
        }).then(userWithRole => {
            if (userWithRole) {
                // User with role found, return the user details with role
                res.json(userWithRole);
            } else {
                // This should not happen as the user should exist at this point
                res.status(404).json('Unexpected error: User not found');
            }
        })
        .catch(err => {
            console.log(err);
            res.status(400).json('Error in processing: ' + err);
        });


};

module.exports = {
    handleUserGet,
    isMenteeAllowListed,
    createUser
}