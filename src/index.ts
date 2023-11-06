import 'dotenv/config'
import { Client } from 'discord.js'

import interactionCreate from './events/interactionCreate'
import messageDelete from './events/messageDelete'
import ready from './events/ready'

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })

client.once("ready", ready)
client.on('interactionCreate', interactionCreate)
client.on('messageDelete', messageDelete)

client.login(process.env.DISCORD_TOKEN)