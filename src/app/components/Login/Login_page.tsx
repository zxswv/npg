// src/app/components/Login/Login_page.tsx
"use client";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export default function Login_page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoing = () => {
    // ログイン処理をここに実装
    console.log("入力されたメールアドレス:", email);
    console.log("入力されたパスワード:", password);
    console.log("ログイン情報:", { email, password });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">ログイン</CardTitle>
          <CardDescription className="text-center">
            アカウントにログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email} //Input に状態を反映
              onChange={(e) => setEmail(e.target.value)} //入力変更時に状態更新
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="パスワードを入力してください"
              value={password} //Input に状態を反映
              onChange={(e) => setPassword(e.target.value)} //入力変更時に状態更新
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-gray-300"
              />
              <Label htmlFor="remember" className="text-sm">
                ログイン状態を保持する
              </Label>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              パスワードを忘れた方
            </a>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" onClick={handleLoing}>
            ログイン
          </Button>
          <div className="text-center text-sm text-gray-600">
            アカウントをお持ちでない方は{" "}
            <a href="#" className="text-blue-600 hover:underline">
              新規登録
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
