import dotenv from 'dotenv'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, Events } from 'discord.js'

dotenv.config()
const TOKEN = process.env.DISCORD_TOKEN


const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] })

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on("messageCreate", async message => {
    if (message.content == "oi") {
        message.reply("Oi meu mano")
        return;
    }

    if (message.content == "button") {
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel("Confirmar")
            .setStyle(ButtonStyle.Success)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(confirm)


        message.channel.send({
            content: "Tem certeza que quer me dar seu cu?",
            components: [row]
        })
    }
})

client.on('interactionCreate', async interaction => {
    if (interaction.isButton() && interaction.customId == "confirm") {
        // interaction.channel?.send("Apertou o botão, iihh ala")
        console.log(interaction.message.edit("Ueeeeeeepa"))
        interaction.deferUpdate()
        return
    }
    console.log(interaction);

    if (!interaction.isCommand()) {
        return
    }

    const { commandName } = interaction;
    if (commandName == 'ping') {
        interaction.reply('Pong')
        return
    }
})

client.login(TOKEN)