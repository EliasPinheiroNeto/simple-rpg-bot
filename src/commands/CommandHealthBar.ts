import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, CommandInteraction } from "discord.js";
import DatabaseController from "../database/DatabaseController";

class CommandHealthBar {
    public data = new SlashCommandBuilder()
        .setName("health-bar")
        .setDescription("Creates a simple health bar")
        .addNumberOption(option => {
            return option
                .setName("hp")
                .setDescription("the full caracter's health")
                .setMinValue(1)
                .setRequired(true)
        })

    public execute(interaction: CommandInteraction) {
        const healthMax = interaction.options.get('hp')?.value as number | undefined
        if (!healthMax) {
            return
        }

        const heal1 = new ButtonBuilder()
            .setCustomId(`heal1`)
            .setLabel("+1")
            .setStyle(ButtonStyle.Success)

        const heal5 = new ButtonBuilder()
            .setCustomId(`heal5`)
            .setLabel("+5")
            .setStyle(ButtonStyle.Success)

        const damage1 = new ButtonBuilder()
            .setCustomId(`damage1`)
            .setLabel("-1")
            .setStyle(ButtonStyle.Danger)

        const damage5 = new ButtonBuilder()
            .setCustomId(`damage5`)
            .setLabel("-5")
            .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(damage5, damage1, heal1, heal5)

        interaction.channel?.send({
            content: this.generateHealthMessage(healthMax),
            components: [row],
        }).then((message) => {
            const db = new DatabaseController()
            db.createHealthBar(healthMax, Number.parseInt(message.id))
        })

        interaction.reply("Criando barra de vida")
        interaction.deleteReply()
        return
    }

    private generateHealthMessage(healthMax: number, healthPoints: number = healthMax) {
        const percent = (healthPoints / healthMax) * 10
        const healthMessage = []
        for (let i = 1; i <= 10; i++) {
            if (i <= percent || (i == 1 && healthPoints >= 1)) {
                healthMessage.push("🟩")
            } else {
                healthMessage.push("🟥")
            }
        }

        return `Pontos de vida: [${healthPoints} / ${healthMax}] \n${healthMessage.join("")}`
    }
}

export default new CommandHealthBar()