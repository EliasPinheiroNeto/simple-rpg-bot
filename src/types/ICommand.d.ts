import { SlashCommandBuilder } from "discord.js";

export default interface ICommand {
    data: Omit<SlashCommandBuilder>
    execute(interaction): void
    buttons?: string[]
    executeButtons?(interaction): void
}