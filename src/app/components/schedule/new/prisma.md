### ディレクトリ構成の一例

```bash
app/
├─ api/
│  ├─ room/
│  │  └─ route.ts       ← REST API (GET)
│  └─ reservation/
│     └─ route.ts       ← REST API (POST/GET)
├─ reserve/
│  └─ actions.ts        ← server action
lib/
├─ prisma.ts            ← PrismaClient 共通化
├─ reservation.ts       ← ビジネスロジック（option）
```
