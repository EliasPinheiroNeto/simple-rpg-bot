import { Collection, Guild, GuildBasedChannel, Message, TextBasedChannel } from "discord.js";

import DatabaseController from "./DatabaseController";
import IDiceRoll from "../types/IDiceRoll";

export default class DiceRollsController extends DatabaseController {
    constructor() {
        super()
    }

    public async insert(diceRoll: IDiceRoll, message: Message) {

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

        const m = await this.prisma.message.create({
            data: {
                id: message.id,
                channelId: message.channelId
            }
        })

        // Criando o DiceRoll no banco com os relacionamentos
        const d = await this.prisma.diceRoll.create({
            data: diceRoll
        })

        console.log(m, d)
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
            const deleteMessage = channels.some(async channel => {
                if (!channel.isTextBased()) {
                    return false
                }

                const message = await channel.messages.fetch(dbMessage.id)
                if (message) {
                    return true
                }
                return false
            })

            if (deleteMessage) {
                await this.prisma.message.delete({
                    where: {
                        id: dbMessage.id
                    }
                })
            }
        })
    }
}