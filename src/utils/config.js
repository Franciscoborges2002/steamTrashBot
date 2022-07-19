require('dotenv').config()

module.exports = {
    accountName: process.env.ACCOUNT_NAME,
    password: process.env.ACCOUNT_PASSWORD,
    sharedSecret: process.env.ACCOUNT_SHARED_SECRET,
    identitySecret: process.env.ACCOUNT_IDENTITY_SECRET,
    botNewName: '',
    botID64: process.env.BOT_ID_64, 
    botOwnerID64: process.env.BOT_ID_OWNER_64,
    acceptAllGroupInvites: 'false',
    prefix: '+',
    customGame: 'TrashBot: ON',
    idGroup2Invite: ''
}