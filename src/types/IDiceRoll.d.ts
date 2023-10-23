export default interface IDiceRoll {
    guildId: string
    channelId: string
    messageId: string
    fullMessage: string
    roll: string
    rollName: string
    secondChannelId?: string
}