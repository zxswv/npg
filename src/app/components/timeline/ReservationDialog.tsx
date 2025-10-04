// app/components/timeline/ReservationDialog.tsx

"use client";
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

// Propsの型定義
interface ReservationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlotsSize: number;
  formState: any; // 簡潔にするためanyを使用
  onFormStateChange: (field: string, value: string) => void;
  onConfirm: () => void;
}

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

export function ReservationDialog({
  isOpen,
  onOpenChange,
  selectedSlotsSize,
  formState,
  onFormStateChange,
  onConfirm,
}: ReservationDialogProps) {
  const {
    personName,
    grade,
    className,
    purpose,
    numberOfUsers,
    note,
    formError,
  } = formState;

  return (
    //  --- ↓ 予約実行用のダイアログ ---
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">予約情報の入力</DialogTitle>
          <DialogDescription>
            選択した {selectedSlotsSize}件の部屋を予約します。
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
                <Select
                  onValueChange={(v) => onFormStateChange("grade", v)}
                  value={grade}
                >
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
                <Select
                  onValueChange={(v) => onFormStateChange("className", v)}
                  value={className}
                >
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
                onChange={(e) =>
                  onFormStateChange("personName", e.target.value)
                }
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
                onChange={(e) => onFormStateChange("purpose", e.target.value)}
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
                onChange={(e) => onFormStateChange("number", e.target.value)}
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
              onChange={(e) => onFormStateChange("note", e.target.value)}
              placeholder="機材の持ち込みや、その他連絡事項があれば入力してください"
            />
          </div>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <div className="flex-grow text-left">
            {/* --- ↓ ダイアログ内のエラーメッセージ表示 --- */}
            {formError && <p className="text-sm text-red-600">{formError}</p>}
          </div>
          <Button type="button" onClick={onConfirm}>
            予約を確定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
