'use client'

import { useState } from 'react'
import { GameCard } from './GameCard'
import { GameModal } from './GameModal'
import type { Game } from '@/lib/types'

type Props = {
  games: Game[]
  imageBaseUrl: string
}

export function GameGrid({ games, imageBaseUrl }: Props) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-lg font-medium">ゲームが見つかりませんでした</p>
        <p className="mt-1 text-sm">条件を変えて検索してみてください</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            imageBaseUrl={imageBaseUrl}
            onClick={() => setSelectedGame(game)}
          />
        ))}
      </div>

      {selectedGame && (
        <GameModal
          game={selectedGame}
          imageBaseUrl={imageBaseUrl}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </>
  )
}
