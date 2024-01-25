// Firebase initialization
var admin = require("firebase-admin");
require('dotenv').config();
const FIREBASE_ADMIN = process.env.FIREBASE_ADMIN
var serviceAccount = require(FIREBASE_ADMIN);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
module.exports = admin;