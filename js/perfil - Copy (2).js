document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = auth.getUsuarioLogado();
    if (!usuarioLogado) {
        setTimeout(() => window.location.href = '/pages/login.html', 500);
        return;
    }
    console.log('Usuário:', usuarioLogado);
    preencherPerfil(usuarioLogado);
    setupAbas();
    setupEditarFoto();
    configurarBotoes(usuarioLogado);
    
    // Carregar banner e dados imediatamente
    setTimeout(() => carregarDadosReais(usuarioLogado), 100);
});

// ============ PREENCHER PERFIL ============
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

// ============ CONVERTER PARA BASE64 ============
function converterImagemBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(file);
}

// ============ SETUP EDITAR FOTO ============
function setupEditarFoto() {
    const inputAvatar = document.getElementById('inputAvatar');
    const previewAvatar = document.getElementById('previewAvatar');

    if (inputAvatar) {
        inputAvatar.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (previewAvatar) previewAvatar.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// ============ APLICAR BANNER ============
function aplicarBanner(bannerValue) {
    const cover = document.getElementById('perfil-cover');
    if (!cover) {
        console.warn('❌ Elemento #perfil-cover não encontrado!');
        return;
    }

    console.log('📸 Aplicando banner:', bannerValue);

    if (bannerValue.startsWith('linear-gradient')) {
        cover.style.background = bannerValue;
        cover.style.backgroundImage = 'none';
    } else {
        cover.style.backgroundImage = `url('${bannerValue}')`;
        cover.style.backgroundSize = 'cover';
        cover.style.backgroundPosition = 'center';
        cover.style.background = 'none';
    }
}

// ============ CARREGAR DADOS REAIS ============
async function carregarDadosReais(usuario) {
    const email = usuario.email;
    const bannerLocal = localStorage.getItem(`banner_${email}`);
    
    console.log('🔍 Buscando banner no localStorage:', `banner_${email}`, bannerLocal);

    if (bannerLocal) {
        aplicarBanner(bannerLocal);
        console.log('✅ Banner do localStorage aplicado!');
    } else {
        console.log('⚠️ Nenhum banner encontrado no localStorage');
    }
}

// ============ SETUP ABAS ============
function setupAbas() {
    const abaBtns = document.querySelectorAll('.aba-btn');
    
    abaBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const abaAtiva = document.querySelector('.aba-btn.aba-ativa');
            if (abaAtiva) abaAtiva.classList.remove('aba-ativa');
            
            this.classList.add('aba-ativa');
            
            const abaConteudoAtivo = document.querySelector('.aba-conteudo.aba-ativa-conteudo');
            if (abaConteudoAtivo) abaConteudoAtivo.classList.remove('aba-ativa-conteudo');
            
            const id = this.getAttribute('data-aba');
            const novoConteudo = document.getElementById(id);
            if (novoConteudo) novoConteudo.classList.add('aba-ativa-conteudo');
        });
    });
}

// ============ CONFIGURAR BOTÕES ============
function configurarBotoes(usuario) {
    // EDITAR BANNER
    const btnBanner = document.querySelector('.btn-editar-banner');
    if (btnBanner) {
        btnBanner.addEventListener('click', () => {
            console.log('🔘 Botão Editar Banner clicado');
            const modal = document.getElementById('modalBanner');
            if (modal) {
                modal.style.display = 'flex';
                console.log('✅ Modal Banner aberto');
            } else {
                console.warn('❌ Modal #modalBanner não encontrado!');
            }
        });
    }

    // EDITAR PERFIL
    const btnEditar = document.querySelector('.btn-editar');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            console.log('🔘 Botão Editar Perfil clicado');
            const modal = document.getElementById('modalEditar');
            if (modal) {
                modal.style.display = 'flex';
                preencherFormularioEditar(usuario);
                console.log('✅ Modal Editar aberto');
            } else {
                console.warn('❌ Modal #modalEditar não encontrado!');
            }
        });
    }

    // LOGOUT
    const btnLogout = document.querySelector('.btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🚪 Logout clicado');
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('usuario');
            setTimeout(() => {
                window.location.href = '/pages/login.html';
            }, 100);
        });
    }

    // FECHAR MODAIS E CONFIGURAR BOTÕES
    fecharModais(usuario);
}

// ============ FECHAR MODAIS ============
function fecharModais(usuario) {
    const modais = document.querySelectorAll('.modal');
    
    modais.forEach(modal => {
        const btnFechar = modal.querySelector('.btn-fechar-modal');
        if (btnFechar) {
            btnFechar.addEventListener('click', () => {
                modal.style.display = 'none';
                console.log('❌ Modal fechado');
            });
        }
    });

    // FECHAR AO CLICAR FORA
    document.addEventListener('click', function(e) {
        modais.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // SALVAR BANNER
    const btnSalvarBanner = document.querySelector('#modalBanner .btn-salvar-banner');
    if (btnSalvarBanner) {
        btnSalvarBanner.addEventListener('click', () => {
            salvarBanner(usuario.email);
        });
    }

    // SALVAR EDITAR
    const btnSalvarEditar = document.querySelector('#modalEditar .btn-salvar-editar');
    if (btnSalvarEditar) {
        btnSalvarEditar.addEventListener('click', () => {
            salvarPerfil(usuario);
        });
    }
}

// ============ SALVAR BANNER ============
async function salvarBanner(email) {
    const urlInput = document.getElementById('urlBanner');
    const gradienteRadios = document.querySelectorAll('input[name="gradiente"]');
    
    let bannerValue = null;
    
    // Verificar se foi selecionado um gradiente
    for (let radio of gradienteRadios) {
        if (radio.checked) {
            bannerValue = radio.value;
            break;
        }
    }

    // Se não houver gradiente, verificar URL
    if (!bannerValue && urlInput && urlInput.value.trim()) {
        bannerValue = urlInput.value.trim();
    }

    if (!bannerValue) {
        alert('❌ Por favor, escolha uma cor ou URL para o banner');
        console.warn('❌ Banner vazio!');
        return;
    }

    try {
        console.log('📤 Enviando banner para backend...');
        const response = await fetch(`/api/perfil/banner/${email}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ banner: bannerValue })
        });

        console.log('📡 Status da resposta:', response.status);
        const resposta = await response.json();
        console.log('✅ Resposta do servidor:', resposta);

        if (response.ok) {
            // SALVAR NO LOCALSTORAGE
            localStorage.setItem(`banner_${email}`, bannerValue);
            console.log('✅ Banner salvo no localStorage');
            alert('✅ Banner salvo com sucesso!');
            
            // APLICAR BANNER IMEDIATAMENTE
            aplicarBanner(bannerValue);
            
            // FECHAR MODAL
            document.getElementById('modalBanner').style.display = 'none';
            
            // LIMPAR FORMULÁRIO
            if (urlInput) urlInput.value = '';
            gradienteRadios.forEach(r => r.checked = false);
            
            console.log('✅ Banner atualizado com sucesso!');
        } else {
            alert('❌ Erro ao salvar banner: ' + (resposta.erro || 'Erro desconhecido'));
            console.error('❌ Erro:', resposta);
        }
    } catch (erro) {
        console.error('❌ Erro na requisição:', erro);
        alert('❌ Erro ao comunicar com servidor');
    }
}

// ============ PREENCHER FORMULÁRIO EDITAR ============
function preencherFormularioEditar(usuario) {
    const inputNome = document.getElementById('inputNome');
    const inputBio = document.getElementById('inputBio');
    const previewAvatar = document.getElementById('previewAvatar');

    if (inputNome) inputNome.value = usuario.nome;
    if (inputBio) inputBio.value = usuario.bio || '';
    if (previewAvatar) previewAvatar.src = usuario.avatar || 'https://via.placeholder.com/120';
}

// ============ SALVAR PERFIL ============
async function salvarPerfil(usuario) {
    const inputNome = document.getElementById('inputNome');
    const inputBio = document.getElementById('inputBio');
    const inputAvatar = document.getElementById('inputAvatar');
    
    const nome = inputNome ? inputNome.value.trim() : '';
    const bio = inputBio ? inputBio.value.trim() : '';
    const email = usuario.email;

    if (!nome) {
        alert('❌ Por favor, preencha o nome');
        return;
    }

    try {
        let avatarBase64 = null;

        // Se um arquivo foi selecionado, converter para base64
        if (inputAvatar && inputAvatar.files.length > 0) {
            avatarBase64 = await new Promise((resolve) => {
                converterImagemBase64(inputAvatar.files[0], resolve);
            });
        }

        console.log('📤 Enviando dados do perfil...');
        const response = await fetch(`/api/perfil/atualizar/${email}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                bio: bio,
                avatar: avatarBase64 || usuario.avatar
            })
        });

        console.log('📡 Status:', response.status);
        const resposta = await response.json();

        if (response.ok) {
            // ATUALIZAR LOCALSTORAGE
            const usuarioAtualizado = {
                ...usuario,
                nome: nome,
                bio: bio,
                avatar: avatarBase64 || usuario.avatar
            };
            localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
            
            // ATUALIZAR INTERFACE
            preencherPerfil(usuarioAtualizado);
            
            alert('✅ Perfil atualizado com sucesso!');
            document.getElementById('modalEditar').style.display = 'none';
            console.log('✅ Perfil salvo!');
        } else {
            alert('❌ Erro ao atualizar perfil');
            console.error('❌ Erro:', resposta);
        }
    } catch (erro) {
        console.error('❌ Erro:', erro);
        alert('❌ Erro ao comunicar com servidor');
    }
}