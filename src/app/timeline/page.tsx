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
                選択中の部屋: {selectedSlots.size}件
              </p>
              <Button onClick={handleOpenDialog} className="w-full">
                選択した部屋を予約する
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
        {/* --- ↓ 予約実行用のダイアログ --- */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">予約情報の入力</DialogTitle>
              <DialogDescription>
                選択した {selectedSlots.size}件の部屋を予約します。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-2">
              {" "}
              {/* 全体の余白を調整 */}
              {/* -- グループ1: 予約情報 -- */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 border-b pb-2">
                  予約情報
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade">
                      学年 <span className="text-red-500">*</span>
                    </Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="className">
                      カレッジ <span className="text-red-500">*</span>
                    </Label>
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
              </div>
              {/* -- グループ2: 予約者情報 -- */}
              <div className="space-y-4">
                {/* <h3 className="text-sm font-semibold text-gray-500 border-b pb-2">
                  予約詳細
                </h3> */}
                <div className="space-y-2">
                  <Label htmlFor="personName">
                    予約代表者名 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="personName"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="氏名を入力"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">
                    用途名 <span className="text-gray-500">(任意)</span>
                  </Label>
                  <Input
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="例: ゼミ活動、最終制作"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfUsers">
                    利用人数 <span className="text-gray-500">(任意)</span>
                  </Label>
                  <Input
                    id="numberOfUsers"
                    type="number"
                    value={numberOfUsers}
                    onChange={(e) => setNumberOfUsers(e.target.value)}
                    placeholder="例: 5"
                  />
                </div>
              </div>
              {/* -- グループ3: 補足情報 -- */}
              <div className="space-y-2">
                <Label htmlFor="note">
                  備考 <span className="text-gray-500">(任意)</span>
                </Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="機材の持ち込みや、その他連絡事項があれば入力してください"
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
