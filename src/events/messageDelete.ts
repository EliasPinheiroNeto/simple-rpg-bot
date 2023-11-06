import { Message, PartialMessage } from "discord.js"
import DatabaseController from "../database/DatabaseController"

export default async function (message: Message<boolean> | PartialMessage) {
    if (!(message.author?.id == process.env.APPLICATION_ID)) {
        return
    }

    const db = new DatabaseController()
    await db.deleteMessage(message.id)
}