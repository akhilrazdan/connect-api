// Firebase initialization
var admin = require("firebase-admin");
var serviceAccount = require("../crwn-clothing-db-ac9fd-firebase-adminsdk-nc4ap-edd0d4b680.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
module.exports = admin;