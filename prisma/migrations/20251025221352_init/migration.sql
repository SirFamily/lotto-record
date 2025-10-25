-- CreateTable
CREATE TABLE `item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('twoNumberTop', 'twoNumberButton', 'threeNumberTop', 'threeNumberButton') NOT NULL,
    `number` INTEGER NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `iswon` BOOLEAN NULL DEFAULT false,
    `billId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `closenumber` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('twoNumberTop', 'twoNumberButton', 'threeNumberTop', 'threeNumberButton') NOT NULL,
    `number` INTEGER NULL,
    `text` VARCHAR(191) NOT NULL,
    `dateEnd` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DECIMAL(10, 2) NOT NULL,
    `state` BOOLEAN NOT NULL DEFAULT true,
    `remark` VARCHAR(191) NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateEnd` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `limitnumber` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('twoNumberTop', 'twoNumberButton', 'threeNumberTop', 'threeNumberButton') NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `amountlimit` DECIMAL(10, 2) NOT NULL,
    `used` DECIMAL(10, 2) NOT NULL,
    `dateEnd` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('twoNumberTop', 'twoNumberButton', 'threeNumberTop', 'threeNumberButton') NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `item_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `bill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `closenumber` ADD CONSTRAINT `closenumber_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bill` ADD CONSTRAINT `bill_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `limitnumber` ADD CONSTRAINT `limitnumber_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rate` ADD CONSTRAINT `rate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
