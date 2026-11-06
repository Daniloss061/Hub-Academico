// Página de uma publicação, com curtir, salvar e comentários.
(function () {
    "use strict";
    var el = Hub.el;
    var box = document.getElementById("conteudo");
    var id = new URLSearchParams(location.search).get("id");
    var p = id ? Hub.porId(id) : null;

    if (!p) {
        box.appendChild(Hub.estadoVazio("🔎", "Publicação não encontrada", "Ela pode ter sido excluída."));
        var a = el("a", "botao-primario", "Voltar ao início"); a.href = "principal.html"; a.style.marginTop = "14px";
        box.appendChild(a);
        return;
    }
    document.title = p.titulo + " - Hub Acadêmico";

    var art = el("article", "publicacao publicacao-detalhe");
    art.appendChild(Hub.cabecalhoAutor(p));
    art.appendChild(Hub.etiquetas(p));
    art.appendChild(el("h3", null, p.titulo));
    art.appendChild(el("p", "texto-completo", p.texto));
    art.appendChild(Hub.barraAcoes(p));
    box.appendChild(art);

    var sec = el("section", "comentarios"); sec.id = "comentarios";
    var titulo = el("h2"); sec.appendChild(titulo);
    var lista = el("div"); sec.appendChild(lista);

    var form = el("form", "formulario-pagina");
    var rot = el("label", null, "Escreva um comentário"); rot.htmlFor = "novoComentario";
    var campo = el("textarea"); campo.id = "novoComentario"; campo.maxLength = 500; campo.placeholder = "Compartilhe sua dúvida ou contribuição...";
    campo.style.minHeight = "80px";
    var enviar = el("button", "botao-primario", "Comentar"); enviar.type = "submit";
    form.append(rot, campo, enviar);
    sec.appendChild(form);
    box.appendChild(sec);

    var baseComentarios = p.comentarios - Hub.comentarios(p.id).length;
    function desenha() {
        var meus = Hub.comentarios(p.id);
        titulo.textContent = "Comentários (" + (baseComentarios + meus.length) + ")";
        lista.innerHTML = "";
        if (!meus.length) {
            lista.appendChild(el("p", null, baseComentarios
                ? "Os " + baseComentarios + " comentários de exemplo não estão disponíveis nesta versão. Seja o primeiro a comentar aqui."
                : "Ninguém comentou ainda."));
        }
        meus.forEach(function (c) {
            var d = el("div", "comentario");
            d.appendChild(el("strong", null, c.autor));
            d.appendChild(el("small", null, " · " + Hub.formatarData(c.ts)));
            d.appendChild(el("p", null, c.texto));
            lista.appendChild(d);
        });
    }
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var t = campo.value.trim();
        if (!t) return;
        Hub.comentar(p.id, t);
        campo.value = "";
        desenha();
    });
    desenha();

    if (p.minha) {
        var ex = el("button", "botao-secundario perigo-botao", "Excluir esta publicação"); ex.type = "button";
        ex.addEventListener("click", function () {
            if (confirm("Excluir esta publicação?")) { Hub.excluir(p.id); location.href = "perfil.html"; }
        });
        box.appendChild(ex);
    }
})();
