import 'dotenv/config'
import { Client } from 'discord.js'

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })

import command from './commands/health-bar'
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
        const db = new DatabaseController()

        const healthBar = db.getHealthBar(Number.parseInt(interaction.message.id))
        if (!healthBar) {
            return
        }

        switch (customId) {
            case 'damage1':
                healthBar.healthPoints -= 1
                break

            case 'damage5':
                healthBar.healthPoints -= 5
                break

            case 'heal1':
                healthBar.healthPoints += 1
                break

            case 'heal5':
                healthBar.healthPoints += 5
                break
        }

        db.updateHealthBar(healthBar)

        interaction.message.edit("" + healthBar.healthPoints)
        interaction.deferUpdate()
    }
})

client.login(process.env.DISCORD_TOKEN)