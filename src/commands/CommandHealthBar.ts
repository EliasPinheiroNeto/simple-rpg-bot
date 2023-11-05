import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
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

    async execute(interaction) {
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

        const config = new ButtonBuilder()
            .setCustomId('config')
            .setLabel("⚙️")
            .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(damage5, damage1, heal1, heal5, config)

        interaction.channel?.send({
            content: generateHealthMessage(healthMax),
            components: [row],
        }).then((message) => {
            const db = new HealthBarsController()
            db.insert({
                healthMax,
                healthPoints: healthMax,
                messageId: message.id,
            }, message)
        })

        await interaction.reply("Criando barra")
        await interaction.deleteReply()
        return
    },

    async buttons(interaction: ButtonInteraction) {
        if (!['heal1', 'heal5', 'damage1', 'damage5', 'config'].includes(interaction.customId)) {
            return
        }

        const { customId } = interaction

        const db = new HealthBarsController()
        const healthBar = await db.get(interaction.message.id)
        if (!healthBar) {
            return
        }

        switch (customId) {
            case `heal1`:
                healthBar.healthPoints += 1
                break;

            case `heal5`:
                healthBar.healthPoints += 5
                break;

            case `damage1`:
                healthBar.healthPoints -= 1
                break;

            case `damage5`:
                healthBar.healthPoints -= 5
                break;

            case 'config':
                const setMax = new TextInputBuilder()
                    .setCustomId('setMax')
                    .setLabel("Novo maximo da barra de vida")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("número")
                    .setRequired(true)

                const row = new ActionRowBuilder<TextInputBuilder>()
                    .setComponents(setMax)

                const modal = new ModalBuilder()
                    .setTitle("Configurar barra de vida")
                    .setCustomId('healthBarModal')
                    .setComponents(row)

                interaction.showModal(modal)
                return
        }

        await interaction.message.edit(generateHealthMessage(healthBar.healthMax, healthBar.healthPoints))
        await db.update(healthBar)
        try {
            await interaction.deferUpdate()
        } catch (err) {
            console.log(err)
            return
        }
    },

    async modals(interaction) {
        interaction.deferUpdate()

        const { customId, message, fields } = interaction

        if (customId != "healthBarModal" || !message?.id) {
            return
        }

        const newMax = fields.fields.get('setMax')?.value
        if (!newMax) {
            return
        }

        const newNumber = Number.parseInt(newMax)
        if (isNaN(newNumber)) {
            return
        }

        const db = new HealthBarsController()
        const healthBar = await db.get(message.id)
        if (!healthBar) {
            return
        }

        healthBar.healthMax = newNumber
        await db.update(healthBar)

        interaction.message?.edit(generateHealthMessage(healthBar.healthMax, healthBar.healthPoints))
    },

    async onDelete(messageId) {
        const db = new HealthBarsController()
        return await db.delete(messageId)
    },

    async verifyData(clientGuilds) {
        const db = new HealthBarsController()
        await db.checkData(clientGuilds.cache)
    },
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