-- CreateTable
CREATE TABLE `guilds` (
    `id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `text_channels` (
    `id` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `health_bars` (
    `messageId` VARCHAR(191) NOT NULL,
    `healthMax` INTEGER NOT NULL,
    `healthPoints` INTEGER NOT NULL,

    UNIQUE INDEX `health_bars_messageId_key`(`messageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dice_rolls` (
    `messageId` VARCHAR(191) NOT NULL,
    `roll` VARCHAR(191) NOT NULL,
    `rollName` VARCHAR(191) NOT NULL,
    `rollDescription` VARCHAR(191) NOT NULL,
    `outputChannelId` VARCHAR(191) NULL,

    UNIQUE INDEX `dice_rolls_messageId_key`(`messageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `text_channels` ADD CONSTRAINT `text_channels_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `guilds`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `text_channels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `health_bars` ADD CONSTRAINT `health_bars_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dice_rolls` ADD CONSTRAINT `dice_rolls_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dice_rolls` ADD CONSTRAINT `dice_rolls_outputChannelId_fkey` FOREIGN KEY (`outputChannelId`) REFERENCES `text_channels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
