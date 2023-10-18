import 'dotenv/config'
import { REST, Routes, SlashCommandBuilder } from "discord.js"

const commands = [
    new SlashCommandBuilder()
        .setName("sapato")
        .setDescription("replies with pong")
]

const rest = new REST().setToken(process.env.DISCORD_TOKEN)

rest.put(Routes.applicationCommands("1163641363926093888"), { body: commands }).then(() => {
    console.log("deu")
})