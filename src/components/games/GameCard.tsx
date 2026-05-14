import Image from "next/image";
import { GenreBadge, DifficultyBadge } from "@/components/ui/Badge";
import { formatPlayers, formatPlayTime } from "@/lib/utils";
import type { Game, Difficulty } from "@/lib/types";
import { GENRES } from "@/lib/types";

const VALID_GENRES = new Set<string>(GENRES.map((g) => g.value));

type Props = { game: Game; imageBaseUrl: string; isNew?: boolean; onClick: () => void };

export function GameCard({ game, imageBaseUrl, isNew = false, onClick }: Props) {
  const imageUrl = game.image_path
    ? `${imageBaseUrl}/${game.image_path}`
    : null;

  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col overflow-hidden rounded-xl bg-[#FEF3E8]/95 shadow-lg shadow-black/30 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 text-left cursor-pointer"
    >
      {/* 画像 */}
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        {/* バッジ */}
        {(isNew || game.is_popular) && (
          <div className="absolute left-1.5 top-1.5 z-10 flex flex-col gap-1">
            {isNew && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">NEW</span>
            )}
            {game.is_popular && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">人気</span>
            )}
          </div>
        )}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={game.title}
            fill
            className="object-contain p-1"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* テキスト */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
          {game.title}
        </h3>

        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{formatPlayers(game.min_players, game.max_players)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⏱</span>
            <span>{formatPlayTime(game.play_time_min, game.play_time_max)}</span>
          </div>
        </div>

        {/* バッジ */}
        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          {game.difficulty && (
            <DifficultyBadge difficulty={game.difficulty as Difficulty} />
          )}
          {game.genres?.filter((g) => VALID_GENRES.has(g)).map((g) => (
            <GenreBadge key={g} genre={g} />
          ))}
        </div>
      </div>
    </button>
  );
}
