const admin = require('../controllers/firebaseAdmin');

const checkUserRole = (db) => {
    return async (req, res, next) => {

        const { authorization } = req.headers;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const idToken = authorization.split('Bearer ')[1];
        try {
            // Verify the ID token and decode its payload
            const decodedToken = await admin.auth().verifyIdToken(idToken);

            // Check if the user's email is in the mentees table
            const mentee = await db.select('*').from('mentees').where({ email: decodedToken.email }).first();
            if (mentee) {
                // User is whitelisted, check if we need to update their role
                if (decodedToken.role !== 'student') {
                    // Update the user's role in your PostgreSQL database
                    await db('users').where({ uid: decodedToken.uid }).update({ role_id: 2 });

                    // Set custom claims in Firebase ID token (e.g., setting role to 'student')
                    await admin.auth().setCustomUserClaims(decodedToken.uid, { role: 'student' });
                    // Note: The new claims will propagate to the user's ID token on the next token refresh
                }
            }

            // Add the decoded token to the request so that it can be used in your route handlers
            req.user = decodedToken;
            next();
        } catch (error) {
            console.error('Error verifying Firebase ID token:', error);
            return res.status(403).json({ error: 'Unauthorized' });
        }
    };
}
module.exports = checkUserRole;