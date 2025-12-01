// ================ LOGIN COMPLETO COM TUDO PERSISTINDO ================

class GerenciadorLogin {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Login...');
        this.setupEventos();
    }

    setupEventos() {
        const btnEntrar = document.querySelector('button[type="submit"]');
        if (btnEntrar) {
            btnEntrar.addEventListener('click', (e) => {
                e.preventDefault();
                this.fazerLogin();
            });
        }
    }

    fazerLogin() {
        const email = document.getElementById('email')?.value.trim();
        const senha = document.getElementById('senha')?.value;

        if (!email || !senha) {
            alert('⚠️ Preencha email e senha!');
            return;
        }

        console.log('📡 Enviando login...');

        fetch('http://localhost:5500/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        })
        .then(res => {
            console.log('📡 Resposta:', res.status);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('✅ Resposta recebida:', data);
            
            if (data.success && data.usuario) {
                console.log('✅ Login realizado!', data.usuario);
                
                // ✅ SALVAR TUDO NO LOCALSTORAGE!
                localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                localStorage.setItem('email', email);
                localStorage.setItem('nome', data.usuario.nome);
                localStorage.setItem('avatar', data.usuario.avatar);
                console.log('✓ Dados básicos salvos');
                
                // ✅ SALVAR STEAM SE EXISTIR!
                if (data.usuario.steamId) {
                    localStorage.setItem('steamId', data.usuario.steamId);
                    localStorage.setItem('steamUsername', data.usuario.steamUsername);
                    if (data.usuario.steamAvatar) {
                        localStorage.setItem('steamAvatar', data.usuario.steamAvatar);
                    }
                    console.log('✓ Steam salvo:', data.usuario.steamUsername);
                }
                
                console.log('✓ Todos os dados salvos no localStorage');
                
                alert('✓ Bem-vindo, ' + data.usuario.nome + '!');
                window.location.href = 'principal.html';
            } else {
                alert('❌ ' + (data.error || 'Erro ao fazer login'));
            }
        })
        .catch(err => {
            console.error('❌ Erro:', err);
            if (err.message.includes('Failed to fetch')) {
                alert('❌ Erro de conexão!\n\nVerifique se o servidor está rodando:\npython app.py\n\nPorta: 5500');
            } else {
                alert('❌ Erro ao fazer login: ' + err.message);
            }
        });
    }
}

const gerenciadorLogin = new GerenciadorLogin();
