import { SlashCommandBuilder } from "discord.js";
import Command from "./Command";

export default new Command({
    builder: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Comando de teste do bot, responde com Pong")
        .toJSON(),

    async execute(interaction) {
        await interaction.reply("Pong!")
    },
})