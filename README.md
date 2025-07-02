# 🚗 Workshop Management System

A professional workshop get-ready management system for Sunco Motors, designed for multi-device access and real-time collaboration.

## ✨ Features

- **Multi-device access** - Access from any device on your network
- **Real-time data sync** - All devices see the same data
- **CSV Import/Export** - Easy data migration and backup
- **Responsive design** - Works on desktop, tablet, and mobile
- **Fullscreen mode** - Perfect for wall-mounted displays
- **Professional UI** - Sunco Motors branding with orange/yellow theme

## 🚀 Quick Start

### Option 1: Local Network Hosting (Recommended for Workshop)

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the system**
   - On your computer: `http://localhost:3000`
   - On other devices: `http://YOUR_COMPUTER_IP:3000`
   
   To find your computer's IP address:
   - **Windows**: Run `ipconfig` in Command Prompt
   - **Mac/Linux**: Run `ifconfig` in Terminal

### Option 2: Cloud Hosting (For External Access)

#### Deploy to Railway (Free tier available)
1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy automatically

#### Deploy to Render (Free tier available)
1. Create account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`

#### Deploy to Heroku
1. Create account at [heroku.com](https://heroku.com)
2. Install Heroku CLI
3. Run commands:
   ```bash
   heroku create your-workshop-app
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

## 📱 Multi-Device Access

### Local Network Setup
1. Ensure all devices are on the same WiFi network
2. Find your computer's IP address (see Quick Start)
3. Access from any device: `http://YOUR_IP:3000`

### External Access Setup
1. Deploy to a cloud service (see Option 2 above)
2. Share the provided URL with your team
3. Access from anywhere with internet connection

## 🔧 Configuration

### Change Port (if needed)
Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your preferred port
```

### Data Storage
- **Local**: Data stored in `data/` folder as JSON files
- **Cloud**: Data persists across deployments

## 📊 Data Management

### CSV Export
- Exports all data (pending + completed)
- Includes all fields: Stock Number, RO Number, Brand, Model, etc.
- Automatic filename with date: `workshop_data_YYYY-MM-DD.csv`

### CSV Import
- Import existing data from spreadsheets
- Supports all system fields
- Automatic categorization (pending vs completed)

## 🛠️ Development

### Run in Development Mode
```bash
npm run dev
```
This will restart the server automatically when you make changes.

### File Structure
```
├── index.html              # Main dashboard
├── add-vehicle.html        # Add vehicle form
├── workshop-view.html      # Workshop view with grid
├── server.js              # Node.js server
├── package.json           # Dependencies
├── data/                  # Data storage (created automatically)
│   ├── workshopEntries.json
│   └── completedEntries.json
└── README.md              # This file
```

## 🔒 Security Notes

- **Local network**: Only accessible to devices on your network
- **Cloud hosting**: Consider adding authentication for external access
- **Data backup**: Regular CSV exports recommended

## 🆘 Troubleshooting

### Can't access from other devices?
1. Check firewall settings
2. Ensure devices are on same network
3. Verify IP address is correct
4. Try disabling antivirus temporarily

### Server won't start?
1. Check if port 3000 is already in use
2. Change port in server.js
3. Ensure Node.js is installed

### Data not syncing?
1. Check network connection
2. Refresh browser
3. Clear browser cache
4. Check server logs

## 📞 Support

For technical support or feature requests, contact your IT team or the system developer.

---

**Built for Sunco Motors** 🚗 | **Professional Workshop Management** ⚙️ 