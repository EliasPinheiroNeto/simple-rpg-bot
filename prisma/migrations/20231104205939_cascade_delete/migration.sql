-- DropForeignKey
ALTER TABLE `dice_rolls` DROP FOREIGN KEY `dice_rolls_messageId_fkey`;

-- DropForeignKey
ALTER TABLE `health_bars` DROP FOREIGN KEY `health_bars_messageId_fkey`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_channelId_fkey`;

-- DropForeignKey
ALTER TABLE `text_channels` DROP FOREIGN KEY `text_channels_guildId_fkey`;

-- AddForeignKey
ALTER TABLE `text_channels` ADD CONSTRAINT `text_channels_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `guilds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `text_channels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `health_bars` ADD CONSTRAINT `health_bars_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dice_rolls` ADD CONSTRAINT `dice_rolls_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
