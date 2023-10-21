import { CommandInteraction, SlashCommandBuilder } from "discord.js";

class CommandPing {
    public data = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!")

    public execute(interaction: CommandInteraction) {
        interaction.reply("Pong!")
    }
}

export default new CommandPing()