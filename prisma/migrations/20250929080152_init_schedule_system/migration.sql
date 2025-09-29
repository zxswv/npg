/*
  Warnings:

  - A unique constraint covering the columns `[slotId,roomId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[date]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reservation_slotId_roomId_key" ON "public"."Reservation"("slotId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_date_key" ON "public"."Schedule"("date");
