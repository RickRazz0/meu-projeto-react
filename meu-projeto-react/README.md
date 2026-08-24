# 🃏 Jogo da Memória em React — Projeto Acadêmico Front-End

Este projeto é uma aplicação web interativa de um **Jogo da Memória Casual**, desenvolvida como atividade prática para a disciplina de **Desenvolvimento Front-End** do **Professor Davidson** no **SENAI**.

O objetivo principal da atividade é aplicar a metodologia de **Desenvolvimento Construtivo e Incremental**, utilizando controle de versão semântico através de commits progressivos (`v0.0.1`, `v0.0.2`, `v0.0.3`, ...).

---

## 🎮 Funcionalidades Principais

* **⚡ 3 Níveis de Dificuldade Selecionáveis**:
  * 🟢 **Fácil**: 12 Cartas / 6 Pares (Grade 4x3)
  * 🟡 **Médio**: 16 Cartas / 8 Pares (Grade 4x4 - Padrão)
  * 🔴 **Difícil**: 24 Cartas / 12 Pares (Grade 6x4)
* **🎨 3 Temas de Cores de Fundo**:
  * 🌌 **Roxo Galáxia**: Dark mode roxo com neon roxo/ciano.
  * 🌊 **Oceano Profundo**: Tons de azul marinho com neon ciano.
  * 🌅 **Pôr do Sol Neon**: Gradiente em tom de carmim e magenta.
* **💥 Efeito Visual de Acerto (Match FX)**: Emojis temporários flutuantes e brilhantes que surgem na tela a cada par acertado!
* **✨ Design & Animações 3D**:
  * Giro 3D nas cartas (*Flip 3D*) usando CSS `perspective` e `rotateY`.
  * Interface em *Glassmorphism* (efeito de vidro jateado).
  * Partículas decorativas flutuantes no fundo da página.
* **📊 Painel de Estatísticas**:
  * Cronômetro automático em tempo real.
  * Contador de tentativas/jogadas.
  * Contador dinâmico de pares em relação ao total da dificuldade escolhida.
* **🏆 Modal de Vitória**: Tela festiva com resumo do tempo, tentativas e avaliação do desempenho.

---

## 📈 Histórico Evolutivo de Commits (`v0.0.1` → `v0.0.6`)

A construção da aplicação seguiu uma progressão de entregas construtivas:

### 📌 `v0.0.1` — First Commit

* Criação inicial do projeto.
* Configuração da estrutura base da aplicação.

### 📌 `v0.0.2` — Jogo da Memória

* Implementação do jogo da memória.
* Criação do tabuleiro e das cartas.
* Implementação da lógica básica de interação e combinação das cartas.

### 📌 `v0.0.3` — Background Mutável

* Implementação de fundos de tela personalizáveis.
* Adição da possibilidade de alterar o background da aplicação.
* Ajustes visuais para adaptar a interface aos diferentes fundos.

### 📌 `v0.0.4` — Níveis de Dificuldade

* Implementação de diferentes níveis de dificuldade.
* Adição da opção de selecionar a dificuldade antes de iniciar a partida.
* Ajuste da quantidade de cartas de acordo com o nível escolhido.
* Adaptação do tabuleiro para comportar diferentes quantidades de cartas.

### 📌 `v0.0.5` — Efeitos Visuais e README

* Adição de efeitos visuais e animações para melhorar a experiência durante a partida.
* Implementação de animações nas cartas e elementos da interface.
* Ajustes de estilização e transições para deixar a aplicação mais dinâmica.
* Criação do arquivo `README.md` com informações sobre o projeto, suas funcionalidades e histórico de versões.
---

## 🛠️ Tecnologias Utilizadas

* **React 19**: Biblioteca para construção de interfaces orientadas a componentes.
* **JavaScript (ES6+)**: Manipulação de estado com Hooks (`useState`, `useEffect`, `useCallback`, `useRef`, `React.memo`).
* **CSS3**: Flexbox, CSS Grid, 3D Transforms, Transições, Animações `@keyframes`, Variáveis CSS e Glassmorphism.
* **HTML5 Semântico**: Estrutura acessível com tags semânticas e atributos ARIA.

---

## 📁 Estrutura de Arquivos do Projeto

```text
meu-projeto-react/
├── public/
│   └── index.html
├── src/
│   ├── App.js           # Renderizador do componente MemoryGame
│   ├── index.css        # Reset global de estilos
│   ├── index.js         # Ponto de entrada do React DOM
│   ├── MemoryGame.jsx   # Lógica completa e estrutura do jogo
│   └── MemoryGame.css   # Estilos CSS com temas, glassmorphism e animações Match FX
├── package.json
└── README.md            # Documentação do projeto
```

---

## 💻 Como Executar o Projeto Localmente

1. **Navegue até a pasta do projeto**:
   ```bash
   cd meu-projeto-react
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm start
   ```

4. **Acesse no seu navegador**:
   Abra [http://localhost:3000](http://localhost:3000)

---

## 👨‍🏫 Créditos

* **Disciplina**: Desenvolvimento Front-End
* **Professor**: Davidson
* **Instituição**: SENAI
