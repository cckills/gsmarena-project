const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) return res.status(400).send('path query required');

    // جلب صفحة الهاتف من Telfonak
    const url = path.startsWith('http') ? path : 'https://telfonak.com' + path;
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!resp.ok) return res.status(502).send('Bad response from Telfonak: ' + resp.status);

    const text = await resp.text();
    const $ = cheerio.load(text);

    // الصورة والعنوان
    const header = $('.entry-title').first().html() || '';
    const imageHtml = $('.entry-content img').first().parent().html() || '';
    
    // المواصفات عادة داخل جدول أو div.specs
    const specsList = $('.specs, table').first().html() || $('.entry-content table').first().html() || '';

    const out = `
      <div class="row">
        <div class="col-md-4">
          ${imageHtml}
        </div>
        <div class="col-md-8">
          ${header}
        </div>
      </div>
      <hr/>
      <div>
        ${specsList}
      </div>
      <div class="mt-3 text-muted small">Source: Telfonak</div>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(out);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
};
