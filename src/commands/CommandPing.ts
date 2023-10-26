import { SlashCommandBuilder } from "discord.js";
import Command from "./Command";

export default new Command({
    builder: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Reply with Pong!"),

    async execute(interaction) {
        interaction.reply("Pong!")
    },
})