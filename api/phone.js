const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) return res.status(400).send('path query required');

    // Ensure we don't allow external redirects - only fetch from gsmarena
    const cleanPath = path.replace(/[^a-zA-Z0-9_\-\(\)\.]/g, '');
    const url = 'https://www.gsmarena.com/' + cleanPath;

    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!resp.ok) return res.status(502).send('Bad response from GSMArena: ' + resp.status);
    const text = await resp.text();
    const $ = cheerio.load(text);

    // Extract the main specs table and the header (title + image)
    const header = $('.specs-phone-title').html() || $('.article-info').html() || '';
    const specsList = $('#specs-list').html() || '';
    const imageHtml = $('.specs-photo-main').html() || $('.review-gallery').html() || '';

    // Build a simple HTML block to return to the frontend
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
      <div class="mt-3 text-muted small">Source: GSM Arena</div>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(out);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
};
