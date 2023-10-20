import 'dotenv/config'
import { Client } from 'discord.js'

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })

import command from './commands/health-bar-creation'
import DatabaseController from './database/DatabaseController'

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

    if (interaction.isButton()) {
        const { customId } = interaction

        if (customId == 'damage1') {
            const db = new DatabaseController()
            const healthBar = db.getHealthBar(Number.parseInt(interaction.message.id))
            healthBar.healthPoints -= 1
            db.updateHealthBar(Number.parseInt(interaction.message.id), healthBar.healthPoints)

            interaction.message.edit("" + healthBar.healthPoints)
        }
    }
})

client.login(process.env.DISCORD_TOKEN)