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
    res.send('Spam selfbot is running!');
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`Selfbot is ready in ${client.guilds.cache.size} servers`);
    console.log(`Type !spamall in any channel to flood all channels with 200 messages`);
});

client.on('messageCreate', async (message) => {
    // Only respond to your own messages
    if (message.author.id !== client.user.id) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ===== SPAM ALL EXISTING CHANNELS (200 MESSAGES EACH) =====
    if (command === 'spamall') {
        const guild = message.guild;
        if (!guild) {
            message.reply('This command only works in servers!');
            return;
        }

        // Fixed at 200 messages per channel
        const messagesPerChannel = 200;

        // Send initial confirmation
        await message.reply(`🔥 **MEGA SPAM INITIATED**\nSending **200 messages** to EVERY channel in **${guild.name}**\nThis will take a while...`);

        // Your raid message
        const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

        // Get ALL text-based channels where you can send messages
        const textChannels = guild.channels.cache.filter(c => 
            (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS') && 
            c.permissionsFor(guild.members.me).has('SendMessages')
        );

        console.log(`📊 Found ${textChannels.size} text channels to spam in ${guild.name}`);
        
        let totalSent = 0;
        let totalFailed = 0;
        let channelsCompleted = 0;
        let startTime = Date.now();

        // Loop through each channel
        for (const [channelId, channel] of textChannels) {
            channelsCompleted++;
            console.log(`\n📢 Channel ${channelsCompleted}/${textChannels.size}: #${channel.name}`);
            
            let channelSuccess = 0;
            let channelFailed = 0;

            // Send 200 messages to this channel
            for (let i = 1; i <= messagesPerChannel; i++) {
                try {
                    await channel.send(raidMessage);
                    channelSuccess++;
                    totalSent++;
                    
                    // Log progress every 20 messages
                    if (i % 20 === 0) {
                        console.log(`   Progress: ${i}/200 messages sent in #${channel.name}`);
                    }
                    
                    // Small delay between messages to avoid rate limits
                    await new Promise(resolve => setTimeout(resolve, 600));
                    
                } catch (error) {
                    channelFailed++;
                    totalFailed++;
                    console.log(`   ❌ Failed message ${i} in #${channel.name}: ${error.message}`);
                    
                    // If rate limited, wait longer
                    if (error.message.includes('rate')) {
                        console.log('   ⏳ Rate limited, waiting 5 seconds...');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    } else {
                        // If other error (like permission removed), stop spamming this channel
                        break;
                    }
                }
            }

            console.log(`   ✅ #${channel.name}: ${channelSuccess}/${messagesPerChannel} messages sent`);
            
            // Delay between channels to avoid global rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Calculate time taken
        let endTime = Date.now();
        let minutes = Math.floor((endTime - startTime) / 60000);
        let seconds = Math.floor(((endTime - startTime) % 60000) / 1000);

        // Final report
        const report = `**✅ MEGA SPAM COMPLETE!**

📊 **RESULTS:**
• Server: **${guild.name}**
• Channels hit: **${textChannels.size}**
• Messages per channel: **${messagesPerChannel}**
• Total messages sent: **${totalSent}**
• Failed messages: **${totalFailed}**
• Time taken: **${minutes}m ${seconds}s**

💀 **RAIDED BY VAMBO**`;

        // Try to send report to the original channel (might be buried in spam)
        try {
            await message.channel.send(report);
        } catch (e) {
            console.log('Could not send final report to original channel');
        }

        // Log to console
        console.log('\n' + '='.repeat(50));
        console.log('💀 **MEGA SPAM COMPLETE** 💀');
        console.log(`Server: ${guild.name}`);
        console.log(`Channels: ${textChannels.size}`);
        console.log(`Messages sent: ${totalSent}`);
        console.log(`Failed: ${totalFailed}`);
        console.log(`Time: ${minutes}m ${seconds}s`);
        console.log('='.repeat(50));
    }
});

client.login(TOKEN);
