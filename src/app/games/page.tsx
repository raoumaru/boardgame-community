import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { GameGrid } from "@/components/games/GameGrid";
import { SearchAndFilter } from "@/components/games/SearchAndFilter";
import type { Game } from "@/lib/types";

type SearchParams = Promise<{
  q?: string;
  genre?: string;
  players?: string;
  time?: string;
  difficulty?: string;
}>;

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-images`;

async function GamesContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("games")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }
  if (params.genre) {
    query = query.contains("genres", [params.genre]);
  }
  if (params.players) {
    const n = parseInt(params.players);
    if (!isNaN(n)) {
      if (n === 8) {
        // 8人以上：max_players が8以上のゲーム
        query = query.gte("max_players", 8);
      } else {
        // ちょうどN人で遊べるゲーム
        query = query.lte("min_players", n).gte("max_players", n);
      }
    }
  }
  if (params.difficulty) {
    query = query.eq("difficulty", params.difficulty);
  }
  if (params.time) {
    const t = parseInt(params.time);
    if (!isNaN(t)) {
      if (t === 91) {
        // 90分以上
        query = query.gte("play_time_min", 90);
      } else {
        query = query.lte("play_time_min", t);
      }
    }
  }

  const { data: games } = await query;

  return (
    <GameGrid games={(games ?? []) as Game[]} imageBaseUrl={IMAGE_BASE_URL} />
  );
}

export default function GamesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-amber-200 drop-shadow-[0_2px_8px_rgba(255,120,0,0.5)]">
          ラ王のボドゲ倉庫
        </h1>
        <p className="mt-1 text-sm text-orange-200/80">
          サークル用ボードゲーム一覧
        </p>
      </div>

      {/* 検索・フィルター */}
      <Suspense>
        <SearchAndFilter />
      </Suspense>

      {/* ゲーム一覧 */}
      <Suspense fallback={<GamesLoadingSkeleton />}>
        <GamesContent searchParams={searchParams} />
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
