import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, GuildMember, SlashCommandBuilder } from "discord.js";
import Roll from 'roll'

import DiceRollsController from "../database/DiceRollsController";
import Command from "./Command";

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
        const roller = new Roll()
        const rollInput = options.get("roll")?.value

        if (!guildId || !channelId || !channel || !rollInput || typeof rollInput != "string") {
            interaction.reply({ content: "Ocorreu algum erro", ephemeral: true })
            return
        }

        const roll = rollInput.replace(/\s/g, "").toLowerCase()

        if (!roller.validate(roll.replace("#", ""))) {
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
        const fullMessage = `**${rollName}**  _[ ${roll} ]_`
        channel.send({
            content: fullMessage,
            components: [row]
        }).then(mensage => {
            const db = new DiceRollsController()
            db.insert({ guildId, channelId, messageId: mensage.id, roll, rollName, fullMessage, secondChannelId })
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
                const rolls = diceRoll.roll.replace("#", "").split(/([\+\-]{1}[1-9]+)(?!d)/g).filter(s => s != '')
                const finalMessage: string[] = []

                if (diceRoll.roll.includes("#")) {
                    const times = Number.parseInt(rolls[0][0])
                    rolls[0] = rolls[0].replace(times.toString(), '1')

                    for (let i = 0; i < times; i++) {
                        finalMessage.push(...makeRolls(rolls))
                    }
                } else {
                    finalMessage.push(...makeRolls(rolls))
                }

                try {
                    interaction.deferUpdate()
                    await message.edit({
                        content: `${diceRoll.fullMessage} \nÚltimo resultado: \n${finalMessage.join("")}`,
                    })

                    if (diceRoll.secondChannelId) {
                        const secondChannel = await interaction.guild?.channels.fetch(diceRoll.secondChannelId)
                        if (!secondChannel || !secondChannel.isTextBased()) {
                            return
                        }

                        const nickname = member instanceof GuildMember ? member.nickname ? member.nickname : user.displayName : user.displayName
                        await secondChannel.send({
                            content: `.\n**${nickname}** rolou ${diceRoll.roll} \n${finalMessage.join("")}`
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
})

function makeRolls(rolls: string[]) {
    const roller = new Roll()
    let result = 0;
    const string: string[] = []

    rolls.forEach(r => {
        if (r.includes("d")) {
            const rResult = roller.roll(r.replace(/^[\-\+]/g, ""))
            result += rResult.result

            string.push(`${/^[\-\+]/g.test(r) ? r[0] : ''} [${rResult.rolled}] ${r.replace(/^[\-\+]/g, "")} `)
            return
        }

        const rBonus = Number.parseInt(r)
        result += rBonus
        string.push(`${/^[\-\+]/g.test(r) ? r[0] : ''} ${Math.abs(Number.parseInt(r))} `)
    })

    string.unshift(`\` ${result} \` ⟵ `)
    string.push('\n')

    return string
}