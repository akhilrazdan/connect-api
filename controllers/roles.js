const admin = require('../controllers/firebaseAdmin');

const verifyToken = () => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const idToken = authorization.split('Bearer ')[1];
        try {
            // Verify the ID token and decode its payload
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            console.log(`Decoded token: ${decodedToken.email} ${decodedToken.uid}`)
            req.user = decodedToken;
            next();
        } catch (error) {
            console.error('Error verifying Firebase ID token:', error);
            return res.status(403).json({ error: 'Unauthorized' });
        }
    };
}
module.exports = verifyToken;