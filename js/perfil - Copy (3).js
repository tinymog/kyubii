// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                    PERFIL.JS - BANNER 100% ESTÁTICO                       ║
// ║                     SEM MOVIMENTO AO SCROLLAR                              ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// ============ INICIALIZAR NA PÁGINA ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Página carregada');
    
    const usuarioLogado = auth.getUsuarioLogado();
    if (!usuarioLogado) {
        console.warn('❌ Nenhum usuário logado');
        setTimeout(() => window.location.href = '/pages/login.html', 500);
        return;
    }

    console.log('✅ Usuário logado:', usuarioLogado.nome);
    console.log('📧 Email:', usuarioLogado.email);
    
    preencherPerfil(usuarioLogado);
    setupAbas();
    setupEditarFoto();
    configurarBotoes(usuarioLogado);
    
    // CARREGA BANNER COM DELAY EXTRA
    setTimeout(() => {
        carregarDadosReais(usuarioLogado);
    }, 200);
});

// ============ APLICAR BANNER - 100% ESTÁTICO ============
function aplicarBanner(bannerValue) {
    const cover = document.getElementById('perfil-cover');
    
    if (!cover) {
        console.error('❌ Elemento #perfil-cover não encontrado!');
        alert('❌ ERRO: Elemento do banner não encontrado no HTML!');
        return;
    }

    console.log('📸 Aplicando banner...');
    console.log('   Valor:', bannerValue);
    console.log('   Tipo:', bannerValue.startsWith('linear-gradient') ? 'GRADIENTE' : 'IMAGEM');

    // LIMPAR ABSOLUTAMENTE TUDO
    cover.style.cssText = '';

    // APLICAR SEM PARALLAX
    if (bannerValue && bannerValue.startsWith('linear-gradient')) {
        // ✅ É um gradiente - usar background direto
        cover.style.background = bannerValue;
        cover.style.backgroundSize = 'cover';
        cover.style.backgroundPosition = 'center';
        cover.style.backgroundRepeat = 'no-repeat';
        cover.style.backgroundAttachment = 'scroll';  // ← SCROLL, NÃO FIXED!
        console.log('✅ Gradiente aplicado (ESTÁTICO)');
        
    } else if (bannerValue && (bannerValue.startsWith('http') || bannerValue.startsWith('/'))) {
        // ✅ É uma URL - usar backgroundImage
        cover.style.backgroundImage = `url('${bannerValue}')`;
        cover.style.backgroundSize = 'cover';
        cover.style.backgroundPosition = 'center';
        cover.style.backgroundRepeat = 'no-repeat';
        cover.style.backgroundAttachment = 'scroll';  // ← SCROLL, NÃO FIXED!
        console.log('✅ Imagem aplicada (ESTÁTICA)');
    }

    // GARANTIR ALTURA E TAMANHO
    cover.style.height = '200px';
    cover.style.minHeight = '200px';
    cover.style.width = '100%';
    cover.style.display = 'block';
    cover.style.borderRadius = '18px';
    cover.style.marginBottom = '12px';
    cover.style.position = 'relative';

    // VERIFICAR DEPOIS DE APLICAR
    setTimeout(() => {
        const bgStyle = window.getComputedStyle(cover);
        console.log('🔍 Verificação final:');
        console.log('   BackgroundAttachment:', bgStyle.backgroundAttachment);
        console.log('   Height:', bgStyle.height);
    }, 100);
}

// ============ CARREGAR BANNER DO LOCALSTORAGE ============
function carregarDadosReais(usuario) {
    const email = usuario.email;
    const chave = `banner_${email}`;
    
    console.log('\n🔍 CARREGANDO BANNER:');
    console.log('   Email:', email);
    console.log('   Chave:', chave);

    const bannerLocal = localStorage.getItem(chave);
    console.log('   Valor encontrado:', bannerLocal);

    if (bannerLocal && bannerLocal.trim() !== '') {
        console.log('✅ Banner encontrado, aplicando...');
        aplicarBanner(bannerLocal);
    } else {
        console.log('ℹ️ Nenhum banner personalizado');
    }
}

// ============ PREENCHER PERFIL ============
function preencherPerfil(usuario) {
    const nomeEl = document.getElementById('nomeUsuario');
    if (nomeEl) nomeEl.textContent = usuario.nome || 'Usuário';

    const avatarEl = document.getElementById('avatar');
    if (avatarEl) {
        avatarEl.src = usuario.avatar || 'https://via.placeholder.com/150';
        avatarEl.onerror = () => {
            avatarEl.src = 'https://via.placeholder.com/150';
        };
    }

    const emailEl = document.getElementById('emailUsuario');
    if (emailEl) emailEl.textContent = `Email: ${usuario.email || 'N/A'}`;

    const bioEl = document.getElementById('bioUsuario');
    if (bioEl) bioEl.textContent = usuario.bio || 'Bio do usuário';
}

// ============ SETUP ABAS ============
function setupAbas() {
    const abaBtns = document.querySelectorAll('.aba-btn');
    
    abaBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const btnAtivoAnterior = document.querySelector('.aba-btn.aba-ativa');
            if (btnAtivoAnterior) {
                btnAtivoAnterior.classList.remove('aba-ativa');
            }
            
            this.classList.add('aba-ativa');
            
            const conteudoAtivoAnterior = document.querySelector('.aba-conteudo.aba-ativa-conteudo');
            if (conteudoAtivoAnterior) {
                conteudoAtivoAnterior.classList.remove('aba-ativa-conteudo');
            }
            
            const idAba = this.getAttribute('data-aba');
            const novoConteudo = document.getElementById(idAba);
            if (novoConteudo) {
                novoConteudo.classList.add('aba-ativa-conteudo');
            }
        });
    });
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
                reader.onload = (evento) => {
                    if (previewAvatar) {
                        previewAvatar.src = evento.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// ============ CONFIGURAR BOTÕES ============
function configurarBotoes(usuario) {
    console.log('⚙️ Configurando botões...');
    
    const btnBanner = document.querySelector('.btn-editar-banner');
    if (btnBanner) {
        btnBanner.addEventListener('click', () => {
            console.log('🎨 Editar Banner clicado');
            const modal = document.getElementById('modalBanner');
            if (modal) {
                modal.style.display = 'flex';
                console.log('✅ Modal Banner aberto');
            }
        });
    }

    const btnEditar = document.querySelector('.btn-editar');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            console.log('✏️ Editar Perfil clicado');
            const modal = document.getElementById('modalEditar');
            if (modal) {
                modal.style.display = 'flex';
                preencherFormularioEditar(usuario);
                console.log('✅ Modal Editar aberto');
            }
        });
    }

    const btnLogout = document.querySelector('.btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🚪 Logout clicado');
            
            const modaisAbertos = document.querySelectorAll('.modal[style*="display: flex"]');
            modaisAbertos.forEach(modal => {
                modal.style.display = 'none';
            });
            
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('usuario');
            console.log('✅ localStorage limpo');
            
            setTimeout(() => {
                window.location.href = '/pages/login.html';
            }, 100);
        });
    }

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

    document.addEventListener('click', function(evento) {
        modais.forEach(modal => {
            if (evento.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    const btnSalvarBanner = document.querySelector('#modalBanner .btn-salvar-banner');
    if (btnSalvarBanner) {
        btnSalvarBanner.addEventListener('click', () => {
            salvarBanner(usuario.email);
        });
    }

    const btnSalvarEditar = document.querySelector('#modalEditar .btn-salvar-editar');
    if (btnSalvarEditar) {
        btnSalvarEditar.addEventListener('click', () => {
            salvarPerfil(usuario);
        });
    }
}

// ============ SALVAR BANNER ============
function salvarBanner(email) {
    console.log('\n💾 SALVANDO BANNER:');
    console.log('   Email:', email);
    
    const urlInput = document.getElementById('urlBanner');
    const gradienteRadios = document.querySelectorAll('input[name="gradiente"]');
    let bannerValue = null;

    // Verificar qual gradiente foi selecionado
    for (let radio of gradienteRadios) {
        if (radio.checked) {
            bannerValue = radio.value;
            console.log('✅ Gradiente selecionado');
            break;
        }
    }

    // Se não há gradiente, verificar URL
    if (!bannerValue && urlInput && urlInput.value.trim()) {
        bannerValue = urlInput.value.trim();
        console.log('✅ URL selecionada');
    }

    // Validar
    if (!bannerValue) {
        console.warn('❌ Nenhum valor selecionado');
        alert('❌ Por favor, escolha uma cor ou URL para o banner');
        return;
    }

    try {
        // Salvar no localStorage
        const chave = `banner_${email}`;
        localStorage.setItem(chave, bannerValue);
        console.log('✅ Salvo no localStorage');
        console.log('   Valor:', bannerValue.substring(0, 50) + '...');
        
        // VERIFICAÇÃO
        const verificacao = localStorage.getItem(chave);
        console.log('✅ Verificação: OK');
        
        // Aplicar banner IMEDIATAMENTE
        aplicarBanner(bannerValue);
        
        // Mensagem
        alert('✅ Banner salvo com sucesso!');
        
        // Fechar modal
        const modalBanner = document.getElementById('modalBanner');
        if (modalBanner) {
            modalBanner.style.display = 'none';
        }
        
        // Limpar formulário
        if (urlInput) urlInput.value = '';
        gradienteRadios.forEach(r => r.checked = false);
        
        console.log('✅ Tudo concluído!');
        
    } catch (erro) {
        console.error('❌ Erro:', erro);
        alert('❌ Erro ao salvar: ' + erro.message);
    }
}

// ============ PREENCHER FORMULÁRIO EDITAR ============
function preencherFormularioEditar(usuario) {
    const inputNome = document.getElementById('inputNome');
    const inputBio = document.getElementById('inputBio');
    const previewAvatar = document.getElementById('previewAvatar');

    if (inputNome) inputNome.value = usuario.nome || '';
    if (inputBio) inputBio.value = usuario.bio || '';
    if (previewAvatar) previewAvatar.src = usuario.avatar || 'https://via.placeholder.com/120';
}

// ============ CONVERTER PARA BASE64 ============
function converterImagemBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function(evento) {
        callback(evento.target.result);
    };
    reader.readAsDataURL(file);
}

// ============ SALVAR PERFIL ============
async function salvarPerfil(usuario) {
    console.log('💾 Salvando perfil...');
    
    const inputNome = document.getElementById('inputNome');
    const inputBio = document.getElementById('inputBio');
    const inputAvatar = document.getElementById('inputAvatar');

    const nome = inputNome ? inputNome.value.trim() : '';
    const bio = inputBio ? inputBio.value.trim() : '';

    if (!nome) {
        alert('❌ Por favor, preencha o nome');
        return;
    }

    try {
        let avatarBase64 = null;

        if (inputAvatar && inputAvatar.files.length > 0) {
            console.log('🖼️ Convertendo avatar...');
            avatarBase64 = await new Promise((resolve) => {
                converterImagemBase64(inputAvatar.files[0], resolve);
            });
            console.log('✅ Avatar convertido');
        }

        const usuarioAtualizado = {
            ...usuario,
            nome: nome,
            bio: bio,
            avatar: avatarBase64 || usuario.avatar
        };

        localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
        console.log('✅ Perfil salvo');

        preencherPerfil(usuarioAtualizado);

        alert('✅ Perfil atualizado!');
        
        const modalEditar = document.getElementById('modalEditar');
        if (modalEditar) {
            modalEditar.style.display = 'none';
        }

    } catch (erro) {
        console.error('❌ Erro:', erro);
        alert('❌ Erro ao atualizar: ' + erro.message);
    }
}
