import 'dotenv/config'
import { Client, InteractionType } from 'discord.js'

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })

import commandHealthBar from './commands/CommandHealthBar'
import commandPing from './commands/CommandPing'
import ICommand from './types/ICommand'

const commands: ICommand[] = [
    commandHealthBar,
    commandPing
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

        const command = commands.find(c => {
            if (!c.buttons) {
                return false
            }

            return c.buttons.includes(customId)
        })

        if (!command || !command.executeButtons) {
            return
        }

        command.executeButtons(interaction)
    }
})

client.login(process.env.DISCORD_TOKEN)