const config = require("./config");

module.exports= {
    commandNotFound: `Command not found. Try to witre ${config.prefix}help`,

    helpRegular: `Commands:\n"owner": show owner profile\n"developer": show the developer of the bot\nThe prefix is: ${config.prefix}`,
    helpAdmin: `Commands:\n"owner": show owner profile\n"giveAll2Owner": giving all the tradable items to the owner\n"developer": show the developer of the bot\nThe prefix is: ${config.prefix}`,
    developer: 'The developer is https://github.com/Franciscoborges2002',
}