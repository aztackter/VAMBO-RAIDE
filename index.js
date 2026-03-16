const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

// Use environment variable for security (NEVER hardcode your token!)
const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = '!';

// Add a simple web server to keep Railway happy
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Selfbot is running!');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Selfbot is ready in ${client.guilds.cache.size} servers`);
});

client.on('messageCreate', async (message) => {
    // Only respond to your own messages (selfbot style)
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'raid') {
        const guild = message.guild;
        if (!guild) {
            message.reply('This command only works in servers!');
            return;
        }

        // Channel name with Zalgo text - copy exactly from a generator
        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';

        try {
            // Create the channel
            const newChannel = await guild.channels.create(channelName, {
                type: 'text'
            });
            
            // Send your message with GIF
            await newChannel.send(`## RAIDED BY VAMBO

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`);
            
            console.log(`✅ Raid completed in ${guild.name}`);
            message.reply(`✅ Channel created and message sent!`);
            
        } catch (error) {
            console.error('Error:', error);
            message.reply(`❌ Error: ${error.message}`);
        }
    }
});

client.login(TOKEN);
