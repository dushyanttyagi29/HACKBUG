 //const API_BASE_URL = 'http://localhost:3005';

const API_BASE_URL = 'https://hackbug-1.onrender.com';

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

    try {
        // Show loading state
        document.getElementById('results-section').style.display = 'block';
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        
        // Update result cards to show loading
        const resultCards = document.querySelectorAll('.result-card');
        resultCards[0].innerHTML = '<h3><i class="fas fa-spinner fa-spin"></i> Searching Tickets...</h3><p>Finding similar issues...</p>';
        resultCards[1].innerHTML = '<h3><i class="fas fa-spinner fa-spin"></i> Generating Summary...</h3><p>AI analysis in progress...</p>';

        // Search for tickets
        const response = await fetch(`${API_BASE_URL}/search`, {
    
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: input })
        });

        const data = await response.json();
        
        if (data.success) {
            // Update result cards with actual data
            const ticketCount = data.tickets.length;
            resultCards[0].innerHTML = `<h3><i class="fas fa-file-alt"></i> Similar Tickets <span class="result-arrow">→</span></h3><p>${ticketCount} matches found • Click to expand</p>`;
            resultCards[1].innerHTML = '<h3><i class="fas fa-lightbulb"></i> Summary <span class="result-arrow">→</span></h3><p>Consolidated solution • Click to expand</p>';
        } else {
            throw new Error(data.error || 'Failed to search');
        }
    } catch (error) {
        console.error('Search error:', error);
        alert('Failed to search for bugs. Please try again.');
        
        // Reset result cards
        const resultCards = document.querySelectorAll('.result-card');
        resultCards[0].innerHTML = '<h3><i class="fas fa-file-alt"></i> Similar Tickets <span class="result-arrow">→</span></h3><p>0 matches found • Click to expand</p>';
        resultCards[1].innerHTML = '<h3><i class="fas fa-lightbulb"></i> Summary <span class="result-arrow">→</span></h3><p>Consolidated solution • Click to expand</p>';
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
    
    countElement.textContent = `${tickets.length} matching issues from Jira & StackOverflow`;
    
    const ticketsHTML = tickets.map(ticket => `
        <div class="ticket-item">
            <div class="ticket-header">
                <div class="ticket-meta">
                    <span class="ticket-tag">${ticket.key || 'Unknown'}</span>
                    <span class="ticket-tag">Jira</span>
                </div>
                <div class="match-score">${Math.floor(Math.random() * 20 + 80)}% match</div>
            </div>
            <div class="ticket-title">${ticket.summary || 'No title available'}</div>
            <div class="ticket-description">
                ${ticket.description && typeof ticket.description === 'string' ? 
                    (ticket.description.length > 200 ? ticket.description.substring(0, 200) + '...' : ticket.description) 
                    : 'No description available'}
            </div>
            <div class="ticket-footer">
                <span>📅 ${new Date().toLocaleDateString()}</span>
                <span class="status-resolved">Resolved</span>
            </div>
            ${ticket.url ? `<div class="ticket-link"><a href="${ticket.url}" target="_blank">View in Jira →</a></div>` : ''}
        </div>
    `).join('');
    
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
    
    // Parse the summary and create a structured display
    const summaryHTML = `
        <div class="summary-content">
            <div class="summary-section">
                <h3>💡 AI-Generated Summary</h3>
                <div class="summary-text">
                    ${summary.replace(/\n/g, '<br>')}
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
   