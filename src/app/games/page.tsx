import { Suspense } from "react";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { GamesClient } from "@/components/games/GamesClient";
import { NavMenu } from "@/components/ui/NavMenu";
import type { Game } from "@/lib/types";

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-images`;

export default async function GamesPage() {
  const supabase = createAdminClient();
  const { data: games } = await supabase
    .from("games")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <NavMenu />
      {/* ヘッダー */}
      <div className="relative mb-6 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-center sm:pt-10">
        <div className="sm:absolute sm:left-0 sm:top-0">
          <Image
            src="/logo.png"
            alt="ラ王のボドゲ倉庫"
            width={157}
            height={59}
            className="w-[79px] sm:w-[157px] h-auto object-contain drop-shadow-[0_2px_12px_rgba(255,120,0,0.4)]"
            priority
          />
        </div>
        <p className="w-full text-center text-lg font-bold tracking-widest text-amber-200 drop-shadow-[0_2px_8px_rgba(255,120,0,0.5)]">
          ボードゲーム一覧
        </p>
      </div>

      {/* 検索・フィルター＋ゲーム一覧（クライアントサイド） */}
      <Suspense fallback={<GamesLoadingSkeleton />}>
        <GamesClient allGames={(games ?? []) as Game[]} imageBaseUrl={IMAGE_BASE_URL} />
      </Suspense>
    </div>
  );
}

function GamesLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl bg-white/90 shadow-md">
          <div className="aspect-[4/3] animate-pulse bg-gray-200" />
          <div className="space-y-2 p-3">
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
