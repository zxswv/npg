// app/timeline/page.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Calendar } from "@/app/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { ReservationTimeline } from "@/app/components/ReservationTimeline/ReservationTimeline"; //セルの中身
import { FloorFilter } from "@/app/components/timeline//FloorFilter"; //フロアフィルター
import { ReservationControl } from "@/app/components/timeline/ReservationControl"; //予約実行ボタン部分
import { ReservationDialog } from "@/app/components/timeline/ReservationDialog"; //予約のホップアップ

// 型の定義
// APIから返されるデータの型
export type RoomWithReservations = {
  id: number;
  number: string;
  name: string;
  capacity: number;
  reservations: {
    id: string;
    personName: string;
    grade: string;
    className: string;
    // roomName: string;
    // roomNumber: string;
    // time: string;
    purpose: string | null;
    slot: {
      startTime: string;
    };
  }[];
};
export type SelectedSlot = {
  roomId: number;
  roomName: string;
  roomNumber: string;
  time: string;
};

export default function TimelinePage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  // タイムラインデータ
  const [timelineData, setTimelineData] = useState<RoomWithReservations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // フロアフィルター
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  // 予約機能
  const [selectedSlots, setSelectedSlots] = useState<Map<string, SelectedSlot>>(
    new Map()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // ハイドレーション対策
  const [isClient, setIsClient] = useState(false);

  // --- ↓ ダイアログのフォームstateをオブジェクトとして一元管理 ---
  const [formState, setFormState] = useState({
    personName: "",
    grade: "",
    className: "",
    purpose: "",
    numberOfUsers: "",
    note: "",
    formError: null as string | null,
  });
  const handleFormStateChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // 日付フォーマット関数
  const formatDate = (d: Date): string => d.toISOString().split("T")[0];

  // クライアントサイドでのみ実行されるマウント時の処理
  useEffect(() => {
    // クライアント指定
    setIsClient(true);
    // ページがブラウザーに読み込まれたら、今日の日付をリセットする。
    setDate(new Date());
  }, []); // 空の配列を指定することで、マウント時に一度だけ実行される

  // --- ↓ データを再取得する関数をuseCallbackで定義 ---
  const fetchTimelineData = useCallback(async () => {
    if (!date) return;

    setIsLoading(true);
    const dateString = date.toISOString().split("T")[0];
    try {
      const res = await fetch(`/api/timeline?date=${dateString}`);
      if (!res.ok) throw new Error("データ取得に失敗");
      const data = await res.json();
      setTimelineData(data);
    } catch (error) {
      console.error("タイムラインデータの取得エラー", error);
      toast.error("データの読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, [date]); // dateが変更されたときだけ関数を再生成

  useEffect(() => {
    fetchTimelineData();
  }, [fetchTimelineData]); // dateの変更をトリガーにする

  // --- ↓ フィルタリングされたデータを計算するロジック ---
  const filteredTimelineData = useMemo(() => {
    if (selectedFloor === "all") return timelineData;
    return timelineData.filter((room) => {
      if (selectedFloor === "11F") return room.number.startsWith("11");
      if (selectedFloor === "10F") return room.number.startsWith("10");
      if (selectedFloor === "other")
        return !room.number.startsWith("11") && !room.number.startsWith("10");
      return true;
    });
  }, [timelineData, selectedFloor]); // timelineDataかselectedFloorが変更されたときだけ再計算

  const handleSlotClick = (slot: SelectedSlot) => {
    setSelectedSlots((prev) => {
      const newSelected = new Map(prev);
      const key = `${slot.roomId}-${slot.time}`;
      if (newSelected.has(key)) {
        newSelected.delete(key); // 既に選択されていれば解除
      } else {
        newSelected.set(key, slot); // 新しく選択
      }
      return newSelected;
    });
  };

  // 予約実行ボタンが押されたときの処理
  const handleOpenDialog = () => {
    if (selectedSlots.size === 0) {
      toast.warning("予約したいスロットをクリックして選択してください。");
      return;
    }
    // フォームをリセット
    setFormState({
      personName: "",
      grade: "",
      className: "",
      purpose: "",
      numberOfUsers: "",
      note: "",
      formError: null,
    });
    setIsDialogOpen(true);
  };

  // 予約を確定する処理
  const handleConfirmReservation = async () => {
    setFormState((prev) => ({ ...prev, formError: null }));

    const { personName, grade, className, numberOfUsers } = formState;

    if (!personName || !grade || !className) {
      setFormState((prev) => ({
        ...prev,
        formError: "必須項目をすべて入力してください。",
      }));
      return;
    }
    const users = Number(numberOfUsers);
    if (numberOfUsers && (isNaN(users) || users <= 0)) {
      setFormState((prev) => ({
        ...prev,
        formError: "利用人数は1以上の数値を入力してください。",
      }));
      return;
    }

    const reservationData = {
      date: date ? formatDate(date) : "",
      slots: Array.from(selectedSlots.values()),
      ...formState,
      className: `${formState.className}カレッジ`,
    };

    toast.promise(
      fetch("/api/reservations/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      }).then(async (res) => {
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || "仮予約に失敗しました");
        }
        return result;
      }),
      {
        loading: "仮予約処理中...",
        success: () => {
          setIsDialogOpen(false);
          setSelectedSlots(new Map());
          fetchTimelineData(); // タイムラインを更新
          return "仮予約が完了しました！";
        },
        error: (err) => {
          setFormState((prev) => ({ ...prev, formError: err.message }));
          return "仮予約に失敗しました。";
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">予約状況タイムライン</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* 左側: カレンダー */}
        <aside className="md:w-1/4 lg:w-1/5 flex-shrink-0 flex flex-col gap-8">
          {/* --- カレンダー ---*/}
          <Card>
            <CardHeader>
              <CardTitle>日付選択</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {isClient ? (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              ) : (
                <div className="p-3">
                  <div className="w-[280px] h-[330px] bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* --- フィルター --- */}
          <FloorFilter
            selectedFloor={selectedFloor}
            onFloorChange={setSelectedFloor}
          />
          {/* --- 実行 --- */}
          <ReservationControl
            selectedSlots={selectedSlots}
            onOpenDialog={handleOpenDialog}
          />
        </aside>

        {/* 右側: タイムライン */}
        <main className="flex-grow">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {date ? date.toLocaleDateString("ja-JP") : "日付を選択"}
              </CardTitle>
              <CardDescription>
                各部屋の時間帯ごとの予約状況です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : (
                <ReservationTimeline
                  data={filteredTimelineData}
                  selectedSlots={selectedSlots}
                  onSlotClick={handleSlotClick}
                  onReservationUpdate={fetchTimelineData}
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      {/* --- ↓ 予約実行用のダイアログ --- */}
      <ReservationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedSlots={selectedSlots}
        formState={formState}
        onFormStateChange={handleFormStateChange}
        onConfirm={handleConfirmReservation}
      />
    </div>
  );
}
