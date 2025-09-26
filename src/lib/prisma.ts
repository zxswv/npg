// src/lib/prisma.ts
// クライアントで prisma を通じてデータベースを操作・利用するための機能をインポート
import { PrismaClient } from "@prisma/client";

// グローバル変数に prisma クライアントを保持
// これにより、開発環境での再起動時にクライアントの再生成を防ぐ
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma クライアントのインスタンスを生成
// グローバル変数に prisma クライアントが存在しない場合は新規インスタンスを生成
// 既に存在する場合はそのインスタンスを使用
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // ログレベルを設定
  });

// 開発環境では、グローバル変数に prisma クライアントを設定
// これにより、Hot Reload 時にクライアントが再生成されない
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
