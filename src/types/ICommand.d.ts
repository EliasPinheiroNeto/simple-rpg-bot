import { SlashCommandBuilder } from "discord.js";

export default interface ICommand {
    data: Omit<SlashCommandBuilder>
    execute(interaction): void

    buttons?: string[]
    async executeButtons?(interaction): void

    commandMessages?: string[]
    async executeCommandMessages?(interaction): void

    onDelete?(message): void
}