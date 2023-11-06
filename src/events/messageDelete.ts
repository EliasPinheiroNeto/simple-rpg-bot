import { Message, PartialMessage } from "discord.js"
import prisma from "../database/prisma"

export default async function (message: Message<boolean> | PartialMessage) {
    if (!(message.author?.id == process.env.APPLICATION_ID)) {
        return
    }

    await prisma.message.deleteMany({
        where: {
            id: message.id
        }
    })
}