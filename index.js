const { Client } = require('discord.js-selfbot-v13');
const PREFIX = '!';

// Web server for Railway
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Multi-Account Raid Bot is running!');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

// Your exact raid message
const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### PUSSY POUNDER 2000

😯OWNERS A PEDO BTW😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load alt tokens from environment variables
function loadAltTokens() {
    const tokens = [];
    
    // Check for MAIN_TOKEN (already used separately)
    // Look for ALT1_TOKEN, ALT2_TOKEN, ALT3_TOKEN, etc.
    for (let i = 1; i <= 20; i++) { // Support up to 20 alts
        const token = process.env[`ALT${i}_TOKEN`];
        if (token && token.length > 10) {
            tokens.push(token);
            console.log(`✅ Found ALT${i}_TOKEN`);
        }
    }
    
    console.log(`📊 Total alt tokens loaded: ${tokens.length}`);
    return tokens;
}

// Make all alts join the server
async function joinServerWithAlts(guild, tokens) {
    console.log(`🔥 Making ${tokens.length} alts join server...`);
    
    let joined = 0;
    let failed = 0;
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        try {
            // Create temporary client for joining
            const tempClient = new Client();
            
            await tempClient.login(token);
            console.log(`   ✅ Alt ${i+1} logged in: ${tempClient.user.tag}`);
            
            // Find any invite in the server
            const invites = await guild.invites.fetch();
            let inviteCode = null;
            
            if (invites.size > 0) {
                inviteCode = invites.first().code;
            } else {
                // Try to create an invite
                const channel = guild.channels.cache.find(c => c.type === 'GUILD_TEXT');
                if (channel) {
                    const invite = await channel.createInvite({ maxAge: 0 });
                    inviteCode = invite.code;
                }
            }
            
            if (inviteCode) {
                await tempClient.acceptInvite(inviteCode);
                console.log(`   ✅ Alt ${i+1} joined server`);
                joined++;
            } else {
                console.log(`   ❌ Alt ${i+1} couldn't join: No invite`);
                failed++;
            }
            
            await tempClient.destroy();
            await delay(2000);
            
        } catch (error) {
            failed++;
            console.log(`   ❌ Alt ${i+1} failed: ${error.message}`);
        }
    }
    
    console.log(`✅ Join complete: ${joined} joined, ${failed} failed`);
    return joined;
}

// Main client for your command account (MAIN_TOKEN)
const mainClient = new Client();

mainClient.on('ready', () => {
    console.log(`✅ MAIN ACCOUNT logged in as ${mainClient.user.tag}`);
    console.log(`Type !help for commands`);
});

mainClient.on('messageCreate', async (message) => {
    if (message.author.id !== mainClient.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== HELP COMMAND =====
    if (command === 'help') {
        await message.channel.send(`**🔥 MULTI-ACCOUNT RAID TOOL**

**!raidall** - Make all alts JOIN then FLOOD together
**!joinalts** - Make all alts join the server only
**!floodalts** - Flood with alts already in server
**!flood** [count] - Flood with main account only
**!status** - Show loaded alt tokens count
**!help** - Show this menu

✅ VAMO ACTIVATED`);
    }

    // ===== STATUS COMMAND =====
    if (command === 'status') {
        const tokens = loadAltTokens();
        await message.channel.send(`**📊 Alt Status**
Main Account: ${mainClient.user.tag}
Alt tokens loaded: ${tokens.length}
Server: ${message.guild.name}`);
    }

    // ===== FLOOD (MAIN ONLY) =====
    if (command === 'flood') {
        await message.channel.send('✅ VAMO ACTIVATED');
        
        const count = parseInt(args[0]) || 100;
        const channel = message.channel;

        console.log(`🔥 MAIN FLOOD: Sending ${count} messages...`);

        for (let i = 1; i <= count; i++) {
            try {
                await channel.send(raidMessage);
                
                if (i % 10 === 0) {
                    console.log(`   ✅ ${i}/${count} messages sent`);
                }
                
                await delay(1000);
                
            } catch (error) {
                console.log(`   ❌ Failed: ${error.message}`);
            }
        }

        console.log(`✅ MAIN FLOOD COMPLETE`);
    }

    // ===== JOIN ALTS ONLY =====
    if (command === 'joinalts') {
        const guild = message.guild;
        const tokens = loadAltTokens();
        
        if (tokens.length === 0) {
            await message.channel.send('❌ No alt tokens found in environment variables');
            return;
        }
        
        await message.channel.send(`🔥 Making ${tokens.length} alts join...`);
        const joined = await joinServerWithAlts(guild, tokens);
        await message.channel.send(`✅ ${joined} alts joined!`);
    }

    // ===== FLOOD WITH ALTS =====
    if (command === 'floodalts') {
        await message.channel.send('✅ VAMO ACTIVATED - FLOODING WITH ALTS');
        
        const guild = message.guild;
        const tokens = loadAltTokens();
        
        if (tokens.length === 0) {
            await message.channel.send('❌ No alt tokens found');
            return;
        }
        
        const activeClients = [];
        const channel = message.channel;
        
        await message.channel.send(`🔥 Logging in ${tokens.length} alts...`);
        
        // Login all alts
        for (let i = 0; i < tokens.length; i++) {
            try {
                const altClient = new Client();
                
                altClient.on('ready', () => {
                    console.log(`   ✅ Alt ${i+1} ready: ${altClient.user.tag}`);
                    
                    // Check if alt is in this server
                    const altGuild = altClient.guilds.cache.get(guild.id);
                    if (altGuild) {
                        activeClients.push(altClient);
                        console.log(`   ✅ Alt ${i+1} is in server`);
                    } else {
                        console.log(`   ⚠️ Alt ${i+1} not in server - use !joinalts first`);
                    }
                });
                
                await altClient.login(tokens[i]);
                await delay(1000);
                
            } catch (error) {
                console.log(`   ❌ Alt ${i+1} login failed: ${error.message}`);
            }
        }
        
        await delay(3000);
        
        if (activeClients.length === 0) {
            await message.channel.send('❌ No alts are in this server! Use !joinalts first.');
            return;
        }
        
        const floodCount = 100;
        await message.channel.send(`🔥 ${activeClients.length} alts flooding ${floodCount} messages...`);
        
        // Synchronized flood - all alts send each message number together
        for (let msgNum = 1; msgNum <= floodCount; msgNum++) {
            const roundPromises = activeClients.map(async (altClient) => {
                try {
                    const altGuild = altClient.guilds.cache.get(guild.id);
                    if (altGuild) {
                        const altChannel = altGuild.channels.cache.get(channel.id);
                        if (altChannel) {
                            await altChannel.send(raidMessage);
                            return true;
                        }
                    }
                    return false;
                } catch (e) {
                    return false;
                }
            });
            
            await Promise.allSettled(roundPromises);
            
            if (msgNum % 10 === 0) {
                console.log(`   ✅ Round ${msgNum}/${floodCount} complete`);
            }
            
            await delay(1500);
        }
        
        await message.channel.send(`✅ FLOOD COMPLETE! ${activeClients.length} alts sent ${floodCount} messages each!`);
        
        // Cleanup
        for (const altClient of activeClients) {
            try { await altClient.destroy(); } catch (e) {}
        }
    }

    // ===== RAID ALL =====
    if (command === 'raidall') {
        await message.channel.send('✅ VAMO ACTIVATED - RAIDING WITH ALL ALTS');
        
        const guild = message.guild;
        const tokens = loadAltTokens();
        
        if (tokens.length === 0) {
            await message.channel.send('❌ No alt tokens found');
            return;
        }
        
        await message.channel.send(`🔥 Found ${tokens.length} alt tokens`);
        
        // Step 1: Join alts
        await message.channel.send('📥 Step 1: Making alts join server...');
        const joined = await joinServerWithAlts(guild, tokens);
        
        if (joined === 0) {
            await message.channel.send('❌ No alts could join');
            return;
        }
        
        await delay(3000);
        
        // Step 2: Login and flood
        await message.channel.send(`🔥 Step 2: Logging in ${joined} alts for flood...`);
        
        const activeClients = [];
        const channel = message.channel;
        
        for (let i = 0; i < tokens.length; i++) {
            try {
                const altClient = new Client();
                
                altClient.on('ready', () => {
                    const altGuild = altClient.guilds.cache.get(guild.id);
                    if (altGuild) {
                        activeClients.push(altClient);
                        console.log(`   ✅ Alt ${i+1} ready in server`);
                    }
                });
                
                await altClient.login(tokens[i]);
                await delay(1000);
                
            } catch (error) {
                console.log(`   ❌ Alt ${i+1} login failed`);
            }
        }
        
        await delay(3000);
        
        if (activeClients.length === 0) {
            await message.channel.send('❌ No alts available for flood');
            return;
        }
        
        const floodCount = 100;
        await message.channel.send(`🔥 ${activeClients.length} alts flooding ${floodCount} messages...`);
        
        for (let msgNum = 1; msgNum <= floodCount; msgNum++) {
            const roundPromises = activeClients.map(async (altClient) => {
                try {
                    const altGuild = altClient.guilds.cache.get(guild.id);
                    if (altGuild) {
                        const altChannel = altGuild.channels.cache.get(channel.id);
                        if (altChannel) {
                            await altChannel.send(raidMessage);
                        }
                    }
                } catch (e) {}
            });
            
            await Promise.allSettled(roundPromises);
            
            if (msgNum % 10 === 0) {
                console.log(`   ✅ Round ${msgNum}/${floodCount} complete`);
            }
            
            await delay(1500);
        }
        
        await message.channel.send(`✅ RAID COMPLETE! ${activeClients.length} alts sent ${floodCount} messages each!`);
        
        // Cleanup
        for (const altClient of activeClients) {
            try { await altClient.destroy(); } catch (e) {}
        }
    }
});

// Login main account using MAIN_TOKEN from Railway
const mainToken = process.env.MAIN_TOKEN;
if (!mainToken) {
    console.error('❌ ERROR: MAIN_TOKEN environment variable not set!');
    process.exit(1);
}

mainClient.login(mainToken);
