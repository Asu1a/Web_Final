window.addEventListener('DOMContentLoaded', (event) => {
    fetch('/auth/status')
        .then(response => response.json())
        .then(data => {
            const loginLink = document.querySelector('.nav-link[href="login.html"]');
            const topNav = document.getElementById('topnav');
            

            if (data.isLoggedIn) {
                if (loginLink) {
                    loginLink.style.display = 'none'; // Скрываем кнопку Login
                }

                // Добавляем кнопку Log out
                const logoutLink = document.createElement('a');
                logoutLink.classList.add('nav-link');
                logoutLink.href = '/logout';
                logoutLink.textContent = 'Log out';
                topNav.appendChild(logoutLink);

                // Для админа добавляем кнопку Admin Panel
                if (data.role === 'admin') {
                    const adminLink = document.createElement('a');
                    adminLink.classList.add('nav-link');
                    adminLink.href = '/admin';
                    adminLink.textContent = 'Admin Panel';
                    topNav.appendChild(adminLink);
                }
            } else {
                if (loginLink) {
                    loginLink.style.display = ''; // Показываем кнопку Login
                }
            }
        });
});