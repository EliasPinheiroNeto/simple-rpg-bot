import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, RESTPostAPIChatInputApplicationCommandsJSONBody, ChatInputCommandInteraction, ModalSubmitInteraction } from "discord.js";

import HealthBarsController from "../database/HealthBarsController";
import ICommand from "../types/ICommand";


export default class CommandHealthBar implements ICommand {
    public name: string;
    public builder: RESTPostAPIChatInputApplicationCommandsJSONBody;

    constructor() {
        this.name = "create-health-bar"

        this.builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription("Creates a simple health bar")
            .setDMPermission(false)
            .addNumberOption(option => {
                return option
                    .setName("hp")
                    .setDescription("the full caracter's health")
                    .setMinValue(1)
                    .setRequired(true)
            }).toJSON()
    }

    public async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void> {
        interaction.reply({
            content: "Criando barra de vida",
            ephemeral: true
        })

        if (!interaction.channel) {
            interaction.editReply("Não foi possivel executar o comando neste canal")
            return
        }

        const buttonComponents = [
            { id: "health-d5", label: "-5", style: ButtonStyle.Danger },
            { id: "health-d1", label: "-1", style: ButtonStyle.Danger },
            { id: "health-h1", label: "+1", style: ButtonStyle.Success },
            { id: "health-h5", label: "+5", style: ButtonStyle.Success },
            { id: "health-config", label: "⚙️", style: ButtonStyle.Secondary }
        ].map(b => {
            return new ButtonBuilder()
                .setCustomId(b.id)
                .setLabel(b.label)
                .setStyle(b.style)
        })

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttonComponents)

        const healthMax = interaction.options.getNumber("hp", true)

        const message = await interaction.channel.send({
            content: this.generateHealthMessage(healthMax),
            components: [row],
        })

        const db = new HealthBarsController()
        db.insert({
            healthMax,
            healthPoints: healthMax,
            messageId: message.id,
        }, message)

        interaction.deleteReply()
    }

    public async buttons(interaction: ButtonInteraction<"cached">): Promise<boolean> {
        if (!interaction.customId.startsWith('health')) {
            return false
        }

        const db = new HealthBarsController()
        const healthBar = await db.get(interaction.message.id)
        if (!healthBar) {
            interaction.reply({
                ephemeral: true,
                content: "Erro de banco de dados"
            })
            return true
        }

        switch (interaction.customId) {
            case `health-h1`:
                healthBar.healthPoints += 1
                break;

            case `health-h5`:
                healthBar.healthPoints += 5
                break;

            case `health-d1`:
                healthBar.healthPoints -= 1
                break;

            case `health-d5`:
                healthBar.healthPoints -= 5
                break;

            case 'health-config':
                const modal = new ModalBuilder({
                    title: "Configurar barra de vida",
                    customId: "health-modal",
                    components: [
                        new ActionRowBuilder<TextInputBuilder>({
                            components: [
                                new TextInputBuilder({
                                    custom_id: "health-hmax",
                                    label: "Novo máximo da barra de vida",
                                    style: TextInputStyle.Short,
                                    placeholder: "Número",
                                    required: true
                                })
                            ]
                        })
                    ]
                })

                interaction.showModal(modal)
                return true
        }

        try {
            interaction.message.edit(this.generateHealthMessage(healthBar.healthMax, healthBar.healthPoints))
            await db.update(healthBar)
            interaction.deferUpdate()
        } catch (err) {
            console.log(err)
            interaction.reply({
                ephemeral: true,
                content: "Algo deu errado"
            })
        }
        return true
    }

    public async modals(interaction: ModalSubmitInteraction<"cached">): Promise<boolean> {
        if (!interaction.customId.startsWith("health")) {
            return false
        }

        interaction.deferUpdate()

        if (!interaction.message?.id) {
            interaction.reply({
                ephemeral: true,
                content: "Algo deu errado"
            })
            return true
        }

        const newMax = interaction.fields.getTextInputValue("health-hmax")

        const newMaxNumber = Number.parseInt(newMax)
        if (isNaN(newMaxNumber)) {
            return true
        }

        // Teoricamente estou pedindo muito do banco de dados, preciso mudar para atualizar direto

        const db = new HealthBarsController()
        const healthBar = await db.get(interaction.message.id)
        if (!healthBar) {
            interaction.reply({
                ephemeral: true,
                content: "Erro de banco de dados"
            })
            return true
        }

        healthBar.healthMax = newMaxNumber
        await db.update(healthBar)

        interaction.message.edit(this.generateHealthMessage(healthBar.healthMax, healthBar.healthPoints))
        return true
    }


    private generateHealthMessage(healthMax: number, healthPoints: number = healthMax): string {
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