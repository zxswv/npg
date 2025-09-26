import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const allBBSPosts = await prisma.post.findMany();
  return NextResponse.json(allBBSPosts);
}
