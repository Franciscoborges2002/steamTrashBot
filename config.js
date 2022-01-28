require('dotenv').config()

module.exports = {
    accountName: process.env.ACCOUNT_NAME,
    password: process.env.ACCOUNT_PASSWORD,
    sharedSecret: process.env.ACCOUNT_SHARED_SECRET,
    identitySecret: process.env.ACCOUNT_IDENTITY_SECRET
}