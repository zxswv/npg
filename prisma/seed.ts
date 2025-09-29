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
  const room_1101 = await prisma.room.create({
    data: { name: "1101", capacity: 10 },
  });
  const room_1102 = await prisma.room.create({
    data: { name: "1102", capacity: 10 },
  });
  const room_1103 = await prisma.room.create({
    data: { name: "1103", capacity: 10 },
  });
  const room_1104 = await prisma.room.create({
    data: { name: "1104", capacity: 10 },
  });
  const room_1105 = await prisma.room.create({
    data: { name: "1105", capacity: 10 },
  });
  const room_1106 = await prisma.room.create({
    data: { name: "1106", capacity: 10 },
  });
  const room_1107 = await prisma.room.create({
    data: { name: "1107", capacity: 10 },
  });
  const room_1108 = await prisma.room.create({
    data: { name: "1108", capacity: 10 },
  });
  const room_1109 = await prisma.room.create({
    data: { name: "1109", capacity: 10 },
  });
  const room_1110 = await prisma.room.create({
    data: { name: "1110", capacity: 10 },
  });
  const room_1111 = await prisma.room.create({
    data: { name: "1111", capacity: 10 },
  });
  const room_1112 = await prisma.room.create({
    data: { name: "1112", capacity: 10 },
  });
  const room_1113 = await prisma.room.create({
    data: { name: "1113", capacity: 10 },
  });
  const room_1001 = await prisma.room.create({
    data: { name: "1001", capacity: 10 },
  });
  const room_1002 = await prisma.room.create({
    data: { name: "1002", capacity: 10 },
  });
  const room_1003 = await prisma.room.create({
    data: { name: "1003", capacity: 10 },
  });
  const room_1004 = await prisma.room.create({
    data: { name: "1004", capacity: 10 },
  });
  const room_1005 = await prisma.room.create({
    data: { name: "1005", capacity: 10 },
  });
  const room_1006 = await prisma.room.create({
    data: { name: "1006", capacity: 10 },
  });
  const room_1007 = await prisma.room.create({
    data: { name: "1007", capacity: 10 },
  });
  const room_1008 = await prisma.room.create({
    data: { name: "1008", capacity: 10 },
  });
  const room_1009 = await prisma.room.create({
    data: { name: "1009", capacity: 10 },
  });
  const room_1010 = await prisma.room.create({
    data: { name: "1010", capacity: 10 },
  });
  const room_1011 = await prisma.room.create({
    data: { name: "1011", capacity: 10 },
  });
  const room_1012 = await prisma.room.create({
    data: { name: "1012", capacity: 10 },
  });
  const room_1013 = await prisma.room.create({
    data: { name: "1013", capacity: 10 },
  });
  const room_1014 = await prisma.room.create({
    data: { name: "1014", capacity: 10 },
  });
  console.log("Created rooms.");

  // 14日分のスケジュールとスロットを作成
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    currentDate.setHours(0, 0, 0, 0); // 時間を00:00に設定

    const schedule = await prisma.schedule.create({
      data: {
        date: currentDate,
      },
    });

    const slotsToCreate = timeSlots.map((time) => {
      const [hour, minute] = time.split(":").map(Number);

      const startTime = new Date(currentDate);
      startTime.setUTCHours(hour, minute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + classDurationMinutes);

      return {
        scheduleId: schedule.id,
        startTime: startTime,
        endTime: endTime,
      };
    });

    await prisma.slot.createMany({
      data: slotsToCreate,
    });

    console.log(
      `Created schedule and slots for ${
        currentDate.toISOString().split("T")[0]
      }`
    );
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
