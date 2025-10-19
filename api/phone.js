const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const query = req.query.name;
    if (!query) return res.status(400).json({ error: 'name query required' });

    const url = `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(query)}`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await resp.text();
    const $ = cheerio.load(text);

    let results = [];
    $('.makers li a').each((i, el) => {
      const href = $(el).attr('href');
      const title = $(el).find('strong').text().trim() || $(el).text().trim();
      const subtitle = $(el).find('span').text().trim() || '';
      let thumb = $(el).find('img').attr('src') || '';
      if (thumb && thumb.startsWith('//')) thumb = 'https:' + thumb;
      results.push({ title, subtitle, path: href, thumb });
    });

    // إذا لم نجد نتائج، نحاول البحث بالموديل داخل أول 10 صفحات نتائج محتملة
    if (results.length === 0) {
      console.log('No direct results found — trying model search fallback...');
      const altUrl = `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(query.split('-')[0])}`;
      const altResp = await fetch(altUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const altText = await altResp.text();
      const $$ = cheerio.load(altText);
      const links = [];

      $$('.makers li a').each((i, el) => {
        const href = $$(el).attr('href');
        if (href) links.push('https://www.gsmarena.com/' + href);
      });

      for (const link of links.slice(0, 10)) {
        try {
          const phoneResp = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const phoneText = await phoneResp.text();
          const p$ = cheerio.load(phoneText);
          const modelText = p$('[data-spec="models"]').text().toLowerCase();
          if (modelText.includes(query.toLowerCase())) {
            const title = p$('.specs-phone-name-title').first().text().trim() || 'Unknown';
            const thumb = 'https://www.gsmarena.com/' + (p$('.specs-photo-main img').attr('src') || '');
            const path = link.split('gsmarena.com/')[1];
            results.push({ title, subtitle: '', path, thumb });
            break;
          }
        } catch {}
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
