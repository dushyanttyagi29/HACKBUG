// // fetchIssues.js
// require("dotenv").config();
// const axios = require("axios");

// let storedResults = [];

// // Helper function to extract text from Jira's structured content
// function extractTextFromContent(content) {
//     if (!Array.isArray(content)) return '';
    
//     return content.map(item => {
//         if (item.type === 'text') {
//             return item.text || '';
//         } else if (item.content) {
//             return extractTextFromContent(item.content);
//         }
//         return '';
//     }).join(' ').trim();
// }

// async function fetchJiraIssues(query) {
//     const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');

//     const jql = `project=${process.env.JIRA_PROJECT_KEY} AND summary ~ "${query}" ORDER BY created DESC`;

//     try {
//         const response = await axios.get(`${process.env.JIRA_DOMAIN}/rest/api/3/search`, {
//             headers: {
//                 'Authorization': `Basic ${auth}`,
//                 'Accept': 'application/json'
//             },
//             params: {
//                 jql: jql,
//                 maxResults: 10
//             }
//         });

//         const issues = response.data.issues.map(issue => {
//             try {
//                 // Handle description field which can be null or an object
//                 let description = '';
//                 if (issue.fields.description) {
//                     if (typeof issue.fields.description === 'string') {
//                         description = issue.fields.description;
//                     } else if (issue.fields.description.content) {
//                         // Handle Jira's structured content format
//                         description = extractTextFromContent(issue.fields.description.content);
//                     }
//                 }
                
//                 return {
//                     key: issue.key || 'Unknown',
//                     summary: issue.fields.summary || 'No summary available',
//                     description: description,
//                     url: `${process.env.JIRA_DOMAIN}/browse/${issue.key}`
//                 };
//             } catch (error) {
//                 console.error('Error processing issue:', error);
//                 return {
//                     key: 'Error',
//                     summary: 'Error processing this issue',
//                     description: 'Unable to load issue details',
//                     url: '#'
//                 };
//             }
//         });

//         storedResults = issues;  // Save for later summarization
//         return issues;

//     } catch (error) {
//         console.error("Error fetching issues:", error.response?.data || error.message);
//         return [];
//     }
// }

// // function getStoredResults() {
// //     return storedResults;
// // }


// function getStoredResults() {
//     console.log("🔍 Stored Results Accessed:", storedResults);
//     return storedResults;
// }


// module.exports = { fetchJiraIssues, getStoredResults };












// fetchIssues.js
require("dotenv").config();
const axios = require("axios");

let storedResults = [];

// Helper function to extract text from Jira's structured content
function extractTextFromContent(content) {
    if (!Array.isArray(content)) return '';
    
    return content.map(item => {
        if (item.type === 'text') {
            return item.text || '';
        } else if (item.content) {
            return extractTextFromContent(item.content);
        }
        return '';
    }).join(' ').trim();
}

// Fetch from Jira
async function fetchJiraIssues(query) {
    const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');

    const jql = `project=${process.env.JIRA_PROJECT_KEY} AND summary ~ "${query}" ORDER BY created DESC`;

    try {
        const response = await axios.get(`${process.env.JIRA_DOMAIN}/rest/api/3/search`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json'
            },
            params: {
                jql: jql,
                maxResults: 10
            }
        });

        const issues = response.data.issues.map(issue => {
            try {
                let description = '';
                if (issue.fields.description) {
                    if (typeof issue.fields.description === 'string') {
                        description = issue.fields.description;
                    } else if (issue.fields.description.content) {
                        description = extractTextFromContent(issue.fields.description.content);
                    }
                }

                return {
                    key: issue.key || 'Unknown',
                    summary: issue.fields.summary || 'No summary available',
                    description: description,
                    url: `${process.env.JIRA_DOMAIN}/browse/${issue.key}`,
                    source: 'Jira'
                };
            } catch (error) {
                console.error('Error processing Jira issue:', error);
                return {
                    key: 'Error',
                    summary: 'Error processing this Jira issue',
                    description: 'Unable to load issue details',
                    url: '#',
                    source: 'Jira'
                };
            }
        });

        return issues;
    } catch (error) {
        console.error("Error fetching Jira issues:", error.response?.data || error.message);
        return [];
    }
}

// Fetch from StackOverflow (top 3 accepted, relevant results)
async function fetchStackOverflowResults(query) {
    try {
        const response = await axios.get('https://api.stackexchange.com/2.3/search/advanced', {
            params: {
                order: 'desc',
                sort: 'relevance',
                accepted: true,
                answers: 1,
                site: 'stackoverflow',
                q: query,
                filter: 'withbody' // Include question body content
            }
        });

        const items = response.data.items.slice(0, 3); // Top 3

        return items.map(item => {
            // Extract question body content and clean HTML tags
            let description = '';
            if (item.body) {
                // Remove HTML tags and decode HTML entities
                description = item.body
                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
                    .replace(/&amp;/g, '&') // Replace &amp; with &
                    .replace(/&lt;/g, '<') // Replace &lt; with <
                    .replace(/&gt;/g, '>') // Replace &gt; with >
                    .replace(/&quot;/g, '"') // Replace &quot; with "
                    .trim();
                
                // Limit description length
                if (description.length > 300) {
                    description = description.substring(0, 300) + '...';
                }
            }

            return {
                key: `SO-${item.question_id}`,
                summary: item.title || 'No title',
                description: description || `Answer Count: ${item.answer_count}\nScore: ${item.score}`,
                url: item.link,
                source: 'StackOverflow',
                answerCount: item.answer_count,
                score: item.score
            };
        });

    } catch (error) {
        console.error("Error fetching StackOverflow results:", error.response?.data || error.message);
        return [];
    }
}

// Combined fetch function used by /search
async function fetchIssues(query) {
    const jiraIssues = await fetchJiraIssues(query);
    const stackOverflowResults = await fetchStackOverflowResults(query);

    storedResults = [...jiraIssues, ...stackOverflowResults];
    return storedResults;
}

// Return all stored results
function getStoredResults() {
    console.log("🔍 Stored Results Accessed:", storedResults);
    return storedResults;
}

module.exports = { fetchIssues, getStoredResults };
