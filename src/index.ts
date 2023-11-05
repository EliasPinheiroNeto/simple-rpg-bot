import 'dotenv/config'
import { Client } from 'discord.js'

import ICommand from './types/ICommand'
import CommandHealthBar from './commands/CommandHealthBar'
import CommandCreateRoll from './commands/CommandCreateRoll'
import CommandPing from './commands/CommandPing'
import prisma from './database/prisma'

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })
const commands: ICommand[] = [new CommandHealthBar(), new CommandCreateRoll(), new CommandPing()]

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
        commands.forEach(async command => {
            await command.buttons?.(interaction)
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

    await prisma.message.deleteMany({
        where: {
            id: message.id
        }
    })
})

client.login(process.env.DISCORD_TOKEN)