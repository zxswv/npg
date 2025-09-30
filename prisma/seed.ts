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
    { name: "1101", capacity: 10 },
    { name: "1102", capacity: 10 },
    { name: "1103", capacity: 10 },
    { name: "1104", capacity: 10 },
    { name: "1105", capacity: 10 },
    { name: "1106", capacity: 10 },
    { name: "1107", capacity: 10 },
    { name: "1108", capacity: 10 },
    { name: "1109", capacity: 10 },
    { name: "1110", capacity: 10 },
    { name: "1111", capacity: 10 },
    { name: "1112", capacity: 10 },
    { name: "1113", capacity: 10 },
    { name: "1001", capacity: 10 },
    { name: "1002", capacity: 10 },
    { name: "1003", capacity: 10 },
    { name: "1004", capacity: 10 },
    { name: "1005", capacity: 10 },
    { name: "1006", capacity: 10 },
    { name: "1007", capacity: 10 },
    { name: "1008", capacity: 10 },
    { name: "1009", capacity: 10 },
    { name: "1010", capacity: 10 },
    { name: "1011", capacity: 10 },
    { name: "1012", capacity: 10 },
    { name: "1013", capacity: 10 },
    { name: "1014", capacity: 10 },
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
