import 'dotenv/config'
import { REST, Routes } from "discord.js"
import commandHealthBar from './commands/CommandHealthBar'
import commandPing from './commands/CommandPing'
import commandCreateRoll from './commands/CommandCreateRoll'

const commands = [commandPing.builder, commandHealthBar.builder, commandCreateRoll.builder]

const rest = new REST().setToken(process.env.DISCORD_TOKEN)

rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), { body: commands }).then(() => {
    console.log("commands created")
})