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
            .setDMPermission(false)
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

    public async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        interaction.reply({
            content: "Criando rolagem",
            ephemeral: true,
        })

        if (!interaction.channel) {
            interaction.editReply("Não é possivel executar o comando no canal atual")
            return
        }

        const rollInput = interaction.options.getString("roll", true)
        const roll = new Roller(rollInput)
        if (!roll.validinput) {
            interaction.editReply("Sintaxe invalida")
            return
        }

        const outputChannelId = interaction.options.getChannel("dice-channel")?.id
        const rollDescription = interaction.options.getString("roll-description")
        const rollName = interaction.options.getString("roll-name", true)

        try {
            const message = await interaction.channel.send({
                content: `**${rollName}**  _[ ${roll.input} ]_ \n` +
                    `_${rollDescription || ''}_`,
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(new ButtonBuilder({
                            customId: "roll-r",
                            label: "🎲",
                            style: ButtonStyle.Primary
                        }))
                ]
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
            interaction.editReply("Algo deu errado")
            console.log(err)
            return
        }

        interaction.deleteReply()
    }

    public async buttons(interaction: ButtonInteraction<"cached">): Promise<boolean> {
        if (!interaction.customId.startsWith("roll")) {
            return false
        }

        const db = new DiceRollsController()
        const diceRoll = await db.get(interaction.message.id)
        if (!diceRoll) {
            interaction.reply("Erro no banco de dados")
            return true
        }

        switch (interaction.customId) {
            case "roll-r":
                const roll = new Roller(diceRoll.roll)

                await interaction.message.edit({
                    content: ` **${diceRoll.rollName}** _[${diceRoll.roll} ]_ \n` +
                        `${diceRoll?.rollDescription ? diceRoll.rollDescription + "\n" : ''}\n` +
                        `Último resultado: \n${roll.expressionResults.join('\n')}`,
                })

                interaction.deferUpdate()

                const secondChannel = interaction.guild.channels.cache.find(c => c.id == diceRoll.outputChannelId)
                if (!secondChannel || !secondChannel.isTextBased()) {
                    break
                }

                const name = interaction.member.nickname || interaction.member.displayName
                secondChannel.send({
                    content: `**${name}** rolou ${diceRoll.roll} \n` +
                        `${roll.expressionResults.join('\n')}`
                })
                break
        }

        return true
    }
}