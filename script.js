document.addEventListener('DOMContentLoaded', function() {
    // ... keep your existing theme and category code ...
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

    // Category Slider Navigation
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

    // Video Data System
    const videoCards = document.querySelectorAll('.video-card');
    if (videoCards.length > 0) {
        const API_BASE_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001' 
            : 'https://veezy-backend.onrender.com';

        async function fetchAllVideos() {
            try {
                const response = await fetch(`${API_BASE_URL}/videos`, {
                    headers: { 'Cache-Control': 'no-cache' }
                });
                return await response.json();
            } catch (error) {
                console.error('Failed to fetch videos:', error);
                return {};
            }
        }

        async function incrementViews(videoId) {
            try {
                await fetch(`${API_BASE_URL}/videos/${videoId}/view`, {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Error incrementing views:', error);
            }
        }

        function formatTimeAgo(uploadTime) {
            const seconds = Math.floor((new Date() - new Date(uploadTime)) / 1000);
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
            return 'just now';
        }

        async function initializeVideos() {
            const allVideos = await fetchAllVideos();
            
            videoCards.forEach(card => {
                const videoId = card.dataset.videoId;
                const videoData = allVideos[videoId] || { 
                    views: 0, 
                    uploadTime: new Date().toISOString() 
                };
                
                const viewsElement = card.querySelector('.views');
                viewsElement.textContent = 
                    `${videoData.views} Views • ${formatTimeAgo(videoData.uploadTime)}`;
                
                card.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await incrementViews(videoId);
                    // Update the UI immediately (optimistic update)
                    const newCount = videoData.views + 1;
                    viewsElement.textContent = 
                        `${newCount} Views • ${formatTimeAgo(videoData.uploadTime)}`;
                    // Navigate
                    window.location.href = card.querySelector('.title').textContent
                        .replace(/\s+/g, '-')
                        .toLowerCase() + '.html';
                });
            });
        }

        initializeVideos();
    }
});
