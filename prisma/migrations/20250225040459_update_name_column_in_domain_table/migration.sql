/*
  Warnings:

  - You are about to drop the column `main_chanel` on the `domain` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `domain` DROP COLUMN `main_chanel`,
    ADD COLUMN `main_channel` VARCHAR(191) NULL;
