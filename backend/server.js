// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { fetchJiraIssues } = require("./fetchIssues");
const summarizeStoredResults = require("./summarizeIssues");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/search", async (req, res) => {
    try {
        const { query } = req.body;
        const results = await fetchJiraIssues(query);
        res.json({ success: true, tickets: results });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ success: false, error: "Failed to search issues" });
    }
});

app.get("/tickets", async (req, res) => {
    try {
        const { getStoredResults } = require("./fetchIssues");
        const tickets = getStoredResults();
        res.json({ success: true, tickets });
    } catch (error) {
        console.error("Tickets error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch tickets" });
    }
});

app.get("/summary", async (req, res) => {
    try {
        const summary = await summarizeStoredResults();
        res.json({ success: true, summary });
    } catch (error) {
        console.error("Summary error:", error);
        res.status(500).json({ success: false, error: "Failed to generate summary" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
