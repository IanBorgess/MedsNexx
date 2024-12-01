let trilho = document.getElementById('trilho');
let body = document.querySelector('body');
let header = document.querySelector('header');
let footer = document.querySelector('footer');
let button = document.querySelector('button');
let somos = document.querySelector('.somos');

// Função para ativar o modo escuro
const enableDarkMode = () => {
    trilho.classList.add('dark');
    body.classList.add('dark');
    if (header) header.classList.add('dark');
    if (footer) footer.classList.add('dark');
    if (button) button.classList.add('dark');
    if (somos) somos.classList.add('dark'); 
    localStorage.setItem('darkMode', 'enabled'); 
}

// Função para desativar o modo escuro
const disableDarkMode = () => {
    trilho.classList.remove('dark');
    body.classList.remove('dark');
    if (header) header.classList.remove('dark');
    if (footer) footer.classList.remove('dark');
    if (button) button.classList.remove('dark');
    if (somos) somos.classList.remove('dark'); 
    localStorage.setItem('darkMode', 'disabled'); 
}

// Verifica se o modo escuro ja ta ativo no localStorage
if (localStorage.getItem('darkMode') === 'enabled') {
    enableDarkMode(); 
} else {
    disableDarkMode(); 
}

// Alterna o modo escuro/claro ao clicar no botao de joadson
trilho.addEventListener('click', () => {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        disableDarkMode(); 
    } else {
        enableDarkMode(); 
    }
});

//esse e o localstorage. NAO MEXA//

// Aguarda o carregamento completo do DOM
document.getElementById("consul-agendar").addEventListener("submit", async function (e) {
    e.preventDefault(); // Previne o reload da página

    // Captura os valores do formulário
    const nomePaciente = document.getElementById("textNomeP").value;
    const nomeDoutor = document.getElementById("selectNomeD").value;
    const data = document.getElementById("dtpDataNascimento").value;
    const descricao = document.getElementById("des_consul").value;

    // Verifica se todos os campos estão preenchidos
    if (!nomePaciente || !nomeDoutor || !data) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    try {
        // Envia os dados para o backend
        const response = await fetch("https://crud-medicos.vercel.app/api/appointments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nomePaciente,
                nomeDoutor,
                data,
                descricao,
            }),
        });

        if (response.ok) {
            alert("Consulta agendada com sucesso!");
            // Limpa o formulário
            document.getElementById("consul-agendar").reset();
        } else {
            const error = await response.json();
            alert("Erro ao agendar consulta: " + error.message);
        }
    } catch (err) {
        alert("Erro de conexão com o servidor: " + err.message);
    }
});

//Lista as consultas na página
// 1. Buscar consultas por nome do paciente
document.getElementById("buscarConsulta").addEventListener("click", async () => {
    const nomePaciente = document.getElementById("buscaPaciente").value;
  
    if (!nomePaciente) {
      alert("Por favor, insira o nome do paciente.");
      return;
    }
  
    try {
      const response = await fetch(`https://crud-medicos.vercel.app/api/appointments/search?nomePaciente=${nomePaciente}`);
      if (response.ok) {
        const consultas = await response.json();
        preencherTabela(consultas);
      } else {
        alert("Erro ao buscar consultas.");
      }
    } catch (err) {
      alert("Erro de conexão com o servidor: " + err.message);
    }
  });
  
  // 2. Preencher tabela com consultas
  function preencherTabela(consultas) {
    const tableBody = document.querySelector("#consultasTable tbody");
    tableBody.innerHTML = ""; // Limpa a tabela antes de preenchê-la
  
    consultas.forEach((consulta) => {
      const row = document.createElement("tr");
  
      row.innerHTML = `
        <td>${consulta.nomePaciente}</td>
        <td>${consulta.nomeDoutor}</td>
        <td>${new Date(consulta.data).toLocaleDateString()}</td>
        <td>${consulta.descricao}</td>
        <td>
          <button onclick="prepararEdicao('${consulta._id}', '${consulta.nomePaciente}', '${consulta.nomeDoutor}', '${consulta.data}', '${consulta.descricao}')">Editar</button>
          <button onclick="deletarConsulta('${consulta._id}')">Excluir</button>
        </td>
      `;
  
      tableBody.appendChild(row);
    });
  }
  
  // 3. Preparar formulário de edição
  function prepararEdicao(id, nomePaciente, nomeDoutor, data, descricao) {
    const formDiv = document.getElementById("editarConsulta");
    formDiv.style.display = "block";
  
    document.getElementById("editarConsultaId").value = id;
    document.getElementById("editarNomePaciente").value = nomePaciente;
    document.getElementById("editarNomeDoutor").value = nomeDoutor;
    document.getElementById("editarData").value = new Date(data).toISOString().split("T")[0];
    document.getElementById("editarDescricao").value = descricao;
  }
  
  // 4. Submeter edição (PUT)
  document.getElementById("editarConsultaForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const id = document.getElementById("editarConsultaId").value;
    const nomePaciente = document.getElementById("editarNomePaciente").value;
    const nomeDoutor = document.getElementById("editarNomeDoutor").value;
    const data = document.getElementById("editarData").value;
    const descricao = document.getElementById("editarDescricao").value;
  
    try {
      const response = await fetch(`https://crud-medicos.vercel.app/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nomePaciente, nomeDoutor, data, descricao }),
      });
  
      if (response.ok) {
        alert("Consulta atualizada com sucesso!");
        document.getElementById("editarConsulta").style.display = "none";
        document.getElementById("editarConsultaForm").reset();
        const nomePacienteBusca = document.getElementById("buscaPaciente").value;
        buscarConsultasPorNome(nomePacienteBusca); // Atualiza a lista
      } else {
        alert("Erro ao atualizar consulta.");
      }
    } catch (err) {
      alert("Erro de conexão com o servidor: " + err.message);
    }
  });
  
  // 5. Deletar consulta (DELETE)
  async function deletarConsulta(id) {
    if (confirm("Tem certeza que deseja excluir esta consulta?")) {
      try {
        const response = await fetch(`https://crud-medicos.vercel.app/api/appointments/${id}`, {
          method: "DELETE",
        });
  
        if (response.ok) {
          alert("Consulta excluída com sucesso!");
          const nomePacienteBusca = document.getElementById("buscaPaciente").value;
          buscarConsultasPorNome(nomePacienteBusca); // Atualiza a lista
        } else {
          alert("Erro ao excluir consulta.");
        }
      } catch (err) {
        alert("Erro de conexão com o servidor: " + err.message);
      }
    }
  }
  

  // Carrega as consultas ao iniciar a página
  document.addEventListener("DOMContentLoaded", listarConsultas);

// Lista de médicos da página "Médicos"
document.addEventListener("DOMContentLoaded", () => {
    const medicos = [
        "Dr. Diogo Sossai Pires",
        "Dra. Angelina Ernesto D. Souza",
        "Dra. Emília Colares",
        "Dr. Gabriel Pereira Dantas"
    ];

    // Salva a lista de médicos no localStorage
    localStorage.setItem("medicos", JSON.stringify(medicos));
});



document.addEventListener("DOMContentLoaded", () => {
    const selectNomeD = document.getElementById("selectNomeD");

    // Carrega a lista de médicos do localStorage
    const medicos = JSON.parse(localStorage.getItem("medicos")) || [];

    // Adiciona cada médico como uma opção no dropdown
    medicos.forEach((medico) => {
        const option = document.createElement("option");
        option.value = medico;
        option.textContent = medico;
        selectNomeD.appendChild(option);
    });
});

document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault(); // Impede o envio padrão para processar manualmente
    alert("Formulário enviado com sucesso!");
  });
