document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Check for saved user preference in localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme immediately on page load
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('i');
            if (icon) icon.classList.replace('fa-moon', 'fa-sun');
        }
    } else {
        body.classList.remove('dark-mode');
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('i');
            if (icon) icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    // Toggle Theme on Button Click
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            body.classList.toggle('dark-mode');
            
            const icon = darkModeToggle.querySelector('i');
            const isDarkMode = body.classList.contains('dark-mode');
            
            if (isDarkMode) {
                localStorage.setItem('theme', 'dark');
                if (icon) icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                localStorage.setItem('theme', 'light');
                if (icon) icon.classList.replace('fa-sun', 'fa-moon');
            }
        });
    }

    // Sync dark mode across browser tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            if (e.newValue === 'dark') {
                body.classList.add('dark-mode');
                if (darkModeToggle) {
                    const icon = darkModeToggle.querySelector('i');
                    if (icon) icon.classList.replace('fa-moon', 'fa-sun');
                }
            } else {
                body.classList.remove('dark-mode');
                if (darkModeToggle) {
                    const icon = darkModeToggle.querySelector('i');
                    if (icon) icon.classList.replace('fa-sun', 'fa-moon');
                }
            }
        }
    });
});