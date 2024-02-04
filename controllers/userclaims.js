const admin = require('../controllers/firebaseAdmin');

async function updateRoleIfNeeded(uid, roleName) {
    try {
        // Retrieve user's current custom claims
        const user = await admin.auth().getUser(uid);
        const currentClaims = user.customClaims || {};

        // Check if the role is different
        if (currentClaims.role !== roleName) {
            // Set custom claims with the new role
            await admin.auth().setCustomUserClaims(uid, { role: roleName });
            console.log(`User ${uid} role updated to ${roleName}`);
        } else {
            console.log(`User ${uid} already has role ${roleName}, no update needed.`);
        }
    } catch (error) {
        console.error(`Error updating role for user ${uid}:`, error);
    }
}

const maybeSetUserClaims = (db) => {
    return async (req, res, next) => {
        const { uid, email } = req.user; // Extracted from verified ID token by your middleware

        try {
            // Join 'mentees' table with 'roles' table to get the role string
            // This join will now always return a result because of the default 'role_id' in 'mentees'
            const userRoleData = await db
                .select('roles.role_name')
                .from('mentees')
                .join('roles', 'mentees.role_id', '=', 'roles.role_id')
                .where('mentees.email', '=', email)
                .first(); // Assuming each email will have only one role

            const roleName = userRoleData ? userRoleData.role_name : 'guest';
            console.log(`${req.path} Setting ${uid}, ${email} to role: ${roleName}`)

            // Set custom claims using Firebase Admin SDK
            await updateRoleIfNeeded(uid, roleName);
            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error setting user claims', error: err.message });
        }
    };
}
module.exports = {
    maybeSetUserClaims
}
