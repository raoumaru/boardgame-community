const res = await fetch(
  'https://en.wikipedia.org/w/api.php?action=query&titles=Catan&prop=pageimages&format=json&pithumbsize=600',
  { headers: { 'User-Agent': 'BoardgameLibrary/1.0' } }
)
const data = await res.json()
const pages = data.query.pages
const page = Object.values(pages)[0]
console.log(JSON.stringify(page, null, 2))
