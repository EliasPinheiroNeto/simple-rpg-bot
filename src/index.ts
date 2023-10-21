import 'dotenv/config'
import { Client, InteractionType } from 'discord.js'

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })

import commandHealthBar from './commands/CommandHealthBar'
import DatabaseController from './database/DatabaseController'

const commands = [
    commandHealthBar,
]

client.once("ready", c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;

        const command = commands.find((c) => {
            return c.data.name == commandName
        })

        if (!command) {
            return
        }

        command.execute(interaction)
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

        const percent = (healthBar.healthPoints / healthBar.healthMax) * 10
        const string = []
        for (let i = 1; i <= 10; i++) {
            if (i <= percent || (i == 1 && healthBar.healthPoints >= 1)) {
                string.push("🟩")
            } else {
                string.push("🟥")
            }
        }

        await interaction.message.edit(`Pontos de vida: [${healthBar.healthPoints} / ${healthBar.healthMax}] \n${string.join("")}`)
        db.updateHealthBar(healthBar)
        try {
            await interaction.deferUpdate()
        } catch (err) {
            console.log(err)
            return
        }
    }
})

client.login(process.env.DISCORD_TOKEN)