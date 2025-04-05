// Track viewed videos in localStorage to prevent duplicate counts
const viewedVideos = JSON.parse(localStorage.getItem('viewedVideos') || '[]');

document.addEventListener('DOMContentLoaded', async () => {
    await loadVideos();
    setupVideoClickTracking();
});

async function loadVideos() {
    try {
        const response = await fetch('https://veezy-backend.onrender.com/videos');
        const videos = await response.json();
        renderVideos(videos);
    } catch (error) {
        console.error('Failed to load videos:', error);
        renderVideos(getFallbackVideos());
    }
}

function renderVideos(videos) {
    const container = document.getElementById('video-list-container');
    container.innerHTML = '';
    
    Object.entries(videos).forEach(([id, video]) => {
        const card = createVideoCard(id, video);
        container.appendChild(card);
    });
}

function createVideoCard(id, video) {
    const card = document.createElement('a');
    card.href = `#`; // Temporary - we'll handle clicks via JavaScript
    card.className = 'video-card';
    card.dataset.videoId = id;

    card.innerHTML = `
        <div class="thumbinal-container">
            <img src="imgs/${id === '1' ? 'blanx-thumbinal.png' : 'watchnest-thumbinal.png'}" class="thumbinal">
            <p class="duration">00:56</p>
        </div>
        <div class="video-info">
            <img src="imgs/icon-big.png" class="icon">
        </div>
        <div class="video-details">
            <h2 class="title">${video.title || `Video ${id}`}</h2>
            <p class="channel-name">Ahmed Megahed</p>
            <p class="views">${video.views} Views • ${formatTimeAgo(video.uploadTime)}</p>
        </div>
    `;

    return card;
}

// ======== NEW: VIEW COUNT TRACKING ======== //
function setupVideoClickTracking() {
    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', async (e) => {
            e.preventDefault();
            const videoId = card.dataset.videoId;

            // Only count if not viewed before
            if (!viewedVideos.includes(videoId)) {
                await incrementViewCount(videoId);
                viewedVideos.push(videoId);
                localStorage.setItem('viewedVideos', JSON.stringify(viewedVideos));
                loadVideos(); // Refresh the view counts
            }

            // Redirect to watch page (you'll need to implement this)
            window.location.href = `watch.html?id=${videoId}`;
        });
    });
}

async function incrementViewCount(videoId) {
    try {
        const response = await fetch(
            `https://veezy-backend.onrender.com/videos/${videoId}/view`, 
            { method: 'POST' }
        );
        
        if (!response.ok) throw new Error('Failed to increment views');
        return await response.json();
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}
// ======== END OF NEW CODE ======== //

// Helper functions
function formatTimeAgo(timestamp) {
    // ... (keep existing time formatting code) ...
}

function getFallbackVideos() {
    return {
        1: { views: 0, uploadTime: new Date().toISOString(), title: "Blanx an E-commerce Website" },
        2: { views: 0, uploadTime: new Date().toISOString(), title: "WatchNest a Movie Website" }
    };
}
