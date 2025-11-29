# 🌦️ Weather Project — Consulta de Clima em Tempo Real

**Aplicação em JavaScript puro utilizando a API Open-Meteo**

Este projeto permite consultar o clima atual de qualquer cidade do mundo, exibindo temperatura, descrição do clima, ícone e data/hora atual formatada.
 Além disso, o fundo da página muda dinamicamente conforme o horário de Brasília, criando uma experiência visual mais imersiva.

------

## ✨ Funcionalidades

- 🔍 **Busca por cidade** usando Geocoding API (Open-Meteo)
- 🌡️ **Clima atual em tempo real**
- 🕒 **Hora e data formatadas automaticamente**
- 🌓 **Fundo dinâmico** baseado no horário (dia/noite – Brasília)
- ⚠️ **Tratamento completo de erros** (cidade inválida, rede, APIs, etc.)
- 🧪 **Testes unitários com Jest**, incluindo mocks de API
- 📄 **Docstrings JSDoc** documentando todas as funções
- 💡 **Código modular e preparado para automação de docs**

------

## 🖼️ Prévia da Interface

> ![image-20251128234220103](/Users/cintiamdourado/Library/Application Support/typora-user-images/image-20251128234220103.png)

------

## 🛠️ Tecnologias Utilizadas

- **HTML5**
- **CSS3**
- **JavaScript ES6+**
- **Fetch API**
- **Open-Meteo API**
- **Jest (para testes)**

------

## 📁 Estrutura do Projeto

```
weather_project/
│
├── assets/
│   └── js/
│       └── script.js
│   └── css/
│       └── style.css
├── node.module
├── tests/
│   └──jest.config.js
├── .gitignore
├── index.html
├── package.lock.json
├── package.json
└── README.md
```

------

## 🚀 Como Executar o Projeto

### 🔧 1. Instale as dependências

```
npm install
```

### ▶️ 2. Execute em um servidor local (opcional)

Você pode abrir o `index.html` diretamente no navegador, ou usar uma extensão como **Live Server**.

------

## 🧪 Como rodar os testes

```
npm test
```

Os testes incluem:

- Cidade válida
- Cidade inexistente
- Entrada vazia
- Erro da API
- Erro 429
- Erro de rede
- JSON inesperado

Todos isolados com mocks — **sem tocar no DOM**.

------

## 📘 Documentação Interna (JSDoc)

O arquivo `script.js` possui **docstrings completas**, descrevendo:

- Parâmetros
- Tipos
- Valor de retorno
- Exemplos
- Erros lançados

Sua base está pronta para gerar documentação HTML com:

```
npx jsdoc -c jsdoc.json
```

------

## 🧠 Arquitetura & Lógica

1. Usuário digita a cidade
2. O formulário dispara o listener
3. `getCoordinates()` busca latitude/longitude
4. `getWeather()` usa essas coordenadas na API
5. O fundo muda pelo horário de Brasília
6. O resultado é exibido com ícones e formatação amigável
7. Em caso de erro, uma mensagem legível aparece na tela

------

## ❗ Tratamento de Erros

O projeto trata cuidadosamente:

- ❌ Falhas de rede
- ❌ Request 4xx/5xx
- ❌ Cidade não encontrada
- ❌ JSON de resposta inesperado
- ❌ Campo de cidade vazio

------

## 📚 Aprendizados do Projeto

- Manipulação de API assíncrona com Fetch
- Estruturação de funções puras para testabilidade
- Separação entre lógica e UI
- Testes unitários avançados com mocking
- Uso de **clock system** (hora de Brasília)
- Gerenciamento visual por hora do dia

------

## 💡 Próximos Passos (Etapa 5 do Projeto)

- Criar documentação JSDoc em HTML
- Melhorar layout e responsividade
- Adicionar previsão de 7 dias
- Implementar modo claro/escuro manual
- Converter para componente Web / framework futuramente

------

## 👩‍💻 Autoria

Projeto desenvolvido por **Cíntia Dourado**✨
 Auxílio técnico e documentação por **Ceci (IA) ** 