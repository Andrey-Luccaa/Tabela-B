const listaOriginal = [
    { nome: "AMÉRICA-MG", id: "america", logo: "america-mg.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "ATHLETIC", id: "athletic", logo: "athletic.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "ATLÉTICO-GO", id: "atletico", logo: "atletico goianiense.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "AVAÍ", id: "avai", logo: "avai.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "BOTAFOGO-SP", id: "botafogo", logo: "botafogo-sp.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "CEARÁ", id: "ceara", logo: "ceara.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "CRB", id: "crb", logo: "crb.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "CRICIÚMA", id: "criciuma", logo: "criciuma.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "CUIABÁ", id: "cuiaba", logo: "cuiaba.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "FORTALEZA", id: "fortaleza", logo: "fortaleza.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "GOIAS", id: "goias", logo: "goias.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "JUVENTUDE", id: "juventude", logo: "juventude.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "NÁUTICO", id: "nautico", logo: "nautico.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "LONDRINA", id: "londrina", logo: "londrina.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "NOVORIZONTINO", id: "novorizontino", logo: "Novorizontino.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "OPERÁRIO", id: "operario", logo: "operario.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "PONTE PRETA", id: "pontepreta", logo: "ponte-preta.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "SÃO BERNARDO", id: "saobernardo", logo: "São_Bernardo.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "SPORT", id: "sport", logo: "sport.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "VILA NOVA", id: "vilanova", logo: "vila-nova.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 }
];

const coresTimes = {
    america: "#00ff00", athletic: "#ffffff", atletico: "#ff0000", avai: "#0067b1",
    botafogo: "#ff0000", ceara: "#ffffff", crb: "#ff0000", criciuma: "#ffcc00",
    cuiaba: "#006b3f", fortaleza: "#e40512", goias: "#006934", juventude: "#008a45",
    nautico: "#ff0000", londrina: "#00a3e0", novorizontino: "#ffcc00",
    operario: "#ffffff", pontepreta: "#ffffff", saobernardo: "#ffcc00",
    sport: "#ff0000", vilanova: "#ff0000"
};

let dadosTimes = [...listaOriginal];
let posicoesAnteriores = {};

// ================= JOGOS =================
let todosJogos = [];
let rodadaAtual = 1;

// ================= UTILS =================
function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

function pegarTimePorNome(nome){
    return listaOriginal.find(t => normalizarTexto(t.nome) === nome);
}

function atualizarUltimos(time, resultado) {
    time.ultimos.push(resultado);f

    if (time.ultimos.length > 5) {
        time.ultimos.shift(); // mantém só os últimos 5
    }
}

function formatarUltimos(lista) {
    return lista.map(r => {
        if (r === "V") return '<span class="vitoria"><i class="bi bi-check-circle-fill"></i></span>';
        if (r === "D") return '<span class="derrota"><i class="bi bi-x-circle-fill"></i></span>';
        return '<span class="empate"><i class="bi bi-ban-fill"></i></span>';
    }).join("");
}

// ================= TABELA =================
async function carregarDadosDaPlanilha() {
    try {
        const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRF3MDN_XZnTxezQK8llm9RLzwVD5Z_UCqTEMHhmIc4j6CGbqiMKUZoMKjpswygYjGdKwbU14j3QOG2/pub?gid=0";
        const res = await fetch(url);
        const texto = (await res.text()).replace(/^\uFEFF/, '');

        const linhas = texto.split(/\r?\n/).slice(1);
        const mapa = {};

        linhas.forEach(l => {
            const sep = l.includes(";") ? ";" : ",";
            const col = l.split(sep);

            const nome = normalizarTexto((col[1] || "").replace(/"/g, ""));

            mapa[nome] = {
                v: parseInt(col[2]) || 0,
                e: parseInt(col[3]) || 0,
                d: parseInt(col[4]) || 0,
                gp: parseInt(col[5]) || 0,
                gc: parseInt(col[6]) || 0
            };
        });

        dadosTimes = listaOriginal.map(t => {
            const chave = normalizarTexto(t.nome);
            return mapa[chave] ? { ...t, ...mapa[chave] } : t;
        });

        renderizarTabela();

    } catch (e) {
        console.error("Erro:", e);
        renderizarTabela();
    }
}

// ================= JOGOS =================
async function carregarJogosDaPlanilha(){
    try{
        const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRF3MDN_XZnTxezQK8llm9RLzwVD5Z_UCqTEMHhmIc4j6CGbqiMKUZoMKjpswygYjGdKwbU14j3QOG2/pub?gid=461482428&single=true&output=csv";

        const res = await fetch(url);
        const texto = (await res.text()).replace(/^\uFEFF/, '');

        const linhas = texto.split(/\r?\n/).slice(1);

        todosJogos = [];

        linhas.forEach(l=>{
            const sep = l.includes(";") ? ";" : ",";
            const col = l.split(sep);

            if (!col[0] || col[0] === "---") return;

            const golsCasa = col[3] && col[3].trim() !== "" ? parseInt(col[3]) : null;
            const golsFora = col[4] && col[4].trim() !== "" ? parseInt(col[4]) : null;

            todosJogos.push({
                rodada: parseInt(col[0]),
                casa: normalizarTexto(col[1]),
                fora: normalizarTexto(col[2]),
                golsCasa,
                golsFora,
                bloqueado: golsCasa !== null && golsFora !== null // 🔒 ESSENCIAL
            });
        });
        
        renderizarRodada();
        atualizarTabelaComJogos();

    }catch(e){
        console.error("Erro jogos:", e);
    }

}

// ================= RODADAS =================
function trocarRodada(dir){
    rodadaAtual += dir;
    if (rodadaAtual < 1) rodadaAtual = 1;
    if (rodadaAtual > 38) rodadaAtual = 38;
    renderizarRodada();
}

function renderizarRodada(){
    const titulo = document.getElementById("tituloRodada");
    if (titulo) titulo.innerText = `Rodada ${rodadaAtual}`;

    const jogos = todosJogos.filter(j => j.rodada === rodadaAtual);
    renderizarJogos(jogos);
}

function renderizarTabela() {
    const tbody = document.querySelector("tbody");
    if (!tbody) return;

    const posicoesAntigasDOM = {};
    tbody.querySelectorAll("tr").forEach(tr => {
        posicoesAntigasDOM[tr.dataset.id] = tr.getBoundingClientRect().top;
    });

    const primeiraRenderizacao = Object.keys(posicoesAnteriores).length === 0;

    const times = dadosTimes.map(t => ({
        ...t,
        pontos: t.v * 3 + t.e,
        jogos: t.v + t.e + t.d,
        sg: t.gp - t.gc,
        aproveitamento: (t.v + t.e + t.d) > 0
            ? (((t.v * 3 + t.e) / ((t.v + t.e + t.d) * 3)) * 100).toFixed(1)
            : "0.0"
    })).sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.v !== a.v) return b.v - a.v;
        if (b.sg !== a.sg) return b.sg - a.sg;
        return a.nome.localeCompare(b.nome);
    });

    tbody.innerHTML = "";

    times.forEach((time, index) => {
        const tr = document.createElement("tr");
        tr.dataset.id = time.id;
        
        tr.style.animationDelay = `${index * 0.03}s`;

        tr.style.setProperty("--time-color", coresTimes[time.id] || "#fff");

        const posAntiga = posicoesAnteriores[time.id];
        let seta = "•";
        let classeSeta = "same";

        if (!primeiraRenderizacao && posAntiga !== undefined) {
            if (index < posAntiga) {
                seta = "↑";
                classeSeta = "up";
            } else if (index > posAntiga) {
                seta = "↓";
                classeSeta = "down";
            }
        }

        posicoesAnteriores[time.id] = index;

        if (index < 4) tr.classList.add("top4", "libertadores");
        else if (index >= 16) tr.classList.add("rebaixamento");

        tr.innerHTML = `
            <td>
                <div class="team-info">
                    <span class="pos-num">${index + 1}º</span>
                    <img src="image/${time.logo}" class="timelogo">
                    <span>${time.nome}</span>
                    <span class="pos-change ${classeSeta}">${seta}</span>
                </div>
            </td>
            <td><strong>${time.pontos}</strong></td>
            <td>${time.jogos}</td>
            <td>${time.v}</td>
            <td>${time.e}</td>
            <td>${time.d}</td>
            <td>${time.gp}</td>
            <td>${time.gc}</td>
            <td>${time.sg}</td>
            <td>
                <div class="aproveitamento-bar">
                    <div class="fill" style="width:${time.aproveitamento}%"></div>
                    <span>${time.aproveitamento}%</span>
                </div>
            </td>
            <td>
                <div class="ultimos">
                    ${formatarUltimos(time.ultimos)}
                </div>
            </td>
        `;

        tr.addEventListener("click", (e) => {

    // SOM
    if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    }

    // ANIMAÇÃO GLOW
    tr.classList.add("clicked");
    setTimeout(() => tr.classList.remove("clicked"), 500);

    // RIPPLE
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");

    const rect = tr.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;

    ripple.style.left = `${x - rect.left}px`;
    ripple.style.top = `${y - rect.top}px`;

    tr.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
});

        tbody.appendChild(tr);
    });

    requestAnimationFrame(() => {
        tbody.querySelectorAll("tr").forEach(tr => {
            const antiga = posicoesAntigasDOM[tr.dataset.id];
            const nova = tr.getBoundingClientRect().top;

            if (antiga !== undefined && antiga !== nova) {
                const delta = antiga - nova;

                tr.style.transition = "none";
                tr.style.transform = `translateY(${delta}px)`;

                requestAnimationFrame(() => {
                    tr.style.transition = window.innerWidth <= 768
                        ? "transform 0.3s ease-out"
                        : "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
                    tr.style.transform = "translateY(0)";
                });
            }
        });
    });
}

// ================= RENDER JOGOS =================
function renderizarJogos(jogos){
    const container = document.getElementById("listaJogos");
    if (!container) return;

    container.innerHTML = "";

    jogos.forEach(j=>{
        const casa = pegarTimePorNome(j.casa);
        const fora = pegarTimePorNome(j.fora);
        if (!casa || !fora) return;

        const div = document.createElement("div");
        div.classList.add("jogo");

        // se estiver bloqueado adiciona classe visual
        if (j.bloqueado) {
            div.classList.add("jogo-bloqueado");
        }

        div.innerHTML = `
            <div class="time casa">
                <img src="image/${casa.logo}">
                <span>${casa.nome}</span>
            </div>

            <div class="placar-input">
                <input 
                    type="number" 
                    min="0" 
                    value="${j.golsCasa ?? ""}" 
                    class="input-gol casa"
                    ${j.bloqueado ? "disabled" : ""}
                >

                <span>x</span>

                <input 
                    type="number" 
                    min="0" 
                    value="${j.golsFora ?? ""}" 
                    class="input-gol fora"
                    ${j.bloqueado ? "disabled" : ""}
                >
            </div>

            <div class="time fora">
                <span>${fora.nome}</span>
                <img src="image/${fora.logo}">
            </div>
        `;

        const inputCasa = div.querySelector(".input-gol.casa");
        const inputFora = div.querySelector(".input-gol.fora");

        function atualizar() {
            // 🔒 segurança extra
            if (j.bloqueado) return;

            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(()=>{});
            }

            j.golsCasa = inputCasa.value === "" ? null : parseInt(inputCasa.value);
            j.golsFora = inputFora.value === "" ? null : parseInt(inputFora.value);

            atualizarTabelaComJogos();
        }

        inputCasa.addEventListener("input", atualizar);
        inputFora.addEventListener("input", atualizar);

        container.appendChild(div);
    });
}

function atualizarTabelaComJogos() {
    // resetar stats
    dadosTimes = listaOriginal.map(t => ({
        ...t,
        v: 0, e: 0, d: 0,
        gp: 0, gc: 0,
        ultimos: []
    }));

    todosJogos.forEach(j => {
        if (j.golsCasa == null || j.golsFora == null) return;

        const casa = dadosTimes.find(t => normalizarTexto(t.nome) === j.casa);
        const fora = dadosTimes.find(t => normalizarTexto(t.nome) === j.fora);

        if (!casa || !fora) return;

        casa.gp += j.golsCasa;
        casa.gc += j.golsFora;

        fora.gp += j.golsFora;
        fora.gc += j.golsCasa;

        if (j.golsCasa > j.golsFora) {
            casa.v++;
            fora.d++;
            atualizarUltimos(casa, "V");
            atualizarUltimos(fora, "D");

        } else if (j.golsCasa < j.golsFora) {
            fora.v++;
            casa.d++;
            atualizarUltimos(casa, "D");
            atualizarUltimos(fora, "V");
        } else {
            casa.e++;
            fora.e++;
            atualizarUltimos(casa, "E");
            atualizarUltimos(fora, "E");
        }
    });

    renderizarTabela();
}

// ================= INIT =================
document.body.addEventListener("touchstart", () => {
    if (clickSound) {
        clickSound.play().then(() => {
            clickSound.pause();
            clickSound.currentTime = 0;
        }).catch(() => {});
    }
}, { once: true });

carregarDadosDaPlanilha();
carregarJogosDaPlanilha();
