 //const API_BASE_URL = 'http://localhost:3005';



const API_BASE_URL = 'https://hackbug-back.onrender.com';

function showSearchPage() {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('search-page').style.display = 'block';
    document.querySelector('.back-btn').style.display = 'block';
    // Add class to make logo text always visible in search page
    document.querySelector('.logo-text').classList.add('show');
}

function goHome() {
    document.getElementById('home-page').style.display = 'block';
    document.getElementById('search-page').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';
    document.querySelector('.back-btn').style.display = 'none';
    // Remove class so it goes back to scroll-controlled visibility
    document.querySelector('.logo-text').classList.remove('show');
}


async function searchBugs() {
    const input = document.getElementById('bug-input').value;
    if (!input.trim()) {
        alert('Please enter a bug description');
        return;
    }

    const resultCards = document.querySelectorAll('.result-card');
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

    resultCards[0].innerHTML = '<h3><i class="fas fa-spinner fa-spin"></i> Searching Tickets...</h3><p>Finding similar issues...</p>';
    resultCards[1].innerHTML = '<h3><i class="fas fa-spinner fa-spin"></i> Generating Summary...</h3><p>AI analysis in progress...</p>';

    try {
        // 1. Search request
        const searchRes = await fetch(`${API_BASE_URL}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: input })
        });

        const searchData = await searchRes.json();

        if (!searchData.success) {
            throw new Error('Search failed: ' + (searchData.error || 'unknown error'));
        }

        console.log("✅ Search Results:", searchData.tickets);

        // 2. Now GET tickets to confirm storage
        const ticketRes = await fetch(`${API_BASE_URL}/tickets`);
        const ticketData = await ticketRes.json();
        console.log("🎟️ /tickets response:", ticketData);

        const summaryRes = await fetch(`${API_BASE_URL}/summary`);
        const summaryData = await summaryRes.json();
        console.log("🧠 /summary response:", summaryData);


        // Update result cards
        const ticketCount = ticketData.tickets?.length || 0;
        const matchLabel = ticketCount === 1  ? 'match' : 'matches';

        resultCards[0].innerHTML = `<h3><i class="fas fa-file-alt"></i> Similar Tickets </h3><p>Top ${ticketCount} ${matchLabel} found • Click to know more</p>`;
        resultCards[1].innerHTML = `<h3><i class="fas fa-lightbulb"></i> Summary</h3><p>Consolidated solution • Click to know more</p>`;




    } catch (error) {
        console.error('❌ Search Error:', error);
        alert('Search failed. Please try again.');

        resultCards[0].innerHTML = `<h3><i class="fas fa-file-alt"></i> Similar Tickets <span class="result-arrow">→</span></h3><p>0 matches found • Click to know more</p>`;
        resultCards[1].innerHTML = `<h3><i class="fas fa-lightbulb"></i> Summary <span class="result-arrow">→</span></h3><p>Try again • Click to know more</p>`;
    }
}




async function showSimilarTickets() {
    document.getElementById('tickets-modal').style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/tickets`);
        const data = await response.json();
        
        if (data.success) {
            displayTickets(data.tickets);
        } else {
            throw new Error(data.error || 'Failed to fetch tickets');
        }
    } catch (error) {
        console.error('Tickets error:', error);
        displayTicketsError();
    }
}

function displayTickets(tickets) {
    const container = document.getElementById('tickets-container');
    const countElement = document.getElementById('tickets-count');
    
    // Debug: Log the tickets data to understand the structure
    console.log('Tickets data received:', tickets);
    
    if (!Array.isArray(tickets) || tickets.length === 0) {
        countElement.textContent = 'No similar tickets found';
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-info-circle" style="font-size: 24px; margin-bottom: 10px;"></i>
                <p>No similar tickets found for this issue.</p>
            </div>
        `;
        return;
    }
    
    countElement.textContent = `Top ${tickets.length} matching issues from Jira & StackOverflow`;
    
    const ticketsHTML = tickets.map((ticket, index) => {
        // If StackOverflow, show answer count and score as extra info
        let extraInfo = '';
        let description = '';
        
        if (ticket.source === 'StackOverflow') {
            extraInfo = `<div class="so-extra">📝 Answers: ${ticket.answerCount || 0} • ⭐ Score: ${ticket.score || 0}</div>`;
            
            // Add meaningful Stack Overflow content
            if (ticket.description && typeof ticket.description === 'string') {
                description = ticket.description.length > 200 ? 
                    ticket.description.substring(0, 200) + '...' : 
                    ticket.description;
            } else {
                description = 'This Stack Overflow question addresses a similar technical issue. The community has provided multiple solutions and approaches to resolve this problem.';
            }
        } else {
            // Jira ticket content
            description = ticket.description && typeof ticket.description === 'string' ? 
                (ticket.description.length > 200 ? ticket.description.substring(0, 200) + '...' : ticket.description) 
                : 'This Jira ticket documents a similar issue that has been resolved. It contains detailed information about the problem and its solution.';
        }
        
        // Add special styling for the first item to make it more attractive
        const isFirstItem = index === 0;
        const itemClass = isFirstItem ? 'ticket-item featured-ticket' : 'ticket-item';
        
        return `
        <div class="${itemClass}">
            <div class="ticket-header">
                <div class="ticket-meta">
                    <span class="ticket-tag">${ticket.key || 'Unknown'}</span>
                    <span class="ticket-tag ${ticket.source === 'StackOverflow' ? 'so-tag' : 'jira-tag'}">${ticket.source || 'Jira'}</span>
                </div>
            </div>
            <div class="ticket-title">${ticket.summary || 'No title available'}</div>
            <div class="ticket-description">
                ${description}
                ${extraInfo}
            </div>
            ${ticket.url ? `<div class="ticket-link"><a href="${ticket.url}" target="_blank">${ticket.source === 'StackOverflow' ? 'View on StackOverflow →' : 'View in Jira →'}</a></div>` : ''}
        </div>
        `;
    }).join('');
    
    container.innerHTML = ticketsHTML;
}

function displayTicketsError() {
    const container = document.getElementById('tickets-container');
    const countElement = document.getElementById('tickets-count');
    
    countElement.textContent = 'Error loading tickets';
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
            <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px; color: #ff6b35;"></i>
            <p>Failed to load tickets. Please try again.</p>
        </div>
    `;
}

async function showSummary() {
    document.getElementById('summary-modal').style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/summary`);
        const data = await response.json();
        
        if (data.success) {
            displaySummary(data.summary);
        } else {
            throw new Error(data.error || 'Failed to generate summary');
        }
    } catch (error) {
        console.error('Summary error:', error);
        displaySummaryError();
    }
}

function displaySummary(summary) {
    const container = document.getElementById('summary-container');
    
    // Parse the summary to extract the three sections
    const summaryMatch = summary.match(/Summary of Tickets:\s*([\s\S]*?)(?=Root Cause Analysis:)/);
    const rootCauseMatch = summary.match(/Root Cause Analysis:\s*([\s\S]*?)(?=Resolution Steps:)/);
    const resolutionMatch = summary.match(/Resolution Steps:\s*([\s\S]*?)(?=\*\*Project\/Question Numbers:\*\*|$)/);
    const projectNumbersMatch = summary.match(/\*\*Project\/Question Numbers:\*\*\s*(.*?)$/);
    
    const summaryText = summaryMatch ? summaryMatch[1].trim() : 'Summary not available';
    const rootCauseText = rootCauseMatch ? rootCauseMatch[1].trim() : 'Root cause analysis not available';
    const resolutionText = resolutionMatch ? resolutionMatch[1].trim() : 'Resolution steps not available';
    const projectNumbers = projectNumbersMatch ? projectNumbersMatch[1].trim() : '';
    
    // Convert numbered lists to bullet points for resolution steps
    const formattedResolution = resolutionText.replace(/^\d+\.\s+/gm, '• ');
    
    const summaryHTML = `
        <div class="summary-cards">
            <!-- Card 1: Summary of Tickets -->
            <div class="summary-card">
                <div class="summary-card-header">
                    <h3><i class="fas fa-file-alt"></i> Summary of Tickets</h3>
                </div>
                <div class="summary-card-content">
                    <p>${summaryText}</p>
                    ${projectNumbers ? `<div class="project-numbers"><strong>Project/Question Numbers:</strong> ${projectNumbers}</div>` : ''}
                </div>
            </div>
            
            <!-- Card 2: Root Cause Analysis -->
            <div class="summary-card">
                <div class="summary-card-header">
                    <h3><i class="fas fa-search"></i> Root Cause Analysis</h3>
                </div>
                <div class="summary-card-content">
                    <p>${rootCauseText}</p>
                </div>
            </div>
            
            <!-- Card 3: Resolution Steps -->
            <div class="summary-card">
                <div class="summary-card-header">
                    <h3><i class="fas fa-tools"></i> Resolution Steps</h3>
                </div>
                <div class="summary-card-content">
                    ${formattedResolution.split('\n').map(line => {
                        if (line.trim().startsWith('•')) {
                            const bulletText = line.trim().replace(/^•\s*/, '');
                            return `<div class="resolution-step"><span class="step-bullet">•</span><span class="step-text">${bulletText}</span></div>`;
                        } else if (line.trim()) {
                            return `<p>${line.trim()}</p>`;
                        }
                        return '';
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = summaryHTML;
}

function displaySummaryError() {
    const container = document.getElementById('summary-container');
    
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
            <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px; color: #ff6b35;"></i>
            <p>Failed to generate summary. Please try again.</p>
        </div>
    `;
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Handle Enter key in search input
document.getElementById('bug-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchBugs();
    }
});

// Auto-fill example on page load
document.addEventListener('DOMContentLoaded', function() {
    // Optional: Add any initialization code here
});


//scroll logic
window.addEventListener('scroll', function () {
           const scrollY = window.scrollY;
           const body = document.body;

           if (scrollY > 50) {
            body.classList.add('scrolled');
           } else {
             body.classList.remove('scrolled');
        }
});
   