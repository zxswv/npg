/*
  Warnings:

  - You are about to drop the column `numberOfPeople` on the `Reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Reservation" DROP COLUMN "numberOfPeople",
ADD COLUMN     "numberOfUsers" INTEGER;
