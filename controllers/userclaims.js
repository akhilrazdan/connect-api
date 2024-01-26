const admin = require('../controllers/firebaseAdmin');

const setUserClaims = async (req, res, db) => {
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

        // Set custom claims using Firebase Admin SDK
        await admin.auth().setCustomUserClaims(uid, { role: roleName });

        res.json({ message: 'User claims updated successfully', role: roleName });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error setting user claims', error: err.message });
    }
};
module.exports = {
    setUserClaims
}
