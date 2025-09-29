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

type Room = {
  id: number;
  name: string;
  capacity: number;
};

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
  // フォームの状態管理
  const [rooms, setRooms] = useState<Room[]>([]); // 部屋リスト
  const [selectedRoomId, setSelectedRoomId] = useState(""); // 選択された部屋ID
  const [date, setDate] = useState(""); // "YYYY-MM-DDTHH:MM"形式
  const [time, setTime] = useState(""); // "HH:MM"形式
  const [personName, setPersonName] = useState(""); // 予約者名
  const [message, setMessage] = useState(""); // フォームの送信結果メッセージ

  // 既に予約されている時間帯
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("/api/room");
        const data = await res.json();
        setRooms(data);
      } catch (error) {
        console.error("部屋の取得に失敗:", error);
      }
    };
    fetchRooms();
  }, []);

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 日付と時間のフォーマットチェック
    const res = await fetch("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        time,
        roomId: Number(selectedRoomId),
        personName,
      }),
    });

    const result = await res.json();
    // レスポンスの処理
    if (res.ok) {
      setMessage("予約を追加しました"); // 成功メッセージ
      setDate(""); // 入力フィールドをリセット
      setTime(""); // 入力フィールドをリセット
      setSelectedRoomId(""); // 入力フィールドをリセット
      setPersonName(""); // 入力フィールドをリセット
    } else {
      const error = await res.json(); // エラーメッセージの取得
      setMessage(error.error || "⚠ エラーが発生しました");
    }
  };

  // 日付と時間のフォーマットを整える
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">新規予約</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* --- 部屋選択を追加 --- */}
        <div className="space-y-1">
          <Label htmlFor="room">部屋</Label>
          <Select
            onValueChange={setSelectedRoomId}
            value={selectedRoomId}
            required
          >
            <SelectTrigger id="room">
              <SelectValue placeholder="部屋を選択" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={String(room.id)}>
                  {room.name} (定員: {room.capacity}人)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* --- 予約者名を追加 --- */}
        <div className="space-y-1">
          <Label htmlFor="personName">予約者名</Label>
          <Input
            id="personName"
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            required
          />
        </div>

        {/* --- 日付入力を date に変更 --- */}
        <div className="space-y-1">
          <Label htmlFor="date">日付</Label>
          <Input
            id="date"
            type="date" // datetime-local から date に変更
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* --- 時間選択 --- */}
        <div className="space-y-1">
          <Label htmlFor="time">時間帯</Label>
          <Select onValueChange={setTime} value={time} required>
            <SelectTrigger id="time">
              <SelectValue placeholder="時間を選択" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}:00
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={!date || !time || !selectedRoomId || !personName}
        >
          登録
        </Button>
      </form>

      {message && <p className="mt-4 text-sm font-medium">{message}</p>}
    </div>
  );
}
