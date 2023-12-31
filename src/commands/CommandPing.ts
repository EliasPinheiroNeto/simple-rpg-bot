import { CacheType, ChatInputCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js";
import ICommand from "../types/ICommand";

export default class implements ICommand {
    public name: string;
    public builder: RESTPostAPIChatInputApplicationCommandsJSONBody;

    constructor() {
        this.name = "ping"

        this.builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription("Comando de teste do bot, responde com Pong")
            .setDMPermission(false)
            .toJSON()
    }

    public async execute(interaction: ChatInputCommandInteraction<"cached">) {
        await interaction.reply("Pong!")
    }
}