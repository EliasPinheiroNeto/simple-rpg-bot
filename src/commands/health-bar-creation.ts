import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, CommandInteraction } from "discord.js";
import ICommand from "../types/commands";
import DatabaseController from "../database/DatabaseController";

export default {
    data: new SlashCommandBuilder()
        .setName("health-bar")
        .setDescription("Creates a simple health bar")
        .addNumberOption(option => {
            return option
                .setName("hp")
                .setDescription("the full caracter's health")
                .setRequired(true)

        }),

    execute(interaction: CommandInteraction) {
        const healthMax = interaction.options.get('hp')?.value as number | undefined
        const { guildId, channelId } = interaction

        if (!healthMax || !guildId || !channelId) {
            return
        }


        const heal1 = new ButtonBuilder()
            .setCustomId(`heal1`)
            .setLabel("+1")
            .setStyle(ButtonStyle.Success)

        const damage1 = new ButtonBuilder()
            .setCustomId(`damage1`)
            .setLabel("-1")
            .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(damage1, heal1)


        interaction.channel?.send({
            content: healthMax.toString(),
            components: [row]
        }).then((m) => {
            const db = new DatabaseController()
            db.createHealthBar(healthMax, Number.parseInt(m.id))
        })

        interaction.reply("Criando barra de vida")
        interaction.deleteReply()
        return
    },
} as ICommand