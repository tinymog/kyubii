// PERFIL.JS - COM AVATAR CORRIGIDO

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Perfil carregado');

    const usuarioLogado = auth.getUsuarioLogado();
    if (!usuarioLogado) {
        window.location.href = '/pages/login.html';
        return;
    }

    const usuario = sincronizarDados(usuarioLogado);

    preencherPerfil(usuario);
    carregarBanner(usuario);
    setupAbas();
    setupBotoes(usuario);
    setupEditarFoto();
    carregarConteudoAbas(usuario);
});

function sincronizarDados(usuario) {
    const email = usuario.email;

    const banner = localStorage.getItem(`banner_${email}`);
    if (banner) usuario.banner = banner;

    const avatar = localStorage.getItem(`avatar_${email}`);
    if (avatar) usuario.avatar = avatar;

    const bio = localStorage.getItem(`bio_${email}`);
    if (bio) usuario.bio = bio;

    return usuario;
}

function preencherPerfil(usuario) {
    const nome = document.getElementById('nomeUsuario');
    if (nome) nome.textContent = usuario.nome || 'Usuário';

    const avatar = document.getElementById('avatar');
    if (avatar) {
        avatar.src = usuario.avatar || 'https://via.placeholder.com/150';
        avatar.onerror = () => avatar.src = 'https://via.placeholder.com/150';
    }

    const email = document.getElementById('emailUsuario');
    if (email) email.textContent = `Email: ${usuario.email}`;

    const bio = document.getElementById('bioUsuario');
    if (bio) bio.textContent = usuario.bio || 'Sua bio aqui';
}

function carregarBanner(usuario) {
    const cover = document.getElementById('perfil-cover');
    if (!cover) return;

    if (usuario.banner) {
        if (usuario.banner.startsWith('linear-gradient')) {
            cover.style.background = usuario.banner;
        } else {
            cover.style.backgroundImage = `url('${usuario.banner}')`;
        }
        cover.style.backgroundSize = 'cover';
        cover.style.backgroundPosition = 'center';
    }
}

function setupAbas() {
    const btns = document.querySelectorAll('.aba-btn');

    btns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();

            btns.forEach(b => b.classList.remove('aba-ativa'));
            document.querySelectorAll('.aba-conteudo').forEach(c => c.classList.remove('aba-ativa-conteudo'));

            this.classList.add('aba-ativa');
            const id = this.getAttribute('data-aba');
            const conteudo = document.getElementById(id);
            if (conteudo) conteudo.classList.add('aba-ativa-conteudo');

            if (id === 'jogos') {
                console.log('🎮 Aba Jogos clicada');
                carregarJogos();
            }
        });
    });

    if (btns[0]) {
        btns[0].click();
    }
}

function setupBotoes(usuario) {
    const btnBanner = document.querySelector('.btn-editar-banner');
    if (btnBanner) {
        btnBanner.addEventListener('click', () => abrirModalBanner(usuario));
    }

    const btnEditar = document.querySelector('.btn-editar');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => abrirModalPerfil(usuario));
    }

    const btnLogout = document.querySelector('.btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🚪 Logout acionado');
            auth.fazerLogout();
            console.log('✅ Logout completo');
            window.location.href = '/pages/login.html';
        });
    }
}

function setupEditarFoto() {
    const input = document.getElementById('inputFoto');
    const preview = document.getElementById('previewAvatar');

    if (input && preview) {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = event => preview.src = event.target.result;
                reader.readAsDataURL(file);
            }
        });
    }
}

function carregarConteudoAbas(usuario) {
    carregarComunidades(usuario);
    carregarConexoes(usuario);
}

function carregarComunidades(usuario) {
    const container = document.getElementById('comunidades-conteudo');
    if (!container) return;

    const comunidades = JSON.parse(localStorage.getItem('comunidades_dados') || '[]');
    const minhasComunidades = comunidades.filter(c => c.membros.includes(usuario.email));

    if (!minhasComunidades.length) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <p style="color: #9d5fd4; margin-bottom: 15px;">Você não participa de nenhuma comunidade</p>
                <button onclick="window.location.href='./comunidades.html'" 
                        style="padding: 10px 20px; background: #7e30ff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Ver Comunidades
                </button>
            </div>
        `;
        return;
    }

    let html = '<div style="display: grid; gap: 15px;">';
    minhasComunidades.forEach(com => {
        html += `
        <div style="border-left: 3px solid #7e30ff; padding: 15px; background: rgba(45,0,80,0.3); border-radius: 8px;">
            <h4 style="color: #c699ff; margin-bottom: 5px;">${com.nome}</h4>
            <p style="color: #b895d4; font-size: 0.9rem; margin-bottom: 8px;">${(com.descricao || 'Sem descrição').substring(0, 80)}...</p>
            <p style="color: #9d5fd4; font-size: 0.85rem;">👥 ${com.membros.length} membros • 💬 ${(com.posts || []).length} posts</p>
            <button onclick="window.location.href='./comunidades.html?id=${com.id}'" 
                    style="margin-top: 8px; padding: 6px 12px; background: #7e30ff; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.85rem;">
                Visitar
            </button>
        </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

function carregarConexoes(usuario) {
    const container = document.getElementById('conexoes-conteudo');
    if (!container) return;

    const conexoes = [
        { 
            nome: 'Steam', 
            icone: '🎮', 
            conectado: !!usuario.conexoes?.steam,
            tipo: 'steam',
            dados: usuario.conexoes?.steam 
        },
        { 
            nome: 'Discord', 
            icone: '💜', 
            conectado: !!usuario.conexoes?.discord,
            tipo: 'discord',
            dados: usuario.conexoes?.discord 
        },
        { 
            nome: 'Spotify', 
            icone: '🎵', 
            conectado: !!usuario.conexoes?.spotify,
            tipo: 'spotify',
            dados: usuario.conexoes?.spotify 
        }
    ];

    let html = '<div style="display: grid; gap: 15px;">';
    conexoes.forEach(c => {
        const statusTexto = c.conectado ? '🟢 Conectado' : '🔴 Desconectado';
        const btnTexto = c.conectado ? 'Desconectar' : 'Conectar';

        html += `
        <div style="border: 2px solid #7e30ff; padding: 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-size: 2rem; margin-bottom: 8px;">${c.icone}</div>
                <h4 style="color: white; margin: 0 0 5px 0; font-size: 1.1rem;">${c.nome}</h4>
                <p style="color: ${c.conectado ? '#00ff00' : '#ff6b6b'}; font-size: 0.9rem; margin: 0;">
                    ${statusTexto}
                </p>
                ${c.conectado && c.dados ? `<p style="color: #9d5fd4; font-size: 0.8rem; margin: 5px 0 0 0;">ID: ${c.dados}</p>` : ''}
            </div>
            <button onclick="handleConexao('${c.tipo}')" 
                    style="padding: 10px 20px; background: ${c.conectado ? '#ff4444' : '#7e30ff'}; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                ${btnTexto}
            </button>
        </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

window.handleConexao = function(tipo) {
    if (tipo === 'steam') {
        const steamData = SteamSync.obterDadosSteam();
        if (steamData) {
            SteamSync.desconectar();
            alert('✅ Steam desconectado!');
            location.reload();
        } else {
            window.location.href = './steam-auth.html';
        }
    } else if (tipo === 'discord') {
        alert('Discord: Conexão em desenvolvimento');
    } else if (tipo === 'spotify') {
        alert('Spotify: Conexão em desenvolvimento');
    }
};

window.carregarJogos = function() {
    console.log('📚 Carregando Jogos');
    const container = document.getElementById('jogos-conteudo');

    if (!container) {
        console.warn('❌ Não encontrou #jogos-conteudo');
        return;
    }

    const usuario = auth.getUsuarioLogado();
    if (!usuario) {
        container.innerHTML = '<p style="color: #9d5fd4;">Faça login primeiro</p>';
        return;
    }

    let biblioteca = null;

    const chave = `biblioteca_steam_${usuario.id}`;
    const jsonStr = localStorage.getItem(chave);
    if (jsonStr && jsonStr !== 'null') {
        try {
            biblioteca = JSON.parse(jsonStr);
            console.log(`✅ Biblioteca carregada (${biblioteca.length} jogos)`);
        } catch (e) {
            console.error('❌ Erro ao parsear JSON:', e);
            biblioteca = null;
        }
    }

    if (!biblioteca && typeof SteamSync !== 'undefined' && SteamSync.obterBiblioteca) {
        biblioteca = SteamSync.obterBiblioteca();
        console.log('✅ Biblioteca do SteamSync');
    }

    if (!biblioteca) {
        const generico = localStorage.getItem('bibliotecaSteam');
        if (generico && generico !== 'null') {
            try {
                biblioteca = JSON.parse(generico);
                console.log('✅ Biblioteca do localStorage genérico');
            } catch (e) {
                console.error('❌ Erro:', e);
                biblioteca = null;
            }
        }
    }

    if (!biblioteca || !Array.isArray(biblioteca) || biblioteca.length === 0) {
        console.log('⚠️ Biblioteca vazia');
        container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #9d5fd4;">
            <p style="font-size: 1.1rem; margin-bottom: 15px;">Nenhum jogo conectado</p>
            <p style="font-size: 0.9rem; color: #7e30ff;">Conecte sua conta Steam para ver sua biblioteca</p>
        </div>
        `;
        return;
    }

    console.log(`✅ Renderizando ${biblioteca.length} jogos`);

    let html = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px;">`;

    biblioteca.forEach(jogo => {
        const nome = jogo.nome || jogo.name || 'Unknown';
        const imagem = jogo.imagem || jogo.img || 'https://via.placeholder.com/180x250?text=Sem+Imagem';
        const horas = jogo.horas || 0;

        html += `
        <div style="
            border: 2px solid #7e30ff;
            border-radius: 8px;
            overflow: hidden;
            background: rgba(45,0,80,0.5);
            transition: all 0.3s ease;
            cursor: pointer;
        " 
        onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 20px #7e30ff';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
            <img src="${imagem}" 
                 alt="${nome}" 
                 style="width: 100%; height: 200px; object-fit: cover; display: block;"
                 onerror="this.src='https://via.placeholder.com/180x250?text=Game';">
            <div style="padding: 10px; background: rgba(0,0,0,0.3);">
                <p style="
                    color: #c699ff; 
                    margin: 0 0 5px 0; 
                    font-weight: 600;
                    font-size: 0.9rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                ">
                    ${nome}
                </p>
                ${horas > 0 ? `<p style="color: #9d5fd4; margin: 0; font-size: 0.8rem;">⏱️ ${horas}h jogadas</p>` : ''}
            </div>
        </div>
        `;
    });

    html += `</div>`;

    container.innerHTML = html;
    console.log('✅ Jogos renderizados!');
};

function abrirModalBanner(usuario) {
    const modal = document.getElementById('modalBanner');
    if (!modal) return;

    modal.style.display = 'flex';

    const fechar = modal.querySelector('.btn-fechar-modal');
    if (fechar) {
        fechar.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    const salvar = document.getElementById('btn-salvar-banner');
    if (salvar) {
        salvar.addEventListener('click', function() {
            const cor = document.querySelector('input[name="gradiente"]:checked');
            const url = document.getElementById('urlBanner');

            let banner = '';
            if (url && url.value.trim()) {
                banner = url.value.trim();
            } else if (cor) {
                banner = cor.value;
            }

            if (banner) {
                localStorage.setItem(`banner_${usuario.email}`, banner);
                carregarBanner({...usuario, banner});
                modal.style.display = 'none';
                alert('✅ Banner salvo!');
            }
        });
    }

    document.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ✨ FUNÇÃO CORRIGIDA: AVATAR ATUALIZA NA PÁGINA
function abrirModalPerfil(usuario) {
    const modal = document.getElementById('modalEditar');
    if (!modal) return;

    modal.style.display = 'flex';

    const inputNome = document.getElementById('inputNome');
    const inputBio = document.getElementById('inputBio');
    const inputAvatar = document.getElementById('inputAvatar');
    const preview = document.getElementById('previewAvatar');

    if (inputNome) inputNome.value = usuario.nome || '';
    if (inputBio) inputBio.value = usuario.bio || '';
    if (preview) preview.src = usuario.avatar || 'https://via.placeholder.com/150';

    // ✨ Permitir selecionar nova foto
    if (inputAvatar) {
        inputAvatar.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = event => {
                    if (preview) preview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const fechar = modal.querySelector('.btn-fechar-modal');
    if (fechar) {
        fechar.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    const salvar = document.querySelector('.btn-salvar-editar');
    if (salvar) {
        salvar.addEventListener('click', function() {
            const nome = inputNome ? inputNome.value.trim() : '';
            const bio = inputBio ? inputBio.value.trim() : '';
            const avatar = preview ? preview.src : '';

            console.log('💾 Salvando perfil...');
            console.log('📝 Nome:', nome);
            console.log('📝 Bio:', bio);
            console.log('🖼️ Avatar:', avatar ? 'SIM' : 'NÃO');

            let mudou = false;

            // ✨ ATUALIZAR NOME
            if (nome && nome !== usuario.nome) {
                usuario.nome = nome;
                auth.atualizarUsuario(usuario);
                const el = document.getElementById('nomeUsuario');
                if (el) el.textContent = nome;
                console.log('✅ Nome atualizado');
                mudou = true;
            }

            // ✨ ATUALIZAR BIO
            if (bio) {
                localStorage.setItem(`bio_${usuario.email}`, bio);
                usuario.bio = bio;
                const el = document.getElementById('bioUsuario');
                if (el) el.textContent = bio;
                console.log('✅ Bio atualizada');
                mudou = true;
            }

            // ✨ ATUALIZAR AVATAR (CORRIGIDO!)
            if (avatar && avatar !== usuario.avatar) {
                console.log('🖼️ Atualizando avatar...');
                localStorage.setItem(`avatar_${usuario.email}`, avatar);
                usuario.avatar = avatar;

                // IMPORTANTE: Atualizar a imagem do avatar na página
                const avatarImg = document.getElementById('avatar');
                if (avatarImg) {
                    avatarImg.src = avatar;
                    console.log('✅ Imagem do avatar atualizada');
                } else {
                    console.warn('⚠️ Elemento #avatar não encontrado');
                }

                auth.atualizarUsuario(usuario);
                mudou = true;
            }

            if (mudou) {
                modal.style.display = 'none';
                alert('✅ Perfil atualizado!');
                console.log('✅ Perfil salvo com sucesso');
            } else {
                alert('❌ Nenhuma alteração feita');
                console.log('⚠️ Nenhuma mudança detectada');
            }
        });
    }

    document.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}
