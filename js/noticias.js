/**
 * NOTICIAS.JS - EUROGAMER APENAS - LAYOUT CORRIGIDO
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Inicializando página de notícias...');
    carregarNoticias();
    setupEventos();
});

function setupEventos() {
    const menuIcon = document.querySelector('.ic-menu');
    const navCentro = document.querySelector('.nav-centro');
    if (menuIcon && navCentro) {
        menuIcon.addEventListener('click', () => {
            navCentro.classList.toggle('ativo');
        });
    }
}

async function carregarNoticias() {
    const container = document.getElementById('noticiasContainer');
    if (!container) {
        console.error('❌ Container noticiasContainer não encontrado');
        return;
    }
    
    container.innerHTML = '<div class="vazio">⏳ Carregando notícias...</div>';
    
    try {
        console.log('🔗 Tentando carregar de /api/noticias');
        const response = await fetch('/api/noticias', { 
            method: 'GET',
            cache: 'no-cache'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const noticias = await response.json();
        console.log('✅ Notícias carregadas:', noticias);
        
        if (!noticias || noticias.length === 0) {
            container.innerHTML = '<div class="vazio">📭 Nenhuma notícia disponível do EUROGAMER</div>';
            return;
        }
        
        renderizarNoticias(container, noticias);
        
    } catch (error) {
        console.error('❌ Erro ao carregar notícias:', error);
        container.innerHTML = `<div class="vazio">⚠️ Erro ao carregar notícias<br>${error.message}</div>`;
    }
}

function renderizarNoticias(container, noticias) {
    container.innerHTML = '';
    
    noticias.forEach((noticia, index) => {
        const card = document.createElement('div');
        card.className = 'noticia-card';
        
        const titulo = noticia.titulo || 'Sem título';
        
        // ✅ LIMPAR DESCRIÇÃO: remover HTML tags e imagens
        let descricao = (noticia.descricao || 'Sem descrição');
        descricao = descricao.replace(/<[^>]*>/g, ''); // Remove todas tags HTML
        descricao = descricao.replace(/<img[^>]*>/g, ''); // Remove tags img
        descricao = descricao.replace(/\n\s*\n/g, ' '); // Remove quebras múltiplas
        descricao = descricao.trim(); // Remove espaços extras
        descricao = descricao.substring(0, 150); // Pega apenas 150 caracteres
        
        const imagem = noticia.imagem; 
        const link = noticia.link || '#';
        const data = formatarData(noticia.data || new Date().toISOString());
        const autor = noticia.autor || 'EUROGAMER';
        
        // ✅ SÓ RENDERIZA SE TIVER IMAGEM
        if (!imagem) {
            console.warn(`⚠️ Notícia sem imagem ignorada: ${titulo}`);
            return;
        }
        
        card.innerHTML = `
            <img src="${imagem}" 
                 alt="${titulo}" 
                 class="noticia-imagem" 
                 onerror="console.error('❌ Erro ao carregar imagem:', this.src)">
            <div class="noticia-conteudo">
                <h3 class="noticia-titulo">${titulo}</h3>
                <p class="noticia-descricao">${descricao}</p>
                <div class="noticia-rodape">
                    <span class="noticia-data">📅 ${data}</span>
                    <span class="noticia-autor">👤 ${autor}</span>
                </div>
                <a href="${link}" target="_blank" class="noticia-link">Leia mais →</a>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    console.log(`✅ ${container.children.length} notícias renderizadas (com imagem)`);
}

function formatarData(data) {
    if (!data) return 'Hoje';
    
    try {
        const d = new Date(data);
        return d.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return 'Hoje';
    }
}

// Função para atualizar notícias manualmente
function atualizarNoticias() {
    console.log('🔄 Atualizando notícias manualmente...');
    carregarNoticias();
}

// Atualizar a cada 5 minutos
setInterval(atualizarNoticias, 5 * 60 * 1000);
