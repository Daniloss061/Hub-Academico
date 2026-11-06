// Módulo compartilhado do Hub Acadêmico.
// Concentra dados de exemplo, matérias, armazenamento local (publicações,
// rascunhos, curtidas, salvos, comentários) e a montagem dos cartões.
var Hub = (function () {
    "use strict";

    /* ---------- armazenamento (localStorage com fallback em memória) ---------- */
    var memoria = {};
    var CH = {
        pub: "hubPublicacoes",
        rasc: "hubRascunhos",
        curtidas: "hubCurtidas",
        salvos: "hubSalvos",
        coment: "hubComentarios",
        ultimo: "hubUltimoId"
    };

    function ler(chave, padrao) {
        try {
            var v = localStorage.getItem(chave);
            return v ? JSON.parse(v) : padrao;
        } catch (e) {
            return memoria[chave] !== undefined ? memoria[chave] : padrao;
        }
    }
    function gravar(chave, valor) {
        memoria[chave] = valor;
        try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem storage */ }
    }
    function lerTexto(chave, padrao) {
        try { return localStorage.getItem(chave) || padrao; } catch (e) { return padrao; }
    }

    /* ---------- catálogo ---------- */
    var CATEGORIAS = [
        { nome: "Materiais de estudo", curto: "Materiais" },
        { nome: "Estágios", curto: "Estágios" },
        { nome: "Grupos", curto: "Grupos" },
        { nome: "Eventos", curto: "Eventos" },
        { nome: "Avisos", curto: "Avisos" }
    ];

    var AREAS = ["Computação", "Exatas", "Gestão e Humanas"];

    var MATERIAS = [
        { id: "bd", area: "Computação", icone: "🗄️", nome: "Banco de Dados",
          desc: "Modelagem, SQL e normalização.", topicos: ["SQL", "Modelagem ER", "Normalização"] },
        { id: "prog", area: "Computação", icone: "☕", nome: "Programação (Java e POO)",
          desc: "Lógica, Java e orientação a objetos.", topicos: ["Java", "Herança", "Polimorfismo"] },
        { id: "ed", area: "Computação", icone: "🌳", nome: "Estruturas de Dados",
          desc: "Listas, árvores, grafos e algoritmos.", topicos: ["Árvores", "Grafos", "Ordenação"] },
        { id: "redes", area: "Computação", icone: "🌐", nome: "Redes de Computadores",
          desc: "Modelo OSI, TCP/IP e endereçamento.", topicos: ["OSI x TCP/IP", "Sub-redes", "Protocolos"] },
        { id: "es", area: "Computação", icone: "🧩", nome: "Engenharia de Software",
          desc: "Requisitos, UML, métodos ágeis e testes.", topicos: ["UML", "Scrum", "Testes"] },
        { id: "so", area: "Computação", icone: "⚙️", nome: "Sistemas Operacionais",
          desc: "Processos, memória e escalonamento.", topicos: ["Processos", "Escalonamento", "Memória"] },
        { id: "calc", area: "Exatas", icone: "📈", nome: "Cálculo",
          desc: "Limites, derivadas e integrais.", topicos: ["Limites", "Derivadas", "Integrais"] },
        { id: "alg", area: "Exatas", icone: "🧮", nome: "Álgebra Linear",
          desc: "Matrizes, vetores e autovalores.", topicos: ["Matrizes", "Espaços vetoriais", "Autovalores"] },
        { id: "est", area: "Exatas", icone: "📊", nome: "Estatística e Probabilidade",
          desc: "Probabilidade, distribuições e inferência.", topicos: ["Probabilidade", "Distribuições", "Testes"] },
        { id: "fis", area: "Exatas", icone: "🔭", nome: "Física",
          desc: "Mecânica, eletromagnetismo e ondas.", topicos: ["Mecânica", "Eletromagnetismo", "Ondas"] },
        { id: "ing", area: "Gestão e Humanas", icone: "🗣️", nome: "Inglês Técnico",
          desc: "Leitura de artigos e vocabulário da área.", topicos: ["Vocabulário", "Leitura", "Conversação"] },
        { id: "met", area: "Gestão e Humanas", icone: "🔬", nome: "Metodologia Científica",
          desc: "Projetos, normas ABNT e TCC.", topicos: ["ABNT", "TCC", "Pesquisa"] }
    ];

    // horas = quantas horas atrás foi publicado (calculado a partir de "agora")
    var BASE = [
        { id: "s1", autor: "João", papel: "Aluno", categoria: "Materiais de estudo", materia: "bd", horas: 2, curtidas: 12, comentarios: 3,
          titulo: "Material de Banco de Dados", texto: "Estou compartilhando um material que me ajudou a estudar SQL." },
        { id: "s2", autor: "Prof. Carlos", papel: "Professor", categoria: "Avisos", materia: "prog", horas: 3, curtidas: 15, comentarios: 2,
          titulo: "Lista de exercícios de Java", texto: "Lista complementar para praticar programação orientada a objetos." },
        { id: "s3", autor: "Marina", papel: "Aluna", categoria: "Materiais de estudo", materia: "calc", horas: 4, curtidas: 24, comentarios: 6,
          titulo: "Resumo de derivadas e regra da cadeia", texto: "Resumo de uma página com as regras de derivação e exemplos resolvidos passo a passo." },
        { id: "s4", autor: "Monitoria de Redes", papel: "Monitor", categoria: "Eventos", materia: "redes", horas: 6, curtidas: 9, comentarios: 1,
          titulo: "Plantão de dúvidas: sub-redes e CIDR", texto: "Quinta-feira, às 18h, no laboratório 3. Traga os exercícios da lista para resolvermos juntos." },
        { id: "s5", autor: "Coordenação", papel: "Coordenação", categoria: "Avisos", materia: null, horas: 8, curtidas: 31, comentarios: 8,
          titulo: "Prazo de entrega das atividades complementares", texto: "O prazo para envio dos certificados termina no dia 30. Envie pelo sistema acadêmico." },
        { id: "s6", autor: "Rafael", papel: "Aluno", categoria: "Estágios", materia: null, horas: 22, curtidas: 18, comentarios: 5,
          titulo: "Vaga de estágio em desenvolvimento web", texto: "Empresa de software procura estagiário (HTML, CSS e JavaScript). Meio período, remoto." },
        { id: "s7", autor: "Profa. Helena", papel: "Professor", categoria: "Materiais de estudo", materia: "est", horas: 26, curtidas: 14, comentarios: 2,
          titulo: "Lista de probabilidade com gabarito", texto: "Exercícios sobre probabilidade condicional e Bayes, com respostas comentadas." },
        { id: "s8", autor: "Bianca", papel: "Aluna", categoria: "Grupos", materia: "es", horas: 28, curtidas: 7, comentarios: 4,
          titulo: "Grupo para o projeto de Engenharia de Software", texto: "Faltam duas pessoas para fechar nosso grupo. Quem curte front-end e testes?" },
        { id: "s9", autor: "Lucas", papel: "Aluno", categoria: "Materiais de estudo", materia: "ed", horas: 30, curtidas: 40, comentarios: 9,
          titulo: "Cheatsheet: árvores e grafos", texto: "Complexidades, percursos (BFS/DFS) e quando usar cada estrutura, tudo em um PDF." },
        { id: "s10", autor: "Centro Acadêmico", papel: "Entidade", categoria: "Eventos", materia: null, horas: 48, curtidas: 52, comentarios: 12,
          titulo: "Semana de Tecnologia: inscrições abertas", texto: "Palestras, minicursos e feira de projetos. Inscrições gratuitas até sexta-feira." },
        { id: "s11", autor: "Camila", papel: "Aluna", categoria: "Materiais de estudo", materia: "so", horas: 50, curtidas: 16, comentarios: 3,
          titulo: "Escalonamento de processos explicado", texto: "FCFS, SJF e Round Robin com diagramas de Gantt e exemplos numéricos." },
        { id: "s12", autor: "Prof. Marcos", papel: "Professor", categoria: "Materiais de estudo", materia: "alg", horas: 72, curtidas: 21, comentarios: 5,
          titulo: "Videoaula: autovalores e autovetores", texto: "Gravação da aula com a intuição geométrica e dois exemplos de diagonalização." },
        { id: "s13", autor: "Thiago", papel: "Aluno", categoria: "Grupos", materia: "ing", horas: 78, curtidas: 11, comentarios: 2,
          titulo: "Grupo de conversação em inglês técnico", texto: "Encontros semanais para treinar apresentação de projetos e leitura de documentação." },
        { id: "s14", autor: "Profa. Ana", papel: "Professor", categoria: "Avisos", materia: "met", horas: 100, curtidas: 19, comentarios: 3,
          titulo: "Modelo de projeto de TCC atualizado", texto: "O novo modelo segue a ABNT mais recente. Baixe no ambiente virtual antes de iniciar o texto." },
        { id: "s15", autor: "Gustavo", papel: "Aluno", categoria: "Estágios", materia: null, horas: 120, curtidas: 27, comentarios: 7,
          titulo: "Como montar um portfólio no GitHub", texto: "Dicas de README, organização de repositórios e quais projetos destacar para recrutadores." },
        { id: "s16", autor: "Débora", papel: "Aluna", categoria: "Materiais de estudo", materia: "fis", horas: 150, curtidas: 13, comentarios: 1,
          titulo: "Resolução de Física: eletromagnetismo", texto: "Resolvi a lista 4 (lei de Gauss e potencial elétrico). Se achar erro, comenta!" },
        { id: "s17", autor: "Prof. Carlos", papel: "Professor", categoria: "Materiais de estudo", materia: "bd", horas: 170, curtidas: 33, comentarios: 6,
          titulo: "Slides: normalização (1FN a 3FN)", texto: "Slides da aula com exemplos de dependências funcionais e como chegar à terceira forma normal." },
        { id: "s18", autor: "Pedro", papel: "Aluno", categoria: "Materiais de estudo", materia: "prog", horas: 200, curtidas: 22, comentarios: 4,
          titulo: "Exemplos de herança e polimorfismo em Java", texto: "Repositório com exemplos comentados de classes abstratas, interfaces e sobrescrita." },
        { id: "s19", autor: "Letícia", papel: "Aluna", categoria: "Materiais de estudo", materia: "es", horas: 210, curtidas: 17, comentarios: 2,
          titulo: "Diagramas UML: guia rápido", texto: "Casos de uso, classes e sequência resumidos com um exemplo de sistema de biblioteca." },
        { id: "s20", autor: "Ana", papel: "Aluna", categoria: "Materiais de estudo", materia: "redes", horas: 230, curtidas: 25, comentarios: 3,
          titulo: "Modelo OSI x TCP/IP: resumo", texto: "Tabela comparativa das camadas, protocolos de cada uma e perguntas frequentes de prova." }
    ];

    /* ---------- utilidades ---------- */
    function el(tag, classe, texto) {
        var e = document.createElement(tag);
        if (classe) e.className = classe;
        if (texto !== undefined) e.textContent = texto;
        return e;
    }
    function novoId() { return "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
    function nomeUsuario() { return lerTexto("hubNome", "Estudante"); }
    function iniciais(nome) {
        var p = String(nome).replace(/^(Prof\.|Profa\.)\s*/, "").trim().split(/\s+/);
        return ((p[0] || "?")[0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
    }
    function materia(id) {
        for (var i = 0; i < MATERIAS.length; i++) if (MATERIAS[i].id === id) return MATERIAS[i];
        return null;
    }
    function hhmm(d) { return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
    function inicioDia(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
    function diasAtras(ts) { return Math.round((inicioDia(new Date()) - inicioDia(new Date(ts))) / 86400000); }
    function formatarData(ts) {
        var d = new Date(ts), n = diasAtras(ts);
        if (n <= 0) return "Hoje às " + hhmm(d);
        if (n === 1) return "Ontem às " + hhmm(d);
        return d.toLocaleDateString("pt-BR") + " às " + hhmm(d);
    }
    function grupoDia(ts) {
        var n = diasAtras(ts);
        if (n <= 0) return "Hoje";
        if (n === 1) return "Ontem";
        if (n < 7) return "Esta semana";
        return "Mais antigas";
    }

    /* ---------- publicações ---------- */
    // Publicações antigas (versão anterior) não tinham id/ts: ajusta uma única vez.
    function publicadas() {
        var lista = ler(CH.pub, []), mudou = false;
        lista.forEach(function (p, i) {
            if (!p.id) { p.id = novoId(); mudou = true; }
            if (!p.ts) { p.ts = Date.now() - (i + 1) * 60000; mudou = true; }
        });
        if (mudou) gravar(CH.pub, lista);
        return lista;
    }
    function decorar(p, minha) {
        var curtidas = ler(CH.curtidas, []), coment = ler(CH.coment, {});
        var extra = (coment[p.id] || []).length;
        return {
            id: p.id, autor: minha ? nomeUsuario() : p.autor, papel: minha ? "Aluno" : p.papel,
            minha: !!minha, categoria: p.categoria, materia: p.materia || null,
            titulo: p.titulo, texto: p.texto, ts: p.ts,
            curtidas: (p.curtidas || 0) + (curtidas.indexOf(p.id) >= 0 ? 1 : 0),
            comentarios: (p.comentarios || 0) + extra
        };
    }
    function todos() {
        var agora = Date.now();
        var base = BASE.map(function (p) {
            var c = {}; for (var k in p) c[k] = p[k];
            c.ts = agora - p.horas * 3600000;
            return decorar(c, false);
        });
        var meus = publicadas().map(function (p) { return decorar(p, true); });
        return meus.concat(base).sort(function (a, b) { return b.ts - a.ts; });
    }
    function porId(id) {
        var t = todos();
        for (var i = 0; i < t.length; i++) if (t[i].id === id) return t[i];
        return null;
    }
    function meus() { return todos().filter(function (p) { return p.minha; }); }
    function pontuacao(p) { return p.curtidas + p.comentarios * 2; }

    function publicar(dados) {
        var lista = publicadas();
        var post = {
            id: dados.id && String(dados.id).charAt(0) === "u" ? dados.id : novoId(),
            titulo: dados.titulo, categoria: dados.categoria, materia: dados.materia || null,
            texto: dados.texto, ts: Date.now()
        };
        lista.unshift(post);
        gravar(CH.pub, lista);
        gravar(CH.ultimo, post.id);
        return post;
    }
    function excluir(id) {
        gravar(CH.pub, publicadas().filter(function (p) { return p.id !== id; }));
    }

    /* ---------- rascunhos ---------- */
    function rascunhos() {
        return ler(CH.rasc, []).sort(function (a, b) { return b.ts - a.ts; });
    }
    function rascunho(id) {
        var l = rascunhos();
        for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
        return null;
    }
    function salvarRascunho(dados) {
        var lista = ler(CH.rasc, []);
        var item = {
            id: dados.id || novoId(), titulo: dados.titulo || "", categoria: dados.categoria,
            materia: dados.materia || null, texto: dados.texto || "", ts: Date.now()
        };
        var achou = false;
        lista = lista.map(function (r) { if (r.id === item.id) { achou = true; return item; } return r; });
        if (!achou) lista.unshift(item);
        gravar(CH.rasc, lista);
        return item;
    }
    function excluirRascunho(id) {
        gravar(CH.rasc, ler(CH.rasc, []).filter(function (r) { return r.id !== id; }));
    }

    /* ---------- curtidas, salvos, comentários ---------- */
    function alternar(chave, id) {
        var l = ler(chave, []), i = l.indexOf(id);
        if (i >= 0) l.splice(i, 1); else l.push(id);
        gravar(chave, l);
        return i < 0;
    }
    function curtido(id) { return ler(CH.curtidas, []).indexOf(id) >= 0; }
    function salvo(id) { return ler(CH.salvos, []).indexOf(id) >= 0; }
    function salvos() {
        var ids = ler(CH.salvos, []);
        return todos().filter(function (p) { return ids.indexOf(p.id) >= 0; });
    }
    function comentarios(id) { return ler(CH.coment, {})[id] || []; }
    function comentar(id, texto) {
        var m = ler(CH.coment, {});
        (m[id] = m[id] || []).push({ autor: nomeUsuario(), texto: texto, ts: Date.now() });
        gravar(CH.coment, m);
    }

    /* ---------- cartões ---------- */
    function cabecalhoAutor(p) {
        var u = el("div", "usuario");
        u.appendChild(el("div", "avatar" + (p.papel === "Professor" ? " professor" : ""), iniciais(p.autor)));
        var info = el("div");
        var nome = el("strong", null, p.autor + " · " + p.papel);
        info.appendChild(nome);
        info.appendChild(el("small", null, formatarData(p.ts)));
        u.appendChild(info);
        if (p.minha) u.appendChild(el("span", "selo-voce", "Você"));
        return u;
    }
    function etiquetas(p) {
        var box = el("div", "etiquetas");
        box.appendChild(el("span", "categoria-post" + (p.categoria === "Avisos" ? " aviso" : ""), p.categoria));
        var m = materia(p.materia);
        if (m) {
            var a = el("a", "categoria-post materia-chip", m.icone + " " + m.nome);
            a.href = "materiais.html?materia=" + m.id;
            box.appendChild(a);
        }
        return box;
    }
    function cartao(p) {
        var art = el("article", "publicacao");
        art.appendChild(cabecalhoAutor(p));
        art.appendChild(etiquetas(p));
        var h = el("h3");
        var link = el("a", "titulo-link", p.titulo);
        link.href = "publicacao.html?id=" + encodeURIComponent(p.id);
        h.appendChild(link);
        art.appendChild(h);
        art.appendChild(el("p", null, p.texto.length > 160 ? p.texto.slice(0, 157).trim() + "…" : p.texto));
        art.appendChild(barraAcoes(p));
        return art;
    }
    function barraAcoes(p) {
        var acoes = el("div", "acoes");
        var bc = el("button");
        bc.type = "button";
        function pintaCurtir() {
            var on = curtido(p.id);
            bc.textContent = (on ? "♥ " : "♡ ") + (p.curtidas);
            bc.className = on ? "ativo" : "";
            bc.setAttribute("aria-pressed", on ? "true" : "false");
            bc.setAttribute("aria-label", on ? "Remover curtida" : "Curtir");
        }
        p = Object.assign({}, p);
        var baseCurtidas = p.curtidas - (curtido(p.id) ? 1 : 0);
        pintaCurtir();
        bc.addEventListener("click", function () {
            alternar(CH.curtidas, p.id);
            p.curtidas = baseCurtidas + (curtido(p.id) ? 1 : 0);
            pintaCurtir();
        });
        var cm = el("a", null, "💬 " + p.comentarios);
        cm.href = "publicacao.html?id=" + encodeURIComponent(p.id) + "#comentarios";
        cm.setAttribute("aria-label", "Ver comentários");
        var bs = el("button", null, "🔖");
        bs.type = "button";
        function pintaSalvo() {
            var on = salvo(p.id);
            bs.className = "salvar" + (on ? " ativo" : "");
            bs.setAttribute("aria-pressed", on ? "true" : "false");
            bs.setAttribute("aria-label", on ? "Remover dos salvos" : "Salvar");
            bs.textContent = on ? "🔖 Salvo" : "🔖";
        }
        pintaSalvo();
        bs.addEventListener("click", function () { alternar(CH.salvos, p.id); pintaSalvo(); });
        acoes.append(bc, cm, bs);
        return acoes;
    }

    function estadoVazio(icone, titulo, texto) {
        var d = el("div", "estado-vazio");
        d.appendChild(document.createTextNode(icone));
        d.appendChild(document.createElement("br"));
        d.appendChild(el("strong", null, titulo));
        d.appendChild(document.createElement("br"));
        d.appendChild(document.createTextNode(texto));
        return d;
    }

    return {
        CATEGORIAS: CATEGORIAS, AREAS: AREAS, MATERIAS: MATERIAS,
        el: el, materia: materia, formatarData: formatarData, grupoDia: grupoDia, iniciais: iniciais,
        nomeUsuario: nomeUsuario, lerTexto: lerTexto,
        todos: todos, porId: porId, meus: meus, pontuacao: pontuacao,
        publicar: publicar, excluir: excluir,
        rascunhos: rascunhos, rascunho: rascunho, salvarRascunho: salvarRascunho, excluirRascunho: excluirRascunho,
        curtido: curtido, salvo: salvo, salvos: salvos, comentarios: comentarios, comentar: comentar,
        ultimoId: function () { return ler(CH.ultimo, null); },
        cartao: cartao, barraAcoes: barraAcoes, cabecalhoAutor: cabecalhoAutor, etiquetas: etiquetas,
        estadoVazio: estadoVazio
    };
})();
