// ================ MENU MOBILE ================
const menuIcon = document.querySelector('.ic-menu');
const navCentro = document.querySelector('.nav-centro');

if (menuIcon && navCentro) {
  menuIcon.addEventListener('click', () => {
    navCentro.classList.toggle('ativo');
  });
}

// ================ BOTÃO AUTORES ================
const btnAutores = document.querySelector('.btn-autores');
if (btnAutores) {
  btnAutores.addEventListener('click', () => {
    const autoresSection = document.querySelector('.autores');
    if (autoresSection) {
      autoresSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// ================ ÍCONE DO USUÁRIO ================
const userIcon = document.querySelector('.ic-usr');
if (userIcon) {
  userIcon.addEventListener('click', () => {
    window.location.href = "/pages/perfil.html";
  });
}

// ================ BUSCA ================
const searchInput = document.querySelector('.busca input');
if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      console.log('Buscando:', searchInput.value);
      // Aqui você pode adicionar lógica de busca
    }
  });
}

// ================ ANIMAÇÃO AO SCROLL ================
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar cards de autores
  const autorCards = document.querySelectorAll('.autor-card');
  autorCards.forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
  });

  // Observar cards de tecnologias
  const techCards = document.querySelectorAll('.tech-card');
  techCards.forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
  });

  // Observar info boxes
  const infoBoxes = document.querySelectorAll('.info-box');
  infoBoxes.forEach(box => {
    box.style.opacity = '0';
    observer.observe(box);
  });
});

// ================ ADICIONAR ANIMAÇÃO CSS ================
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);