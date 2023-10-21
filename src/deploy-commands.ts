import 'dotenv/config'
import { REST, Routes, SlashCommandBuilder } from "discord.js"
import commandHealthBar from './commands/CommandHealthBar'
import commandPing from './commands/CommandPing'

const commands = [
    commandHealthBar.data,
    commandPing.data
]

const rest = new REST().setToken(process.env.DISCORD_TOKEN)

rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), { body: commands }).then(() => {
    console.log("commands created")
})