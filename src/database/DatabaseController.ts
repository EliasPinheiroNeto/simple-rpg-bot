import { PrismaClient } from '@prisma/client'
import prisma from './prisma'
import { Collection, Guild } from 'discord.js'

export default class DatabaseController {
    protected prisma: PrismaClient
    constructor() {
        this.prisma = prisma
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

        //Aparentemente não ta filtrando os canias de texto
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