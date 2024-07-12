// history.js

const HISTORY_KEY = 'web_note_history';
const MAX_HISTORY_ITEMS = 30;

function addToHistory(note) {
    let history = getHistory();
    history = history.filter(item => item !== note);
    history.unshift(note);
    history = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    updateSidebar();
}

function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
}

function updateSidebar() {
    const history = getHistory();
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    history.forEach((note, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="/${note}">${note}</a>
            <button class="delete-btn" data-index="${index}">×</button>
        `;
        historyList.appendChild(li);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteHistoryItem);
    });
}

function deleteHistoryItem(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const listItem = event.target.closest('li');
    const index = Array.from(listItem.parentNode.children).indexOf(listItem);
    let history = getHistory();
    history.splice(index, 1);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    updateSidebar();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const container = document.querySelector('.container');
    sidebar.classList.toggle('open');
    container.classList.toggle('sidebar-open');
}