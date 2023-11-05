import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, GuildMember, SlashCommandBuilder } from "discord.js";

import DiceRollsController from "../database/DiceRollsController";
import Command from "./Command";
import Roller from "../utils/Roller";

export default new Command({
    builder: new SlashCommandBuilder()
        .setName("create-roll")
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
        }),

    async execute(interaction): Promise<void> {
        const { options, channel } = interaction
        const rollInput = options.get("roll")?.value

        if (!channel || !rollInput || typeof rollInput != "string") {
            interaction.reply({ content: "Ocorreu algum erro", ephemeral: true })
            return
        }

        const roll = new Roller(rollInput)

        if (!roll.validinput) {
            interaction.reply({ content: "Sintaxe invalida", ephemeral: true })
            return
        }

        const buttonRoll = new ButtonBuilder()
            .setCustomId("roll")
            .setLabel("🎲")
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttonRoll)

        const outputChannelId = options.get("dice-channel")?.value as string | undefined
        const rollDescription = options.get("roll-description")?.value as string | undefined
        const rollName = options.get("roll-name")?.value as string

        channel.send({
            content: `**${rollName}**  _[ ${roll.input} ]_ ${rollDescription ? `\n_${rollDescription}_` : ''}`,
            components: [row]
        }).then(message => {
            const db = new DiceRollsController()
            db.insert({
                messageId: message.id, roll: roll.input, rollName, outputChannelId, rollDescription
            }, message)
        })


        await interaction.reply({
            content: "Criando rolagem",
            ephemeral: true,
        })

        interaction.deleteReply()
    },

    async buttons(interaction): Promise<void> {
        if (!["roll"].includes(interaction.customId)) {
            return
        }

        const { customId, message, member, user } = interaction
        const db = new DiceRollsController()
        const diceRoll = await db.get(message.id)
        if (!diceRoll) {
            return
        }

        switch (customId) {
            case "roll":
                const roll = new Roller(diceRoll.roll)

                try {
                    interaction.deferUpdate()
                    await message.edit({
                        content: ` ** ${diceRoll.rollName} ** _[${diceRoll.roll} ]_ 
                        ${diceRoll.rollDescription ? `_${diceRoll.rollDescription}_` : ''} 
                        Último resultado: \n${roll.expressionResults.join('\n')}`,
                    })

                    if (diceRoll.outputChannelId) {
                        const secondChannel = await interaction.guild?.channels.fetch(diceRoll.outputChannelId)
                        if (!secondChannel || !secondChannel.isTextBased()) {
                            return
                        }

                        const nickname = member instanceof GuildMember ? member.nickname ? member.nickname : user.displayName : user.displayName
                        await secondChannel.send({
                            content: `**${nickname}** rolou ${diceRoll.roll} \n${roll.expressionResults.join('\n')}`
                        })
                    }
                } catch (err) {
                    console.log(err)
                }
                break
        }
    },

    async onDelete(messageId) {
        const db = new DiceRollsController()
        return await db.delete(messageId)
    },

    async verifyData(clientGuilds) {
        const db = new DiceRollsController()

        db.checkData(clientGuilds.cache)
    },
})