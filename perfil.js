// Perfil: dados do usuário + abas "Publicações" e "Rascunhos".
(function () {
    "use strict";
    var el = Hub.el;

    var nome = Hub.nomeUsuario();
    document.getElementById("perfilNome").textContent = nome;
    document.getElementById("perfilAvatar").textContent = Hub.iniciais(nome);
    var bio = Hub.lerTexto("hubBio", "");
    if (bio) document.getElementById("perfilBio").textContent = bio;

    var abas = {
        publicacoes: { aba: document.getElementById("abaPublicacoes"), painel: document.getElementById("painelPublicacoes") },
        rascunhos: { aba: document.getElementById("abaRascunhos"), painel: document.getElementById("painelRascunhos") }
    };

    function mostrar(qual) {
        Object.keys(abas).forEach(function (k) {
            var ativo = k === qual;
            abas[k].aba.setAttribute("aria-selected", ativo ? "true" : "false");
            abas[k].aba.tabIndex = ativo ? 0 : -1;
            abas[k].painel.hidden = !ativo;
        });
        try { history.replaceState(null, "", "#" + qual); } catch (e) { /* ok */ }
    }
    Object.keys(abas).forEach(function (k) {
        abas[k].aba.addEventListener("click", function () { mostrar(k); });
        abas[k].aba.addEventListener("keydown", function (e) {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                var outro = k === "publicacoes" ? "rascunhos" : "publicacoes";
                mostrar(outro); abas[outro].aba.focus();
            }
        });
    });

    function botao(rotulo, classe, fn) {
        var b = el("button", classe, rotulo);
        b.type = "button";
        b.addEventListener("click", fn);
        return b;
    }
    function link(rotulo, href, classe) {
        var a = el("a", classe, rotulo);
        a.href = href;
        return a;
    }

    function cartaoPublicado(p) {
        var art = Hub.cartao(p);
        var gestao = el("div", "gestao");
        gestao.appendChild(link("Abrir", "publicacao.html?id=" + encodeURIComponent(p.id)));
        gestao.appendChild(botao("Excluir", "perigo", function () {
            if (confirm("Excluir esta publicação? Essa ação não pode ser desfeita.")) { Hub.excluir(p.id); desenha(); }
        }));
        art.appendChild(gestao);
        return art;
    }

    function cartaoRascunho(r) {
        var art = el("article", "publicacao rascunho");
        art.appendChild(el("span", "categoria-post rascunho-selo", "Rascunho"));
        var tags = el("span", "categoria-post", r.categoria);
        art.appendChild(tags);
        var m = Hub.materia(r.materia);
        if (m) art.appendChild(el("span", "categoria-post", m.icone + " " + m.nome));
        art.appendChild(el("h3", null, r.titulo || "(Sem título)"));
        art.appendChild(el("p", null, r.texto ? (r.texto.length > 140 ? r.texto.slice(0, 137).trim() + "…" : r.texto) : "Sem descrição ainda."));
        art.appendChild(el("small", "data-rascunho", "Editado " + Hub.formatarData(r.ts).toLowerCase()));
        var gestao = el("div", "gestao");
        gestao.appendChild(link("Continuar editando", "nova-publicacao.html?rascunho=" + encodeURIComponent(r.id)));
        var completo = r.titulo && r.texto && (r.categoria !== "Materiais de estudo" || r.materia);
        var pub = botao("Publicar", "", function () {
            Hub.publicar(r);
            Hub.excluirRascunho(r.id);
            location.href = "confirmacao.html";
        });
        if (!completo) { pub.disabled = true; pub.title = "Complete título, descrição" + (r.categoria === "Materiais de estudo" ? " e matéria" : "") + " para publicar"; }
        gestao.appendChild(pub);
        gestao.appendChild(botao("Excluir", "perigo", function () {
            if (confirm("Excluir este rascunho?")) { Hub.excluirRascunho(r.id); desenha(); }
        }));
        art.appendChild(gestao);
        return art;
    }

    function desenha() {
        var pubs = Hub.meus(), rascs = Hub.rascunhos();
        document.getElementById("contPub").textContent = pubs.length;
        document.getElementById("contRasc").textContent = rascs.length;

        var nums = document.getElementById("perfilNumeros");
        nums.innerHTML = "";
        [[pubs.length, "publicações"], [rascs.length, "rascunhos"], [Hub.salvos().length, "salvos"]].forEach(function (n) {
            var d = el("div");
            d.appendChild(el("strong", null, String(n[0])));
            d.appendChild(el("span", null, n[1]));
            nums.appendChild(d);
        });

        var pp = abas.publicacoes.painel, pr = abas.rascunhos.painel;
        pp.innerHTML = ""; pr.innerHTML = "";
        if (!pubs.length) {
            pp.appendChild(Hub.estadoVazio("✍️", "Você ainda não publicou nada", "Compartilhe um material, aviso ou oportunidade com a comunidade."));
            pp.appendChild(link("Criar publicação", "nova-publicacao.html", "botao-primario"));
        } else {
            pubs.forEach(function (p) { pp.appendChild(cartaoPublicado(p)); });
        }
        if (!rascs.length) {
            pr.appendChild(Hub.estadoVazio("📝", "Nenhum rascunho", "Ao criar uma publicação, use “Salvar rascunho” para terminar depois."));
        } else {
            rascs.forEach(function (r) { pr.appendChild(cartaoRascunho(r)); });
        }
    }

    desenha();
    mostrar(location.hash === "#rascunhos" ? "rascunhos" : "publicacoes");
})();
