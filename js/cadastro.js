// ================ CADASTRO COM MOSTRAR SENHA - FUNCIONANDO ================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Página carregada!');
    
    // Setup para mostrar/ocultar senha
    const toggleSenha = document.getElementById('toggleSenha');
    const toggleConfirmaSenha = document.getElementById('toggleConfirmaSenha');
    const inputSenha = document.getElementById('senha');
    const inputConfirmaSenha = document.getElementById('confirmaSenha');

    console.log('🔍 Elementos encontrados:');
    console.log('toggleSenha:', toggleSenha);
    console.log('inputSenha:', inputSenha);
    console.log('toggleConfirmaSenha:', toggleConfirmaSenha);
    console.log('inputConfirmaSenha:', inputConfirmaSenha);

    if (toggleSenha && inputSenha) {
        toggleSenha.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('👁️ Clicou em toggleSenha');
            togglePasswordVisibility(inputSenha, toggleSenha);
        });
    }

    if (toggleConfirmaSenha && inputConfirmaSenha) {
        toggleConfirmaSenha.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('👁️ Clicou em toggleConfirmaSenha');
            togglePasswordVisibility(inputConfirmaSenha, toggleConfirmaSenha);
        });
    }

    // Setup para formulário
    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            fazerCadastro();
        });
    }
});

function togglePasswordVisibility(input, icon) {
    console.log('🔄 Alternando visibilidade');
    console.log('Type atual:', input.type);
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        console.log('✅ Senha VISÍVEL (type=text)');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        console.log('✅ Senha OCULTA (type=password)');
    }
}

function fazerCadastro() {
    const nome = document.getElementById('nome')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const senha = document.getElementById('senha')?.value;
    const confirmaSenha = document.getElementById('confirmaSenha')?.value;

    console.log('📝 Dados coletados:', { nome, email });

    if (!nome || !email || !senha || !confirmaSenha) {
        alert('⚠️ Preencha todos os campos!');
        return;
    }

    if (senha !== confirmaSenha) {
        alert('⚠️ As senhas não conferem!');
        return;
    }

    if (senha.length < 6) {
        alert('⚠️ Senha deve ter pelo menos 6 caracteres!');
        return;
    }

    console.log('📡 Enviando cadastro para http://localhost:5500/api/auth/cadastro...');

    fetch('http://localhost:5500/api/auth/cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nome: nome,
            email: email,
            senha: senha
        })
    })
    .then(res => {
        console.log('📡 Resposta do servidor:', res.status, res.statusText);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
    })
    .then(data => {
        console.log('✅ Resposta recebida:', data);
        if (data.success) {
            console.log('✅ Cadastro realizado!', data.usuario);
            localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
            localStorage.setItem('email', email);
            alert('✓ Cadastro realizado com sucesso!\n\nBem-vindo, ' + data.usuario.nome + '!');
            window.location.href = 'principal.html';
        } else {
            alert('❌ ' + (data.error || 'Erro ao cadastrar'));
        }
    })
    .catch(err => {
        console.error('❌ Erro completo:', err);
        console.error('Tipo:', err.name);
        console.error('Mensagem:', err.message);
        if (err.message.includes('Failed to fetch')) {
            alert('❌ Erro de conexão!\n\nVerifique se o servidor está rodando:\npython app.py\n\nPorta: 5500');
        } else {
            alert('❌ Erro ao cadastrar: ' + err.message);
        }
    });
}
