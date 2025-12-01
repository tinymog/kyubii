const menuIcon = document.querySelector('.ic-menu');
const navCentro = document.querySelector('.nav-centro');
const ctaButtons = document.querySelectorAll('.cta-button');

// Menu móvel
if (menuIcon && navCentro) {
    menuIcon.addEventListener('click', () => {
        navCentro.classList.toggle('active');
    });
}

// Botões "Participar Agora" -> Login
if (ctaButtons) {
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = "/pages/login.html";
        });
    });
}

// Fechar menu ao clicar em link
document.querySelectorAll('.nav-centro a').forEach(link => {
    link.addEventListener('click', () => {
        if (navCentro) {
            navCentro.classList.remove('active');
        }
    });
});
