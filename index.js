// ===== SPAM ALL EXISTING CHANNELS =====
if (command === 'spamall') {
    const guild = message.guild;
    if (!guild) {
        message.reply('This command only works in servers!');
        return;
    }

    // Optional: set number of messages per channel (default 5)
    let messagesPerChannel = parseInt(args[0]) || 5;
    if (messagesPerChannel > 20) messagesPerChannel = 20; // safety limit

    message.reply(`🔥 Spamming **ALL channels** with ${messagesPerChannel} messages each...`);

    const raidMessage = `@everyone @here **RAIDED BY VAMBO**

### NEVER SCAM AGAIN SON😂
            😯KICK ROCKS😯
https://media.tenor.com/hWmpAzAlsm4AAAAM/ishowspeed-scary-speed.gif`;

    // Get all text channels (including threads? – we'll stick to guild text channels)
    const textChannels = guild.channels.cache.filter(c => 
        c.type === 'GUILD_TEXT' && c.permissionsFor(guild.members.me).has('SendMessages')
    );

    console.log(`Found ${textChannels.size} text channels to spam.`);

    let totalSent = 0;
    let failedChannels = 0;

    for (const [id, channel] of textChannels) {
        console.log(`Spamming #${channel.name}...`);
        for (let i = 0; i < messagesPerChannel; i++) {
            try {
                await channel.send(raidMessage);
                totalSent++;
                console.log(`✅ Sent message ${i+1}/${messagesPerChannel} in #${channel.name}`);
                // Small delay between messages to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                console.log(`❌ Failed in #${channel.name}: ${error.message}`);
                failedChannels++;
                break; // stop spamming this channel if it fails
            }
        }
        // Delay between channels to avoid global rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    message.reply(`✅ **Spam complete!** Sent ${totalSent} messages across ${textChannels.size - failedChannels} channels.`);
}
