// app/timeline/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar } from "@/app/components/ui/calendar";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { ReservationTimeline } from "@/app/components/ReservationTimeline/ReservationTimeline";

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
// 選択肢
const gradeOptions = ["1年", "2年", "3年", "研究生", "教職員", "外部"];
const classOptions = [
  "ヘアメイク",
  "フィッシング",
  "ミュージック",
  "バスケット",
  "パフォーミングアーツ",
  "e-Sports",
  "ゲーム",
  "マンガ・イラスト",
  "IT",
  "動画クリエーター",
  "チャイルドケア",
  "スポーツ",
  "デザイン",
  "高校",
];

export default function TimelinePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  // タイムラインデータ
  const [timelineData, setTimelineData] = useState<RoomWithReservations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 予約機能
  const [selectedSlots, setSelectedSlots] = useState<Map<string, SelectedSlot>>(
    new Map()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  // ダイアログ用のフォーム状態
  const [personName, setPersonName] = useState(""); // 予約者名
  const [grade, setGrade] = useState(""); // 学年
  const [className, setClassName] = useState(""); // クラス
  const [purpose, setPurpose] = useState(""); // 目的
  const [numberOfUsers, setNumberOfUsers] = useState(""); // 利用人数
  const [note, setNote] = useState(""); // 備考

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

  // 日付フォーマット関数
  const formatDate = (d: Date): string => d.toISOString().split("T")[0];

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
      alert("予約したいスロットをクリックして選択してください。");
      return;
    }
    setIsDialogOpen(true);
  };

  // 予約を確定する処理
  const handleConfirmReservation = async () => {
    setMessage("");
    if (!personName || !grade || !className) {
      setMessage("必須項目をすべて入力してください。");
      return;
    }

    const reservationData = {
      date: date ? formatDate(date) : "",
      slots: Array.from(selectedSlots.values()),
      personName,
      grade,
      className: `${className}カレッジ`, // 「カレッジ」を付与
      purpose,
      numberOfUsers,
      note,
    };

    try {
      const res = await fetch("/api/reservations/bulk", {
        // 新しいAPIエンドポイント
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "予約に失敗しました");

      // 成功した場合
      setMessage("予約が完了しました！");
      setIsDialogOpen(false);
      setSelectedSlots(new Map()); // 選択をリセット
      // タイムラインのデータを再取得して画面を更新
      await fetchTimelineData();
    } catch (error) {
      if (error instanceof Error) setMessage(`⚠ ${error.message}`);
    }
  };

  // 日付が変更されたらAPIを叩いてデータを再取得
  useEffect(() => {
    if (!date) return;

    const fetchTimelineData = async () => {
      setIsLoading(true);
      // Dateオブジェクトを "YYYY-MM-DD" 形式の文字列に変換
      const dateString = date.toISOString().split("T")[0];
      const res = await fetch(`/api/timeline?date=${dateString}`);
      const data = await res.json();
      setTimelineData(data);
      setIsLoading(false);
    };

    fetchTimelineData();
  }, [date]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">予約状況タイムライン</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* 左側: カレンダー */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>日付選択</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>予約実行</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                選択中のスロット: {selectedSlots.size}件
              </p>
              <Button onClick={handleOpenDialog} className="w-full">
                選択したスロットを予約する
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右側: タイムライン */}
        <div className="md:col-span-3">
          <Card>
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
                  data={timelineData}
                  selectedSlots={selectedSlots}
                  onSlotClick={handleSlotClick}
                />
              )}
            </CardContent>
          </Card>
        </div>
        {/* --- ↓ 予約実行用のダイアログを追加 --- */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>予約者情報の入力</DialogTitle>
              <DialogDescription>
                以下の情報を入力して予約を確定してください。選択した{" "}
                {selectedSlots.size}件のスロットが一度に予約されます。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="grade">学年</Label>
                  <Select onValueChange={setGrade} value={grade}>
                    <SelectTrigger id="grade">
                      <SelectValue placeholder="学年を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="className">カレッジ</Label>
                  <Select onValueChange={setClassName} value={className}>
                    <SelectTrigger id="className">
                      <SelectValue placeholder="カレッジを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {classOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="personName">予約代表者名</Label>
                <Input
                  id="personName"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="purpose">用途名</Label>
                  <Input
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="numberOfUsers">利用人数</Label>
                  <Input
                    id="numberOfUsers"
                    type="number"
                    value={numberOfUsers}
                    onChange={(e) => setNumberOfUsers(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="note">備考</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              {message && (
                <p className="text-sm text-red-600 mr-auto">{message}</p>
              )}
              <Button type="button" onClick={handleConfirmReservation}>
                予約を確定
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
