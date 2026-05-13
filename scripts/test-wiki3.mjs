const games = ['Catan', 'Pandemic_(game)', 'Dominion_(card_game)', 'Terraforming_Mars_(board_game)']

for (const title of games) {
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, {
    headers: { 'User-Agent': 'BoardgameLibrary/1.0' }
  })
  const data = await res.json()
  console.log(title, '->', data.thumbnail?.source ?? 'no image')
}
