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
        })
        .addChannelOption(option => {
            return option
                .setName("dice-channel")
                .setDescription("Canal de texto onde o resultado será duplicado")
                .addChannelTypes(ChannelType.GuildText)
        }),

    async execute(interaction): Promise<void> {
        const { options, guildId, channelId, channel } = interaction
        const rollInput = options.get("roll")?.value

        if (!guildId || !channelId || !channel || !rollInput || typeof rollInput != "string") {
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

        const secondChannelId = options.get("dice-channel")?.value as string | undefined
        const rollName = options.get("roll-name")?.value as string
        const fullMessage = `**${rollName}**  _[ ${roll.input} ]_`
        channel.send({
            content: fullMessage,
            components: [row]
        }).then(mensage => {
            const db = new DiceRollsController()
            db.insert({ guildId, channelId, messageId: mensage.id, roll: roll.input, rollName, fullMessage, secondChannelId })
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
        const diceRoll = db.get(message.id)
        if (!diceRoll) {
            return
        }

        switch (customId) {
            case "roll":
                const roll = new Roller(diceRoll.roll)

                try {
                    interaction.deferUpdate()
                    await message.edit({
                        content: `${diceRoll.fullMessage} \nÚltimo resultado: \n${roll.expressionResults.join('\n')}`,
                    })

                    if (diceRoll.secondChannelId) {
                        const secondChannel = await interaction.guild?.channels.fetch(diceRoll.secondChannelId)
                        if (!secondChannel || !secondChannel.isTextBased()) {
                            return
                        }

                        const nickname = member instanceof GuildMember ? member.nickname ? member.nickname : user.displayName : user.displayName
                        await secondChannel.send({
                            content: `.\n**${nickname}** rolou ${diceRoll.roll} \n${roll.expressionResults.join('\n')}`
                        })
                    }
                } catch (err) {
                    console.log(err)
                }
                break
        }
    },

    async onDelete(messageId): Promise<boolean> {
        const db = new DiceRollsController()
        return db.delete(messageId)
    },

    async verifyData(clientGuilds) {
        const db = new DiceRollsController
        const data = db.getData()

        const newData = data.filter(bar => {
            const guild = clientGuilds.cache.get(bar.guildId)
            if (!guild) {
                return false
            }

            const channel = guild.channels.cache.get(bar.channelId)
            if (!channel || !channel.isTextBased()) {
                return false
            }

            const message = channel.messages.cache.get(bar.messageId)
            if (!message) {
                return false
            }

            return true
        })

        db.setData(newData)
    },
})