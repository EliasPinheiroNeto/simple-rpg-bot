import { Client } from "discord.js"
import DatabaseController from "../database/DatabaseController"

export default function (client: Client<true>) {
    console.log(`Ready! Logged in as ${client.user.tag}`)

    const db = new DatabaseController()
    db.checkData(client.guilds.cache)
}