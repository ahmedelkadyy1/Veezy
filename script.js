document.addEventListener('DOMContentLoaded', function() {
    // Theme Switcher Functionality (unchanged)
    const themeButton = document.querySelector('.theme-button');
    if (themeButton) {
        const icon = themeButton.querySelector('i');
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (savedTheme === null && systemPrefersDark)) {
            document.body.classList.add('dark');
            icon.classList.replace('bx-moon', 'bx-sun');
        }
        
        themeButton.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark');
            if (isDark) {
                icon.classList.replace('bx-moon', 'bx-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                icon.classList.replace('bx-sun', 'bx-moon');
                localStorage.setItem('theme', 'light');
            }
        });
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (localStorage.getItem('theme') === null) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.body.classList.toggle('dark', newTheme === 'dark');
                if (newTheme === 'dark') {
                    icon.classList.replace('bx-moon', 'bx-sun');
                } else {
                    icon.classList.replace('bx-sun', 'bx-moon');
                }
            }
        });
    }

    // Category Slider Navigation (unchanged)
    const categoryList = document.querySelector('.category-list');
    if (categoryList) {
        const leftNav = document.createElement('button');
        const rightNav = document.createElement('button');
        leftNav.className = 'category-nav left';
        leftNav.innerHTML = '<i class="bx bx-chevron-left"></i>';
        rightNav.className = 'category-nav right';
        rightNav.innerHTML = '<i class="bx bx-chevron-right"></i>';
        
        const container = document.querySelector('.category-container');
        container.insertBefore(leftNav, categoryList);
        container.appendChild(rightNav);
        
        leftNav.addEventListener('click', () => {
            categoryList.scrollBy({ left: -200, behavior: 'smooth' });
        });
        
        rightNav.addEventListener('click', () => {
            categoryList.scrollBy({ left: 200, behavior: 'smooth' });
        });
        
        const checkNavButtons = () => {
            const scrollLeft = categoryList.scrollLeft;
            const maxScroll = categoryList.scrollWidth - categoryList.clientWidth;
            leftNav.style.display = scrollLeft <= 0 ? 'none' : 'flex';
            rightNav.style.display = scrollLeft >= maxScroll ? 'none' : 'flex';
        };
        
        categoryList.addEventListener('scroll', checkNavButtons);
        window.addEventListener('resize', checkNavButtons);
        checkNavButtons();
    }

    // Updated Video View Tracking System (now connects to backend)
    const videoCards = document.querySelectorAll('.video-card');
    if (videoCards.length > 0) {
        // Base URL for your backend API
        const API_BASE_URL = 'http://localhost:3001/videos';

        // Fetch video data from backend
        async function fetchVideoData(videoId) {
            try {
                const response = await fetch(`${API_BASE_URL}/${videoId}`);
                if (!response.ok) throw new Error('Network error');
                return await response.json();
            } catch (error) {
                console.error('Failed to fetch video data:', error);
                return { views: 0, uploadTime: new Date().toISOString() }; // Fallback
            }
        }

        // Increment views on backend
        async function incrementViews(videoId) {
            try {
                const response = await fetch(`${API_BASE_URL}/${videoId}/view`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) throw new Error('Failed to update views');
            } catch (error) {
                console.error('Error incrementing views:', error);
            }
        }

        // Format time (e.g., "2 days ago")
        function formatTimeAgo(uploadTime) {
            const seconds = Math.floor(new Date() - new Date(uploadTime)) / 1000;
            const intervals = {
                year: 31536000,
                month: 2592000,
                week: 604800,
                day: 86400,
                hour: 3600,
                minute: 60,
            };

            for (const [unit, secondsInUnit] of Object.entries(intervals)) {
                const interval = Math.floor(seconds / secondsInUnit);
                if (interval >= 1) {
                    return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
                }
            }
            return 'just now';
        }

        // Process each video card
        videoCards.forEach(async (card, index) => {
            const videoId = index + 1; // Simple ID system (1, 2, 3...)
            const viewsElement = card.querySelector('.views');
            const videoTitle = card.querySelector('.title').textContent;

            // Load initial data
            const videoData = await fetchVideoData(videoId);
            viewsElement.textContent = `${videoData.views} Views • ${formatTimeAgo(videoData.uploadTime)}`;

            // Handle clicks
            card.addEventListener('click', async (e) => {
                e.preventDefault();
                await incrementViews(videoId); // Update backend
                const updatedData = await fetchVideoData(videoId); // Refresh data
                viewsElement.textContent = `${updatedData.views} Views • ${formatTimeAgo(updatedData.uploadTime)}`;
                window.location.href = `${videoTitle.replace(/\s+/g, '-').toLowerCase()}.html`;
            });
        });
    }
});
