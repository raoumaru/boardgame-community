// Wikimedia Commons から直接画像を探す
const titles = ['Catan (board game)', 'Pandemic (game)', 'Dominion (card game)']

for (const title of titles) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600&piprop=thumbnail|original`
  const res = await fetch(url, { headers: { 'User-Agent': 'BoardgameLibrary/1.0' } })
  const data = await res.json()
  const page = Object.values(data.query.pages)[0]
  console.log(title, '->', page.thumbnail?.source ?? page.original?.source ?? 'no image')
}
