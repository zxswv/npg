-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,               -- ID
    "date" TIMESTAMP(3) NOT NULL,       -- スケジュールの日付
    "time" TEXT NOT NULL,               -- スケジュールの時間
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- 作成日時

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")                   -- 主キー制約
);
