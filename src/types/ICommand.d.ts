import { SlashCommandBuilder } from "discord.js";

export default interface ICommand {
    data: SlashCommandBuilder | Omit
    execute(interaction): void
    buttons?: string[]
    executeButtons?(interaction): void
}