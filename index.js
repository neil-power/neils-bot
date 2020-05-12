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
//const app = express();
//app.get("/", (request, response) => {
//    console.log(Date.now() + " Ping Received");
//    response.sendStatus(200);
//});
//app.listen(process.env.PORT);
//setInterval(() => {
//    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
//}, 280000);


///////////////////////////////SETTINGS/////////////////////////////////////
const prefix = '!'; //The prefix for bot commands
const BannedRoles = ['admin', 'administrator', 'moderator', 'neil\'s bot', '@everyone']; //Roles which the user cannot use
const AdminRole = 'Admin'; //The admin role for the server - case sensitive
const DownForMaintenance = false;
const MainChannelName = 'general';
const NumberEmojis = ["\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3", "\u0036\u20E3", "\u0037\u20E3", "\u0038\u20E3", "\u0039\u20E3"];
//const NumberEmojis = ["\u0030\u20E3", "\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3", "\u0036\u20E3", "\u0037\u20E3", "\u0038\u20E3", "\u0039\u20E3"];


///////////////////////////////EVENTS/////////////////////////////////////
client.on('ready', () => { //Wait for the bot to be ready before anything happens
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', Message => { // Create an event listener for messages
    var MessageText = Message.content; //The content of the message sent
    var User = Message.member; //The member who sent the message
    var Server = Message.guild; //The server the message was sent on
    var GeneralChannel = Server.channels.cache.find(c => c.name === MainChannelName) //General channel

    if (MessageText.startsWith(prefix)) { //If the message begins with the prefix
        if (DownForMaintenance == false || IsUserAdmin(User)) { //If bot is not being upgraded

            if (MessageText.startsWith(prefix + 'role')) { //If the !role command is typed

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
                        RoleToAdd = role.name //Adds capitalised name
                        RoleFound = true;
                    }
                }
                )

                //3 - Check if the specified role exists
                if (RoleFound) { //If the specified role exists

                    //4 - Check if the specified role is a forbidden role
                    if (BannedRoles.includes(RoleToAdd.toLowerCase())) {
                        Message.reply('Sorry, I\'m afraid I can\'t do that.').catch(err => console.error(err));
                    }
                    else {

                        //5 - Check if the user already has the role
                        if (User.roles.cache.has(RoleIDToAdd)) {

                            //6 - Add/remove role
                            User.roles.remove(RoleIDToAdd).catch(err => console.error(err));
                            Message.reply(`You no longer have the role \"${RoleToAdd}\"`).catch(err => console.error(err));
                        }
                        else {

                            //6 - Add/remove role
                            User.roles.add(RoleIDToAdd).catch(err => console.error(err));
                            Message.reply(`I\'ve given you the role \"${RoleToAdd}\"`).catch(err => console.error(err));
                        }
                    }

                }
                else {
                    var RoleMenu = new Discord.MessageEmbed()
                        .setColor('ad1457')
                        .setTitle('Role not found')
                        .setDescription('Sorry, I couldn\'t find that role. The following roles are available: ')
                        .addField('Type !role <rolename> to try again', `\n ${GenerateRoleNamesList(Server).join("\n")}`)
                        .setTimestamp()
                        .setFooter('Made by Neil');

                    Message.reply(RoleMenu).catch(err => console.error(err));
                }
            }
            else if (MessageText.startsWith(`${prefix}help`)) {
                var HelpMenu = new Discord.MessageEmbed()
                    .setColor('ad1457')
                    .setTitle('Help Menu')
                    .setDescription('Here are the commands I respond to:')
                    .addField('!help', 'Shows the help menu')
                    .addField('!role', `Adds a role. The following roles are available: \n ${GenerateRoleNamesList(Server).join("\n")}\n Role names do not have to be case-sensitive`)
                    .setTimestamp()
                    .setFooter('Made by Neil');

                Message.reply(HelpMenu).catch(err => console.error(err));
            }

            else if (MessageText.startsWith(`${prefix}shutdown`) && IsUserAdmin(User)) {  // Admin shutdown 
                Message.reply('Shutting down').then(process.exit(0)); //Shuts down when message is sent
            }

            else if (MessageText.startsWith(`${prefix}poll `)) {
                var PollOptions = MessageText.slice('!poll '.length, MessageText.length).split(',') //Gets all info in poll command
                var PollQuestion = PollOptions[0];
                PollOptions.reverse() //Removes first item in array by reversing, removing last item and then reversing
                PollOptions.pop()
                PollOptions.reverse()
                PollOptions.forEach(option => {
                    var OptionNumber = PollOptions.indexOf(option);
                    PollOptions[OptionNumber] = `${NumberEmojis[OptionNumber]} - ${option}`; //Shifts array to the left
                });

                var PollMenu = new Discord.MessageEmbed()
                    .setColor('ad1457')
                    .setTitle(PollQuestion)
                    .addField('Please pick one or more of the following options:', `${PollOptions.join("\n")}\n`)
                    .setTimestamp()
                    .setFooter('Made by Neil');

                GeneralChannel.send(PollMenu)
                    .then((Message) => { //Reacts to sent message
                        Message.react(PollOptions.forEach(i => Message.react(NumberEmojis[PollOptions.indexOf(i)])))
                    })
                    .catch(err => console.error(err));
            }

            else {
                Message.reply('Sorry, I didn\'t recognise that command. Type !help to see what I can do').catch(err => console.error(err));
            }
        }
        else {
            Message.reply('I\'m currently down for maintenance at the moment. Please try again later').catch(err => console.error(err));
        }
    }
}
);

client.on("guildMemberAdd", (member) => { //New member has joined
    member.guild.channels.cache.find(c => c.name === MainChannelName).send(`Welcome, ${member.user.username}. `);
});

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