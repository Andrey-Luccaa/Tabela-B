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

function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

async function carregarDadosDaPlanilha() {
    try {
        const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRF3MDN_XZnTxezQK8llm9RLzwVD5Z_UCqTEMHhmIc4j6CGbqiMKUZoMKjpswygYjGdKwbU14j3QOG2/pub?output=csv";

        const resposta = await fetch(sheetURL);
        if (!resposta.ok) throw new Error("Erro ao acessar Google Sheets.");

        const texto = (await resposta.text()).replace(/^\uFEFF/, '');
        const linhas = texto.split(/\r?\n/).filter(l => l.trim().length > 0);
        const corpo = linhas.slice(1);

        const mapaPlanilha = {};

        corpo.forEach(linha => {
            const separador = linha.includes(';') ? ';' : ',';
            const col = linha.split(separador);

            // ✅ CORRIGIDO AQUI
            if (col.length >= 6) {
                const nomeCSV = normalizarTexto(col[0].replace(/"/g, ''));

                mapaPlanilha[nomeCSV] = {
                    v: parseInt(col[1]) || 0,
                    e: parseInt(col[2]) || 0,
                    d: parseInt(col[3]) || 0,
                    gp: parseInt(col[4]) || 0,
                    gc: parseInt(col[5]) || 0
                };
            }
        });

        dadosTimes = listaOriginal.map(time => {
            const nomeChave = normalizarTexto(time.nome);
            const novosValores = mapaPlanilha[nomeChave];
            return novosValores ? { ...time, ...novosValores } : time;
        });

        renderizarTabela();

    } catch (erro) {
        console.error("Erro:", erro.message);
        renderizarTabela();
    }
}

function renderizarTabela() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    const posicoesAntigas = {};
    tbody.querySelectorAll('tr').forEach(tr => {
        const id = tr.dataset.id;
        if (id) posicoesAntigas[id] = tr.getBoundingClientRect().top;
    });

    const timesProcessados = dadosTimes.map(t => ({
        ...t,
        pontos: (t.v * 3) + t.e,
        jogos: t.v + t.e + t.d,
        sg: t.gp - t.gc,
        aproveitamento: (t.v + t.e + t.d) > 0
            ? (((t.v * 3 + t.e) / ((t.v + t.e + t.d) * 3)) * 100).toFixed(1)
            : "0.0"
    })).sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.v !== a.v) return b.v - a.v;
        if (b.sg !== a.sg) return b.sg - a.sg;
        if (b.gp !== a.gp) return b.gp - a.gp;
        return a.nome.localeCompare(b.nome);
    });

    tbody.innerHTML = '';

    timesProcessados.forEach((time, index) => {
        const tr = document.createElement('tr');
        tr.dataset.id = time.id;

        const corHex = coresTimes[time.id] || "#ffffff";
        tr.style.setProperty('--time-color', corHex);

        tr.innerHTML = `
            <td>
                <div class="team-info">
                    <span class="pos-num">${index + 1}º</span>
                    <img src="image/${time.logo}" class="timelogo">
                    <span>${time.nome}</span>
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
            <td>${time.aproveitamento}%</td>
        `;

        if (index < 4) tr.style.borderLeft = "4px solid #00ff88";
        else if (index >= 16) tr.style.borderLeft = "4px solid #ff4d4d";

        tbody.appendChild(tr);
    });

    requestAnimationFrame(() => {
        tbody.querySelectorAll('tr').forEach(tr => {
            const id = tr.dataset.id;
            const antiga = posicoesAntigas[id];
            const nova = tr.getBoundingClientRect().top;

            if (antiga !== undefined && antiga !== nova) {
                const delta = antiga - nova;
                tr.style.transition = 'none';
                tr.style.transform = `translateY(${delta}px)`;

                requestAnimationFrame(() => {
                    tr.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    tr.style.transform = 'translateY(0)';
                });
            }
        });
    });
}

window.onload = carregarDadosDaPlanilha;