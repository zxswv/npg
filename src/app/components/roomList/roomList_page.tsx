// npg/src/app/components/roomList/roomList_page.tsx
"use client";
import { useEffect, useState } from "react";

type Room = {
  id: number;
  name: string;
  capacity: number;
};

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true); // ローディング状態を追加
  const [error, setError] = useState<string | null>(null); // エラーメッセージ用のstate

  useEffect(() => {
    // APIから部屋の一覧を取得
    fetch("/api/room")
      // レスポンスをJSON形式に変換
      .then((res) => {
        if (!res.ok) {
          throw new Error("データの取得に失敗しました");
        }
        return res.json();
      })
      .then((data) => setRooms(data))
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        console.error("部屋の取得に失敗しました:", err);
      }) // エラーハンドリング
      .finally(() => {
        setIsLoading(false); // 成功・失敗に関わらずローディング完了
      });
  }, []);

  if (isLoading) {
    return <div>読み込み中...</div>; // ローディング中の表示
  }
  if (error) return <div className="text-red-500">エラー: {error}</div>; // エラー表示

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">部屋一覧</h2>
      <ul className="space-y-4">
        {rooms.map((room) => (
          <li key={room.id} className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold">{room.name}</h3>
            <p>収容人数: {room.capacity}人</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
