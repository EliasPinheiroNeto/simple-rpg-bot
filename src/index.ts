import 'dotenv/config'
import { Client } from 'discord.js'

import Command from './commands/Command'
import commandPing from './commands/CommandPing'
import commandHealthBar from './commands/CommandHealthBar'
import commandCreateRoll from './commands/CommandCreateRoll'

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })
const commands: Command[] = [commandPing, commandHealthBar, commandCreateRoll]

client.once("ready", c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on('interactionCreate', interaction => {
    if (interaction.isCommand()) {
        commands.forEach(command => {
            interaction.commandName == command.builder.name ? command.execute(interaction) : ''
        })
    }


    if (interaction.isButton()) {
        commands.forEach(command => {
            command.buttons?.(interaction)
        })
    }
})

// client.on("messageCreate", message => {
//     if (!message.reference || message.mentions.repliedUser?.id != process.env.APPLICATION_ID || !message.content.startsWith('-')) {
//         return
//     }

//     const command = commands.find(c => {
//         if (!c.commandMessages) {
//             return false
//         }

//         const commandMessage = message.content.split(' ')[0]
//         return c.commandMessages.includes(commandMessage)
//     })

//     if (!command || !command.executeCommandMessages) {
//         return
//     }

//     command.executeCommandMessages(message)
// })

client.on("messageDelete", message => {
    if (message.author?.id != process.env.APPLICATION_ID) {
        return
    }

    // commands.forEach(c => {
    //     if (c.onDelete) {
    //         c.onDelete(message)
    //     }
    // })
})

client.login(process.env.DISCORD_TOKEN)