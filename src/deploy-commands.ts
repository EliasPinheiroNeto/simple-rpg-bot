import 'dotenv/config'
import { REST, Routes } from "discord.js"
import CommandHealthBar from './commands/CommandHealthBar'
import CommandCreateRoll from './commands/CommandCreateRoll'
import CommandPing from './commands/CommandPing'

const commands = [new CommandPing().builder, new CommandHealthBar().builder, new CommandCreateRoll().builder]

const rest = new REST().setToken(process.env.DISCORD_TOKEN)

rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), { body: commands }).then(() => {
    console.log("commands created")
})