const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const readline = require('readline');

const PREFIX = '!';
const CONFIG = require('./config.json');

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

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Read alt tokens from file
function loadAltTokens() {
    try {
        const data = fs.readFileSync('tokens.txt', 'utf8');
        return data.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));
    } catch (error) {
        console.log('❌ No tokens.txt file found. Create it with one token per line.');
        return [];
    }
}

// Make all alts join the server
async function joinServerWithAlts(guildId, tokens) {
    console.log(`🔥 Making ${tokens.length} alts join server ${guildId}...`);
    
    let joined = 0;
    let failed = 0;
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        try {
            // Create temporary client for joining
            const tempClient = new Client();
            
            await tempClient.login(token);
            console.log(`   ✅ Alt ${i+1} logged in: ${tempClient.user.tag}`);
            
            // Try to join via invite link
            const inviteCode = CONFIG.serverInvite.split('/').pop();
            await tempClient.acceptInvite(inviteCode);
            
            console.log(`   ✅ Alt ${i+1} joined server`);
            joined++;
            
            await tempClient.destroy();
            await delay(2000); // Delay between joins
            
        } catch (error) {
            failed++;
            console.log(`   ❌ Alt ${i+1} failed: ${error.message}`);
        }
    }
    
    console.log(`✅ Join complete: ${joined} joined, ${failed} failed`);
    return joined;
}

// Main client for your command account
const mainClient = new Client();

mainClient.on('ready', () => {
    console.log(`✅ Main account logged in as ${mainClient.user.tag}`);
    console.log(`Type !raidall to make all alts join and flood`);
});

mainClient.on('messageCreate', async (message) => {
    if (message.author.id !== mainClient.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== RAID ALL COMMAND =====
    if (command === 'raidall') {
        await message.channel.send('✅ VAMO ACTIVATED - RAIDING WITH ALL ALTS');
        
        const guild = message.guild;
        const tokens = loadAltTokens();
        
        if (tokens.length === 0) {
            await message.channel.send('❌ No tokens found in tokens.txt');
            return;
        }
        
        await message.channel.send(`🔥 Found ${tokens.length} alt tokens`);
        
        // Step 1: Make all alts join the server
        const joined = await joinServerWithAlts(guild.id, tokens);
        
        if (joined === 0) {
            await message.channel.send('❌ No alts could join. Check tokens.');
            return;
        }
        
        await message.channel.send(`✅ ${joined} alts joined the server!`);
        await delay(3000);
        
        // Step 2: Activate all alts for flooding
        await message.channel.send('🔥 Activating all alts for synchronized flood...');
        
        const activeClients = [];
        const floodPromises = [];
        
        // Log in all alts simultaneously
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            try {
                const altClient = new Client();
                
                altClient.on('ready', () => {
                    console.log(`   ✅ Alt ${i+1} ready: ${altClient.user.tag}`);
                    
                    // Find the target channel in this server
                    const targetGuild = altClient.guilds.cache.get(guild.id);
                    if (targetGuild) {
                        const channel = targetGuild.channels.cache.get(message.channel.id);
                        if (channel && channel.permissionsFor(altClient.user).has('SendMessages')) {
                            activeClients.push(altClient);
                        }
                    }
                });
                
                await altClient.login(token);
                await delay(500); // Stagger logins slightly
                
            } catch (error) {
                console.log(`   ❌ Alt ${i+1} login failed: ${error.message}`);
            }
        }
        
        await delay(5000); // Wait for all alts to fully initialize
        
        await message.channel.send(`🔥 ${activeClients.length} alts ready! Starting synchronized flood...`);
        
        // Step 3: Synchronized flood - ALL alts send message #1 together
        const floodCount = 100;
        const channel = message.channel;
        
        for (let msgNum = 1; msgNum <= floodCount; msgNum++) {
            console.log(`\n📢 Round ${msgNum}/${floodCount} - All alts sending simultaneously...`);
            
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
                } catch (error) {
                    return false;
                }
            });
            
            await Promise.allSettled(roundPromises);
            console.log(`   ✅ Round ${msgNum} complete`);
            
            // Delay between rounds
            await delay(1500);
        }
        
        await message.channel.send(`✅ RAID COMPLETE! ${activeClients.length} alts flooded ${floodCount} messages each!`);
        
        // Cleanup - log out all alts
        for (const altClient of activeClients) {
            try { await altClient.destroy(); } catch (e) {}
        }
    }

    // ===== JOIN ONLY COMMAND =====
    if (command === 'joinalts') {
        const guild = message.guild;
        const tokens = loadAltTokens();
        
        await message.channel.send(`🔥 Making ${tokens.length} alts join...`);
        const joined = await joinServerWithAlts(guild.id, tokens);
        await message.channel.send(`✅ ${joined} alts joined!`);
    }

    // ===== FLOOD WITH EXISTING ALTS =====
    if (command === 'floodalts') {
        await message.channel.send('✅ VAMO ACTIVATED - FLOODING WITH ALTS');
        
        const guild = message.guild;
        const tokens = loadAltTokens();
        
        if (tokens.length === 0) {
            await message.channel.send('❌ No tokens found');
            return;
        }
        
        const activeClients = [];
        const channel = message.channel;
        
        await message.channel.send(`🔥 Logging in ${tokens.length} alts...`);
        
        for (let i = 0; i < tokens.length; i++) {
            try {
                const altClient = new Client();
                
                altClient.on('ready', () => {
                    console.log(`   ✅ Alt ${i+1} ready: ${altClient.user.tag}`);
                    
                    const altGuild = altClient.guilds.cache.get(guild.id);
                    if (altGuild) {
                        activeClients.push(altClient);
                    }
                });
                
                await altClient.login(tokens[i]);
                await delay(500);
                
            } catch (error) {
                console.log(`   ❌ Alt ${i+1} failed: ${error.message}`);
            }
        }
        
        await delay(3000);
        
        if (activeClients.length === 0) {
            await message.channel.send('❌ No alts are in this server! Use !joinalts first.');
            return;
        }
        
        await message.channel.send(`🔥 ${activeClients.length} alts flooding ${floodCount} messages...`);
        
        const floodCount = 100;
        
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
        
        await message.channel.send(`✅ FLOOD COMPLETE! ${activeClients.length} alts sent ${floodCount} messages each!`);
        
        // Cleanup
        for (const altClient of activeClients) {
            try { await altClient.destroy(); } catch (e) {}
        }
    }
    
    // ===== HELP COMMAND =====
    if (command === 'help') {
        await message.channel.send(`**🔥 MULTI-ACCOUNT RAID TOOL**

!raidall - Make all alts JOIN then FLOOD together
!joinalts - Make all alts join the server only
!floodalts - Flood with alts already in server
!help - Show this menu

Create tokens.txt with one token per line
Configure server invite in config.json

✅ VAMO ACTIVATED`);
    }
});

mainClient.login(process.env.MAIN_TOKEN);
