-- CreateEnum
CREATE TYPE "public"."ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."Reservation" ADD COLUMN     "status" "public"."ReservationStatus" NOT NULL DEFAULT 'PENDING';
