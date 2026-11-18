# Meu Chat com Inteligência Artificial (LLM)

## 1. Sobre o projeto

Aplicação web de chat integrada a um modelo de linguagem (LLM), desenvolvida como atividade prática utilizando HTML5, CSS3 e JavaScript. O usuário pode enviar mensagens à inteligência artificial e continuar uma conversa mantendo o contexto por meio do histórico enviado à API.

## 2. Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Fetch API
- API Gemini, do Google
- Modelos: `gemini-3.8-flash`
           `gemini-3.7-flash`
           `gemini-3.6-flash`
           `gemini-3.5-flash`


## 3. Funcionalidades

- Interface visual semelhante a uma plataforma de chat.
- Campo para digitar e enviar mensagens.
- Mensagens do usuário e da IA exibidas em balões distintos.
- Histórico das mensagens durante a conversa.
- Envio das mensagens anteriores à API para manter o contexto.
- Indicador de carregamento enquanto aguarda a resposta.
- Tratamento de erros de comunicação com a API.
- Opção para iniciar uma nova conversa.

## 4. Arquivos do projeto

```text
DesafioPratico/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 5. Como obter a chave da API

1. Acesse https://aistudio.google.com/app/apikey.
2. Entre com uma conta Google.
3. Crie uma chave de API.
4. Copie a chave gerada.

## 6. Como executar

1. Deixe os quatro arquivos na mesma pasta.
2. Abra `index.html` em um navegador atualizado.
3. Cole sua chave no campo **Key**.
4. Clique em **Confirmar**.
5. Digite uma mensagem e clique no botão de envio ou pressione Enter.
6. Para começar outra conversa, clique em **+ Novo Chat**.

É necessário ter conexão com a internet para acessar a API Gemini.

## 7. Funcionamento da integração

Ao enviar uma mensagem, o JavaScript adiciona o texto ao array de mensagens da conversa atual. Em seguida, converte o histórico para o formato aceito pela API Gemini e realiza uma requisição HTTP `POST` usando `fetch()` e `async/await`.

A aplicação envia as mensagens anteriores junto com a nova mensagem. Assim, o modelo recebe o contexto da conversa e pode considerar o que foi dito anteriormente. A resposta recebida é exibida na tela e adicionada ao histórico.

O histórico é mantido em memória enquanto a página estiver aberta. Ao atualizar ou fechar a página, as conversas são apagadas. O projeto não utiliza `localStorage`, banco de dados ou backend, pois esses recursos não são necessários para os requisitos descritos no desafio.

## 8. Tratamento de erros

Se a API retornar uma resposta de erro, a aplicação apresenta a mensagem recebida do serviço. Também verifica se a resposta contém texto antes de exibi-la.

## 9. Segurança

A chave da API é digitada pelo usuário e mantida em memória durante a utilização da página. Como a integração é feita diretamente no navegador, a chave pode ser visualizada por alguém que inspecione a aplicação ou as requisições. Utilize uma chave de teste e não publique uma chave real em repositórios públicos.

## 10. Integrantes

- Integrante : **Carlos Henrique Lima**

## 11. Referência

GOOGLE. **Gemini API documentation**. Disponível em: https://ai.google.dev/gemini-api/docs. Acesso em: [dia mês ano].
