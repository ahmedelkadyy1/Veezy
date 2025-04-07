// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
    await loadVideos();
    
    // Add click event listener to video cards
    document.addEventListener('click', handleVideoClick);
});

// Handle video card clicks
async function handleVideoClick(event) {
    // Find the closest video card element
    const videoCard = event.target.closest('.video-card');
    if (!videoCard) return;

    event.preventDefault(); // Prevent default link behavior
    
    const videoId = videoCard.dataset.videoId;
    const videoTitle = videoCard.querySelector('.title').textContent;
    const videoSlug = createSlug(videoTitle);
    
    // Check if this video has already been viewed in this session
    const viewedVideos = JSON.parse(sessionStorage.getItem('viewedVideos') || '{}');
    if (!viewedVideos[videoId]) {
        try {
            // Increment view count on the server
            const response = await fetch(`https://veezy-backend.onrender.com/videos/${videoId}/view`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Mark as viewed in this session
            viewedVideos[videoId] = true;
            sessionStorage.setItem('viewedVideos', JSON.stringify(viewedVideos));

            // Update the local view count display immediately
            const viewsElement = videoCard.querySelector('.views');
            if (viewsElement) {
                const currentViews = parseInt(viewsElement.textContent) || 0;
                viewsElement.textContent = viewsElement.textContent.replace(
                    /(\d+) Views/, 
                    `${currentViews + 1} Views`
                );
            }
        } catch (error) {
            console.error('Failed to increment view count:', error);
        }
    }
    
    // Redirect to the video page with title-only URL
    window.location.href = `${videoSlug}.html`;
}

// Create URL-friendly slug from title
function createSlug(title) {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single
        .trim();                  // Trim leading/trailing hyphens
}

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
    const videoSlug = createSlug(video.title || `Video ${id}`);
    videoCard.href = `${videoSlug}.html`;
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