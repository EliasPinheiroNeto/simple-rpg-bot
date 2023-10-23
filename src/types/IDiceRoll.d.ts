export default interface IDiceRoll {
    guildId: string
    channelId: string
    messageId: string
    roll: string,
    rollName: string
    secondChannelId?: string
}