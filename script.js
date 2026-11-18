const MODELOS = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash"
];

const NOMES_MODELOS = {
    "gemini-3.8-flash": "Gemini 3.8 Flash",
    "gemini-3.7-flash": "Gemini 3.7 Flash",
    "gemini-3.6-flash": "Gemini 3.6 Flash",
    "gemini-3.5-flash": "Gemini 3.5 Flash"
};

let apiKey = "";

const campoKey = document.getElementById("apiKey");
const botaoKey = document.getElementById("acessar");
const statusKey = document.getElementById("statusKey");

const campoMensagem = document.getElementById("mensagem");
const botaoEnviar = document.getElementById("enviar");
const botaoNovoChat = document.getElementById("novo-chat");

const chat = document.getElementById("chat");
const listaConversas = document.getElementById("lista-conversas");


// ==========================================
//  VARIÁVEIS DO CHAT
// ==========================================

let conversas = [];
let conversaAtual = null;


// ==========================================
//  CONFIGURAR API KEY
// ==========================================

botaoKey.addEventListener("click", function () {

    const chave = campoKey.value.trim();

    if (chave === "") {
        statusKey.textContent = "Informe sua API Key.";
        statusKey.style.color = "red";
        return;
    }

    apiKey = chave;
    campoKey.value = "";

    statusKey.textContent = "API Key configurada!";
    statusKey.style.color = "lightgreen";

});


// ==========================================
//  CRIAR UMA NOVA CONVERSA
// ==========================================

function novaConversa() {

    const conversa = {
        id: Date.now() + Math.random(),
        titulo: "Nova conversa",
        mensagens: []
    };

    conversas.push(conversa);
    conversaAtual = conversa;

    atualizarListaConversas();
    mostrarMensagens();

    campoMensagem.value = "";
    campoMensagem.focus();

}


// ==========================================
//  ATUALIZAR LISTA DE CONVERSAS
// ==========================================

function atualizarListaConversas() {

    listaConversas.innerHTML = "";

    conversas.forEach(function (conversa) {

        const botao = document.createElement("button");

        botao.textContent = conversa.titulo;
        botao.classList.add("conversa-item");

        if (conversaAtual && conversa.id === conversaAtual.id) {
            botao.classList.add("ativa");
        }

        botao.addEventListener("click", function () {

            conversaAtual = conversa;

            mostrarMensagens();
            atualizarListaConversas();

        });

        listaConversas.appendChild(botao);

    });

}


// ==========================================
//  EXIBIR MENSAGENS NA TELA
// ==========================================

function mostrarMensagens() {

    chat.innerHTML = "";

    if (!conversaAtual) {
        return;
    }

    if (conversaAtual.mensagens.length === 0) {

        adicionarMensagem(
            "Olá! Como posso ajudar?",
            "ia"
        );

        return;
    }

    conversaAtual.mensagens.forEach(function (mensagem) {

        adicionarMensagem(
            mensagem.texto,
            mensagem.tipo
        );

    });

}


// ==========================================
//  ADICIONAR MENSAGEM
// ==========================================

function adicionarMensagem(texto, tipo) {

    const mensagem = document.createElement("div");

    mensagem.classList.add("mensagem", tipo);
    mensagem.textContent = texto;

    chat.appendChild(mensagem);
    chat.scrollTop = chat.scrollHeight;

    return mensagem;

}


// ==========================================
//  FAZER REQUISIÇÃO PARA UM MODELO
// ==========================================

async function requisitarModelo(modelo, conversa) {

    const API_URL =
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 8000);

    try {

        const resposta = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },

            signal: controller.signal,

            body: JSON.stringify({

                contents: conversa.mensagens
                    .filter(m => m.tipo === "usuario" || m.tipo === "ia")
                    .map(m => ({
                        role: m.tipo === "usuario" ? "user" : "model",
                        parts: [{ text: m.texto }]
                    }))

            })

        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {

            const erro = new Error(
                dados.error?.message || "Erro ao comunicar com a API."
            );

            erro.status = resposta.status;

            // Erros que não adianta tentar novamente com outro modelo.
            if ([400, 401, 403].includes(resposta.status)) {
                erro.fatal = true;
            }

            throw erro;

        }

        const textoResposta = dados.candidates?.[0]?.content?.parts
            ?.map(parte => parte.text || "")
            .join("");

        if (!textoResposta) {
            throw new Error("A IA não retornou uma resposta.");
        }

        return textoResposta;

    } catch (erro) {

        if (erro.name === "AbortError") {
            throw new Error("Tempo limite de 8 segundos excedido.");
        }

        throw erro;

    } finally {

        clearTimeout(timeout);

    }

}


// ==========================================
//  CONSULTAR IA COM MODELO ALTERNATIVO
// ==========================================

async function consultarIA(conversa, atualizarStatus) {

    let ultimoErro;

    for (const modelo of MODELOS) {

        const nomeModelo = NOMES_MODELOS[modelo] || modelo;

        try {

            console.log(`Consultando: ${nomeModelo}`);

            // Atualiza o modelo exibido na interface.
            atualizarStatus(nomeModelo);

            const resposta = await requisitarModelo(modelo, conversa);

            console.log(`${nomeModelo} respondeu com sucesso!`);

            return resposta;

        } catch (erro) {

            ultimoErro = erro;

            console.warn(
                `Falha em ${nomeModelo}:`,
                erro.message
            );

            // Erro na API Key ou na estrutura da requisição.
            if (erro.fatal) {
                throw new Error(
                    "Erro na configuração da API: " + erro.message
                );
            }

            // Identifica o tipo de falha.
            if (erro.status === 429) {

                console.warn(
                    `${nomeModelo}: limite de requisições atingido.`
                );

            } else if (erro.status === 404) {

                console.warn(
                    `${nomeModelo}: modelo não encontrado ou indisponível.`
                );

            } else if (erro.status >= 500) {

                console.warn(
                    `${nomeModelo}: erro interno no servidor.`
                );

            } else if (erro.message.includes("Tempo limite")) {

                console.warn(
                    `${nomeModelo}: tempo limite excedido.`
                );

            } else {

                console.warn(
                    `${nomeModelo}: falha de comunicação.`
                );

            }

            console.log("Tentando o próximo modelo...");

        }

    }

    // Todos os modelos falharam.
    throw new Error(
        "Nenhum modelo conseguiu responder. Último erro: " +
        (ultimoErro?.message || "Erro desconhecido.")
    );

}

// ==========================================
//  ENVIAR MENSAGEM
// ==========================================

async function enviarMensagem() {

    const texto = campoMensagem.value.trim();

    if (!apiKey) {

        statusKey.textContent = "Configure sua API Key primeiro.";
        statusKey.style.color = "red";

        campoKey.focus();
        return;

    }

    if (texto === "" || botaoEnviar.disabled) {
        return;
    }

    if (!conversaAtual) {
        novaConversa();
    }

    // Guarda a conversa em que a mensagem foi enviada.
    const conversa = conversaAtual;

    // Adiciona a mensagem do usuário.
    conversa.mensagens.push({
        texto: texto,
        tipo: "usuario"
    });

    // Define o título da conversa.
    if (conversa.titulo === "Nova conversa") {

        conversa.titulo =
            texto.length > 25
                ? texto.substring(0, 25) + "..."
                : texto;

    }

    mostrarMensagens();
    atualizarListaConversas();

    campoMensagem.value = "";

    // Indicador de carregamento.
    const carregando = adicionarMensagem(
        "A IA está pensando...",
        "ia"
    );

    botaoEnviar.disabled = true;

    try {

        // Consulta a IA com tentativa de modelo alternativo.
        const respostaIA = await consultarIA(conversa, function (modelo) {

            if (conversaAtual === conversa) {

                carregando.textContent =
                    `Consultando ${modelo}...`;

            }

        });

        // Salva a resposta na conversa original.
        conversa.mensagens.push({
            texto: respostaIA,
            tipo: "ia"
        });

        // Atualiza a tela se essa conversa estiver aberta.
        if (conversaAtual === conversa) {
            mostrarMensagens();
        }

    } catch (erro) {

        console.error("Erro na API:", erro);

        // Não apaga a mensagem enviada pelo usuário.
        if (conversaAtual === conversa) {
            carregando.textContent = "Erro: " + erro.message;
        }

    } finally {

        botaoEnviar.disabled = false;
        campoMensagem.focus();

    }

}


// ==========================================
//  EVENTO DO BOTÃO ENVIAR
// ==========================================

botaoEnviar.addEventListener("click", enviarMensagem);


// ==========================================
//  ENVIAR MENSAGEM COM ENTER
// ==========================================

campoMensagem.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        enviarMensagem();
    }

});


// ==========================================
//  CRIAR NOVO CHAT
// ==========================================

botaoNovoChat.addEventListener("click", function () {
    novaConversa();
});


// ==========================================
//  INICIALIZAÇÃO
// ==========================================

novaConversa();