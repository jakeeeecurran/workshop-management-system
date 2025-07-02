const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// API endpoints for data persistence
app.get('/api/data', (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'data');
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath);
        }
        
        const entriesPath = path.join(dataPath, 'workshopEntries.json');
        const completedPath = path.join(dataPath, 'completedEntries.json');
        
        const entries = fs.existsSync(entriesPath) ? JSON.parse(fs.readFileSync(entriesPath, 'utf8')) : [];
        const completed = fs.existsSync(completedPath) ? JSON.parse(fs.readFileSync(completedPath, 'utf8')) : [];
        
        res.json({ entries, completed });
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/data', (req, res) => {
    try {
        const { entries, completed } = req.body;
        const dataPath = path.join(__dirname, 'data');
        
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath);
        }
        
        fs.writeFileSync(path.join(dataPath, 'workshopEntries.json'), JSON.stringify(entries, null, 2));
        fs.writeFileSync(path.join(dataPath, 'completedEntries.json'), JSON.stringify(completed, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚗 Workshop Management System running on http://localhost:${PORT}`);
    console.log(`📱 Access from other devices on your network using your computer's IP address`);
    console.log(`🌐 For external access, consider deploying to a cloud service`);
}); 