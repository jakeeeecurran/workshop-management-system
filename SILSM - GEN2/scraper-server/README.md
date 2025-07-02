# Sunco Motors Silent Salesman Generator - Scraper Server

This is the backend server for the Sunco Motors Silent Salesman Generator web application. It provides web scraping capabilities to extract vehicle data from car listing websites.

## Prerequisites

Before starting the server, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## Installation

1. **Navigate to the scraper server directory:**
   ```bash
   cd "SILSM - GEN2/scraper-server"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install the required packages:
   - `express` - Web server framework
   - `puppeteer` - Headless browser for web scraping
   - `cheerio` - HTML parsing library
   - `cors` - Cross-origin resource sharing middleware

## Starting the Server

### Method 1: Direct Node.js
```bash
node index.js
```

### Method 2: Using npm start (if configured)
```bash
npm start
```

### Method 3: Development mode with auto-restart
```bash
npx nodemon index.js
```

## Server Status

When the server starts successfully, you should see:
```
🚀 Scraper server running on http://localhost:3000
🌐 CORS enabled for all origins
```

## API Endpoints

### POST /scrape
Scrapes vehicle data from a provided URL.

**Request:**
```json
{
  "url": "https://suncomotors.com.au/vehicle-listing.html"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Vehicle Title",
    "images": [
      {
        "src": "https://example.com/image1.jpg",
        "alt": "Vehicle Image"
      }
    ],
    "features": ["Feature 1", "Feature 2"],
    "specs": ["Spec 1", "Spec 2"],
    "pricing": ["$30,000"],
    "contact": ["Contact Info"],
    "description": "Vehicle description",
    "allText": ["All text content"],
    "metadata": {
      "url": "https://example.com",
      "scrapedAt": "2024-01-01T00:00:00.000Z",
      "totalImages": 5,
      "totalFeatures": 10,
      "totalSpecs": 8,
      "totalTextBlocks": 25
    }
  }
}
```

## Troubleshooting

### Port Already in Use
If you get an error that port 3000 is already in use:

1. **Find the process using the port:**
   ```bash
   lsof -i :3000
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>
   ```

3. **Or use a different port:**
   Edit `index.js` and change the port number:
   ```javascript
   const PORT = 3001; // or any available port
   ```

### Puppeteer Installation Issues
If you encounter issues with Puppeteer:

1. **Reinstall Puppeteer:**
   ```bash
   npm uninstall puppeteer
   npm install puppeteer
   ```

2. **On macOS, you might need to allow the binary:**
   ```bash
   sudo xattr -d com.apple.quarantine node_modules/puppeteer/.local-chromium/chrome-mac/Chromium.app
   ```

### Permission Issues
If you get permission errors:

1. **Check file permissions:**
   ```bash
   ls -la index.js
   ```

2. **Make sure you have read/write access:**
   ```bash
   chmod 644 index.js
   ```

## Development

### File Structure
```
scraper-server/
├── index.js          # Main server file
├── package.json      # Dependencies and scripts
├── package-lock.json # Locked dependency versions
└── README.md         # This file
```

### Adding New Features
1. Edit `index.js` to add new scraping logic
2. Test with different URLs
3. Update this README if needed

## Security Notes

- The server runs on localhost only for security
- CORS is enabled for development purposes
- Consider adding rate limiting for production use
- Be mindful of website terms of service when scraping

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify the URL is accessible
3. Ensure all dependencies are installed
4. Check that the target website hasn't changed its structure

## License

This project is for internal use by Sunco Motors. 