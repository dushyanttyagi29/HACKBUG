// summarizeIssues.js
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getStoredResults } = require("./fetchIssues");

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function summarizeStoredResults() {
    const issues = getStoredResults();

    if (issues.length === 0) {
        return "No issues stored yet.";
    }

    const combinedText = issues.map(issue =>
        `Summary: ${issue.summary}\nDescription: ${issue.description}`
    ).join("\n\n");

    const prompt = `Summarize the following JIRA issues:\n\n${combinedText}`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error("Gemini Error:", error.message || error);
        return "Error generating summary.";
    }
}

module.exports = summarizeStoredResults;
