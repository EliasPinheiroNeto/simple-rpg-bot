import { Interaction } from "discord.js";

import ICommand from "../types/ICommand";
import CommandHealthBar from "../commands/CommandHealthBar";
import CommandCreateRoll from "../commands/CommandCreateRoll";
import CommandPing from "../commands/CommandPing";

const commands: ICommand[] = [new CommandHealthBar(), new CommandCreateRoll(), new CommandPing()]

export default function (interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
        commands.some(command => {
            if (interaction.commandName == command.name) {
                command.execute(interaction)
                return true
            }

            return false
        })
    }

    if (interaction.isButton()) {
        commands.forEach(async command => {
            await command.buttons?.(interaction)
        })
    }

    if (interaction.isModalSubmit()) {
        commands.some(async command => {
            return await command.modals?.(interaction)
        })
    }
}