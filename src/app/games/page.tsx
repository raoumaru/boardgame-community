import { Suspense } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { GameGrid } from "@/components/games/GameGrid";
import { SearchAndFilter } from "@/components/games/SearchAndFilter";
import { NavMenu } from "@/components/ui/NavMenu";
import type { Game } from "@/lib/types";

type SearchParams = Promise<{
  q?: string;
  genre?: string;
  players?: string;
  time?: string;
  difficulty?: string;
}>;

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-images`;

function toKatakana(str: string): string {
  return str.replace(/[ぁ-ゖ]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  )
}

function toHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  )
}

async function GamesContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("games")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (params.q) {
    const kata = toKatakana(params.q)
    const hira = toHiragana(params.q)
    const terms = [...new Set([params.q, kata, hira])]
    const filters = [
      ...terms.map(t => `title.ilike.%${t}%`),
      ...terms.map(t => `title_kana.ilike.%${t}%`),
    ].join(",")
    query = query.or(filters)
  }
  if (params.genre) {
    query = query.contains("genres", [params.genre]);
  }
  if (params.players) {
    const n = parseInt(params.players);
    if (!isNaN(n)) {
      if (n === 8) {
        query = query.gte("max_players", 8);
      } else {
        query = query.lte("min_players", n).gte("max_players", n);
      }
    }
  }
  if (params.difficulty) {
    query = query.eq("difficulty", params.difficulty);
  }
  if (params.time) {
    if (params.time === "91") {
      // 90分以上
      query = query.gte("play_time_min", 90);
    } else if (params.time === "30") {
      // 〜30分：最短時間が30分以内
      query = query.lte("play_time_min", 30);
    } else if (params.time === "30-60") {
      // 30〜60分：時間範囲が[30,60]と重複
      query = query
        .lte("play_time_min", 60)
        .or("play_time_max.gte.30,and(play_time_max.is.null,play_time_min.gte.30)")
    } else if (params.time === "60-90") {
      // 60〜90分：時間範囲が[60,90]と重複
      query = query
        .lte("play_time_min", 90)
        .or("play_time_max.gte.60,and(play_time_max.is.null,play_time_min.gte.60)")
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
