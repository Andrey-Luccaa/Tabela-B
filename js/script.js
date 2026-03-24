const listaOriginal = [
    { nome: "AMÉRICA-MG", id: "america", logo: "america-mg.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "ATHLETIC", id: "athletic", logo: "athletic.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "ATLÉTICO-GO", id: "atletico", logo: "atletico goianiense.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
    { nome: "AVAÍ", id: "avai", logo: "Avai.png", v: 0, e: 0, d: 0, gp: 0, gc: 0 },
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

function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

async function carregarDadosDaPlanilha() {
    try {
        const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRF3MDN_XZnTxezQK8llm9RLzwVD5Z_UCqTEMHhmIc4j6CGbqiMKUZoMKjpswygYjGdKwbU14j3QOG2/pub?output=csv&gid=2083338507";
        const res = await fetch(url);
        const texto = (await res.text()).replace(/^\uFEFF/, '');

        const linhas = texto.split(/\r?\n/).slice(1);
        const mapa = {};

        linhas.forEach(l => {
            const sep = l.includes(";") ? ";" : ",";
            const col = l.split(sep);

            const nome = normalizarTexto((col[1] || "").replace(/"/g, ""));

            mapa[nome] = {
                v: parseInt(col[1]) || 0,
                e: parseInt(col[2]) || 0,
                d: parseInt(col[3]) || 0,
                gp: parseInt(col[4]) || 0,
                gc: parseInt(col[5]) || 0
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
        `;

        tr.addEventListener("click", () => {
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(() => {});
            }

            tr.classList.add("clicked");
            setTimeout(() => tr.classList.remove("clicked"), 400);
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

document.body.addEventListener("touchstart", () => {
    if (clickSound) {
        clickSound.play().then(() => {
            clickSound.pause();
            clickSound.currentTime = 0;
        }).catch(() => {});
    }
}, { once: true });

carregarDadosDaPlanilha();
