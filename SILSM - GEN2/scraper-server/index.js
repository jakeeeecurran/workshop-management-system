import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sunco Motors Scraper API is running!',
    endpoints: {
      scrape: 'POST /api/scrape',
      health: 'GET /',
      test: 'GET /test',
      debug: 'POST /debug'
    }
  });
});

// Test endpoint to check if we can make external requests
app.get('/test', async (req, res) => {
  try {
    const response = await axios.get('https://httpbin.org/get', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000
    });
    res.json({ 
      success: true, 
      message: 'External requests are working',
      testResponse: response.data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'External requests failed: ' + error.message 
    });
  }
});

// Debug endpoint to see what HTML we're getting
app.post('/debug', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }
  
  try {
    const response = await axios.get(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 30000
    });
    
    res.json({
      success: true,
      htmlLength: response.data.length,
      htmlPreview: response.data.substring(0, 1000) + '...',
      fullHtml: response.data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Debug failed: ' + error.message 
    });
  }
});

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const html = await page.content();
    const $ = cheerio.load(html);

    // --- Extract ALL available data ---
    let scrapedData = {
      title: '',
      images: [],
      features: [],
      specs: [],
      pricing: [],
      contact: [],
      description: '',
      allText: [],
      metadata: {}
    };

    // --- Title Extraction ---
    scrapedData.title = $('h1, .vehicle-title').first().text().trim();
    if (!scrapedData.title) scrapedData.title = $('title').text().trim();

    // --- ALL Images ---
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-original');
      const alt = $(el).attr('alt') || '';
      if (src) {
        let fullSrc = src;
        if (src.startsWith('/')) {
          fullSrc = `https://suncomotors.com.au${src}`;
        } else if (src.startsWith('./')) {
          fullSrc = `https://suncomotors.com.au${src.substring(1)}`;
        } else if (!src.startsWith('http')) {
          fullSrc = `https://suncomotors.com.au/${src}`;
        }
        scrapedData.images.push({ src: fullSrc, alt: alt });
      }
    });

    // --- ALL Features/Specs ---
    $('li, p, .feature, .spec, .detail').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 3) {
        scrapedData.features.push(text);
      }
    });

    // --- Specifications ---
    $('.specs, .specifications, .vehicle-specs, .car-specs, .technical-specs').find('tr, .spec-item, .spec-row').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 3) {
        scrapedData.specs.push(text);
      }
    });

    // --- Pricing Information ---
    $('.price, .pricing, .cost, .value, .amount').each((i, el) => {
      const text = $(el).text().trim();
      if (text && /\$|price|cost|value/i.test(text)) {
        scrapedData.pricing.push(text);
      }
    });

    // --- Contact Information ---
    $('.contact, .phone, .email, .address, .location').each((i, el) => {
      const text = $(el).text().trim();
      if (text && /phone|email|address|contact|location/i.test(text)) {
        scrapedData.contact.push(text);
      }
    });

    // --- Description ---
    scrapedData.description = $('.description, .vehicle-description, .car-description, .details').text().trim();

    // --- ALL Text Content ---
    $('p, h1, h2, h3, h4, h5, h6, span, div').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10 && !scrapedData.allText.includes(text)) {
        scrapedData.allText.push(text);
      }
    });

    // --- Metadata ---
    scrapedData.metadata = {
      url: url,
      scrapedAt: new Date().toISOString(),
      totalImages: scrapedData.images.length,
      totalFeatures: scrapedData.features.length,
      totalSpecs: scrapedData.specs.length,
      totalTextBlocks: scrapedData.allText.length
    };

    await browser.close();
    res.json({
      success: true,
      data: scrapedData
    });
  } catch (err) {
    if (browser) await browser.close();
    res.status(500).json({ error: 'Failed to scrape: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Scraper server running on port ${PORT}`);
}); 