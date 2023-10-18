import dotenv from 'dotenv'
import { Client, Events } from 'discord.js'

dotenv.config()
const TOKEN = process.env.DISCORD_TOKEN


const client = new Client({ intents: ["Guilds", "GuildMessages"] })

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) {
        return
    }

    const { commandName } = interaction;
    if (commandName == 'ping') {
        interaction.reply('Pong')
        return
    }
})

client.login(TOKEN)