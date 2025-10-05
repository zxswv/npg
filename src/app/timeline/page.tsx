// app/timeline/page.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { ReservationTimeline } from "@/app/components/ReservationTimeline/ReservationTimeline";
// --- ↓ 新しいコンポーネントをインポート ---
import { DateSelector } from "@/app/components/timeline/DateSelector";
import { FloorFilter } from "@/app/components/timeline//FloorFilter";
import { ReservationControl } from "@/app/components/timeline/ReservationControl";
import { ReservationDialog } from "@/app/components/timeline/ReservationDialog";

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
  const [date, setDate] = useState<Date | undefined>(new Date());
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

  // --- ↓ データを再取得する関数をuseCallbackで定義 ---
  const fetchTimelineData = useCallback(async () => {
    if (!date) return;
    setIsLoading(true);
    const dateString = formatDate(date);
    try {
      const res = await fetch(`/api/timeline?date=${dateString}`);
      const data = await res.json();
      setTimelineData(data);
    } catch (error) {
      console.error("タイムラインデータの取得エラー", error);
    } finally {
      setIsLoading(false);
    }
  }, [date]); // dateが変更されたときだけ関数を再生成

  // 初回読み込みと、date変更時にデータを取得
  useEffect(() => {
    fetchTimelineData();
  }, [fetchTimelineData]);

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
      fetch("/api/reservation/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      }).then(async (res) => {
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || "予約に失敗しました");
        }
        return result;
      }),
      {
        loading: "予約処理中...",
        success: () => {
          setIsDialogOpen(false);
          setSelectedSlots(new Map());
          fetchTimelineData(); // タイムラインを更新
          return "予約が完了しました！";
        },
        error: (err) => {
          setFormState((prev) => ({ ...prev, formError: err.message }));
          return "予約に失敗しました。";
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
          <DateSelector date={date} onDateChange={setDate} />
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
        selectedSlotsSize={selectedSlots.size}
        formState={formState}
        onFormStateChange={handleFormStateChange}
        onConfirm={handleConfirmReservation}
      />
    </div>
  );
}
