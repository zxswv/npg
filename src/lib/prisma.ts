// src/lib/prisma.ts
// クライアントで prisma を通じてデータベースを操作・利用するための機能をインポート
import { PrismaClient } from "@/generated/prisma";
// 型エラー回避例
import { withAccelerate } from "@prisma/extension-accelerate";

// これで「ブロックスコープの変数 'globalForPrisma' を再宣言できません」エラーは解消します。
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 素のPrismaClientのシングルトンインスタンスを作成
// もしグローバルに存在すればそれを使用し、なければ新規作成する
const prismaBase =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

// アプリケーション全体で実際に使用するクライアントは、
// 上記のシングルトンインスタンスをAccelerateで拡張したもの
export const prisma = prismaBase.$extends(withAccelerate());

// 開発環境でのみ、素のPrismaClientインスタンスをグローバルに保存する
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaBase;
}
