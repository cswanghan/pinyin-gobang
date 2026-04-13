const presets = {
    initials: {
        title: "声母基础",
        description: "适合入门识读和辨音练习。",
        items: ["b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "zh", "ch", "sh", "r", "z", "c", "s", "y", "w"]
    },
    finals: {
        title: "韵母基础",
        description: "覆盖单韵母、复韵母和鼻韵母。",
        items: ["a", "o", "e", "i", "u", "u:", "ai", "ei", "ui", "ao", "ou", "iu", "ie", "ue", "er", "an", "en", "in", "un", "ang", "eng", "ing", "ong"]
    },
    overall: {
        title: "整体认读音节",
        description: "适合整体认读专项复习。",
        items: ["zhi", "chi", "shi", "ri", "zi", "ci", "si", "yi", "wu", "yu", "ye", "yue", "yuan", "yin", "yun", "ying"]
    },
    g1_unit1: {
        title: "一年级上册 · 第一单元",
        description: "拼音入门与常见动物、身体词汇。",
        items: [
            { pinyin: "ma3", hanzi: "马" },
            { pinyin: "ba4", hanzi: "爸" },
            { pinyin: "miao1", hanzi: "喵" },
            { pinyin: "niu2", hanzi: "牛" },
            { pinyin: "yu2", hanzi: "鱼" },
            { pinyin: "yang2", hanzi: "羊" },
            { pinyin: "shou3", hanzi: "手" },
            { pinyin: "zu2", hanzi: "足" },
            { pinyin: "mu4", hanzi: "木" },
            { pinyin: "huo3", hanzi: "火" },
            { pinyin: "kou3", hanzi: "口" },
            { pinyin: "er3", hanzi: "耳" },
            { pinyin: "ri4", hanzi: "日" },
            { pinyin: "yue4", hanzi: "月" }
        ]
    },
    animals: {
        title: "动物主题词语",
        description: "适合词语识读和口语表达活动。",
        items: [
            { pinyin: "xiong2 mao1", hanzi: "熊猫" },
            { pinyin: "chang2 jing3 lu4", hanzi: "长颈鹿" },
            { pinyin: "xiao3 gou3", hanzi: "小狗" },
            { pinyin: "xiao3 mao1", hanzi: "小猫" },
            { pinyin: "hai3 tun2", hanzi: "海豚" },
            { pinyin: "jing1 yu2", hanzi: "鲸鱼" },
            { pinyin: "song1 shu3", hanzi: "松鼠" },
            { pinyin: "xiao3 niao3", hanzi: "小鸟" }
        ]
    }
};

const players = {
    blue: { name: "玩家一 · 蓝方", stoneClass: "stone-blue" },
    orange: { name: "玩家二 · 橙方", stoneClass: "stone-orange" }
};

const form = document.querySelector("#generator-form");
const boardTitle = document.querySelector("#boardTitle");
const boardMeta = document.querySelector("#boardMeta");
const dataSummaryText = document.querySelector("#dataSummaryText");
const boardSvgWrapper = document.querySelector("#boardSvgWrapper");
const randomSeedButton = document.querySelector("#randomSeedButton");
const customInput = document.querySelector("#customInput");
const turnLabel = document.querySelector("#turnLabel");
const statusLabel = document.querySelector("#statusLabel");
const lastMoveLabel = document.querySelector("#lastMoveLabel");
const undoMoveButton = document.querySelector("#undoMoveButton");
const resetGameButton = document.querySelector("#resetGameButton");
const studentModeButton = document.querySelector("#studentModeButton");
const teacherModeButton = document.querySelector("#teacherModeButton");
const printBoardButton = document.querySelector("#printBoardButton");
const teacherAnswerText = document.querySelector("#teacherAnswerText");
const paperSizeSelect = document.querySelector("#paperSizeSelect");
const printLayerSelect = document.querySelector("#printLayerSelect");
const printTitleInput = document.querySelector("#printTitleInput");
const printSubtitleInput = document.querySelector("#printSubtitleInput");
const printFooterInput = document.querySelector("#printFooterInput");
const printTitleText = document.querySelector("#printTitleText");
const printSubtitleText = document.querySelector("#printSubtitleText");
const printFooterText = document.querySelector("#printFooterText");

const appState = {
    form: null,
    boardCells: [],
    game: createGameState(11),
    printMode: "student",
    paperSize: "a4",
    printLayer: "clean"
};

function createGameState(size) {
    return {
        size,
        currentPlayer: "blue",
        moves: [],
        occupied: new Map(),
        winner: null,
        winningCells: []
    };
}

function mulberry32(seed) {
    let t = seed >>> 0;
    return function next() {
        t += 0x6d2b79f5;
        let value = Math.imul(t ^ (t >>> 15), t | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffle(list, random) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function parseCustomItems(text) {
    return text
        .split(/[\n,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => ({ pinyin: item }));
}

function normalizeItem(item) {
    if (typeof item === "string") {
        return { pinyin: item };
    }
    return item;
}

const toneMap = {
    a: ["a", "ā", "á", "ǎ", "à"],
    e: ["e", "ē", "é", "ě", "è"],
    i: ["i", "ī", "í", "ǐ", "ì"],
    o: ["o", "ō", "ó", "ǒ", "ò"],
    u: ["u", "ū", "ú", "ǔ", "ù"],
    ü: ["ü", "ǖ", "ǘ", "ǚ", "ǜ"]
};

function normalizeUmlaut(text) {
    return text
        .replaceAll("u:", "ü")
        .replaceAll("v", "ü");
}

function tonePosition(syllable) {
    if (syllable.includes("a")) {
        return syllable.indexOf("a");
    }
    if (syllable.includes("o")) {
        return syllable.indexOf("o");
    }
    if (syllable.includes("e")) {
        return syllable.indexOf("e");
    }
    if (syllable.includes("iu")) {
        return syllable.indexOf("u");
    }
    if (syllable.includes("ui")) {
        return syllable.indexOf("i");
    }

    const vowels = ["i", "u", "ü"];
    for (let index = syllable.length - 1; index >= 0; index -= 1) {
        if (vowels.includes(syllable[index])) {
            return index;
        }
    }
    return -1;
}

function convertNumberedSyllable(syllable) {
    const normalized = normalizeUmlaut(syllable.trim().toLowerCase());
    const match = normalized.match(/^([a-zü]+)([0-5])$/i);
    if (!match) {
        return normalized;
    }

    const [, base, toneNumberText] = match;
    const toneNumber = Number(toneNumberText);
    if (toneNumber === 0 || toneNumber === 5) {
        return base;
    }

    const markIndex = tonePosition(base);
    if (markIndex < 0) {
        return base;
    }

    const target = base[markIndex];
    const marked = toneMap[target]?.[toneNumber];
    if (!marked) {
        return base;
    }

    return `${base.slice(0, markIndex)}${marked}${base.slice(markIndex + 1)}`;
}

function toneLabel(text) {
    return text
        .split(/\s+/)
        .map((syllable) => convertNumberedSyllable(syllable))
        .join(" ");
}

function displayPinyin(text, showTone = true) {
    const normalized = normalizeUmlaut(text);
    if (!showTone) {
        return normalized.replace(/[0-5]/g, "");
    }
    return toneLabel(normalized);
}

function getItems(state) {
    if (state.contentMode === "custom") {
        const parsed = parseCustomItems(state.customInput);
        return parsed.length > 0 ? parsed : presets.g1_unit1.items.map(normalizeItem);
    }
    const preset = presets[state.preset] || presets.g1_unit1;
    return preset.items.map(normalizeItem);
}

function buildBoardCells(state) {
    const items = getItems(state);
    const random = mulberry32(Number(state.seed) || 1);
    const total = state.boardSize * state.boardSize;

    let source = shuffle(items, random);
    if (state.allowRepeat) {
        while (source.length < total) {
            source = source.concat(shuffle(items, random));
        }
    } else if (source.length < total) {
        source = source.concat(Array.from({ length: total - source.length }, () => ({ pinyin: " " })));
    }

    return source.slice(0, total).map((item, index) => {
        const normalized = normalizeItem(item);
        const displayPrimary = state.showHanzi && normalized.hanzi ? normalized.hanzi : normalized.pinyin;
        const displaySecondary = state.showHanzi || !normalized.hanzi ? "" : normalized.hanzi;
        const withTone = state.showTone ? toneLabel(displayPrimary) : displayPrimary;
        const row = Math.floor(index / state.boardSize);
        const col = index % state.boardSize;

        return {
            ...normalized,
            id: `${row}-${col}-${normalized.pinyin}`,
            row,
            col,
            primary: withTone,
            secondary: displaySecondary
        };
    });
}

function fontSizeFor(text) {
    if (text.length >= 12) {
        return 10;
    }
    if (text.length >= 8) {
        return 12;
    }
    if (text.length >= 5) {
        return 14;
    }
    return 16;
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function modeLabel(mode) {
    if (mode === "syllable_hanzi") {
        return "拼音 + 汉字提示";
    }
    if (mode === "word") {
        return "词语练习";
    }
    if (mode === "custom") {
        return "自定义词库";
    }
    return "拼音音节";
}

function readFormState() {
    const data = new FormData(form);
    return {
        contentMode: String(data.get("contentMode") || "syllable"),
        boardSize: Number(data.get("boardSize") || 11),
        seed: Number(data.get("seed") || 1),
        preset: String(data.get("preset") || "g1_unit1"),
        customInput: String(data.get("customInput") || ""),
        showTone: data.get("showTone") === "on",
        showHelper: data.get("showHelper") === "on",
        allowRepeat: data.get("allowRepeat") === "on",
        showHanzi: data.get("showHanzi") === "on"
    };
}

function updateHelperCards(state) {
    const left = document.querySelector("#leftRuleCard");
    const right = document.querySelector("#rightRuleCard");
    if (!state.showHelper) {
        left.style.visibility = "hidden";
        right.style.visibility = "hidden";
        return;
    }

    left.style.visibility = "visible";
    right.style.visibility = "visible";

    if (state.contentMode === "word") {
        left.querySelector("h4").textContent = "读词语再落子";
        left.querySelector("p:last-child").textContent = "每次选中一个格子，先完整读出词语，再落子连线。";
        right.querySelector("h4").textContent = "扩展口语表达";
        right.querySelector("p:last-child").textContent = "用词语说一句完整的话，再继续下棋，适合课堂展示。";
        return;
    }

    if (state.contentMode === "custom") {
        left.querySelector("h4").textContent = "按自定义规则练";
        left.querySelector("p:last-child").textContent = "这块区域会根据老师选择的词库，承载课堂自定义玩法说明。";
        right.querySelector("h4").textContent = "打印时同步保留";
        right.querySelector("p:last-child").textContent = "同一套布局后续可直接进入打印页，不需要重新排版。";
        return;
    }

    left.querySelector("h4").textContent = "读对才能落子";
    left.querySelector("p:last-child").textContent = "读对一个格子，才能在这个位置落下一枚棋子。先连成 5 个即可获胜。";
    right.querySelector("h4").textContent = "组词或造句";
    right.querySelector("p:last-child").textContent = "读对以后，用这个拼音说一个词语或一句话，再继续下棋，课堂互动更完整。";
}

function renderMeta(state) {
    const preset = presets[state.preset] || presets.g1_unit1;
    boardTitle.textContent = state.contentMode === "custom" ? "自定义词库棋盘" : preset.title;
    boardMeta.textContent = `${state.boardSize} x ${state.boardSize} 棋盘 · ${modeLabel(state.contentMode)} · 种子 ${state.seed}`;

    const items = getItems(state);
    const summaryItems = items
        .slice(0, 12)
        .map((item) => displayPinyin(normalizeItem(item).pinyin, state.showTone))
        .join("、");

    dataSummaryText.textContent = `${preset.description} 当前词库共 ${items.length} 项，预览示例：${summaryItems}${items.length > 12 ? "…" : ""}`;
    teacherAnswerText.textContent = buildTeacherHint(items, state);
}

function buildTeacherHint(items, state) {
    const examples = items
        .slice(0, 6)
        .map((item) => displayPinyin(normalizeItem(item).pinyin, state.showTone))
        .join("、");
    if (state.contentMode === "word") {
        return `建议先挑 3 到 5 个词语做示范朗读，再要求学生用其中两个词语连成一句话。当前示例：${examples}`;
    }
    if (state.contentMode === "custom") {
        return `当前为自定义词库，打印前建议检查是否覆盖目标音节、易混项和课堂口头表达任务。示例：${examples}`;
    }
    return `可先圈出高频音节或易混拼音，再让学生边读边落子。当前示例：${examples}`;
}

function syncModeSpecificControls(mode) {
    if (mode === "word") {
        form.preset.value = "animals";
        form.showHanzi.checked = false;
        return;
    }
    if (mode === "syllable_hanzi") {
        form.showHanzi.checked = false;
    }
}

function keyForPosition(row, col) {
    return `${row}:${col}`;
}

function renderStones(cells, cellSize, boardPadding) {
    const winningKeys = new Set(appState.game.winningCells.map(({ row, col }) => keyForPosition(row, col)));
    const content = cells.map((cell) => {
        const stone = appState.game.occupied.get(keyForPosition(cell.row, cell.col));
        if (!stone) {
            return "";
        }

        const cx = boardPadding + cell.col * cellSize + cellSize / 2;
        const cy = boardPadding + cell.row * cellSize + cellSize / 2;
        const isWinning = winningKeys.has(keyForPosition(cell.row, cell.col));
        return `
            <g class="${isWinning ? "win-cell" : ""}">
                <circle class="stone-shadow" cx="${cx + 2}" cy="${cy + 3}" r="18"></circle>
                <circle class="${players[stone.player].stoneClass}" cx="${cx}" cy="${cy}" r="18"></circle>
                <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#ffffff">${stone.player === "blue" ? "1" : "2"}</text>
            </g>
        `;
    }).join("");

    return `<g class="stone-layer">${content}</g>`;
}

function renderBoard() {
    const cells = appState.boardCells;
    const size = appState.form.boardSize;
    const cellSize = 74;
    const boardPadding = 22;
    const width = boardPadding * 2 + cellSize * size;
    const height = width;

    const gridRects = cells.map((cell) => {
        const x = boardPadding + cell.col * cellSize;
        const y = boardPadding + cell.row * cellSize;
        const centerY = y + cellSize / 2;
        const secondary = cell.secondary
            ? `<text x="${x + cellSize / 2}" y="${centerY + 17}" text-anchor="middle" font-size="12" fill="#6680b4">${escapeHtml(cell.secondary)}</text>`
            : "";
        const isWinning = appState.game.winningCells.some((candidate) => candidate.row === cell.row && candidate.col === cell.col);

        return `
            <g class="board-cell ${isWinning ? "win-cell" : ""}" data-row="${cell.row}" data-col="${cell.col}">
                <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="0" fill="white" stroke="#b4c3e5" stroke-width="1"/>
                <text x="${x + cellSize / 2}" y="${centerY - (cell.secondary ? 4 : 0)}" text-anchor="middle" font-size="${fontSizeFor(cell.primary)}" font-weight="700" fill="#334f84">${escapeHtml(cell.primary || "")}</text>
                ${secondary}
            </g>
        `;
    }).join("");

    const marks = [
        [2, 2],
        [2, Math.floor(size / 2)],
        [2, size - 3],
        [Math.floor(size / 2), 2],
        [Math.floor(size / 2), Math.floor(size / 2)],
        [Math.floor(size / 2), size - 3],
        [size - 3, 2],
        [size - 3, Math.floor(size / 2)],
        [size - 3, size - 3]
    ]
        .filter(([row, col]) => row >= 0 && row < size && col >= 0 && col < size)
        .map(([row, col]) => {
            const cx = boardPadding + col * cellSize + cellSize / 2;
            const cy = boardPadding + row * cellSize + cellSize / 2;
            return `<circle cx="${cx}" cy="${cy}" r="6" fill="#8097ff" opacity="0.36"/>`;
        })
        .join("");

    boardSvgWrapper.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="拼音五子棋棋盘预览">
            <rect x="0" y="0" width="${width}" height="${height}" rx="30" fill="#ffffff"/>
            ${gridRects}
            ${marks}
            ${renderStones(cells, cellSize, boardPadding)}
        </svg>
    `;
}

function countDirection(row, col, deltaRow, deltaCol, player) {
    const cells = [];
    let currentRow = row + deltaRow;
    let currentCol = col + deltaCol;
    while (appState.game.occupied.get(keyForPosition(currentRow, currentCol))?.player === player) {
        cells.push({ row: currentRow, col: currentCol });
        currentRow += deltaRow;
        currentCol += deltaCol;
    }
    return cells;
}

function evaluateWinner(row, col, player) {
    const directions = [
        [[0, 1], [0, -1]],
        [[1, 0], [-1, 0]],
        [[1, 1], [-1, -1]],
        [[1, -1], [-1, 1]]
    ];

    for (const [[forwardRow, forwardCol], [backRow, backCol]] of directions) {
        const line = [
            ...countDirection(row, col, backRow, backCol, player).reverse(),
            { row, col },
            ...countDirection(row, col, forwardRow, forwardCol, player)
        ];
        if (line.length >= 5) {
            return line;
        }
    }
    return [];
}

function updatePracticeStatus() {
    if (appState.game.winner) {
        turnLabel.textContent = `${players[appState.game.winner].name} 获胜`;
        statusLabel.textContent = "已连成五子，可以悔棋或重新开局";
    } else {
        turnLabel.textContent = players[appState.game.currentPlayer].name;
        statusLabel.textContent = appState.game.moves.length === 0 ? "点击棋盘任意格子开始练习" : "继续点击空白格子完成双人对练";
    }

    const lastMove = appState.game.moves.at(-1);
    if (!lastMove) {
        lastMoveLabel.textContent = "还没有落子";
    } else {
        const cell = appState.boardCells.find((candidate) => candidate.row === lastMove.row && candidate.col === lastMove.col);
        const label = cell ? cell.primary : `${lastMove.row + 1}-${lastMove.col + 1}`;
        lastMoveLabel.textContent = `${players[lastMove.player].name} 落在 ${lastMove.row + 1} 行 ${lastMove.col + 1} 列 · ${label}`;
    }

    undoMoveButton.disabled = appState.game.moves.length === 0;
}

function resetGame(size = appState.form?.boardSize || 11) {
    appState.game = createGameState(size);
    updatePracticeStatus();
    renderBoard();
}

function applyPrintMode(mode) {
    appState.printMode = mode;
    document.body.dataset.printMode = mode;
    studentModeButton.classList.toggle("is-active", mode === "student");
    teacherModeButton.classList.toggle("is-active", mode === "teacher");
}

function applyPaperSize(value) {
    appState.paperSize = value;
    document.body.dataset.paperSize = value;
}

function applyPrintLayer(value) {
    appState.printLayer = value;
    document.body.dataset.printLayer = value;
}

function syncPrintCopy() {
    printTitleText.textContent = printTitleInput.value.trim() || "拼音五子棋课堂练习单";
    printSubtitleText.textContent = printSubtitleInput.value.trim() || "边读边下，先连成五子获胜";
    printFooterText.textContent = printFooterInput.value.trim() || "班级：__________  姓名：__________  日期：__________";
}

function handleBoardClick(event) {
    const cellNode = event.target.closest("[data-row][data-col]");
    if (!cellNode) {
        return;
    }

    if (appState.game.winner) {
        return;
    }

    const row = Number(cellNode.dataset.row);
    const col = Number(cellNode.dataset.col);
    const positionKey = keyForPosition(row, col);
    if (appState.game.occupied.has(positionKey)) {
        statusLabel.textContent = "这个格子已经被占用，请选择其他格子";
        return;
    }

    const currentPlayer = appState.game.currentPlayer;
    appState.game.occupied.set(positionKey, { player: currentPlayer });
    appState.game.moves.push({ row, col, player: currentPlayer });

    const winningCells = evaluateWinner(row, col, currentPlayer);
    if (winningCells.length > 0) {
        appState.game.winner = currentPlayer;
        appState.game.winningCells = winningCells;
    } else {
        appState.game.currentPlayer = currentPlayer === "blue" ? "orange" : "blue";
    }

    updatePracticeStatus();
    renderBoard();
}

function undoMove() {
    const lastMove = appState.game.moves.pop();
    if (!lastMove) {
        return;
    }

    appState.game.occupied.delete(keyForPosition(lastMove.row, lastMove.col));
    appState.game.winner = null;
    appState.game.winningCells = [];
    appState.game.currentPlayer = lastMove.player;
    updatePracticeStatus();
    renderBoard();
}

function refreshBoard({ resetPractice = true } = {}) {
    appState.form = readFormState();
    appState.boardCells = buildBoardCells(appState.form);
    renderMeta(appState.form);
    updateHelperCards(appState.form);

    if (resetPractice || appState.game.size !== appState.form.boardSize) {
        resetGame(appState.form.boardSize);
        return;
    }

    updatePracticeStatus();
    renderBoard();
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    refreshBoard({ resetPractice: true });
});

form.addEventListener("input", () => {
    refreshBoard({ resetPractice: true });
});

randomSeedButton.addEventListener("click", () => {
    form.seed.value = String(Math.floor(Math.random() * 90000000) + 10000000);
    refreshBoard({ resetPractice: true });
});

document.querySelector("#contentMode").addEventListener("change", (event) => {
    const mode = event.target.value;
    customInput.disabled = mode !== "custom";
    syncModeSpecificControls(mode);
    refreshBoard({ resetPractice: true });
});

boardSvgWrapper.addEventListener("click", handleBoardClick);
undoMoveButton.addEventListener("click", undoMove);
resetGameButton.addEventListener("click", () => resetGame(appState.form.boardSize));
studentModeButton.addEventListener("click", () => applyPrintMode("student"));
teacherModeButton.addEventListener("click", () => applyPrintMode("teacher"));
printBoardButton.addEventListener("click", () => window.print());
paperSizeSelect.addEventListener("change", () => applyPaperSize(paperSizeSelect.value));
printLayerSelect.addEventListener("change", () => applyPrintLayer(printLayerSelect.value));
printTitleInput.addEventListener("input", syncPrintCopy);
printSubtitleInput.addEventListener("input", syncPrintCopy);
printFooterInput.addEventListener("input", syncPrintCopy);

customInput.disabled = true;
applyPrintMode("student");
applyPaperSize("a4");
applyPrintLayer("clean");
syncPrintCopy();
refreshBoard({ resetPractice: true });
