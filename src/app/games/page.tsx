import { Suspense } from "react";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { GamesClient } from "@/components/games/GamesClient";
import { NavMenu } from "@/components/ui/NavMenu";
import type { Game } from "@/lib/types";

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-images`;

// 一覧表示に必要なカラムのみ取得（rules・description・recommended_for は除外）
const GAMES_SELECT =
  "id, title, slug, title_kana, min_players, max_players, play_time_min, play_time_max, difficulty, genres, image_path, is_popular, is_recommendable, sort_order, created_at, external_url";

// 1時間キャッシュ。管理画面でゲームを保存・削除すると自動でリセット
const fetchPublishedGames = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("games")
      .select(GAMES_SELECT)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    return data ?? [];
  },
  ["games-list"],
  { revalidate: 3600, tags: ["games-list"] }
);

async function GamesWithData() {
  const games = await fetchPublishedGames();
  return (
    <GamesClient allGames={games as Game[]} imageBaseUrl={IMAGE_BASE_URL} />
  );
}

// ページシェルは同期関数（ランタイムAPIにアクセスしない）
export default function GamesPage() {
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

      {/* DB fetch + フィルタリング（Suspense 内で完結） */}
      <Suspense fallback={<GamesLoadingSkeleton />}>
        <GamesWithData />
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
