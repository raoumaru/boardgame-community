const res = await fetch('https://boardgamegeek.com/boardgame/13/catan', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
    'Accept': 'text/html',
  }
})
console.log('status:', res.status)
const html = await res.text()
const m = html.match(/property="og:image"\s+content="([^"]+)"/)
console.log('image:', m ? m[1] : 'not found')
console.log('snippet:', html.slice(0, 200))
