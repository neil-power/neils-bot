// Neil's Bot

//TO DO:
//
//
//

///////////////////////////////IMPORTS/////////////////////////////////////
const Discord = require('discord.js'); // Import the discord.js module
const http = require('http');
const express = require('express');
const token = process.env.TOKEN //Gets token from secure env file
const client = new Discord.Client(); // Create an instance of a Discord client


///////////////////////////////WEB PING/////////////////////////////////////
const app = express();
app.get("/", (request, response) => {
    console.log(Date.now() + " Ping Received");
    response.sendStatus(200).catch(err => console.error(err));
});
app.listen(process.env.PORT);
setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);


///////////////////////////////SETTINGS/////////////////////////////////////
const prefix = '!'; //The prefix for bot commands
const BannedRoles = ['admin', 'administrator', 'moderator', 'neil\'s bot', '@everyone']; //Roles which the user cannot use
const AdminRole = 'Admin' //The admin role for the server - case sensitive
const DownForMaintenance = false


///////////////////////////////EVENTS/////////////////////////////////////
client.on('ready', () => { //Wait for the bot to be ready before anything happens
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', Message => { // Create an event listener for messages
    var MessageText = Message.content; //The content of the message sent
    var User = Message.member; //The member who sent the message
    var Server = Message.guild; //The server the message was sent on

    if (MessageText.startsWith(prefix)) { //If the message begins with the prefix
        if (DownForMaintenance == false || IsUserAdmin(User)) { //If bot is not being upgraded

            if (MessageText.startsWith(prefix + 'role ')) { //If the !role command is typed

                //1 - Get role to add
                var RoleToAdd = MessageText.slice('!role '.length, MessageText.length).toLowerCase(); //Gets all text typed after !role in lowercase

                //2 - Get list of roles
                Server.roles.fetch().catch(err => console.error(err)); //Fetch list of roles
                var RolesCache = Server.roles.cache; //Create collection of available roles
                var RoleFound = false;
                var RoleIDToAdd = '';
                RolesCache.forEach(role => {
                    if (role.name.toLowerCase() == RoleToAdd) {
                        RoleIDToAdd = role.id;
                        RoleFound = true;
                    }
                }
                )

                //3 - Check if the specified role exists
                if (RoleFound) { //If the specified role exists

                    //4 - Check if the specified role is a forbidden role
                    if (BannedRoles.includes(RoleToAdd)) {
                        Message.reply('Sorry, I\'m afraid I can\'t do that.').catch(err => console.error(err));
                    }
                    else {

                        //5 - Check if the user already has the role
                        if (User.roles.cache.has(RoleIDToAdd)) {

                            //6 - Add/remove role
                            User.roles.remove(RoleIDToAdd).catch(err => console.error(err));
                            Message.reply(`You no longer have the role ${RoleToAdd}`).catch(err => console.error(err));
                        }
                        else {

                            //6 - Add/remove role
                            User.roles.add(RoleIDToAdd).catch(err => console.error(err));
                            Message.reply(`I\'ve given you the role \"${RoleToAdd}\"`).catch(err => console.error(err))
                        }
                    }

                }
                else {
                    Message.reply(`Sorry, I couldn\'t find that role. The following roles are available: ${GenerateRoleNamesList(Server).join(", ")}`).catch(err => console.error(err));
                }
            }
            else if (MessageText.startsWith(`${prefix}help`)) {
                Message.reply(`Type !role <your role> to add or remove a role. The following roles are available: ${GenerateRoleNamesList(Server).join(", ")}`).catch(err => console.error(err));
            }
            else{
                Message.reply('Sorry, I didn\'t recognise that command. Type !help to see what I can do').catch(err => console.error(err));
            }
        }
        else {
            Message.reply('I\'m currently down for maintenance at the moment. Please try again later').catch(err => console.error(err));
        }
    }
}
);

process.on('uncaughtException', err => { //If an uncaught exception occurs
    console.error('There was an uncaught error', err)
    process.exit(1) //mandatory (as per the Node.js docs)
  })


  ///////////////////////////////FUNCTIONS/////////////////////////////////////
function IsUserAdmin(User) { //Checks to see if a user is an admin
    var UserRoles = User.roles.cache; //Create collection of user's roles
    var UserAdmin = false;
    UserRoles.forEach(role => {
        if (role.name == AdminRole) {
            UserAdmin = true;
        }
    })
    return UserAdmin
}

function GenerateRoleNamesList(Server) { //Creates an array of the server roles name
    Server.roles.fetch().catch(err => console.error(err)); //Fetch list of roles
    var RolesCache = Server.roles.cache; //Create collection of available roles
    var RolesList = [] //Creates a blank array for roles names
    RolesCache.forEach(role => { //Iterates through each role
        if (BannedRoles.includes(role.name.toLowerCase()) == false) { //If the role is not banned, adds it to the list
            RolesList.push(role.name)
        }
    })
    return RolesList;
}


client.login(token); //Logs the bot in using the token from https://discordapp.com/developers/applications/me