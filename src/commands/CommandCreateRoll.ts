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


        const rollName = options.get("roll-name")?.value as string
        const fullMessage = `**${rollName}**  _[ ${roll} ]_`
        channel.send({
            content: fullMessage,
            components: [row]
        }).then(mensage => {
            const db = new DiceRollsController()
            db.insert({ guildId, channelId, messageId: mensage.id, roll, rollName, fullMessage })
        })


        await interaction.reply({
            content: "Criando rolagem",
            ephemeral: true,
        })

        interaction.deleteReply()
    }

    public executeButtons(interaction: ButtonInteraction): void {
        const { customId, message } = interaction
        const db = new DiceRollsController()
        const diceRoll = db.get(message.id)
        if (!diceRoll) {
            return
        }

        switch (customId) {
            case "roll":
                const rolls = diceRoll.roll.replace("#", "").split(/([\+\-]{1}[1-9]+)(?!d)/g).filter(s => s != '')

                const finalMessage = []

                if (diceRoll.roll.includes("#")) {
                    const times = Number.parseInt(rolls[0][0])
                    rolls[0] = rolls[0].replace(times.toString(), '1')

                    for (let i = 0; i < times; i++) {
                        finalMessage.push(...this.makeRolls(rolls))
                    }
                } else {
                    finalMessage.push(...this.makeRolls(rolls))
                }

                message.edit(`${diceRoll.fullMessage} \n${finalMessage.join("")}`).then(() => {
                    interaction.deferUpdate()
                    setTimeout(() => {
                        message.edit(diceRoll.fullMessage)
                    }, 5000)
                })
                break
        }
    }

    private makeRolls(rolls: string[]) {
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
}

export default new CommandCreateRoll()