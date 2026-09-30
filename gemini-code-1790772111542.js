// alberto.js - Lógica do Jogo e Acessibilidade Dinâmica

// Figuras Universais (Emojis) com descrições para leitores de tela e áudio
const cardItems = [
    { icon: '🐶', name: 'Cachorro' },
    { icon: '🐱', name: 'Gato' },
    { icon: '🍎', name: 'Maçã' },
    { icon: '🚗', name: 'Carro' },
    { icon: '🌻', name: 'Flor' },
    { icon: '⭐', name: 'Estrela' }
];

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let audioEnabled = false;

const board = document.getElementById('game-board');
const anunciante = document.getElementById('status-anunciante');
const victoryMessage = document.getElementById('victory-message');

// --- SISTEMA DE ACESSIBILIDADE ---

// 1. Áudio (Sintetizador de Voz)
function speak(text) {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0; // Velocidade calma para evitar sobrecarga (Autismo)
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

document.getElementById('btn-audio').addEventListener('click', (e) => {
    audioEnabled = !audioEnabled;
    e.target.setAttribute('aria-pressed', audioEnabled);
    e.target.textContent = audioEnabled ? '🔊 Áudio/Voz Ativado' : '🔈 Ativar Áudio/Voz';
    if(audioEnabled) speak("Áudio ativado. Bem vindo ao jogo.");
});

// 2. Deficiência Visual (Baixa Visão) - Negrito e Contraste
document.getElementById('btn-vision').addEventListener('click', (e) => {
    const isHighVision = document.body.classList.toggle('high-vision');
    e.target.setAttribute('aria-pressed', isHighVision);
});

// 3. Daltonismo - Troca de Classes CSS
document.getElementById('colorblind-select').addEventListener('change', (e) => {
    document.body.classList.remove('colorblind-rg', 'colorblind-by', 'colorblind-mono');
    if (e.target.value !== 'default') {
        document.body.classList.add(`colorblind-${e.target.value}`);
    }
});

// --- LÓGICA DO JOGO ---

function createBoard() {
    board.innerHTML = '';
    matchedPairs = 0;
    flippedCards = [];
    victoryMessage.classList.add('hidden');
    
    // Duplicar e embaralhar as cartas
    cards = [...cardItems, ...cardItems]
        .sort(() => Math.random() - 0.5)
        .map((item, index) => ({ ...item, id: index }));

    cards.forEach((card, index) => {
        const btn = document.createElement('button');
        btn.classList.add('card');
        // Acessibilidade inicial da carta (não revela o ícone)
        btn.setAttribute('aria-label', `Carta ${index + 1} de ${cards.length}, virada para baixo`);
        btn.dataset.id = card.id;
        btn.dataset.index = index;
        
        const iconSpan = document.createElement('span');
        iconSpan.classList.add('icon');
        iconSpan.textContent = card.icon;
        btn.appendChild(iconSpan);

        btn.addEventListener('click', () => flipCard(btn, card));
        board.appendChild(btn);
    });
}

function flipCard(btn, card) {
    // Evita clicar na mesma carta ou se já houverem 2 viradas
    if (btn.classList.contains('flipped') || flippedCards.length === 2) return;

    btn.classList.add('flipped');
    btn.setAttribute('aria-label', `Carta revelada: ${card.name}`);
    
    // Atualiza leitor de tela e voz
    anunciante.textContent = card.name;
    speak(card.name);

    flippedCards.push({ btn, card });

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const match = card1.card.name === card2.card.name;

    if (match) {
        setTimeout(() => {
            card1.btn.classList.add('matched');
            card2.btn.classList.add('matched');
            card1.btn.setAttribute('aria-label', `${card1.card.name}, par encontrado`);
            card2.btn.setAttribute('aria-label', `${card2.card.name}, par encontrado`);
            
            anunciante.textContent = `Par de ${card1.card.name} encontrado!`;
            speak(`Par de ${card1.card.name} encontrado!`);
            
            matchedPairs++;
            if (matchedPairs === cardItems.length) {
                setTimeout(winGame, 500);
            }
        }, 500);
    } else {
        setTimeout(() => {
            card1.btn.classList.remove('flipped');
            card2.btn.classList.remove('flipped');
            card1.btn.setAttribute('aria-label', `Carta ${parseInt(card1.btn.dataset.index) + 1}, virada para baixo`);
            card2.btn.setAttribute('aria-label', `Carta ${parseInt(card2.btn.dataset.index) + 1}, virada para baixo`);
            
            anunciante.textContent = "Não formam par. As cartas foram escondidas novamente.";
            speak("Diferentes. Escondendo.");
        }, 1500); // Tempo mais lento e previsível para não estressar autistas
    }
    
    flippedCards = [];
}

function winGame() {
    victoryMessage.classList.remove('hidden');
    anunciante.textContent = "Parabéns! Você encontrou todos os pares.";
    speak("Parabéns! Você venceu o jogo.");
    document.getElementById('btn-restart').focus();
}

document.getElementById('btn-restart').addEventListener('click', () => {
    speak("Reiniciando o jogo.");
    createBoard();
});

// Inicializar o jogo ao carregar a página
window.onload = createBoard;