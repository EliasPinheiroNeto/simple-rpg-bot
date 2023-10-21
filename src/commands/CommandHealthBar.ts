import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, CommandInteraction, ButtonInteraction } from "discord.js";
import DatabaseController from "../database/DatabaseController";
import ICommand from "../types/ICommand";

class CommandHealthBar implements ICommand {
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


    public buttons = ['commandHealth-heal1', 'commandHealth-heal5', 'commandHealth-damage1', 'commandHealth-damage5']

    public execute(interaction: CommandInteraction) {
        const healthMax = interaction.options.get('hp')?.value as number | undefined
        if (!healthMax) {
            return
        }

        const heal1 = new ButtonBuilder()
            .setCustomId(`commandHealth-heal1`)
            .setLabel("+1")
            .setStyle(ButtonStyle.Success)

        const heal5 = new ButtonBuilder()
            .setCustomId(`commandHealth-heal5`)
            .setLabel("+5")
            .setStyle(ButtonStyle.Success)

        const damage1 = new ButtonBuilder()
            .setCustomId(`commandHealth-damage1`)
            .setLabel("-1")
            .setStyle(ButtonStyle.Danger)

        const damage5 = new ButtonBuilder()
            .setCustomId(`commandHealth-damage5`)
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

    public async executeButtons(interaction: ButtonInteraction) {
        const { customId } = interaction

        const db = new DatabaseController()
        const healthBar = db.getHealthBar(Number.parseInt(interaction.message.id))
        if (!healthBar) {
            return
        }

        switch (customId) {
            case `commandHealth-heal1`:
                healthBar.healthPoints += 1
                break;

            case `commandHealth-heal5`:
                healthBar.healthPoints += 5
                break;

            case `commandHealth-damage1`:
                healthBar.healthPoints -= 1
                break;

            case `commandHealth-damage5`:
                healthBar.healthPoints -= 5
                break;
        }

        await interaction.message.edit(this.generateHealthMessage(healthBar.healthMax, healthBar.healthPoints))
        db.updateHealthBar(healthBar)
        try {
            await interaction.deferUpdate()
        } catch (err) {
            console.log(err)
            return
        }
    }

    private generateHealthMessage(healthMax: number, healthPoints: number = healthMax) {
        const percent = (healthPoints / healthMax) * 10
        const healthMessage = []
        for (let i = 1; i <= 10; i++) {
            if (i == 1 && healthPoints >= 1) {
                healthMessage.push("🟩")
                continue
            }

            if (10 - i < percent - 10) {
                healthMessage.push("🟨")
                continue
            }

            if (i <= percent) {
                healthMessage.push("🟩")
                continue
            }

            healthMessage.push("🟥")
        }

        return `Pontos de vida: [${healthPoints} / ${healthMax}] \n${healthMessage.join("")}`
    }
}

export default new CommandHealthBar()