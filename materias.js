// Categoria Materiais: lista de matérias específicas e página de cada matéria.
(function () {
    "use strict";
    var el = Hub.el;
    var box = document.getElementById("conteudo");
    var id = new URLSearchParams(location.search).get("materia");
    var materia = Hub.materia(id);
    var posts = Hub.todos();

    function qtd(mid) { return posts.filter(function (p) { return p.materia === mid; }).length; }
    function plural(n) { return n + (n === 1 ? " publicação" : " publicações"); }

    function visaoGeral() {
        document.getElementById("voltar").href = "principal.html";
        box.appendChild(el("p", null, "Escolha uma matéria para ver resumos, listas e materiais compartilhados pela comunidade."));

        var busca = el("input"); busca.type = "search"; busca.placeholder = "Buscar matéria..."; busca.className = "busca-materia";
        busca.setAttribute("aria-label", "Buscar matéria");
        box.appendChild(busca);

        var chips = el("div", "chips"); chips.setAttribute("role", "group"); chips.setAttribute("aria-label", "Filtrar por área");
        box.appendChild(chips);
        var grade = el("div", "grade-materias"); box.appendChild(grade);
        var vazio = el("p", "mensagem-pagina", "Nenhuma matéria encontrada."); vazio.hidden = true; box.appendChild(vazio);

        var area = "Todas";
        function norm(s) { return s.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[̀-ͯ]/g, ""); }

        function desenha() {
            var q = norm(busca.value.trim());
            chips.innerHTML = "";
            ["Todas"].concat(Hub.AREAS).forEach(function (a) {
                var b = el("button", "chip", a); b.type = "button";
                b.setAttribute("aria-pressed", a === area ? "true" : "false");
                b.addEventListener("click", function () { area = a; desenha(); });
                chips.appendChild(b);
            });
            grade.innerHTML = "";
            var n = 0;
            Hub.MATERIAS.forEach(function (m) {
                if (area !== "Todas" && m.area !== area) return;
                if (q && norm(m.nome + " " + m.desc + " " + m.topicos.join(" ")).indexOf(q) < 0) return;
                n++;
                var a = el("a", "cartao-materia");
                a.href = "materiais.html?materia=" + m.id;
                a.appendChild(el("span", "icone-materia", m.icone));
                a.appendChild(el("strong", null, m.nome));
                a.appendChild(el("small", null, m.desc));
                a.appendChild(el("span", "qtd-materia", plural(qtd(m.id))));
                grade.appendChild(a);
            });
            vazio.hidden = n > 0;
        }
        busca.addEventListener("input", desenha);
        desenha();

        var outras = el("a", "botao-secundario", "Ver todas as categorias"); outras.href = "categorias.html";
        box.appendChild(outras);
    }

    function paginaMateria(m) {
        document.title = m.nome + " - Hub Acadêmico";
        document.getElementById("tituloPagina").textContent = m.nome;
        document.getElementById("voltar").href = "materiais.html";
        document.getElementById("voltar").textContent = "‹ Matérias";

        var topo = el("div", "materia-topo");
        topo.appendChild(el("span", "icone-materia grande", m.icone));
        var info = el("div");
        info.appendChild(el("strong", null, m.area));
        info.appendChild(el("p", null, m.desc));
        topo.appendChild(info);
        box.appendChild(topo);

        var tops = el("div", "chips");
        m.topicos.forEach(function (t) { tops.appendChild(el("span", "etiqueta", t)); });
        box.appendChild(tops);

        var novo = el("a", "botao-primario", "＋ Compartilhar material de " + m.nome);
        novo.href = "nova-publicacao.html?materia=" + m.id;
        novo.style.marginTop = "14px";
        box.appendChild(novo);

        var lista = posts.filter(function (p) { return p.materia === m.id; });
        box.appendChild(el("h2", "titulo-lista", plural(lista.length)));
        if (!lista.length) {
            box.appendChild(Hub.estadoVazio("📚", "Ainda não há materiais aqui", "Seja a primeira pessoa a compartilhar algo desta matéria."));
        } else {
            lista.forEach(function (p) { box.appendChild(Hub.cartao(p)); });
        }
    }

    if (materia) paginaMateria(materia); else visaoGeral();
})();
