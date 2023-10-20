import 'dotenv/config'
import fs from 'fs'
import { Client, CommandInteraction } from 'discord.js'

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })

import command from './commands/health-bar-creation'

client.once("ready", c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName == command.data.name) {
            command.execute(interaction)
        }
        return
    }
})

client.login(process.env.DISCORD_TOKEN)