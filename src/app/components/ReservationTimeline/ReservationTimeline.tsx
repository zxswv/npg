// app/components/roomList/ReservationTimeline.tsx
// セルの中身
"use client";

import { useState } from "react"; // useStateをインポート
import { toast } from "sonner"; // sonnerをインポート
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button"; // Buttonをインポート
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog"; // AlertDialogをインポート
import { RoomWithReservations, SelectedSlot } from "@/app/timeline/page"; // 親ページで定義した型をインポート

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
  onReservationUpdate: () => void;
}

type ReservationInfo = {
  id: string;
  personName: string;
  grade: string;
  className: string;
  purpose: string | null;
  roomName: string;
  roomNumber: string;
  time: string;
};

export function ReservationTimeline({
  data,
  selectedSlots,
  onSlotClick,
  onReservationUpdate,
}: ReservationTimelineProps) {
  // 予約情報を高速に検索できるようにMapに変換
  // キャンセル確認
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] =
    useState<ReservationInfo | null>(null);

  // --- ↓ キャンセル処理の関数を追加 ---
  const handleOpenAlert = (reservation: ReservationInfo) => {
    setReservationToCancel(reservation);
    setIsAlertOpen(true);
  };

  const reservationMap = new Map<string, ReservationInfo>();
  data.forEach((room) => {
    room.reservations.forEach((res) => {
      const time = new Date(res.slot.startTime).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
      const key = `${room.id}-${time}`;

      // --- ↓ reservationMap にセットする情報を追加 ---
      reservationMap.set(key, {
        id: res.id, // id をセット
        personName: res.personName,
        grade: res.grade,
        className: res.className,
        purpose: res.purpose,
        // AlertDialog表示用の情報をセット
        roomName: room.name,
        roomNumber: room.number,
        time: time,
      });
    });
  });

  const handleCancelReservation = async () => {
    if (!reservationToCancel) return;

    toast.promise(
      fetch(`/api/reservation/${reservationToCancel.id}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) {
          // 204 No Content の場合は res.json() を呼べないので特別扱い
          if (res.status === 204) return;
          throw new Error("キャンセルの処理に失敗しました");
        }
      }),
      {
        loading: "キャンセル処理中...",
        success: () => {
          onReservationUpdate(); // 親コンポーネントに更新を通知
          return "予約をキャンセルしました。";
        },
        error: "キャンセルに失敗しました。",
      }
    );
  };

  return (
    <>
      <div className="border rounded-lg overflow-x-auto">
        {/* 横スクロールを可能に */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background z-10 font-bold text-center">
                部屋
              </TableHead>
              {timeSlots.map((time) => (
                <TableHead
                  key={time}
                  className="text-center min-w-[150px] align-middle"
                >
                  {time}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="sticky left-0 bg-background z-10 p-2 h-[100px]">
                  <div className="flex flex-col text-center justify-center h-full">
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
                    <TableCell
                      key={key}
                      className="text-center p-1 align-top h-[120px]"
                    >
                      {reservation ? (
                        // 予約済みのセルの表示をリッチに
                        <div className="bg-blue-100 border border-blue-300 text-blue-900 rounded-md p-2 text-xs text-left h-full flex flex-col justify-between">
                          <p className="font-bold truncate">
                            {reservation.purpose || "（用途未入力）"}
                          </p>
                          <p className="mt-1 truncate">
                            {reservation.personName}
                          </p>
                          <p className="text-gray-600 truncate">
                            {reservation.grade} / {reservation.className}
                          </p>
                          <p className="mt-1 text-right text-[10px] text-gray-500">
                            予約済み
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full h-5 mt-1"
                            onClick={() => handleOpenAlert(reservation)}
                          >
                            キャンセル
                          </Button>
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
                          className={`w-full h-full rounded-md p-2 text-xs transition-colors flex items-center justify-center ${
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
      {/* --- ↓ 警告ダイアログをコンポーネントの末尾に追加 --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              本当に予約をキャンセルしますか？
            </AlertDialogTitle>
            <AlertDialogDescription>
              この操作は元に戻すことはできません。以下の予約が完全に削除されます。
              <div className="mt-4 bg-gray-100 p-3 rounded-md text-sm">
                <p>
                  <strong>部屋:</strong> {reservationToCancel?.roomNumber} (
                  {reservationToCancel?.roomName})
                </p>
                <p>
                  <strong>時間:</strong> {reservationToCancel?.time}
                </p>
                <p>
                  <strong>予約者:</strong> {reservationToCancel?.personName}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>閉じる</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelReservation}>
              キャンセルを実行
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
