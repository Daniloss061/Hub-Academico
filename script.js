// Tela de confirmação da publicação.
// "Ver publicação" abre a página da publicação recém-criada.
// "Voltar para o início" retorna ao feed principal.
function verPublicacao() {
    var id = null;
    try { id = JSON.parse(localStorage.getItem("hubUltimoId")); } catch (e) { /* sem storage */ }
    window.location.href = id ? "publicacao.html?id=" + encodeURIComponent(id) : "perfil.html";
}

function voltarInicio() {
    window.location.href = "principal.html";
}
