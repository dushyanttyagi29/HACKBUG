// // server.js
// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { fetchJiraIssues } = require("./fetchIssues");
// const summarizeStoredResults = require("./summarizeIssues");

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(bodyParser.json());

// app.post("/search", async (req, res) => {
//     try {
//         const { query } = req.body;
//         const results = await fetchJiraIssues(query);
//         res.json({ success: true, tickets: results });
//     } catch (error) {
//         console.error("Search error:", error);
//         res.status(500).json({ success: false, error: "Failed to search issues" });
//     }
// });

// app.get("/tickets", async (req, res) => {
//     try {
//         const { getStoredResults } = require("./fetchIssues");
//         const tickets = getStoredResults();
//         res.json({ success: true, tickets });
//     } catch (error) {
//         console.error("Tickets error:", error);
//         res.status(500).json({ success: false, error: "Failed to fetch tickets" });
//     }
// });

// app.get("/summary", async (req, res) => {
//     try {
//         const summary = await summarizeStoredResults();
//         res.json({ success: true, summary });
//     } catch (error) {
//         console.error("Summary error:", error);
//         res.status(500).json({ success: false, error: "Failed to generate summary" });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { fetchJiraIssues } = require("./fetchIssues");
// const summarizeStoredResults = require("./summarizeIssues");
// const { sanitizeInput, validateInput } = require("./utils/inputSanitizer");

// const app = express();
// const PORT = process.env.PORT || 3000;

// // CORS configuration for frontend on render
// app.use(cors({
//   origin: 'https://hackbug-2.onrender.com',
//   methods: ['GET', 'POST', 'OPTIONS'],
//   credentials: true
// }));

// app.use(bodyParser.json());

// app.post("/search", async (req, res) => {
//     try {
//         const { query } = req.body;

//         if (!validateInput(query)) {
//             console.warn(`Rejected suspicious input: ${query}`);
//             return res.status(400).json({ success: false, error: "Invalid input format" });
//         }

//         const safeQuery = sanitizeInput(query);
//         const results = await fetchJiraIssues(safeQuery);
//         res.json({ success: true, tickets: results });
//     } catch (error) {
//         console.error("Search error:", error);
//         res.status(500).json({ success: false, error: "Failed to search issues" });
//     }
// });














const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { fetchJiraIssues, getStoredResults } = require("./fetchIssues");
const summarizeStoredResults = require("./summarizeIssues");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

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

