// Neil's Roles Bot

//TO DO:
//List of all available roles
//Error handling
//Hosting

//USED TO KEEP BOT ALIVE ON GLITCH
const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
    console.log(Date.now() + " Ping Received");
    response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
//USED TO KEEP BOT ALIVE ON GLITCH

const Discord = require('discord.js'); // Import the discord.js module
const token = process.env.TOKEN //Gets token from secure env file
const client = new Discord.Client(); // Create an instance of a Discord client
const prefix = '!'; //The prefix for bot commands
const BannedRoles = ['admin', 'administrator', 'moderator', 'neil\'s bot', '@everyone']; //Roles which the user cannot use
const AdminRole = 'Admin'
const DownForMaintenance = false

client.on('ready', () => { //Wait for the bot to be ready before anything happens
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', Message => { // Create an event listener for messages
    var MessageText = Message.content; //The content of the message sent
    var User = Message.member; //The member who sent the message
    var Server = Message.guild; //The server the message was sent on

    if (MessageText.startsWith(prefix)) { //If the message begins with the prefix
        if (DownForMaintenance == false || IsUserAdmin(User)) {

            if (MessageText.startsWith(prefix + 'role ')) { //If the !role command is typed

                //1 - Get role to add
                var RoleToAdd = MessageText.slice('!role '.length, MessageText.length).toLowerCase(); //Gets all text typed after !role in lowercase
                //Message.reply('Role Specified: ' + RoleToAdd); //DEBUGGING

                //2 - Get list of roles
                Server.roles.fetch(); //Fetch list of roles
                var RolesCache = Server.roles.cache; //Create collection of available roles
                var RoleFound = false;
                var RoleIDToAdd = '';
                RolesCache.forEach(role => {
                    //Message.reply(role.name.toLowerCase()); //DEBUGGING
                    if (role.name.toLowerCase() == RoleToAdd) {
                        RoleIDToAdd = role.id;
                        RoleFound = true;
                    }
                }
                )

                //Message.reply('Roles found: ' + RoleFound); //DEBUGGING
                //Message.reply('Role ID: ' + RoleIDToAdd); //DEBUGGING

                //3 - Check if the specified role exists
                if (RoleFound) { //If the specified role exists
                    //Message.reply('Role found'); //DEBUGGING

                    //4 - Check if the specified role is a forbidden role
                    if (BannedRoles.includes(RoleToAdd)) {
                        Message.reply('Sorry, I\'m afraid I can\'t do that.'); //DEBUGGING
                    }
                    else {
                        //Message.reply('Role is not banned'); //DEBUGGING

                        //5 - Check if the user already has the role
                        if (User.roles.cache.has(RoleIDToAdd)) {
                            //Message.reply('User already has role') //DEBUGGING

                            //6 - Add/remove role
                            User.roles.remove(RoleIDToAdd)
                            Message.reply(`You no longer have the role ${RoleToAdd}`) //DEBUGGING
                        }
                        else {
                            //Message.reply('User does not have role') //DEBUGGING

                            //6 - Add/remove role
                            User.roles.add(RoleIDToAdd)
                            Message.reply(`I\'ve given you the role \"${RoleToAdd}\"`) //DEBUGGING
                        }
                    }

                }
                else {
                    Message.reply('I couldn\'t find that role.') //DEBUGGING
                }
            }
            else if (MessageText.startsWith(`${prefix}help`)) {
                Message.reply('Type !role <your role> to add that role to your profile.')
            }
        }
        else {
            Message.reply('I\'m currently down for maintenance at the moment. Please try again later')
        }
    }
}
);

function IsUserAdmin(User) {
    var UserRoles = User.roles.cache; //Create collection of user's roles
    var UserAdmin = false;
    UserRoles.forEach(role => {
        if (role.name == AdminRole) {
            UserAdmin = true;
        }
    }
    )
    return UserAdmin
}

client.login(token); //Logs the bot in using the token from https://discordapp.com/developers/applications/me