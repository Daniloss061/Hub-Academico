// Feed dinâmico: destaques, filtro por categoria, ordenação e paginação.
(function () {
    "use strict";
    var POR_PAGINA = 5;
    var ORDENS = [
        { id: "recentes", rotulo: "Recentes" },
        { id: "populares", rotulo: "Populares" },
        { id: "comentados", rotulo: "Mais comentados" }
    ];
    var params = new URLSearchParams(location.search);
    var estado = {
        cat: params.get("cat") || "todas",
        ord: params.get("ord") || "recentes",
        pg: parseInt(params.get("pg"), 10) || 1
    };
    var el = Hub.el;
    var posts = Hub.todos();

    function sincronizaURL() {
        var q = new URLSearchParams();
        if (estado.cat !== "todas") q.set("cat", estado.cat);
        if (estado.ord !== "recentes") q.set("ord", estado.ord);
        if (estado.pg > 1) q.set("pg", estado.pg);
        var s = q.toString();
        try { history.replaceState(null, "", location.pathname + (s ? "?" + s : "")); } catch (e) { /* ok */ }
    }

    /* ---------- destaques ---------- */
    function desenhaDestaques() {
        var box = document.getElementById("destaques");
        var limite = Date.now() - 7 * 86400000;
        var top = posts.filter(function (p) { return p.ts >= limite; })
            .sort(function (a, b) { return Hub.pontuacao(b) - Hub.pontuacao(a); }).slice(0, 6);
        box.innerHTML = "";
        top.forEach(function (p, i) {
            var a = el("a", "destaque");
            a.href = "publicacao.html?id=" + encodeURIComponent(p.id);
            a.appendChild(el("span", "destaque-posicao", "#" + (i + 1)));
            a.appendChild(el("span", "categoria-post", p.categoria));
            a.appendChild(el("strong", null, p.titulo));
            a.appendChild(el("small", null, "♥ " + p.curtidas + "  ·  💬 " + p.comentarios));
            box.appendChild(a);
        });
    }

    /* ---------- controles ---------- */
    function desenhaControles() {
        var chips = document.getElementById("filtroCategorias");
        chips.innerHTML = "";
        var opcoes = [{ nome: "todas", curto: "Todas" }].concat(Hub.CATEGORIAS);
        opcoes.forEach(function (c) {
            var n = c.nome === "todas" ? posts.length : posts.filter(function (p) { return p.categoria === c.nome; }).length;
            var b = el("button", "chip", c.curto + " " + n);
            b.type = "button";
            b.setAttribute("aria-pressed", estado.cat === c.nome ? "true" : "false");
            b.addEventListener("click", function () { estado.cat = c.nome; estado.pg = 1; desenha(false); });
            chips.appendChild(b);
        });
        var seg = document.getElementById("ordenacao");
        seg.innerHTML = "";
        ORDENS.forEach(function (o) {
            var b = el("button", null, o.rotulo);
            b.type = "button";
            b.setAttribute("aria-pressed", estado.ord === o.id ? "true" : "false");
            b.addEventListener("click", function () { estado.ord = o.id; estado.pg = 1; desenha(false); });
            seg.appendChild(b);
        });
    }

    /* ---------- lista ---------- */
    function filtrados() {
        var l = posts.filter(function (p) { return estado.cat === "todas" || p.categoria === estado.cat; });
        if (estado.ord === "populares") l.sort(function (a, b) { return Hub.pontuacao(b) - Hub.pontuacao(a) || b.ts - a.ts; });
        else if (estado.ord === "comentados") l.sort(function (a, b) { return b.comentarios - a.comentarios || b.ts - a.ts; });
        else l.sort(function (a, b) { return b.ts - a.ts; });
        return l;
    }

    function desenhaLista(lista, total) {
        var box = document.getElementById("listaFeed");
        box.innerHTML = "";
        if (!total) {
            box.appendChild(Hub.estadoVazio("📭", "Nada por aqui ainda", "Nenhuma publicação nesta categoria. Que tal criar a primeira?"));
            return;
        }
        var grupoAtual = null;
        lista.forEach(function (p) {
            if (estado.ord === "recentes") {
                var g = Hub.grupoDia(p.ts);
                if (g !== grupoAtual) { box.appendChild(el("h3", "dia-titulo", g)); grupoAtual = g; }
            }
            box.appendChild(Hub.cartao(p));
        });
    }

    function botaoPagina(rotulo, pg, opcoes) {
        var b = el("button", opcoes.classe || "", rotulo);
        b.type = "button";
        if (opcoes.aria) b.setAttribute("aria-label", opcoes.aria);
        if (opcoes.atual) b.setAttribute("aria-current", "page");
        b.disabled = !!opcoes.desabilitado;
        b.addEventListener("click", function () { estado.pg = pg; desenha(true); });
        return b;
    }

    function desenhaPager(totalPaginas) {
        var nav = document.getElementById("pager");
        nav.innerHTML = "";
        if (totalPaginas <= 1) return;
        nav.appendChild(botaoPagina("‹ Anterior", estado.pg - 1, { desabilitado: estado.pg === 1, classe: "pager-nav", aria: "Página anterior" }));
        for (var i = 1; i <= totalPaginas; i++) {
            nav.appendChild(botaoPagina(String(i), i, { atual: i === estado.pg, aria: "Página " + i }));
        }
        nav.appendChild(botaoPagina("Próxima ›", estado.pg + 1, { desabilitado: estado.pg === totalPaginas, classe: "pager-nav", aria: "Próxima página" }));
    }

    function desenha(rolar) {
        var todos = filtrados();
        var totalPaginas = Math.max(1, Math.ceil(todos.length / POR_PAGINA));
        if (estado.pg > totalPaginas) estado.pg = totalPaginas;
        if (estado.pg < 1) estado.pg = 1;
        var ini = (estado.pg - 1) * POR_PAGINA;
        desenhaControles();
        desenhaLista(todos.slice(ini, ini + POR_PAGINA), todos.length);
        desenhaPager(totalPaginas);
        document.getElementById("contagemFeed").textContent = todos.length
            ? "Mostrando " + (ini + 1) + "–" + Math.min(ini + POR_PAGINA, todos.length) + " de " + todos.length
            : "";
        sincronizaURL();
        if (rolar) document.getElementById("feed").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    desenhaDestaques();
    desenha(false);
})();
