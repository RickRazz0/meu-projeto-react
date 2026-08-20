/**
 * MemoryGame.jsx
 * ---------------------------------------------------------------
 * Jogo da Memória completo em React.
 * Funcionalidades:
 *  - Níveis de Dificuldade: Fácil (6 pares), Médio (8 pares), Difícil (12 pares)
 *  - Seletor de Temas de Cores de Fundo (Galáxia, Oceano, Pôr do Sol)
 *  - Flip 3D nas cartas com animação CSS suave
 *  - Cronômetro em tempo real e contador de tentativas
 *  - Delay de 800ms para desvirar pares errados
 *  - Modal de vitória elegante com estatísticas
 *  - Embaralhamento aleatório (Fisher-Yates) a cada nova partida
 * ---------------------------------------------------------------
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MemoryGame.css';

// ── Pool de Emojis para o Jogo ──────────────────────────────────
const ALL_EMOJIS = ['🍎', '🍌', '🍕', '🍔', '🍩', '🍦', '🥑', '🍓', '🍇', '🍒', '🍉', '🍍'];

// ── Configurações de Dificuldade ───────────────────────────────
const DIFFICULTY_CONFIGS = {
  easy: {
    key: 'easy',
    name: 'Fácil',
    emojiCount: 6,      // 12 cartas (6 pares)
    gridClass: 'grid-12',
    targetPairs: 6,
  },
  medium: {
    key: 'medium',
    name: 'Médio',
    emojiCount: 8,      // 16 cartas (8 pares)
    gridClass: 'grid-16',
    targetPairs: 8,
  },
  hard: {
    key: 'hard',
    name: 'Difícil',
    emojiCount: 12,     // 24 cartas (12 pares)
    gridClass: 'grid-24',
    targetPairs: 12,
  },
};

// Cria e embaralha o baralho com base na dificuldade
function createShuffledDeck(difficultyKey = 'medium') {
  const count = DIFFICULTY_CONFIGS[difficultyKey].emojiCount;
  const selectedEmojis = ALL_EMOJIS.slice(0, count);

  const deck = [...selectedEmojis, ...selectedEmojis].map((emoji, index) => ({
    id: index,         // ID único da carta
    emoji,             // Conteúdo visível
    isFlipped: false,  // Virada para cima?
    isMatched: false,  // Par encontrado?
  }));

  // Algoritmo Fisher-Yates para embaralhar de forma justa
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Formata segundos como mm:ss
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Partículas decorativas de fundo ────────────────────────────
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 20 + Math.random() * 60,
  left: Math.random() * 100,
  delay: Math.random() * 8,
  duration: 8 + Math.random() * 12,
  color: ['#a855f7', '#ec4899', '#22d3ee', '#4ade80', '#fb7185'][i % 5],
}));

// ── Componente de Carta Individual ─────────────────────────────
const Card = React.memo(function Card({ card, onClick, isLocked }) {
  const isActive = card.isFlipped || card.isMatched;
  const isClickable = !isActive && !isLocked;

  return (
    <div
      className={`mg-card-container ${isActive ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''} ${!isClickable ? 'locked' : ''}`}
      onClick={() => isClickable && onClick(card.id)}
      role="button"
      aria-label={isActive ? `Carta: ${card.emoji}` : 'Carta virada para baixo'}
      aria-pressed={isActive}
    >
      <div className="mg-card-scene">
        {/* Verso da carta */}
        <div className="mg-card-face mg-card-back" />

        {/* Frente da carta */}
        <div className="mg-card-face mg-card-front">
          {card.emoji}
        </div>
      </div>
    </div>
  );
});

// ── Componente Modal de Vitória ─────────────────────────────────
function WinModal({ time, moves, targetPairs, difficultyName, onRestart }) {
  // Avaliação baseada no número de tentativas em relação aos pares
  const isLowMoves = moves <= targetPairs + 4;
  const rating = isLowMoves ? '🏆 Perfeito!' : moves <= targetPairs + 10 ? '⭐ Excelente!' : '👍 Muito Bem!';

  return (
    <div className="mg-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="mg-modal">
        <span className="mg-modal-emoji">🎉</span>

        <h2 className="mg-modal-title" id="modal-title">Você Venceu!</h2>
        <p className="mg-modal-subtitle">{rating} Modo {difficultyName} concluído!</p>

        {/* Chips de resultado */}
        <div className="mg-modal-results">
          <div className="mg-result-chip">
            <span className="chip-label">Tempo</span>
            <span className="chip-value cyan">{formatTime(time)}</span>
          </div>
          <div className="mg-result-chip">
            <span className="chip-label">Tentativas</span>
            <span className="chip-value purple">{moves}</span>
          </div>
          <div className="mg-result-chip">
            <span className="chip-label">Pares</span>
            <span className="chip-value green">{targetPairs}/{targetPairs}</span>
          </div>
        </div>

        <button className="mg-btn" onClick={onRestart} autoFocus>
          🔄 Jogar Novamente
        </button>
      </div>
    </div>
  );
}

// ── Componente Principal: MemoryGame ───────────────────────────
function MemoryGame() {
  // Tema de cor de fundo ('purple' | 'ocean' | 'sunset')
  const [theme, setTheme] = useState('purple');

  // Nível de Dificuldade ('easy' | 'medium' | 'hard')
  const [difficulty, setDifficulty] = useState('medium');

  // Configuração atual de dificuldade
  const currentConfig = DIFFICULTY_CONFIGS[difficulty];

  // Estado das cartas
  const [cards, setCards] = useState(() => createShuffledDeck('medium'));

  // IDs das cartas viradas na jogada atual (máx. 2)
  const [selected, setSelected] = useState([]);

  // Número de tentativas (pares de cartas virados)
  const [moves, setMoves] = useState(0);

  // Cronômetro em segundos
  const [time, setTime] = useState(0);

  // Jogo em andamento (cronômetro ativo)?
  const [isRunning, setIsRunning] = useState(false);

  // Jogo concluído?
  const [isWon, setIsWon] = useState(false);

  // Bloqueio de cliques durante o delay de verificação
  const [isLocked, setIsLocked] = useState(false);

  // Ref para o timeout de desvirar cartas
  const flipTimeoutRef = useRef(null);

  // ── Cronômetro ───────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // ── Verificação de Pares ─────────────────────────────────────
  useEffect(() => {
    if (selected.length !== 2) return;

    setIsLocked(true);
    setMoves(prev => prev + 1);

    const [firstId, secondId] = selected;
    const firstCard  = cards.find(c => c.id === firstId);
    const secondCard = cards.find(c => c.id === secondId);

    if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
      // ✅ Par encontrado!
      setCards(prev =>
        prev.map(card =>
          card.id === firstId || card.id === secondId
            ? { ...card, isMatched: true }
            : card
        )
      );
      setSelected([]);
      setIsLocked(false);
    } else {
      // ❌ Par errado — aguarda 800ms e desvira
      flipTimeoutRef.current = setTimeout(() => {
        setCards(prev =>
          prev.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isFlipped: false }
              : card
          )
        );
        setSelected([]);
        setIsLocked(false);
      }, 800);
    }
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Detecção de Vitória ──────────────────────────────────────
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched) && moves > 0) {
      setIsRunning(false);
      setIsWon(true);
    }
  }, [cards, moves]);

  // ── Handler de Clique em Carta ───────────────────────────────
  const handleCardClick = useCallback((id) => {
    if (!isRunning) setIsRunning(true);

    setCards(prev =>
      prev.map(card =>
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );

    setSelected(prev => [...prev, id]);
  }, [isRunning]);

  // ── Reiniciar Jogo ───────────────────────────────────────────
  const handleRestart = useCallback(() => {
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);

    setCards(createShuffledDeck(difficulty));
    setSelected([]);
    setMoves(0);
    setTime(0);
    setIsRunning(false);
    setIsWon(false);
    setIsLocked(false);
  }, [difficulty]);

  // ── Trocar Dificuldade ───────────────────────────────────────
  const handleDifficultyChange = useCallback((newDiffKey) => {
    if (newDiffKey === difficulty) return;
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);

    setDifficulty(newDiffKey);
    setCards(createShuffledDeck(newDiffKey));
    setSelected([]);
    setMoves(0);
    setTime(0);
    setIsRunning(false);
    setIsWon(false);
    setIsLocked(false);
  }, [difficulty]);

  // ── Pares encontrados ────────────────────────────────────────
  const matchedCount = cards.filter(c => c.isMatched).length / 2;

  // ── Renderização ─────────────────────────────────────────────
  return (
    <>
      {/* Partículas de fundo decorativas */}
      <div className="mg-particles" aria-hidden="true">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="mg-particle"
            style={{
              width:           `${p.size}px`,
              height:          `${p.size}px`,
              left:            `${p.left}%`,
              bottom:          '-10%',
              background:      p.color,
              animationDuration:  `${p.duration}s`,
              animationDelay:     `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Container principal */}
      <main className={`mg-wrapper theme-${theme}`}>

        {/* Cabeçalho */}
        <header className="mg-header">
          <h1 className="mg-title">🃏 Jogo da Memória</h1>
          <p className="mg-subtitle">Encontre todos os pares de emojis!</p>
        </header>

        {/* Controles: Seletor de Tema e Dificuldade */}
        <div className="mg-controls-bar">

          {/* Tema */}
          <div className="mg-control-group" aria-label="Escolher cor de fundo">
            <span className="mg-control-label">🎨 Tema:</span>
            <div className="mg-control-options">
              <button
                className={`mg-control-btn ${theme === 'purple' ? 'active' : ''}`}
                onClick={() => setTheme('purple')}
                title="Roxo Galáxia"
              >
                <span className="theme-dot purple"></span>
                Galáxia
              </button>
              <button
                className={`mg-control-btn ${theme === 'ocean' ? 'active' : ''}`}
                onClick={() => setTheme('ocean')}
                title="Oceano Profundo"
              >
                <span className="theme-dot ocean"></span>
                Oceano
              </button>
              <button
                className={`mg-control-btn ${theme === 'sunset' ? 'active' : ''}`}
                onClick={() => setTheme('sunset')}
                title="Pôr do Sol Neon"
              >
                <span className="theme-dot sunset"></span>
                Pôr do Sol
              </button>
            </div>
          </div>

          {/* Dificuldade */}
          <div className="mg-control-group" aria-label="Escolher nível de dificuldade">
            <span className="mg-control-label">⚡ Dificuldade:</span>
            <div className="mg-control-options">
              <button
                className={`mg-control-btn ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('easy')}
                title="Fácil (6 Pares / 12 Cartas)"
              >
                🟢 Fácil
              </button>
              <button
                className={`mg-control-btn ${difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('medium')}
                title="Médio (8 Pares / 16 Cartas)"
              >
                🟡 Médio
              </button>
              <button
                className={`mg-control-btn ${difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('hard')}
                title="Difícil (12 Pares / 24 Cartas)"
              >
                🔴 Difícil
              </button>
            </div>
          </div>

        </div>

        {/* Painel de estatísticas */}
        <div className="mg-stats" role="status" aria-live="polite">
          <div className="mg-stat-card">
            <span className="mg-stat-label">⏱ Tempo</span>
            <span className="mg-stat-value time">{formatTime(time)}</span>
          </div>
          <div className="mg-stat-card">
            <span className="mg-stat-label">🔄 Tentativas</span>
            <span className="mg-stat-value moves">{moves}</span>
          </div>
          <div className="mg-stat-card">
            <span className="mg-stat-label">✅ Pares</span>
            <span className="mg-stat-value pairs">{matchedCount}/{currentConfig.targetPairs}</span>
          </div>
        </div>

        {/* Grade de cartas */}
        <section
          className={`mg-board ${currentConfig.gridClass}`}
          aria-label={`Tabuleiro no modo ${currentConfig.name}`}
        >
          {cards.map(card => (
            <Card
              key={card.id}
              card={card}
              onClick={handleCardClick}
              isLocked={isLocked}
            />
          ))}
        </section>

        {/* Botão de reiniciar */}
        <button className="mg-btn" onClick={handleRestart}>
          🔀 Novo Jogo
        </button>
      </main>

      {/* Modal de vitória */}
      {isWon && (
        <WinModal
          time={time}
          moves={moves}
          targetPairs={currentConfig.targetPairs}
          difficultyName={currentConfig.name}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}

export default MemoryGame;
