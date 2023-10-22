import { ButtonInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js";

export default interface ICommand {
    public data: Omit<SlashCommandBuilder>
    public execute(interaction: CommandInteraction): void

    public buttons?: string[]
    public async executeButtons?(interaction: ButtonInteraction): void

    public commandMessages?: string[]
    public async executeCommandMessages?(interaction): void

    public onDelete?(message): void
}