"use client";

import { useState, useEffect } from "react";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";

// 時間帯の選択肢
const timeOptions = [
  "09:10",
  "10:50",
  "13:10",
  "14:50",
  "16:30",
  "18:10",
  "19:50",
];

export default function NewSchedulePage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [reservedTimes, setReservedTimes] = useState<string[]>([]);

  // 指定して時間の予約済みの時間を取得
  useEffect(() => {
    const fetchReservedTimes = async () => {
      if (!date) return;

      try {
        const res = await fetch(
          `/api/schedule?date=${encodeURIComponent(date.split("T")[0])}`
        );
        const data = await res.json(); // レスポンスのデータを取得
        const times = data.map((item: { time: string }) => item.time); // 時間のみを抽出
        console.log("予約済み時間:", times);
        console.log("予約済み時間のデータ:", data);
        setReservedTimes(times); // 予約済み時間を更新
      } catch (error) {
        console.error("予約済み時間の取得に失敗:", error);
      }
    };

    fetchReservedTimes();
  }, [date]);

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 日付と時間のフォーマットチェック
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time }),
    });

    // レスポンスの処理
    if (res.ok) {
      setMessage("予約を追加しました"); // 成功メッセージ
      setDate(""); // 入力フィールドをリセット
      setTime(""); // 入力フィールドをリセット
      setReservedTimes([]); // 予約済み時間をリセット
    } else {
      const error = await res.json(); // エラーメッセージの取得
      setMessage(error.error || "⚠ エラーが発生しました");
    }
  };

  // 利用可能な時間帯をフィルタリング
  const availableTimes = timeOptions.filter((t) => !reservedTimes.includes(t));

  // 日付と時間のフォーマットを整える
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">新規予約</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="date">日付と時間</Label>
          <Input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="time">時間帯</Label>
          <Select onValueChange={setTime} value={time}>
            <SelectTrigger id="time">
              <SelectValue placeholder="時間を選択" />
            </SelectTrigger>
            <SelectContent>
              {availableTimes.length > 0 ? (
                availableTimes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="none">
                  選択可能な時間がありません
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={!date || !time}>
          登録
        </Button>
      </form>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}
