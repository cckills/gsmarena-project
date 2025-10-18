const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ error: 'name query required' });

    // البحث في Telfonak
    const url = `https://telfonak.com/?s=${encodeURIComponent(name)}`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await resp.text();
    const $ = cheerio.load(text);

    const results = [];
    // Telfonak يستخدم div.card أو div.product-card
    $('.product-card, .card').each((i, el) => {
      const aTag = $(el).find('a').first();
      const href = aTag.attr('href') || '';
      const title = aTag.text().trim() || '';
      let thumb = $(el).find('img').attr('src') || '';
      if (thumb && thumb.startsWith('//')) thumb = 'https:' + thumb;
      results.push({ title, path: href, thumb });
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
