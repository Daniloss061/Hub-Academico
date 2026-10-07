
const formulario = document.getElementById("formLogin");

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const mensagem = document.getElementById("mensagem");

    if (email.trim() === "" || senha.trim() === "") {
        mensagem.textContent = "Preencha todos os campos.";
        return;
    }

    mensagem.textContent = "Login realizado!";

    setTimeout(function() {
        window.location.href = "principal.html";
    }, 500);
});