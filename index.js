//Requires
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity'); 
const TradeOfferManager = require('steam-tradeoffer-manager');
require('dotenv').config();

//Pastes & other things
const config = require('./utils/config.js');
const messages = require('./utils/messages.js');
const commandsResponses = require('./utils/commandsResponses');
const { CommunityGetUserFriendNews } = require('steam-user/enums/EMsg');

let client = new SteamUser();
let community = new SteamCommunity();
let manager = new TradeOfferManager({ 
	steam: client,
	community: community,
	language: 'en',
	cancelTime: "7200000"
});

const logOnOptions = {
	accountName : config.accountName,
	password : config.password,
	twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret) 
};

client.logOn(logOnOptions);

client.on('loggedOn', () => {
    client.getPersonas([client.steamID], (personas) => {
        console.log('Logged in as ' + client.accountInfo.name + " [ " + client.steamID + " ].");  
	
        if(config.botNewName != ''){//Check if has new name in the configs
            client.setPersona(1 , config.botNewName);//1 = Online, change the name of the acc
        }
        //0, 440, 730, 531390, 531430, 531460, 578080, 622590, 813000, 777320, 433850, 439700, 553900, 876733, 304930, 10, 80, 363970
        client.gamesPlayed(['TrashBot: ON',0, 10, 80, 440, 730, 531390, 531430, 531460, 578080, 622590, 813000, 777320, 433850, 439700, 553900, 876733, 304930, 363970]);

        client.chatMessage(config.botOwnerID64, messages.botIsOnlineMessage);//Message the owner that the bot is online
    });
});

client.on('friendMessage', function(steamID, message){
	var message = message.toLowerCase(); 
	client.getPersonas([steamID], function(err, personas) {
        if(err){
            console.log('>ERROR<');
        } else{
            var persona = personas[steamID];
            var name = persona ? persona.player_name : ("[" + steamID.getSteamID64() + "]");
            console.log('>MESSAGE< Message from - ' + name + ' [ ' + steamID + ' ] - : ' + message + '.');
        };
	
        switch(message){
            case config.prefix + 'help':
                if(steamID == config.botOwnerID64){
                    client.chatMessage(config.botOwnerID64, commandsResponses.helpAdmin); 
                }else{
                    client.chatMessage(steamID, commandsResponses.helpRegular); 
                }
            break;
            case config.prefix + 'giveAll2Owner':
                if(steamID == config.botOwnerID64){
                    give2Owner();
                }else{
                    client.chatMessage(steamID, commandsResponses.insufficientPermissions); 
                }
            break;
            case config.prefix + 'developer':
                client.chatMessage(steamID, commandsResponses.developer);
            break;
            default:
                client.chatMessage(steamID, commandsResponses.commandNotFound);
            break;
            }
    });
});

client.on('webSession', (sid, cookies) =>{
    manager.setCookies(cookies);
    community.setCookies(cookies);
    community.startConfirmationChecker(20000, config.identitySecret);
});

manager.on('newOffer', offer =>{
    client.getPersonas([offer.partner.getSteamID64()], function(err, personas) {
        if(err){
            client.log('>ERROR< Error: ' + err);
        } else{
            var persona = personas[offer.partner.getSteamID64()];
            var name = persona ? persona.player_name : ("[" + offer.partner.getSteamID64() + "]");
            var steamID = offer.partner.getSteamID64();

            console.log('>OFFER< Offer from - ' + name + ' [ ' + offer.partner.getSteamID64() + ' ].');

            var botComment = '𝙏𝙝𝙖𝙣𝙠 𝙮𝙤𝙪 ' + name + ' 𝙛𝙤𝙧 𝙩𝙝𝙚 𝙙𝙤𝙣𝙖𝙩𝙞𝙤𝙣.\n𝙃𝙚 𝙜𝙞𝙫𝙚𝙙 ' + offer.itemsToReceive.length + ' 𝙞𝙩𝙚𝙢𝙨.' + '\n\nhttp://steamcommunity.com/profiles/' + steamID ;


            function acceptOffer(offer){//Function to accep the offer
                offer.accept((err, status) => {
                    if(err){
                        console.log('>ERROR< Error while accepting offer . Error: ' + err);
                    } else {
                        console.log(`>OFFER< Offer accepted. Status: ${status}.`);
                    };
            })};
            function declineOffer(offer){//Function to decline the offer
                offer.decline((err, status) => {
                    if(err){
                        console.log('>ERROR< Error while declining offer . Error: ' + error);
                    } else {
                        console.log(`>OFFER< Offer accepted. Status: ${status}.`) ;
                    };
                });
            };

            if(offer.isGlitched() || offer.state === 11){
                declineOffer(offer);
                console.log('>OFFER< Offer is glitched.'); 
            } else if(offer.itemsToGive.length === 0){
                acceptOffer(offer);
                client.chatMessage(config.botOwnerID64, messages.botReceivedItems);
                console.log('>OFFER< Donation from ' + name  + '.');
                client.chatMessage(steamID, messages.offer);
                community.postUserComment(steamID, messages.commentOnProfile, function(err){
                    if(err){
                        client.chatMessage(steamID, messages.commentOnProfileDonatorERROR);
                        console.log('>ERROR< Error while comenting on users profile. Error: ' + err);
                    } else {
                        console.log('>SUCESS< The comment has been dropped in users profile:)');
                        client.chatMessage(steamID, messages.commentOnProfileDonator);
                        community.postUserComment(config.botID64, botComment, function(err){
                            if(err){
                                console.log(err);
                            };
                        });
                    };
                }); 
            } else if(offer.itemsToReceive.length === 0){
                console.log('>SCAMMER< An person is trying to scam the bot.');
                declineOffer(offer);
                client.chatMessage(steamID, 'Why are you tryng to scam me??\nI\'m mad.');
                client.chatMessage(config.botOwnerID64, `${name} [ ${steamID} ] is trying to scam in total of  ${offer.itemsToGive.length}!`)
                community.postUserComment(config.botID64, name + ' 𝙞𝙨 𝙩𝙧𝙮𝙞𝙣𝙜 𝙩𝙤 𝙨𝙘𝙖𝙢.\n 𝙄𝙣 𝙖 𝙩𝙤𝙩𝙖𝙡 𝙤𝙛 ' + offer.itemsToGive.length +' 𝙞𝙩𝙚𝙢𝙨.\n\nhttp://steamcommunity.com/profiles/' + steamID, function(err){
                    if(err){
                        console.log('>ERROR< Error while commenting on our profile' + err);
                    };
                });
            }; 
        };
    });
});


//Add the person automatically
client.on('friendRelationship', (steamID, relationship) =>{
    client.getPersonas([steamID], function(err, personas) {
        if(err){
            console.log('>ERROR< Error: ' + err);
        } else {
            var persona = personas[steamID];
            var name = persona ? persona.player_name : ("[" + steamID + "]"); 

            function acceptFriendRequest(){
                client.addFriend(steamID, (err) =>{
                    if(err){
                        console.log('>ERROR< An error ocurred while accepting friends request from ' + name + ' .');
                    } else {
                        console.log('>SUCESS< ' + name + ' is your friend now.');
                        client.chatMessage(steamID, `Hello i\'m ' + client.accountInfo.name + ' i accept the garbage from your inventorie :)\nType "${config.prefix}help" for Help.`)
                    };
                });
            };

            function invite2Group(){
                community.inviteUserToGroup(steamID, '103582791462033662');
            };

            if(relationship == 2){
                console.log('>FRIEND_REQUEST< An friend request from ' + name + ' [ ' + steamID + ' ].');
                acceptFriendRequest();
                invite2Group();
            };
        };
    });
});

client.on('tradeRequest', function(steamID, respond){
    client.getPersonas([steamID], function(err, personas) {
        if(err){
            console.log('>ERROR< Error: ' + err);
        } else {
            var persona = personas[steamID];
            var name = persona ? persona.player_name : ("[" + steamID + "]"); 
            console.log('>TRADE_REQUEST< An trade request from ' + name + ' [ ' + steamID + ' ].\nI dont accept trade requests, declining it.');
            respond(false);

            client.chatMessage(steamID, 'I dont accept trade request sorry :(');
        };
    });
});


client.on('groupRelationship', function(sid, relationship){
    console.log('>GROUP_INVITE< An invite to join in steam group.');
    if(config.acceptAllGroupInvites === 'true'){
        client.respondToGroupInvite(sid, true);
        console.log('Accepting');
    } else {
        client.respondToGroupInvite(sid, false);
        console.log('Declining');
    };
});

client.on('offlineMessages', function(count){
    if(count >= 0){
        console.log('>OFFLINE_MESSAGE< You have a new offline message.');
    }
}); 

client.on('communityMessages', function(count){
    if(count >= 0){
        console.log('>COMMUNITY_MESSAGES< You have a new moderator message.');
    }
});

client.on('newComments', function(count, myItems, discussions ){
    if(count >= 0){
        console.log('>COMMUNITY_MESSAGES< You have a new moderator message.\nIn bot items: ' + myItems + '\nOn subscribed discussions: ' + discussions);
    }
});

//When the bot is disconnected
client.on('disconnected', function(result, msg){
    client.chatMessage(config.botOwnerID64, messages.botDisconnected + '\n' + msg);//Message the owner that the bot is offline

})

function give2Owner(){
    let offer = manager.createOffer(`${config.botOwnerID64}`);
}