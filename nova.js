// Nova publicação com suporte a rascunhos e seleção de matéria.
(function () {
    "use strict";
    var el = Hub.el;
    var params = new URLSearchParams(location.search);
    var rascunho = params.get("rascunho") ? Hub.rascunho(params.get("rascunho")) : null;

    var $ = function (id) { return document.getElementById(id); };
    var cat = $("categoriaPost"), mat = $("materiaPost"), msg = $("msgPost");

    Hub.CATEGORIAS.forEach(function (c) { var o = el("option", null, c.nome); o.value = c.nome; cat.appendChild(o); });

    var vazio = el("option", null, "Selecione a matéria"); vazio.value = ""; mat.appendChild(vazio);
    Hub.AREAS.forEach(function (area) {
        var g = el("optgroup"); g.label = area;
        Hub.MATERIAS.filter(function (m) { return m.area === area; }).forEach(function (m) {
            var o = el("option", null, m.icone + " " + m.nome); o.value = m.id; g.appendChild(o);
        });
        mat.appendChild(g);
    });

    function ajustaMateria() {
        var obrigatoria = cat.value === "Materiais de estudo";
        $("rotuloMateria").textContent = obrigatoria ? "Matéria" : "Matéria (opcional)";
        vazio.textContent = obrigatoria ? "Selecione a matéria" : "Nenhuma matéria específica";
        mat.required = obrigatoria;
    }
    cat.addEventListener("change", ajustaMateria);

    if (rascunho) {
        $("tituloPagina").textContent = "Editar rascunho";
        $("tituloPost").value = rascunho.titulo;
        cat.value = rascunho.categoria;
        mat.value = rascunho.materia || "";
        $("textoPost").value = rascunho.texto;
    } else if (params.get("materia") && Hub.materia(params.get("materia"))) {
        cat.value = "Materiais de estudo";
        mat.value = params.get("materia");
    }
    ajustaMateria();

    function dados() {
        return {
            id: rascunho ? rascunho.id : null,
            titulo: $("tituloPost").value.trim(),
            categoria: cat.value,
            materia: mat.value || null,
            texto: $("textoPost").value.trim()
        };
    }

    $("formPublicacao").addEventListener("submit", function (e) {
        e.preventDefault();
        var d = dados();
        if (!d.titulo || !d.texto) { msg.style.color = "#b3261e"; msg.textContent = "Preencha título e descrição para publicar."; return; }
        if (d.categoria === "Materiais de estudo" && !d.materia) { msg.style.color = "#b3261e"; msg.textContent = "Escolha a matéria do material."; return; }
        Hub.publicar(d);
        if (rascunho) Hub.excluirRascunho(rascunho.id);
        msg.style.color = ""; msg.textContent = "Publicação salva neste navegador!";
        setTimeout(function () { location.href = "confirmacao.html"; }, 600);
    });

    $("btnRascunho").addEventListener("click", function () {
        var d = dados();
        if (!d.titulo && !d.texto) { msg.style.color = "#b3261e"; msg.textContent = "Escreva ao menos um título ou parte do texto para salvar o rascunho."; return; }
        var r = Hub.salvarRascunho(d);
        rascunho = r;
        msg.style.color = ""; msg.textContent = "Rascunho salvo! Você o encontra no seu perfil.";
        setTimeout(function () { location.href = "perfil.html#rascunhos"; }, 700);
    });
})();
