import { ButtonInteraction, CommandInteraction, ModalSubmitInteraction } from "discord.js"

export default interface ICommand {
    public name: string
    public builder: RESTPostAPIChatInputApplicationCommandsJSONBody
    public execute(interaction: ChatInputCommandInteraction): Promise<void>

    public buttons?(interaction: ButtonInteraction): Promise<boolean>
    public modals?(interaction: ModalSubmitInteraction): Promise<boolean>
    public onDelete?(messageId: string): Promise<boolean>
}