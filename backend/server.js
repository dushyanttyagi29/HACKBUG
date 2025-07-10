const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { fetchJiraIssues, getStoredResults } = require("./fetchIssues");
const summarizeStoredResults = require("./summarizeIssues");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*', // Allow all origins
    credentials: false, // Must be false when origin is '*'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(bodyParser.json());

// Handle preflight requests
app.options('*', cors());

// Add additional CORS headers for all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Route: Search JIRA issues based on input query
app.post("/search", async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ success: false, error: "Query is required" });
        }
        const results = await fetchJiraIssues(query);
        res.json({ success: true, tickets: results });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ success: false, error: "Failed to search issues" });
    }
});

// Route: Get previously stored results
app.get("/tickets", (req, res) => {
    try {
        const tickets = getStoredResults();
        res.json({ success: true, tickets });
    } catch (error) {
        console.error("Tickets error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch tickets" });
    }
});

// Route: Generate summary of stored results
app.get("/summary", async (req, res) => {
    try {
        const summary = await summarizeStoredResults();
        res.json({ success: true, summary });
    } catch (error) {
        console.error("Summary error:", error);
        res.status(500).json({ success: false, error: "Failed to generate summary" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});

