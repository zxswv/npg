"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { RoomWithReservations } from "@/app/timeline/page"; // 親ページで定義した型をインポート

// 表示する時間割
const timeSlots = [
  "09:10",
  "10:50",
  "13:10",
  "14:50",
  "16:30",
  "18:10",
  "19:50",
];

interface ReservationTimelineProps {
  data: RoomWithReservations[];
}

export function ReservationTimeline({ data }: ReservationTimelineProps) {
  // 予約情報を高速に検索できるようにMapに変換
  const reservationMap = new Map<string, { personName: string }>();
  data.forEach((room) => {
    room.reservations.forEach((res) => {
      const time = new Date(res.slot.startTime).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const key = `${room.id}-${time}`; // 例: "1-09:10"
      reservationMap.set(key, { personName: res.personName });
    });
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] sticky left-0 bg-background z-10">
              部屋
            </TableHead>
            {timeSlots.map((time) => (
              <TableHead key={time} className="text-center">
                {time}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((room) => (
            <TableRow key={room.id}>
              <TableCell className="font-medium sticky left-0 bg-background z-10">
                {room.name}
              </TableCell>
              {timeSlots.map((time) => {
                const key = `${room.id}-${time}`;
                const reservation = reservationMap.get(key);
                return (
                  <TableCell key={key} className="text-center p-2">
                    {reservation ? (
                      <div className="bg-blue-500 text-white rounded-md p-2 text-xs">
                        {reservation.personName}
                      </div>
                    ) : (
                      <div className="bg-gray-100 text-gray-400 rounded-md p-2 text-xs">
                        空き
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
