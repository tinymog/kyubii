// ═══════════════════════════════════════════════════════════════════════════
// CRIAR COMUNIDADE - JS CORRIGIDO
// ═══════════════════════════════════════════════════════════════════════════

class CriarComunidade {
    constructor() {
        this.imageData = null;
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Criar Comunidade');
        this.setupUpload();
        this.setupForm();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SETUP UPLOAD COM DRAG & DROP
    // ═══════════════════════════════════════════════════════════════════════════

    setupUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('preview');

        if (!uploadArea || !fileInput) {
            console.error('❌ Elementos de upload não encontrados');
            return;
        }

        console.log('✅ Upload setup iniciado');

        // ═ CLICK NO UPLOAD AREA ═
        uploadArea.addEventListener('click', (e) => {
            if (!this.imageData) { // Só clica se não tem imagem
                e.stopPropagation();
                console.log('📌 Upload area clicada');
                fileInput.click();
            }
        });

        // ═ CHANGE NO FILE INPUT ═
        fileInput.addEventListener('change', (e) => {
            console.log('📌 Arquivo selecionado');
            this.handleFile(e.target.files[0]);
        });

        // ═ DRAG OVER ═
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!this.imageData) {
                uploadArea.classList.add('ativo');
            }
            console.log('📌 Arrastar sobre upload area');
        });

        // ═ DRAG LEAVE ═
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('ativo');
            console.log('📌 Saiu da upload area');
        });

        // ═ DROP ═
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('ativo');
            console.log('📌 Arquivo solto');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                fileInput.files = files;
                this.handleFile(file);
            }
        });

        // Prevenir comportamento padrão no document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PROCESSAR ARQUIVO
    // ═══════════════════════════════════════════════════════════════════════════

    handleFile(file) {
        if (!file) {
            console.warn('⚠️ Nenhum arquivo selecionado');
            return;
        }

        console.log('📁 Arquivo:', file.name, file.size, file.type);

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('❌ Selecione uma imagem válida!');
            console.error('❌ Tipo inválido:', file.type);
            return;
        }

        // Validar tamanho (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('❌ Arquivo muito grande! Máximo 5MB');
            console.error('❌ Tamanho:', file.size, 'Máximo:', maxSize);
            return;
        }

        // Ler arquivo
        const reader = new FileReader();

        reader.onload = (e) => {
            console.log('✅ Arquivo lido com sucesso');
            this.showPreview(e.target.result, file.name);
        };

        reader.onerror = (e) => {
            console.error('❌ Erro ao ler arquivo:', e);
            alert('❌ Erro ao processar imagem');
        };

        reader.readAsDataURL(file);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MOSTRAR PREVIEW - IMAGEM COMO <img>
    // ═══════════════════════════════════════════════════════════════════════════

    showPreview(dataUrl, filename) {
        const uploadContent = document.getElementById('uploadContent');
        const uploadImageWrapper = document.getElementById('uploadImageWrapper');
        const uploadImageDisplay = document.getElementById('uploadImageDisplay');

        if (!uploadContent || !uploadImageWrapper || !uploadImageDisplay) {
            console.error('❌ Elementos de preview não encontrados');
            return;
        }

        console.log('🖼️ Mostrando preview:', filename);

        // Guardar dados
        this.imageData = dataUrl;

        // Mostrar imagem, esconder texto
        uploadContent.style.display = 'none';
        uploadImageWrapper.style.display = 'flex';
        uploadImageDisplay.src = dataUrl;

        console.log('✅ Preview exibido');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // REMOVER IMAGEM
    // ═══════════════════════════════════════════════════════════════════════════

    removerImagem() {
        const uploadArea = document.getElementById('uploadArea');
        const uploadContent = document.getElementById('uploadContent');
        const uploadImageWrapper = document.getElementById('uploadImageWrapper');
        const fileInput = document.getElementById('preview');

        console.log('🗑️ Removendo imagem');

        // Resetar dados
        this.imageData = null;

        // Mostrar texto, esconder imagem
        uploadContent.style.display = 'flex';
        uploadImageWrapper.style.display = 'none';
        fileInput.value = '';

        // Remover classe ativo
        uploadArea.classList.remove('ativo');

        console.log('✅ Imagem removida');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SETUP FORMULÁRIO
    // ═══════════════════════════════════════════════════════════════════════════

    setupForm() {
        const form = document.getElementById('formCriarComunidade');

        if (!form) {
            console.error('❌ Formulário não encontrado');
            return;
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm(form);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ENVIAR FORMULÁRIO
    // ═══════════════════════════════════════════════════════════════════════════

    submitForm(form) {
        console.log('📋 Enviando formulário');

        // Coletar dados
        const dados = {
            id: Date.now().toString(),
            nome: document.getElementById('nomeComunidade')?.value,
            tamanhoMax: parseInt(document.getElementById('tamanhoMax')?.value) || 50,
            assunto: document.getElementById('assunto')?.value,
            tipo: document.getElementById('tipo')?.value,
            regras: document.getElementById('regras')?.value,
            biografia: document.getElementById('biografia')?.value,
            criador: JSON.parse(localStorage.getItem('usuarioLogado'))?.email,
            dataCriacao: new Date().toISOString(),
            membros: [JSON.parse(localStorage.getItem('usuarioLogado'))?.email],
            membrosInfo: [{
                email: JSON.parse(localStorage.getItem('usuarioLogado'))?.email,
                nome: JSON.parse(localStorage.getItem('usuarioLogado'))?.nome,
                role: 'criador',
                dataEntrada: new Date().toISOString()
            }],
            posts: [],
            banner: this.imageData,
            foto: this.imageData
        };

        // Validar dados
        if (!dados.nome || !dados.assunto || !dados.biografia) {
            alert('❌ Preencha todos os campos obrigatórios!');
            console.warn('⚠️ Campos obrigatórios vazios');
            return;
        }

        console.log('✅ Dados validados:', dados);

        // Salvar em localStorage
        const comunidades = JSON.parse(localStorage.getItem('comunidades_dados')) || [];
        comunidades.push(dados);
        localStorage.setItem('comunidades_dados', JSON.stringify(comunidades));

        console.log('💾 Comunidade salva em localStorage');

        // Feedback
        alert('✅ Comunidade criada com sucesso!');

        // Redirecionar
        window.location.href = '/pages/comunidades.html';
    }
}

let criarComunidadeInstance;

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado');
    criarComunidadeInstance = new CriarComunidade();
});

// Função para remover imagem (chamada do HTML)
function removerImagem() {
    if (criarComunidadeInstance) {
        criarComunidadeInstance.removerImagem();
    }
}
