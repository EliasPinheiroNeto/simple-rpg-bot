import { ButtonInteraction, CommandInteraction, GuildManager, Message, ModalSubmitInteraction, SlashCommandBuilder } from "discord.js";

export default class Command {
    // O Omit retorna o tipo escolhido, retirando os atributos ou métodos escolhidos
    // Como não estou modificando o builder em mais nenhum lugar, posso codar assim
    // porém talvez exista uma maneira melhor de salvar o builder, talvez apenas como um objeto padrão sem métodos
    // que é o usado na api do discord
    public builder: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
    public async execute(interaction: CommandInteraction): Promise<void> { }
    public async buttons?(interaction: ButtonInteraction): Promise<void> { }
    public async modals?(interaction: ModalSubmitInteraction): Promise<void> { }
    public async onDelete?(messageId: string): Promise<boolean> { return false }
    public async verifyData?(clientGuilds: GuildManager): Promise<void> { }

    constructor(command: Command) {
        this.builder = command.builder
        this.execute = command.execute
        this.buttons = command.buttons
        this.modals = command.modals
        this.onDelete = command.onDelete
        this.verifyData = command.verifyData
    }
}