// // app/timeline/page.tsx

// "use client";

// import { useState, useEffect, useCallback, useMemo } from "react";
// import { Calendar } from "@/app/components/ui/calendar";
// import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";
// import { Textarea } from "@/app/components/ui/textarea";
// import { Label } from "@/app/components/ui/label";
// import { toast } from "sonner";
// import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/app/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/app/components/ui/dialog";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/app/components/ui/card";
// import { ReservationTimeline } from "@/app/components/ReservationTimeline/ReservationTimeline";

// // 型の定義
// // APIから返されるデータの型
// export type RoomWithReservations = {
//   id: number;
//   number: string;
//   name: string;
//   capacity: number;
//   reservations: {
//     id: string;
//     personName: string;
//     grade: string;
//     className: string;
//     purpose: string | null;
//     slot: {
//       startTime: string;
//     };
//   }[];
// };
// export type SelectedSlot = {
//   roomId: number;
//   roomName: string;
//   roomNumber: string;
//   time: string;
// };
// // 選択肢
// const gradeOptions = ["1年", "2年", "3年", "研究生", "教職員", "外部"];
// const classOptions = [
//   "ヘアメイク",
//   "フィッシング",
//   "ミュージック",
//   "バスケット",
//   "パフォーミングアーツ",
//   "e-Sports",
//   "ゲーム",
//   "マンガ・イラスト",
//   "IT",
//   "動画クリエーター",
//   "チャイルドケア",
//   "スポーツ",
//   "デザイン",
//   "高校",
// ];

// export default function TimelinePage() {
//   const [date, setDate] = useState<Date | undefined>(new Date());
//   // タイムラインデータ
//   const [timelineData, setTimelineData] = useState<RoomWithReservations[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // フロアフィルター
//   const [selectedFloor, setSelectedFloor] = useState<string>("all");

//   // 予約機能
//   const [selectedSlots, setSelectedSlots] = useState<Map<string, SelectedSlot>>(
//     new Map()
//   );
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   // ダイアログ用のフォーム状態
//   const [personName, setPersonName] = useState(""); // 予約者名
//   const [grade, setGrade] = useState(""); // 学年
//   const [className, setClassName] = useState(""); // クラス
//   const [purpose, setPurpose] = useState(""); // 目的
//   const [numberOfUsers, setNumberOfUsers] = useState(""); // 利用人数
//   const [note, setNote] = useState(""); // 備考
//   const [formError, setFormError] = useState<string | null>(null);

//   // --- ↓ データを再取得する関数をuseCallbackで定義 ---
//   const fetchTimelineData = useCallback(async () => {
//     if (!date) return;
//     setIsLoading(true);
//     const dateString = formatDate(date);
//     try {
//       const res = await fetch(`/api/timeline?date=${dateString}`);
//       const data = await res.json();
//       setTimelineData(data);
//     } catch (error) {
//       console.error("タイムラインデータの取得エラー", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [date]); // dateが変更されたときだけ関数を再生成

//   // 初回読み込みと、date変更時にデータを取得
//   useEffect(() => {
//     fetchTimelineData();
//   }, [fetchTimelineData]);

//   // --- ↓ フィルタリングされたデータを計算するロジック ---
//   const filteredTimelineData = useMemo(() => {
//     if (selectedFloor === "all") return timelineData;
//     return timelineData.filter((room) => {
//       if (selectedFloor === "11F") return room.number.startsWith("11");
//       if (selectedFloor === "10F") return room.number.startsWith("10");
//       if (selectedFloor === "other")
//         return !room.number.startsWith("11") && !room.number.startsWith("10");
//       return true;
//     });
//   }, [timelineData, selectedFloor]); // timelineDataかselectedFloorが変更されたときだけ再計算

//   // 日付フォーマット関数
//   const formatDate = (d: Date): string => d.toISOString().split("T")[0];

//   const handleSlotClick = (slot: SelectedSlot) => {
//     setSelectedSlots((prev) => {
//       const newSelected = new Map(prev);
//       const key = `${slot.roomId}-${slot.time}`;
//       if (newSelected.has(key)) {
//         newSelected.delete(key); // 既に選択されていれば解除
//       } else {
//         newSelected.set(key, slot); // 新しく選択
//       }
//       return newSelected;
//     });
//   };

//   // フォームをリセットする関数
//   const resetForm = () => {
//     setPersonName("");
//     setGrade("");
//     setClassName("");
//     setPurpose("");
//     setNumberOfUsers("");
//     setNote("");
//     setFormError(null);
//   };

//   // 予約実行ボタンが押されたときの処理
//   const handleOpenDialog = () => {
//     if (selectedSlots.size === 0) {
//       toast.warning("予約したいスロットをクリックして選択してください。");
//       return;
//     }
//     resetForm();
//     setIsDialogOpen(true);
//   };

//   // 予約を確定する処理
//   const handleConfirmReservation = async () => {
//     setFormError(null); // エラーメッセージをクリア
//     if (!personName || !grade || !className) {
//       setFormError("必須項目をすべて入力してください。");
//       return;
//     }
//     const users = Number(numberOfUsers);
//     if (numberOfUsers && (isNaN(users) || users <= 0)) {
//       setFormError("利用人数は1以上の数値を入力してください。");
//       return;
//     }

//     toast.promise(
//       fetch("/api/reservations/bulk", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(reservationData),
//       }).then(async (res) => {
//         const result = await res.json();
//         if (!res.ok) {
//           throw new Error(result.error || "予約に失敗しました");
//         }
//         return result;
//       }),
//       {
//         loading: "予約処理中...",
//         success: () => {
//           setIsDialogOpen(false);
//           setSelectedSlots(new Map());
//           fetchTimelineData(); // タイムラインを更新
//           return "予約が完了しました！";
//         },
//         error: (err) => {
//           setFormError(err.message); // ダイアログ内にエラーメッセージを表示
//           return "予約に失敗しました。"; // トーストのエラーメッセージ
//         },
//       }
//     );

//     return (
//       <div className="container mx-auto p-4 md:p-8">
//         <h1 className="text-3xl font-bold mb-6">予約状況タイムライン</h1>
//         <div className="flex flex-col md:flex-row gap-8">
//           {/* 左側: カレンダー */}
//           {/* --- カレンダー ---*/}
//           <aside className="md:w-1/4 lg:w-1/5 flex-shrink-0 flex flex-col gap-8">
//             <Card>
//               <CardHeader>
//                 <CardTitle>日付選択</CardTitle>
//               </CardHeader>
//               <CardContent className="flex justify-center">
//                 <Calendar
//                   mode="single"
//                   selected={date}
//                   onSelect={setDate}
//                   className="rounded-md border"
//                 />
//               </CardContent>
//             </Card>

//             {/* --- フィルター --- */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>フロア選択</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ToggleGroup
//                   type="single"
//                   value={selectedFloor}
//                   onValueChange={(v) => v && setSelectedFloor(v)}
//                   className="flex-col w-full"
//                 >
//                   <ToggleGroupItem value="all" className="w-full">
//                     すべて
//                   </ToggleGroupItem>
//                   <ToggleGroupItem value="11F" className="w-full">
//                     11階
//                   </ToggleGroupItem>
//                   <ToggleGroupItem value="10F" className="w-full">
//                     10階
//                   </ToggleGroupItem>
//                   <ToggleGroupItem value="other" className="w-full">
//                     その他
//                   </ToggleGroupItem>
//                 </ToggleGroup>
//               </CardContent>
//             </Card>

//             {/* --- 実行 --- */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>予約実行</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-sm text-gray-600 mb-4">
//                   選択中の部屋: {selectedSlots.size}件
//                 </p>
//                 <Button onClick={handleOpenDialog} className="w-full">
//                   選択した部屋を予約する
//                 </Button>
//               </CardContent>
//             </Card>
//           </aside>

//           {/* 右側: タイムライン */}
//           <main className="flex-grow">
//             <Card className="h-full">
//               <CardHeader>
//                 <CardTitle>
//                   {date ? date.toLocaleDateString("ja-JP") : "日付を選択"}
//                 </CardTitle>
//                 <CardDescription>
//                   各部屋の時間帯ごとの予約状況です。
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {isLoading ? (
//                   <div className="text-center py-8">読み込み中...</div>
//                 ) : (
//                   <ReservationTimeline
//                     data={filteredTimelineData}
//                     selectedSlots={selectedSlots}
//                     onSlotClick={handleSlotClick}
//                   />
//                 )}
//               </CardContent>
//             </Card>
//           </main>
//           {/* --- ↓ 予約実行用のダイアログ --- */}
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogContent className="sm:max-w-md">
//               <DialogHeader>
//                 <DialogTitle className="text-2xl">予約情報の入力</DialogTitle>
//                 <DialogDescription>
//                   選択した {selectedSlots.size}件の部屋を予約します。
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-6 py-2">
//                 {" "}
//                 {/* 全体の余白を調整 */}
//                 {/* -- グループ1: 予約情報 -- */}
//                 <div className="space-y-4">
//                   <h3 className="text-sm font-semibold text-gray-500 border-b pb-2">
//                     予約情報
//                   </h3>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="grade">
//                         学年 <span className="text-red-500">*</span>
//                       </Label>
//                       <Select onValueChange={setGrade} value={grade}>
//                         <SelectTrigger id="grade">
//                           <SelectValue placeholder="学年を選択" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {gradeOptions.map((g) => (
//                             <SelectItem key={g} value={g}>
//                               {g}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="className">
//                         カレッジ <span className="text-red-500">*</span>
//                       </Label>
//                       <Select onValueChange={setClassName} value={className}>
//                         <SelectTrigger id="className">
//                           <SelectValue placeholder="カレッジを選択" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {classOptions.map((c) => (
//                             <SelectItem key={c} value={c}>
//                               {c}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </div>
//                 {/* -- グループ2: 予約者情報 -- */}
//                 <div className="space-y-4">
//                   {/* <h3 className="text-sm font-semibold text-gray-500 border-b pb-2">
//                   予約詳細
//                 </h3> */}
//                   <div className="space-y-2">
//                     <Label htmlFor="personName">
//                       予約代表者名 <span className="text-red-500">*</span>
//                     </Label>
//                     <Input
//                       id="personName"
//                       value={personName}
//                       onChange={(e) => setPersonName(e.target.value)}
//                       placeholder="氏名を入力"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="purpose">
//                       用途名 <span className="text-gray-500">(任意)</span>
//                     </Label>
//                     <Input
//                       id="purpose"
//                       value={purpose}
//                       onChange={(e) => setPurpose(e.target.value)}
//                       placeholder="例: ゼミ活動、最終制作"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="numberOfUsers">
//                       利用人数 <span className="text-gray-500">(任意)</span>
//                     </Label>
//                     <Input
//                       id="numberOfUsers"
//                       type="number"
//                       value={numberOfUsers}
//                       onChange={(e) => setNumberOfUsers(e.target.value)}
//                       placeholder="例: 5"
//                     />
//                   </div>
//                 </div>
//                 {/* -- グループ3: 補足情報 -- */}
//                 <div className="space-y-2">
//                   <Label htmlFor="note">
//                     備考 <span className="text-gray-500">(任意)</span>
//                   </Label>
//                   <Textarea
//                     id="note"
//                     value={note}
//                     onChange={(e) => setNote(e.target.value)}
//                     placeholder="機材の持ち込みや、その他連絡事項があれば入力してください"
//                   />
//                 </div>
//               </div>
//               <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
//                 <div className="flex-grow text-left">
//                   {/* --- ↓ ダイアログ内のエラーメッセージ表示 --- */}
//                   {formError && (
//                     <p className="text-sm text-red-600">{formError}</p>
//                   )}
//                 </div>
//                 <Button type="button" onClick={handleConfirmReservation}>
//                   予約を確定
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>
//     );
//   };
// }
