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
import { SelectedSlot } from "@/app/timeline/page";

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
  selectedSlots: Map<string, SelectedSlot>;
  onSlotClick: (slot: SelectedSlot) => void;
}

type ReservationInfo = {
  personName: string;
  grade: string;
  className: string;
  purpose: string | null;
};

export function ReservationTimeline({
  data,
  selectedSlots,
  onSlotClick,
}: ReservationTimelineProps) {
  // 予約情報を高速に検索できるようにMapに変換
  const reservationMap = new Map<string, ReservationInfo>();
  data.forEach((room) => {
    room.reservations.forEach((res) => {
      // タイムゾーン問題を避けるため、UTC時刻から日本の時間文字列を生成
      const time = new Date(res.slot.startTime).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Tokyo",
      });
      const key = `${room.id}-${time}`;
      reservationMap.set(key, {
        personName: res.personName,
        grade: res.grade,
        className: res.className,
        purpose: res.purpose,
      });
    });
  });

  return (
    <div className="border rounded-lg overflow-x-auto">
      {/* 横スクロールを可能に */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] sticky left-0 bg-background z-10 font-bold text-center">
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
              <TableCell className="sticky left-0 bg-background z-10 p-2">
                <div className="flex flex-col text-center">
                  <span className="font-bold text-lg">{room.number}</span>
                  <span className="text-sm truncate">{room.name}</span>
                  <span className="text-xs text-gray-500">
                    定員: {room.capacity}人
                  </span>
                </div>
              </TableCell>
              {timeSlots.map((time) => {
                const key = `${room.id}-${time}`;
                const reservation = reservationMap.get(key);
                const isSelected = selectedSlots.has(key);

                // クリック可能なセル
                return (
                  <TableCell key={key} className="text-center p-2">
                    {reservation ? (
                      // 予約済みのセルの表示をリッチに
                      <div className="bg-blue-100 border border-blue-300 text-blue-900 rounded-md p-2 text-xs text-left h-full">
                        <p className="font-bold truncate">
                          {reservation.purpose || "（用途未入力）"}
                        </p>
                        <p className="mt-1 truncate">
                          {reservation.personName}
                        </p>
                        <p className="text-gray-600 truncate">
                          {reservation.grade} / {reservation.className}
                        </p>
                      </div>
                    ) : (
                      // 空きセルの表示
                      <button
                        onClick={() =>
                          onSlotClick({
                            roomId: room.id,
                            roomName: room.name,
                            roomNumber: room.number,
                            time,
                          })
                        }
                        className={`w-full h-full rounded-md p-2 text-xs transition-colors ${
                          isSelected
                            ? "bg-green-500 text-white font-bold ring-2 ring-green-700"
                            : "bg-gray-50 text-gray-400 hover:bg-green-100"
                        }`}
                      >
                        {isSelected ? "選択中" : "空き"}
                      </button>
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
