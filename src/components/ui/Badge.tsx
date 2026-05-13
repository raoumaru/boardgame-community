import { GENRES, DIFFICULTY_LABELS, DIFFICULTY_COLORS, type Difficulty } from "@/lib/types";

export function GenreBadge({ genre }: { genre: string }) {
  const label = GENRES.find((g) => g.value === genre)?.label ?? genre;
  return (
    <span className="inline-flex items-center rounded-full bg-[#2D5A27]/10 px-2 py-0.5 text-xs font-medium text-[#2D5A27]">
      {label}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[difficulty]}`}
    >
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}
