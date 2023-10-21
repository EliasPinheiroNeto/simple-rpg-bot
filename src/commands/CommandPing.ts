import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import ICommand from "../types/ICommand";

class CommandPing implements ICommand {
    public data = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")

    public execute(interaction: CommandInteraction) {
        interaction.reply("Pong!")
    }
}

export default new CommandPing()