/**
 * MemoryGame.jsx
 * ---------------------------------------------------------------
 * Jogo da Memória completo em React.
 * Funcionalidades:
 *  - Tabuleiro 4x4 (8 pares de emojis)
 *  - Flip 3D nas cartas
 *  - Cronômetro em tempo real
 *  - Contador de tentativas
 *  - Delay de 800ms para desvirar pares errados
 *  - Modal de vitória com resultado final
 *  - Embaralhamento aleatório a cada partida
 * ---------------------------------------------------------------
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MemoryGame.css';

// ── Constantes ──────────────────────────────────────────────────
const EMOJIS = ['🍎', '🍌', '🍕', '🍔', '🍩', '🍦', '🥑', '🍓'];

// Cria e embaralha o baralho: cada emoji aparece 2 vezes
function createShuffledDeck() {
  const deck = [...EMOJIS, ...EMOJIS].map((emoji, index) => ({
    id: index,         // ID único da carta
    emoji,             // Conteúdo visível
    isFlipped: false,  // Virada para cima?
    isMatched: false,  // Par encontrado?
  }));

  // Algoritmo Fisher-Yates para embaralhar
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
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  size: 20 + Math.random() * 60,
  left: Math.random() * 100,
  delay: Math.random() * 8,
  duration: 8 + Math.random() * 12,
  color: ['#a855f7', '#ec4899', '#22d3ee', '#4ade80'][i % 4],
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
function WinModal({ time, moves, onRestart }) {
  // Avaliação simples baseada em tentativas
  const rating = moves <= 12 ? '🏆 Perfeito!' : moves <= 18 ? '⭐ Excelente!' : '👍 Completou!';

  return (
    <div className="mg-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="mg-modal">
        <span className="mg-modal-emoji">🎉</span>

        <h2 className="mg-modal-title" id="modal-title">Você Venceu!</h2>
        <p className="mg-modal-subtitle">{rating} Todos os pares foram encontrados.</p>

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
            <span className="chip-value green">8/8</span>
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

  // Estado das cartas
  const [cards, setCards] = useState(createShuffledDeck);

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

  // Ref para o timeout de desvirar cartas (limpar ao reiniciar)
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
    // Só verifica quando 2 cartas foram selecionadas
    if (selected.length !== 2) return;

    setIsLocked(true); // Bloqueia novos cliques
    setMoves(prev => prev + 1); // Incrementa tentativas

    const [firstId, secondId] = selected;
    const firstCard  = cards.find(c => c.id === firstId);
    const secondCard = cards.find(c => c.id === secondId);

    if (firstCard.emoji === secondCard.emoji) {
      // ✅ Par encontrado! Marca como matched
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
    const allMatched = cards.every(card => card.isMatched);
    if (allMatched && moves > 0) {
      setIsRunning(false);
      setIsWon(true);
    }
  }, [cards, moves]);

  // ── Handler de Clique em Carta ───────────────────────────────
  const handleCardClick = useCallback((id) => {
    // Inicia o cronômetro na primeira carta
    if (!isRunning) setIsRunning(true);

    // Vira a carta clicada
    setCards(prev =>
      prev.map(card =>
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );

    // Adiciona ao par selecionado
    setSelected(prev => [...prev, id]);
  }, [isRunning]);

  // ── Reiniciar Jogo ───────────────────────────────────────────
  const handleRestart = useCallback(() => {
    // Cancela timeout pendente
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);

    setCards(createShuffledDeck());
    setSelected([]);
    setMoves(0);
    setTime(0);
    setIsRunning(false);
    setIsWon(false);
    setIsLocked(false);
  }, []);

  // ── Pares encontrados (para o painel) ───────────────────────
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

        {/* Seletor de Tema / Cor de Fundo */}
        <div className="mg-theme-selector" aria-label="Escolher cor de fundo">
          <span className="mg-theme-label">🎨 Tema:</span>
          <div className="mg-theme-options">
            <button
              className={`mg-theme-btn ${theme === 'purple' ? 'active' : ''}`}
              onClick={() => setTheme('purple')}
              title="Roxo Galáxia"
            >
              <span className="theme-dot purple"></span>
              Galáxia
            </button>
            <button
              className={`mg-theme-btn ${theme === 'ocean' ? 'active' : ''}`}
              onClick={() => setTheme('ocean')}
              title="Oceano Profundo"
            >
              <span className="theme-dot ocean"></span>
              Oceano
            </button>
            <button
              className={`mg-theme-btn ${theme === 'sunset' ? 'active' : ''}`}
              onClick={() => setTheme('sunset')}
              title="Pôr do Sol Neon"
            >
              <span className="theme-dot sunset"></span>
              Pôr do Sol
            </button>
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
            <span className="mg-stat-value pairs">{matchedCount}/8</span>
          </div>
        </div>

        {/* Grade de cartas */}
        <section
          className="mg-board"
          aria-label="Tabuleiro do Jogo da Memória"
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
          onRestart={handleRestart}
        />
      )}
    </>
  );
}

export default MemoryGame;
