import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ButtonInteraction } from "discord.js";
import HealthBarsController from "../database/HealthBarsController";
import Command from "./Command";


export default new Command({
    builder: new SlashCommandBuilder()
        .setName("create-health-bar")
        .setDescription("Creates a simple health bar")
        .addNumberOption(option => {
            return option
                .setName("hp")
                .setDescription("the full caracter's health")
                .setMinValue(1)
                .setRequired(true)
        }),

    // public commandMessages = ['-setMax']

    async execute(interaction) {
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
            content: generateHealthMessage(healthMax),
            components: [row],
        }).then((message) => {
            const db = new HealthBarsController()
            db.createHealthBar(healthMax, message.id)
        })

        await interaction.reply("Criando barra")
        await interaction.deleteReply()
        return
    },

    async buttons(interaction: ButtonInteraction) {
        if (!['commandHealth-heal1', 'commandHealth-heal5',
            'commandHealth-damage1', 'commandHealth-damage5'].includes(interaction.customId)) {
            return
        }

        const { customId } = interaction

        const db = new HealthBarsController()
        const healthBar = db.getHealthBar(interaction.message.id)
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

        await interaction.message.edit(generateHealthMessage(healthBar.healthMax, healthBar.healthPoints))
        db.updateHealthBar(healthBar)
        try {
            await interaction.deferUpdate()
        } catch (err) {
            console.log(err)
            return
        }
    }

    // public async executeCommandMessages(message: Message) {
    //     const { content, reference } = message

    //     if (!reference || !reference.messageId) {
    //         return
    //     }

    //     const db = new HealthBarsController
    //         ()
    //     const healthBar = db.getHealthBar(reference.messageId)
    //     if (!healthBar) {
    //         return
    //     }

    //     if (content.startsWith('-setMax ')) {
    //         const number = Number.parseInt(content.replace('-setMax ', ''))
    //         if (isNaN(number)) {
    //             return
    //         }

    //         healthBar.healthMax = number
    //     }

    //     const referenceMessage = await message.channel.messages.fetch(reference.messageId)
    //     await referenceMessage.edit(generateHealthMessage(healthBar.healthMax, healthBar.healthPoints))
    //     db.updateHealthBar(healthBar)
    //     message.delete()
    // }
})

function generateHealthMessage(healthMax: number, healthPoints: number = healthMax) {
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