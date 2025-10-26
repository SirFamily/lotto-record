/*
  Warnings:

  - Made the column `number` on table `closenumber` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `closenumber` MODIFY `number` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `item` MODIFY `number` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `limitnumber` MODIFY `number` VARCHAR(191) NOT NULL;
