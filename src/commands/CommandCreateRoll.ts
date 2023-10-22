import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import ICommand from "../types/ICommand";
import DiceRollsController from "../database/DiceRollsController";

class CommandCreateRoll implements ICommand {
    public data = new SlashCommandBuilder()
        .setName("create-roll")
        .setDescription("Cria uma nova rolagem de dados")
        .addStringOption(option => {
            return option
                .setName("roll-name")
                .setDescription("Ação da rolagem de dados, exemplo: Dano da Magia x, Resistência de destreza")
                .setRequired(true)
        }).addNumberOption(option => {
            return option
                .setName("dice-sides")
                .setDescription("Número de lados do dado")
                .setRequired(true)
                .setMinValue(1)
        })
        .addChannelOption(option => {
            return option
                .setName("dice-channel")
                .setDescription("Canal de texto onde o resultado será duplicado")
                .addChannelTypes(ChannelType.GuildText)
        })
    public buttons = ["roll"];

    public async execute(interaction: CommandInteraction): Promise<void> {
        const { options, guildId, channelId, channel } = interaction

        if (!guildId || !channelId || !channel) {
            interaction.reply({ content: "Ocorreu algum erro", ephemeral: true })
            return
        }


        const buttonRoll = new ButtonBuilder()
            .setCustomId("roll")
            .setLabel("🎲")
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttonRoll)


        channel.send({
            content: `**${options.get("roll-name")?.value}**  _[ 1d${options.get("dice-sides")?.value} ]_`,
            components: [row]
        }).then(m => {
            const db = new DiceRollsController()
            db.insert({ guildId, channelId, messageId: m.id, roll: `1d${options.get("dice-sides")?.value}` })
        })


        await interaction.reply({
            content: "Criando rolagem",
            ephemeral: true,
        })

        interaction.deleteReply()
    }

    public executeButtons(interaction: ButtonInteraction): void {
        const { customId, message } = interaction

        switch (customId) {
            case "roll":
                const roll = Math.floor(Math.random() * 20 + 7)
                interaction.message.edit(interaction.message.content + "\n> Resultado dos dados: ${roll}")
                // interaction.channel?.send(`Resultado dos dados: ${roll}`)
                break
        }

        interaction.deferUpdate()
    }
}

export default new CommandCreateRoll()