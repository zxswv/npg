// npg/prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const timeSlots = [
  "09:10",
  "10:50",
  "13:10",
  "14:50",
  "16:30",
  "18:10",
  "19:50",
];

const classDurationMinutes = 90;

// 型エラー回避例
async function main() {
  console.log("Seeding started...");

  // 既存データの削除
  await prisma.$transaction([
    prisma.reservation.deleteMany(),
    prisma.slot.deleteMany(),
    prisma.schedule.deleteMany(),
    prisma.room.deleteMany(),
  ]);
  console.log("Cleaned up existing data.");

  // 部屋データの作成
  const roomsToCreate = [
    { number: "B101(L)", name: "ホール", capacity: 100 },
    { number: "B104①②③", name: "REC室", capacity: 20 },
    { number: "B112", name: "レクチャー&スタジオ", capacity: 24 },
    { number: "B113", name: "トレーニングR", capacity: 15 },
    { number: "901", name: " レクチャー", capacity: 24 },
    { number: "1001", name: "レクチャー", capacity: 36 },
    { number: "1002", name: "CATIA", capacity: 10 },
    { number: "1003", name: "レクチャー", capacity: 0 },
    { number: "1004", name: "レクチャー", capacity: 0 },
    { number: "1005", name: "レクチャー", capacity: 24 },
    { number: "1006", name: "レクチャー", capacity: 24 },
    { number: "1007", name: "レクチャー", capacity: 24 },
    { number: "1008", name: "レクチャー", capacity: 17 },
    { number: "1009", name: "MAC", capacity: 18 },
    { number: "1010", name: "win", capacity: 14 },
    { number: "1011", name: "音響(防音)", capacity: 20 },
    { number: "1012", name: "win", capacity: 18 },
    { number: "1013", name: "win(CG)", capacity: 19 },
    { number: "1014", name: "win", capacity: 17 },
    { number: "1101", name: "レクチャー", capacity: 40 },
    { number: "1102", name: "レクチャー", capacity: 40 },
    { number: "1103", name: "レクチャー", capacity: 20 },
    { number: "1104", name: "レクチャー", capacity: 21 },
    { number: "1105", name: "レクチャー", capacity: 12 },
    { number: "1106", name: "メイク", capacity: 10 },
    { number: "1107", name: "メイク", capacity: 10 },
    { number: "1108", name: "デザイン工房", capacity: 20 },
    { number: "1109", name: "工作室", capacity: 30 },
    { number: "1110", name: "動画CR", capacity: 20 },
    { number: "1111", name: "レクチャー", capacity: 24 },
    { number: "1112", name: "レクチャー", capacity: 30 },
    { number: "1113", name: "レクチャー", capacity: 24 },
    { number: "1201", name: "スタジオ", capacity: 40 },
    { number: "1202(L)", name: "レクチャー", capacity: 49 },
    { number: "1204(L)", name: "e-Sports", capacity: 10 },
    { number: "1206", name: "スタジオ", capacity: 30 },
    { number: "1207", name: "スタジオ", capacity: 30 },
  ];

  // 部屋データを一括で作成
  await prisma.room.createMany({
    data: roomsToCreate,
  });
  console.log("Created rooms.");

  // 14日分のスケジュールとスロットを作成
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    const dateString = currentDate.toISOString().split("T")[0]; // "YYYY-MM-DD"形式の文字列
    const scheduleDate = new Date(`${dateString}T00:00:00.000Z`); // UTCの午前0時に設定

    const schedule = await prisma.schedule.create({
      data: {
        date: scheduleDate,
        slots: {
          create: timeSlots.map((time) => {
            const [hour, minute] = time.split(":").map(Number);
            const startTime = new Date(scheduleDate);
            startTime.setUTCHours(hour, minute);
            const endTime = new Date(startTime);
            endTime.setMinutes(startTime.getMinutes() + classDurationMinutes);
            return { startTime, endTime };
          }),
        },
      },
    });
    console.log(`Created schedule and slots for ${dateString}`);
    console.log(`Created schedule and slots for ${dateString}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
