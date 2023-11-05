import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChannelType, ChatInputCommandInteraction, GuildMember, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js";

import DiceRollsController from "../database/DiceRollsController";
import Roller from "../utils/Roller";
import ICommand from "../types/ICommand";

export default class CommandCreateRoll implements ICommand {
    public name: string;
    public builder: RESTPostAPIChatInputApplicationCommandsJSONBody;

    constructor() {
        this.name = "create-roll"

        this.builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription("Cria uma nova rolagem de dados")
            .addStringOption(option => {
                return option
                    .setName("roll-name")
                    .setDescription("Ação da rolagem de dados, exemplo: Dano da Magia x, Resistência de destreza")
                    .setRequired(true)
            }).addStringOption(option => {
                return option
                    .setName("roll")
                    .setDescription("Rolagem de dados")
                    .setRequired(true)
            }).addStringOption(option => {
                return option
                    .setName("roll-description")
                    .setDescription("Detalhes sobre a rolagem")
            }).addChannelOption(option => {
                return option
                    .setName("dice-channel")
                    .setDescription("Canal de texto onde o resultado será duplicado")
                    .addChannelTypes(ChannelType.GuildText)
            }).toJSON()
    }

    public async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        interaction.reply({
            content: "Criando rolagem",
            ephemeral: true,
        })

        const { options, channel } = interaction
        const rollInput = options.getString("roll", true)

        if (!channel) {
            interaction.editReply({ content: "Algo deu errado" })
            return
        }

        const roll = new Roller(rollInput)

        if (!roll.validinput) {
            interaction.editReply({ content: "Sintaxe invalida" })
            return
        }

        const buttonRoll = new ButtonBuilder()
            .setCustomId("roll-r")
            .setLabel("🎲")
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttonRoll)

        const outputChannelId = options.getChannel("dice-channel")?.id
        const rollDescription = options.getString("roll-description")
        const rollName = options.getString("roll-name", true)

        try {
            const message = await channel.send({
                content: `**${rollName}**  _[ ${roll.input} ]_ ${rollDescription ? `\n_${rollDescription}_` : ''}`,
                components: [row]
            })

            const db = new DiceRollsController()
            await db.insert({
                rollName,
                roll: roll.input,
                messageId: message.id,
                outputChannelId,
                rollDescription: rollDescription ? rollDescription : undefined
            }, message)

        } catch (err) {
            interaction.editReply({ content: "Algo deu errado" })
            console.log(err)
            return
        }

        interaction.deleteReply()
    }

    public async buttons(interaction: ButtonInteraction<CacheType>): Promise<boolean> {
        if (!interaction.customId.startsWith("roll")) {
            return false
        }

        const { message, member, user } = interaction
        const db = new DiceRollsController()
        const diceRoll = await db.get(message.id)
        if (!diceRoll) {
            interaction.reply({
                content: "Erro de banco de dados",
                ephemeral: true
            })
            return true
        }

        switch (interaction.customId) {
            case "roll-r":
                const roll = new Roller(diceRoll.roll)

                try {
                    interaction.deferUpdate()
                    await message.edit({
                        content: ` ** ${diceRoll.rollName} ** _[${diceRoll.roll} ]_ \n` +
                            `${diceRoll.rollDescription ? `_${diceRoll.rollDescription}_ \n` : ''}\n` +
                            `Último resultado: \n${roll.expressionResults.join('\n')}`,
                    })

                    if (diceRoll.outputChannelId) {
                        const secondChannel = await interaction.guild?.channels.fetch(diceRoll.outputChannelId)
                        if (!secondChannel || !secondChannel.isTextBased()) {
                            return true
                        }

                        const nickname = member instanceof GuildMember ? member.nickname ? member.nickname : user.displayName : user.displayName
                        secondChannel.send({
                            content: `**${nickname}** rolou ${diceRoll.roll} \n${roll.expressionResults.join('\n')}`
                        })
                    }
                } catch (err) {
                    interaction.reply({ content: "Algo deu errado", ephemeral: true })
                    console.log(err)
                    return true
                }
                break
        }

        return true
    }
}