import { Collection, Guild, Message } from "discord.js";

import DatabaseController from "./DatabaseController";
import IDiceRoll from "../types/IDiceRoll";

export default class DiceRollsController extends DatabaseController {
    constructor() {
        super()
    }

    public async insert(diceRoll: IDiceRoll, message: Message) {
        if (!message.guildId) {
            console.log("Alguma coisa acontedeu de errado")
            return
        }

        const dbChannel = await this.prisma.textChannel.findUnique({
            where: {
                id: message.channelId
            }
        })

        // Cria o canal da mensagem no banco se necessario
        if (!dbChannel) {
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

        if (diceRoll.outputChannelId) {
            const dbOutputChannel = await this.prisma.textChannel.findUnique({
                where: {
                    id: diceRoll.outputChannelId
                }
            })

            if (!dbOutputChannel) {
                await this.prisma.textChannel.create({
                    data: {
                        id: diceRoll.outputChannelId,
                        guildId: message.guildId
                    }
                })
            }
        }

        // Criando o DiceRoll no banco com os relacionamentos
        await this.prisma.diceRoll.create({
            data: diceRoll
        })
    }

    public async get(messageId: string) {
        const diceRoll = await this.prisma.diceRoll.findUnique({
            where: {
                messageId
            }
        })

        return diceRoll
    }

    public async delete(messageId: string) {
        const message = await this.prisma.message.findUnique({
            where: {
                id: messageId
            }
        })

        if (!message) {
            return false
        }

        await this.prisma.message.delete({
            where: {
                id: messageId
            }
        })

        return true
    }

    public async checkData(clientGuilds: Collection<string, Guild>) {
        const guildsId = clientGuilds.map(guild => guild.id)
        await this.prisma.guild.deleteMany({
            where: {
                id: {
                    notIn: guildsId
                }
            }
        })

        const channels = clientGuilds.map((guild) => {
            return guild.channels.cache.filter(channel => {
                if (channel.isTextBased()) {
                    return true
                }
                return false
            })
        }).reduce(a => a)

        const channelsId = channels.map(a => a.id)

        await this.prisma.textChannel.deleteMany({
            where: {
                id: {
                    notIn: channelsId
                }
            }
        })

        const dbMessages = await this.prisma.message.findMany()

        dbMessages.forEach(async dbMessage => {
            const channel = channels.find(c => c.id == dbMessage.channelId)
            if (!channel || !channel.isTextBased()) {
                await this.prisma.message.delete({
                    where: {
                        id: dbMessage.id
                    }
                })

                return
            }

            const message = await channel.messages.fetch(dbMessage.id).then(m => {
                return m
            }).catch(() => {
                return undefined
            })

            if (!message) {
                await this.prisma.message.delete({
                    where: {
                        id: dbMessage.id
                    }
                })

                return
            }
        })
    }
}