import 'dotenv/config'
import { Client } from 'discord.js'

import ICommand from './types/ICommand'
import CommandHealthBar from './commands/CommandHealthBar'
// import commandPing from './commands/CommandPing'
// import commandCreateRoll from './commands/CommandCreateRoll'

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })
const commands: ICommand[] = [new CommandHealthBar()]

client.once("ready", c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)

    // commands.forEach(command => {
    //     command.verifyData?.(client.guilds)
    // })
})

client.on('interactionCreate', interaction => {
    if (interaction.isChatInputCommand()) {
        commands.some(command => {
            if (interaction.commandName == command.name) {
                command.execute(interaction)
                return true
            }

            return false
        })
    }

    if (interaction.isButton()) {
        commands.some(async command => {
            return await command.buttons?.(interaction)
        })
    }

    if (interaction.isModalSubmit()) {
        commands.some(async command => {
            return await command.modals?.(interaction)
        })
    }
})

client.on('messageDelete', async message => {
    if (!(message.author?.id == client.user?.id)) {
        return
    }
    commands.forEach(async command => {
        await command.onDelete?.(message.id)
    })
})

client.login(process.env.DISCORD_TOKEN)