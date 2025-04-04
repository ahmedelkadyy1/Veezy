document.addEventListener('DOMContentLoaded', function() {
    // Theme Switcher Functionality
    const themeButton = document.querySelector('.theme-button');
    if (themeButton) {
        const icon = themeButton.querySelector('i');
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Apply theme (saved preference > system preference > light)
        if (savedTheme === 'dark' || (savedTheme === null && systemPrefersDark)) {
            document.body.classList.add('dark');
            icon.classList.replace('bx-moon', 'bx-sun');
        }
        
        // Theme toggle button click
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
        
        // Watch for system theme changes (only when no user preference is set)
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
        
        // Hide arrows when at scroll boundaries
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

    // Video View Tracking System
    const videoCards = document.querySelectorAll('.video-card');
    if (videoCards.length > 0) {
        // Load saved data
        let savedViews = JSON.parse(localStorage.getItem('videoViews')) || {};
        let viewedVideos = JSON.parse(localStorage.getItem('viewedVideos')) || {};
        let videoUploadData = JSON.parse(localStorage.getItem('videoUploadData')) || {};
        
        const currentDate = new Date();
        
        // Initialize video data
        videoCards.forEach((card, index) => {
            const videoId = `video-${index}`;
            
            if (!videoUploadData[videoId]) {
                const viewsElement = card.querySelector('.views');
                const viewText = viewsElement.textContent;
                const viewTextParts = viewText.split('Views •');
                const uploadText = viewTextParts[1] ? viewTextParts[1].trim() : 'just added';
                
                videoUploadData[videoId] = {
                    initialText: uploadText,
                    timestamp: uploadText === 'just added' ? currentDate.getTime() : getTimestampFromText(uploadText, currentDate)
                };
            }
        });
        
        localStorage.setItem('videoUploadData', JSON.stringify(videoUploadData));
        
        // Process each video
        videoCards.forEach((card, index) => {
            const viewsElement = card.querySelector('.views');
            const videoTitle = card.querySelector('.title').textContent;
            const videoId = `video-${index}`;
            
            let viewCount = savedViews[videoId] || 0;
            updateViewAndTimeDisplay(viewsElement, viewCount, videoUploadData[videoId].timestamp);
            
            card.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (!viewedVideos[videoId]) {
                    viewCount++;
                    savedViews[videoId] = viewCount;
                    viewedVideos[videoId] = true;
                    
                    localStorage.setItem('videoViews', JSON.stringify(savedViews));
                    localStorage.setItem('viewedVideos', JSON.stringify(viewedVideos));
                    
                    updateViewAndTimeDisplay(viewsElement, viewCount, videoUploadData[videoId].timestamp);
                }
                
                window.location.href = `${videoTitle.replace(/\s+/g, '-').toLowerCase()}.html`;
            });
        });
        
        // Helper functions
        function updateViewAndTimeDisplay(element, count, timestamp) {
            const timeAgo = getTimeAgoString(timestamp);
            element.textContent = `${count} Views • ${timeAgo}`;
        }
        
        function getTimestampFromText(text, currentDate) {
            if (text.toLowerCase().includes('just added')) return currentDate.getTime();
            
            const parts = text.split(' ');
            if (parts.length < 2) return currentDate.getTime();
            
            const value = parseInt(parts[0]) || 0;
            const unit = parts[1].toLowerCase();
            let timestamp = new Date(currentDate);
            
            if (unit.includes('second')) timestamp.setSeconds(timestamp.getSeconds() - value);
            else if (unit.includes('minute')) timestamp.setMinutes(timestamp.getMinutes() - value);
            else if (unit.includes('hour')) timestamp.setHours(timestamp.getHours() - value);
            else if (unit.includes('day')) timestamp.setDate(timestamp.getDate() - value);
            else if (unit.includes('week')) timestamp.setDate(timestamp.getDate() - (value * 7));
            else if (unit.includes('month')) timestamp.setMonth(timestamp.getMonth() - value);
            else if (unit.includes('year')) timestamp.setFullYear(timestamp.getFullYear() - value);
            
            return timestamp.getTime();
        }
        
        function getTimeAgoString(timestamp) {
            const now = new Date().getTime();
            const diff = now - timestamp;
            const minute = 60 * 1000;
            const hour = minute * 60;
            const day = hour * 24;
            const week = day * 7;
            const month = day * 30;
            const year = day * 365;
            
            if (diff < minute) return 'just now';
            else if (diff < hour) return `${Math.floor(diff / minute)} minute${Math.floor(diff / minute) > 1 ? 's' : ''} ago`;
            else if (diff < day) return `${Math.floor(diff / hour)} hour${Math.floor(diff / hour) > 1 ? 's' : ''} ago`;
            else if (diff < week) return `${Math.floor(diff / day)} day${Math.floor(diff / day) > 1 ? 's' : ''} ago`;
            else if (diff < month) return `${Math.floor(diff / week)} week${Math.floor(diff / week) > 1 ? 's' : ''} ago`;
            else if (diff < year) return `${Math.floor(diff / month)} month${Math.floor(diff / month) > 1 ? 's' : ''} ago`;
            else return `${Math.floor(diff / year)} year${Math.floor(diff / year) > 1 ? 's' : ''} ago`;
        }
        
        // Update timestamps periodically
        setInterval(() => {
            videoCards.forEach((card, index) => {
                const videoId = `video-${index}`;
                const viewsElement = card.querySelector('.views');
                
                if (videoUploadData[videoId] && savedViews[videoId]) {
                    updateViewAndTimeDisplay(viewsElement, savedViews[videoId], videoUploadData[videoId].timestamp);
                }
            });
        }, 60000);
    }
});