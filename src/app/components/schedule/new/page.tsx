// app/components/schedule/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
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
  number: string;
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
const gradeOptions = ["1年", "2年", "3年", "研究生"];
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
// 案の一つ 選択式にする
// 利用人数の選択肢
// const usersOptions = Array.from({ length: 50 }, (_, i) => (i + 1).toString());

// カレンダーから選択された日付を受け取るためのprops
interface ReservationFormProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export default function ReservationForm({
  selectedDate,
  onDateChange,
}: ReservationFormProps) {
  // フォームの状態管理
  const [rooms, setRooms] = useState<Room[]>([]); // 部屋リスト
  const [selectedRoomId, setSelectedRoomId] = useState(""); // 選択された部屋ID
  const [time, setTime] = useState(""); // "HH:MM"形式
  const [personName, setPersonName] = useState(""); // 予約者名
  const [message, setMessage] = useState(""); // フォームの送信結果メッセージ
  // 追加のフォームフィールド（必要に応じて使用）
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [numberOfUsers, setNumberOfUsers] = useState("");
  const [note, setNote] = useState("");

  // 日付のフォーマットを "YYYY-MM-DD" に変換する関数
  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";

    // エラー回避のためコメントアウト
    // タイムゾーン問題を回避するため、ローカルの年月日を直接取得する
    const year = date.getFullYear();
    // getMonth()は0始まりなので+1する。padStartで2桁に揃える (例: 1 -> "01")
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  const dateString = formatDate(selectedDate); // "YYYY-MM-DD"形式の日付文字列

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
    if (!dateString) {
      setMessage("⚠ 日付を選択してください");
      return;
    }

    const reservationData = {
      date: dateString,
      time,
      roomId: Number(selectedRoomId),
      personName,
      grade,
      className,
      purpose,
      // 人数が入力されていれば数値に、されていなければnullに
      numberOfUsers: numberOfUsers ? Number(numberOfUsers) : null,
      note,
    };

    // デバッグ用: 送信するデータが正しいかコンソールで確認
    // console.log("送信するデータ:", reservationData);

    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      // レスポンスのボディを **一度だけ** 読み込む
      const result = await res.json();

      // res.ok (ステータスコードが200番台) かどうかで成功/失敗を判断
      if (!res.ok) {
        // 失敗した場合 (400, 500エラーなど)
        // 読み込んだresultからエラーメッセージを取り出す
        throw new Error(result.error || `サーバーエラー: ${res.status}`);
      }

      // 成功した場合
      setMessage("予約を追加しました！");
      // フォームをリセット
      setTime("");
      setSelectedRoomId("");
      setPersonName("");
      setGrade("");
      setClassName("");
      setPurpose("");
      setNumberOfUsers("");
      setNote("");
    } catch (error) {
      // ネットワークエラーや、上記でthrowしたエラーをキャッチ
      console.error("フォーム送信エラー:", error);
      if (error instanceof Error) {
        setMessage(`⚠ ${error.message}`);
      } else {
        setMessage("⚠ 不明なエラーが発生しました");
      }
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
                  {room.name} ({room.number}) - 定員: {room.capacity}人
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* --- 学年選択を追加 --- */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="grade">学年</Label>
            <Select onValueChange={setGrade} value={grade} required>
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

          {/* --- クラス選択を追加 --- */}
          <div className="space-y-1">
            <Label htmlFor="className">ガレッジ名</Label>
            <Select onValueChange={setClassName} value={className} required>
              <SelectTrigger id="className">
                <SelectValue placeholder="ガレッジを選択" />
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
            value={dateString} // カレンダーから選択された日付を表示
            onChange={(e) => {
              //タイムゾーン問題を回避するため、ユーザーが選択した日付文字列を直接使用してDateオブジェクトを作成
              if (!e.target.value) {
                onDateChange(undefined);
                return;
              }
              //  "YYYY-MM-DD" の文字列をUTCとして解釈し、Dateオブジェクトを生成
              const newDate = new Date(`${e.target.value}T00:00:00.000Z`);
              onDateChange(newDate);
            }}
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
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* --- 用途、利用人数、備考を追加 --- */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="purpose">用途名</Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="例: ゼミ活動"
            />
          </div>

          {/* --- 利用人数を追加 --- */}
          <div className="space-y-1">
            <Label htmlFor="numberOfUsers">利用人数</Label>
            <Input
              id="numberOfUsers"
              type="number"
              value={numberOfUsers}
              onChange={(e) => setNumberOfUsers(e.target.value)}
              placeholder="例: 5"
            />
          </div>
        </div>

        {/* --- 備考を追加 --- */}
        <div className="space-y-1">
          <Label htmlFor="note">備考</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="何か連絡事項があれば入力してください"
          />
        </div>

        <Button
          type="submit"
          disabled={!selectedDate || !time || !selectedRoomId || !personName}
        >
          登録
        </Button>
      </form>

      {message && <p className="mt-4 text-sm font-medium">{message}</p>}
    </div>
  );
}
