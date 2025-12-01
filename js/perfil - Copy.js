/**
 * PERFIL.JS - BUSCA CORRETA DE JOGOS
 */

document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = auth.getUsuarioLogado();
    
    if (!usuarioLogado) {
        setTimeout(() => window.location.href = '/pages/login.html', 500);
        return;
    }
    
    preencherPerfil(usuarioLogado);
    setupAbas();
    configurarBotoes(usuarioLogado);
    carregarDadosReais(usuarioLogado);
});

function preencherPerfil(usuario) {
    const h1 = document.getElementById('nomeUsuario');
    if (h1) h1.textContent = usuario.nome;
    
    const avatar = document.getElementById('avatar');
    if (avatar) {
        avatar.src = usuario.avatar || 'https://via.placeholder.com/150';
        avatar.onerror = () => avatar.src = 'https://via.placeholder.com/150';
    }
    
    const email = document.getElementById('emailUsuario');
    if (email) email.textContent = `Email: ${usuario.email || 'N/A'}`;
    
    const bio = document.getElementById('bioUsuario');
    if (bio) bio.textContent = usuario.bio || 'Bio do usuário';
}

async function carregarDadosReais(usuario) {
    console.log('🔄 Carregando dados do backend...');
    
    try {
        const response = await fetch(`/api/perfil/completo/${usuario.email}`);
        const perfil = await response.json();
        
        console.log('📊 Perfil recebido:', perfil);
        carregarConexoes(perfil);
        carregarJogos(perfil);
        carregarComunidades(perfil);
        carregarAtividades(perfil);
        
    } catch (error) {
        console.warn('⚠️ API erro, usando dados locais:', error);
        carregarConexoes(usuario);
        carregarJogos(usuario);
        carregarComunidades(usuario);
        carregarAtividades(usuario);
    }
}

function carregarConexoes(usuario) {
    const grid = document.querySelector('[data-aba="conexoes"] .conexoes-grid');
    if (!grid) return;
    
    const conexoes = usuario.conexoes || {};
    
    if (!document.querySelector('link[href*="fontawesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);
    }
    
    grid.innerHTML = `
        <div class="conexao-card">
            <i class="fab fa-steam" style="color: #1b9ae0;"></i>
            <h3>Steam</h3>
            ${conexoes.steam?.id ? `
                <p>✅ Conectado como <strong>${conexoes.steam.username || 'Steam'}</strong></p>
                <button class="btn-remover" onclick="desconectarSteam('${usuario.email}')">Desconectar</button>
            ` : `
                <p>Conecte sua Steam para sincronizar jogos</p>
                <button class="btn-conectar" onclick="window.location.href='/steam-login'">Conectar Steam</button>
            `}
        </div>
        <div class="conexao-card">
            <i class="fab fa-discord" style="color: #5865f2;"></i>
            <h3>Discord</h3>
            ${conexoes.discord?.id ? `
                <p>✅ Conectado como <strong>${conexoes.discord.username || 'Discord'}</strong></p>
                <button class="btn-remover" onclick="desconectarDiscord('${usuario.email}')">Desconectar</button>
            ` : `
                <p>Conecte seu Discord</p>
                <button class="btn-conectar" onclick="window.location.href='/discord-login'">Conectar Discord</button>
            `}
        </div>
        <div class="conexao-card">
            <i class="fab fa-spotify" style="color: #1db954;"></i>
            <h3>Spotify</h3>
            ${conexoes.spotify?.id ? `
                <p>✅ Conectado como <strong>${conexoes.spotify.username || 'Spotify'}</strong></p>
                <button class="btn-remover" onclick="desconectarSpotify('${usuario.email}')">Desconectar</button>
            ` : `
                <p>Conecte seu Spotify</p>
                <button class="btn-conectar" onclick="window.location.href='/spotify-login'">Conectar Spotify</button>
            `}
        </div>
    `;
}

function carregarJogos(usuario) {
    const lista = document.querySelector('[data-aba="jogos"]');
    if (!lista) {
        console.warn('⚠️ Element [data-aba="jogos"] não encontrado');
        return;
    }
    
    let jogos = [];
    
    if (Array.isArray(usuario.historico_steam)) {
        jogos = usuario.historico_steam;
    } else if (Array.isArray(usuario.jogos)) {
        jogos = usuario.jogos;
    } else if (usuario.historico_steam && typeof usuario.historico_steam === 'object') {
        jogos = Object.values(usuario.historico_steam);
    }
    
    console.log('🎮 Jogos encontrados:', jogos);
    
    let html = '';
    
    if (!jogos || jogos.length === 0) {
        html = '<div class="vazio">🎮 Nenhum jogo na biblioteca. Conecte sua Steam!</div>';
    } else {
        html = '<div class="jogos-lista">' + 
            jogos.slice(0, 20).map(jogo => `
            <div class="jogo-card">
                ${jogo.imagem ? `<img src="${jogo.imagem}" style="width:100%; height:150px; border-radius:8px; margin-bottom:10px; object-fit:cover;">` : ''}
                <h3>${jogo.nome || jogo.name || jogo.title || 'Jogo'}</h3>
                <p>⏱️ ${(jogo.horas || jogo.playtime_forever || 0)} horas</p>
                ${jogo.playtime_2weeks ? `<p>📅 ${jogo.playtime_2weeks}h últimas 2 semanas</p>` : ''}
            </div>
        `).join('') + '</div>';
    }
    
    lista.innerHTML = html;
}

function carregarComunidades(usuario) {
    const grid = document.querySelector('[data-aba="comunidades"]');
    if (!grid) return;
    
    const comunidades = usuario.comunidades || [];
    
    if (!comunidades || comunidades.length === 0) {
        grid.innerHTML = '<div class="vazio">🌐 Você não está em nenhuma comunidade</div>';
        return;
    }
    
    let html = '<div class="comunidades-grid">' +
        comunidades.map(com => `
        <div class="comunidade-card">
            ${com.logo ? `<img src="${com.logo}" class="comunidade-logo" alt="${com.nome}">` : ''}
            <h3>${com.nome}</h3>
            <p>${com.descricao || 'Sem descrição'}</p>
        </div>
    `).join('') + '</div>';
    
    grid.innerHTML = html;
}

function carregarAtividades(usuario) {
    const lista = document.querySelector('[data-aba="atividades"]');
    if (!lista) return;
    
    const atividades = usuario.atividades || [];
    
    if (!atividades || atividades.length === 0) {
        lista.innerHTML = '<div class="vazio">📭 Nenhuma atividade recente</div>';
        return;
    }
    
    let html = '<div class="atividades-lista">' +
        atividades.slice(0, 10).map(ativ => `
        <div class="atividade-item">
            <span class="atividade-icon">📌</span>
            <div class="atividade-texto">
                <strong>${ativ.titulo || 'Atividade'}</strong>
                <p>${ativ.descricao || ''}</p>
            </div>
            <span class="atividade-tempo">${new Date(ativ.timestamp).toLocaleDateString('pt-BR')}</span>
        </div>
    `).join('') + '</div>';
    
    lista.innerHTML = html;
}

function setupAbas() {
    const abas = document.querySelectorAll('.aba');
    const conteudos = document.querySelectorAll('.aba-conteudo');
    
    abas.forEach((aba, index) => {
        aba.addEventListener('click', () => {
            abas.forEach(a => a.classList.remove('aba-ativa'));
            conteudos.forEach(c => c.classList.remove('aba-ativa'));
            
            aba.classList.add('aba-ativa');
            if (conteudos[index]) conteudos[index].classList.add('aba-ativa');
        });
    });
}

function configurarBotoes(usuario) {
    const btnEditar = document.getElementById('btnEditarPerfil');
    const btnLogout = document.getElementById('btnLogout');
    const btnEditarBanner = document.getElementById('btnEditarBanner');
    
    if (btnEditar) btnEditar.addEventListener('click', () => abrirModalEdicao(usuario));
    if (btnLogout) btnLogout.addEventListener('click', () => {
        auth.fazerLogout();
        window.location.href = '/pages/login.html';
    });
    if (btnEditarBanner) btnEditarBanner.addEventListener('click', () => {
        const modal = document.getElementById('modalEditarBanner');
        if (modal) modal.classList.add('show');
    });
    
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('modalEditarBanner');
        if (modal && e.target === modal) modal.classList.remove('show');
    });
}

function abrirModalEdicao(usuario) {
    const existente = document.getElementById('modalEdicaoPerfil');
    if (existente) existente.remove();
    
    const modal = document.createElement('div');
    modal.id = 'modalEdicaoPerfil';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="fechar-modal" onclick="document.getElementById('modalEdicaoPerfil').remove()">×</button>
            <h2>Editar Perfil</h2>
            <form onsubmit="salvarEdicao(event, '${usuario.email}')">
                <div class="input-group">
                    <label>Nome</label>
                    <input type="text" class="input" id="nomeInput" value="${usuario.nome}" required>
                </div>
                <div class="input-group">
                    <label>Bio</label>
                    <input type="text" class="input" id="bioInput" value="${usuario.bio || ''}">
                </div>
                <div class="input-group">
                    <label>Avatar URL</label>
                    <input type="text" class="input" id="avatarInput" value="${usuario.avatar || ''}">
                </div>
                <button type="submit" class="btn-salvar">Salvar</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('show');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function salvarEdicao(event, email) {
    event.preventDefault();
    
    const dados = {
        nome: document.getElementById('nomeInput').value,
        bio: document.getElementById('bioInput').value,
        avatar: document.getElementById('avatarInput').value
    };
    
    const resultado = auth.atualizarPerfil(email, dados);
    
    if (resultado.sucesso || resultado.success) {
        alert('✅ Perfil atualizado!');
        document.getElementById('modalEdicaoPerfil').remove();
        location.reload();
    } else {
        alert('❌ Erro ao atualizar');
    }
}

function definirBanner(valor) {
    const cover = document.getElementById('perfilCover');
    if (cover) {
        if (valor.startsWith('http')) {
            cover.style.backgroundImage = `url('${valor}')`;
            cover.style.backgroundSize = 'cover';
            cover.style.backgroundPosition = 'center';
        } else {
            cover.style.background = valor;
            cover.style.backgroundImage = 'none';
        }
    }
}

function salvarBanner() {
    const urlBanner = document.getElementById('urlBanner').value;
    if (urlBanner) definirBanner(urlBanner);
    alert('✅ Banner atualizado!');
    fecharModalBanner();
}

function fecharModalBanner() {
    const modal = document.getElementById('modalEditarBanner');
    if (modal) modal.classList.remove('show');
}

function desconectarSteam(email) {
    if (confirm('Desconectar Steam?')) {
        fetch('/api/steam/desconectar/' + email, { method: 'POST' })
            .then(r => r.json())
            .then(d => { if (d.success) { alert('✅ Desconectado'); location.reload(); } })
            .catch(e => console.error(e));
    }
}

function desconectarDiscord(email) {
    if (confirm('Desconectar Discord?')) {
        fetch('/api/discord/desconectar/' + email, { method: 'POST' })
            .then(r => r.json())
            .then(d => { if (d.success) { alert('✅ Desconectado'); location.reload(); } })
            .catch(e => console.error(e));
    }
}

function desconectarSpotify(email) {
    if (confirm('Desconectar Spotify?')) {
        fetch('/api/spotify/desconectar/' + email, { method: 'POST' })
            .then(r => r.json())
            .then(d => { if (d.success) { alert('✅ Desconectado'); location.reload(); } })
            .catch(e => console.error(e));
    }
}
