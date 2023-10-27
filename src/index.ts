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

    if (interaction.isModalSubmit()) {
        commands.forEach(command => {
            command.modals?.(interaction)
        })
    }
})

client.on('messageDelete', message => {
    if (!(message.author?.id == client.user?.id)) {
        return
    }

    commands.forEach(command => {
        command.onDelete?.(message.id)
    })
})

client.login(process.env.DISCORD_TOKEN)