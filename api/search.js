const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ error: 'name query required' });

    const url = `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(name)}`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await resp.text();
    const $ = cheerio.load(text);

    const results = [];
    // GSMArena search results: .makers li a
    $('.makers li a').each((i, el) => {
      const href = $(el).attr('href'); // relative path like 'huawei_y9_prime_(2019)-9742.php'
      const title = $(el).find('strong').text().trim() || $(el).text().trim();
      const subtitle = $(el).find('span').text().trim() || '';
      let thumb = $(el).find('img').attr('src') || '';
      if (thumb && thumb.startsWith('//')) thumb = 'https:' + thumb;
      results.push({ title, subtitle, path: href, thumb });
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
