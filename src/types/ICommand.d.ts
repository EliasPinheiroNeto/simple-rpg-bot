import { SlashCommandBuilder } from "discord.js";

export default interface ICommand {
    data: SlashCommandBuilder
    execute(interaction): void
}