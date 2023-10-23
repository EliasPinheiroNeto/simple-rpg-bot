import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, CommandInteraction, SlashCommandBuilder, time } from "discord.js";
import Roll from 'roll'

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
        })
    public buttons = ["roll"];

    public async execute(interaction: CommandInteraction): Promise<void> {
        const { options, guildId, channelId, channel } = interaction
        const roller = new Roll()

        if (!guildId || !channelId || !channel) {
            interaction.reply({ content: "Ocorreu algum erro", ephemeral: true })
            return
        }

        let rollString = options.get("roll")?.value
        if (!rollString || typeof rollString != "string") {
            interaction.reply({ content: "Ocorreu algum erro", ephemeral: true })
            return
        }

        rollString = rollString.split(" ").join("")

        if (!roller.validate(rollString.replace("#", ""))) {
            interaction.reply({ content: "Sintaxe invalida", ephemeral: true })
            return
        }

        const buttonRoll = new ButtonBuilder()
            .setCustomId("roll")
            .setLabel("🎲")
            .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttonRoll)

        channel.send({
            content: `**${options.get("roll-name", true)?.value}**  _[ ${rollString} ]_`,
            components: [row]
        }).then(m => {
            const db = new DiceRollsController()
            db.insert({ guildId, channelId, messageId: m.id, roll: `${rollString}` })
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
                const db = new DiceRollsController()
                const diceRoll = db.get(message.id)
                if (!diceRoll) {
                    return
                }

                const roller = new Roll()

                const rolls = diceRoll.roll.replace("#", "").split(/([\+\-]{1}[1-9]+)(?!d)/g).filter(s => s != '')

                let result = 0;
                let stringMessage = [`Rolagem **Ataque** _[${diceRoll.roll}_]\n`]

                if (diceRoll.roll.includes("#")) {
                    const times = Number.parseInt(rolls[0][0])
                    rolls[0] = rolls[0].replace(times.toString(), '1')
                    for (let i = 0; i < times; i++) {
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
                        stringMessage.push(...string, '\n')
                        result = 0
                    }

                } else {
                    rolls.forEach(r => {
                        if (r.includes("d")) {
                            const rResult = roller.roll(r.replace(/^[\-\+]/g, ""))
                            result += rResult.result

                            stringMessage.push(`${/^[\-\+]/g.test(r) ? r[0] : ''} [${rResult.rolled}] ${r.replace(/^[\-\+]/g, "")} `)
                            return
                        }

                        const rBonus = Number.parseInt(r)
                        result += rBonus
                        stringMessage.push(`${/^[\-\+]/g.test(r) ? r[0] : ''} ${Math.abs(Number.parseInt(r))} `)
                    })

                    stringMessage = [
                        ...stringMessage.slice(0, 1),
                        (`\` ${result} \` ⟵ `),
                        ...stringMessage.slice(1)
                    ]

                }

                interaction.channel?.send(stringMessage.join(""))
                break
        }

        interaction.deferUpdate()
    }
}

export default new CommandCreateRoll()