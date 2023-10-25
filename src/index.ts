import 'dotenv/config'
import { Client } from 'discord.js'

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })

import commandHealthBar from './commands/CommandHealthBar'
import commandPing from './commands/CommandPing'
import commandCreateRoll from './commands/CommandCreateRoll'
import ICommand from './types/ICommand'

const commands: ICommand[] = [
    commandHealthBar,
    commandPing,
    commandCreateRoll
]

client.once("ready", c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on('interactionCreate', interaction => {
    if (interaction.isCommand()) {
        const command = commands.find((c) => {
            return c.data.name == interaction.commandName
        })

        if (!command) {
            return
        }

        command.execute(interaction)
        return
    }


    if (interaction.isButton()) {
        commands.forEach(command => {
            command.executeButtons?.(interaction)
        })
    }
})

client.on("messageCreate", message => {
    if (!message.reference || message.mentions.repliedUser?.id != process.env.APPLICATION_ID || !message.content.startsWith('-')) {
        return
    }

    const command = commands.find(c => {
        if (!c.commandMessages) {
            return false
        }

        const commandMessage = message.content.split(' ')[0]
        return c.commandMessages.includes(commandMessage)
    })

    if (!command || !command.executeCommandMessages) {
        return
    }

    command.executeCommandMessages(message)
})

client.on("messageDelete", message => {
    if (message.author?.id != process.env.APPLICATION_ID) {
        return
    }

    commands.forEach(c => {
        if (c.onDelete) {
            c.onDelete(message)
        }
    })
})

client.login(process.env.DISCORD_TOKEN)