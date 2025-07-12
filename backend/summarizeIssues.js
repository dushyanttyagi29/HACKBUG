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

    // Create a list of project/question numbers for the summary
    const projectNumbers = issues.map((issue, index) => {
        if (issue.source === 'StackOverflow') {
            return `Question ${index + 1}`;
        } else {
            return `Project ${issue.key || `#${index + 1}`}`;
        }
    }).join(', ');

    const prompt = `
    You are an expert bug triage assistant.

    Analyze the following issues and provide a structured summary in exactly three sections:

    **Summary of Tickets:**
    Provide a comprehensive paragraph summarizing all the issues found. Include the main problems, common patterns, and overall impact. This should be a cohesive narrative that ties all the issues together.

    **Root Cause Analysis:**
    Provide a detailed paragraph explaining the underlying root cause(s) of these issues. Focus on the fundamental problems that lead to these bugs occurring.

    **Resolution Steps:**
    Provide a numbered list of specific steps to resolve these issues. Each step should be actionable and clear.

    At the very end of your response, include this line exactly:
    **Project/Question Numbers:** ${projectNumbers}

    Format your response exactly as follows:

    Summary of Tickets:
    [Your comprehensive paragraph here]

    Root Cause Analysis:
    [Your root cause analysis paragraph here]

    Resolution Steps:
    1. [Step 1]
    2. [Step 2]
    3. [Step 3]
    ...

    **Project/Question Numbers:** ${projectNumbers}

    Here are the issues to analyze:

    ${combinedText}
    `;

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
