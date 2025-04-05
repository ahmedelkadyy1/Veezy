// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
    await loadVideos();
});

// Main function to load videos from backend
async function loadVideos() {
    try {
        const response = await fetch('https://veezy-backend.onrender.com/videos');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const videos = await response.json();
        renderVideos(videos);
    } catch (error) {
        console.error('Failed to load videos:', error);
        // Fallback to default videos if API fails
        renderVideos({
            1: {
                views: 0,
                uploadTime: new Date().toISOString(),
                title: "Blanx an E-commerce Website"
            },
            2: {
                views: 0,
                uploadTime: new Date().toISOString(),
                title: "WatchNest a Movie Website"
            }
        });
    }
}

// Render videos to the page
function renderVideos(videos) {
    const videoListContainer = document.getElementById('video-list-container');
    videoListContainer.innerHTML = ''; // Clear existing content

    Object.entries(videos).forEach(([id, video]) => {
        const videoCard = createVideoCard(id, video);
        videoListContainer.appendChild(videoCard);
    });
}

// Create individual video card element
function createVideoCard(id, video) {
    const videoCard = document.createElement('a');
    videoCard.href = `watch.html?id=${id}`;
    videoCard.className = 'video-card';
    videoCard.dataset.videoId = id;

    const timeAgo = formatTimeAgo(video.uploadTime);
    const thumbnail = id === '1' ? 'blanx-thumbinal.png' : 'watchnest-thumbinal.png';

    videoCard.innerHTML = `
        <div class="thumbinal-container">
            <img src="imgs/${thumbnail}" class="thumbinal">
            <p class="duration">00:56</p>
        </div>
        <div class="video-info">
            <img src="imgs/icon-big.png" class="icon">
        </div>
        <div class="video-details">
            <h2 class="title">${video.title || `Video ${id}`}</h2>
            <p class="channel-name">Ahmed Megahed</p>
            <p class="views">${video.views} Views • ${timeAgo}</p>
        </div>
    `;

    return videoCard;
}

// Format timestamp to "X time ago" format
function formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }

    return 'Just now';
}

// Optional: Auto-refresh every 30 seconds
setInterval(loadVideos, 30000);
