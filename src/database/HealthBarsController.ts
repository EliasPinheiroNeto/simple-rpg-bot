import { Collection, Guild, Message } from 'discord.js';

import DatabaseController from './DatabaseController';
import IHealthBar from '../types/IHealthBar';

export default class HealthBarsController extends DatabaseController {
    constructor() {
        super()
    }

    public async insert(healthBar: IHealthBar, message: Message) {
        const dbChannel = await this.prisma.textChannel.findUnique({
            where: {
                id: message.channelId
            }
        })

        // Cria o canal da mensagem no banco se necessario
        if (!dbChannel) {
            if (!message.guildId) {
                console.log("Alguma coisa acontedeu de errado")
                return
            }

            const dbGuild = await this.prisma.guild.findUnique({
                where: {
                    id: message.guildId
                }
            })

            // Cria a Guilda no banco se necessario
            if (!dbGuild) {
                await this.prisma.guild.create({
                    data: {
                        id: message.guildId
                    }
                })
            }

            await this.prisma.textChannel.create({
                data: {
                    id: message.channelId,
                    guildId: message.guildId
                }
            })
        }

        await this.prisma.message.create({
            data: {
                id: message.id,
                channelId: message.channelId
            }
        })

        // Criando o healthBar no banco com os relacionamentos
        await this.prisma.healthBar.create({
            data: healthBar
        })
    }

    public async get(messageId: string) {
        const healthBar = await this.prisma.healthBar.findUnique({
            where: {
                messageId
            }
        })

        return healthBar
    }

    public async update(healthBar: IHealthBar) {
        await this.prisma.healthBar.update({
            where: {
                messageId: healthBar.messageId
            },
            data: healthBar
        })
    }
}