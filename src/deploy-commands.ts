import 'dotenv/config'
import { REST, Routes, SlashCommandBuilder } from "discord.js"
import command from './commands/health-bar'

const commands = [
    command.data
]

const rest = new REST().setToken(process.env.DISCORD_TOKEN)

rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), { body: commands }).then(() => {
    console.log("commands created")
})