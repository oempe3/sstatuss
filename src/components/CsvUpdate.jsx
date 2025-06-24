import React, { useState, useEffect } from 'react';
import Header from './Header';

const CsvUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // const endpoint = "https://script.google.com/macros/s/AKfycbwSwlJATYl9L0GHOwNrGzRnhRsrNbaZedUd0lLGujwiF4noP8xHP8dUH9SrfVh7fAi0Sw/exec";
const endpoint = "https://script.google.com/macros/s/AKfycbxl3vJCyPH_VUfg-Tls3ySsmclMZaR9mYOjeAhq3WuLvtt71FLk-ZuuXcAzsc9jLscQuQ/exec"
  const handleSubmit = (e) => {
    e.preventDefault();
    handleCsvUpload();
  };

  const handleCsvUpload = async () => {
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];

    if (!file) {
      mostrarMensagem("Por favor, selecione um arquivo CSV para upload.", "error");
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      mostrarMensagem("Por favor, selecione apenas arquivos .csv", "error");
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const csvText = e.target.result;
        const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== "");
        
        if (lines.length < 2) {
          throw new Error("O arquivo CSV deve conter pelo menos um cabeçalho e uma linha de dados.");
        }

        const headers = lines[0].split(",").map(h => h.trim());
        const expectedHeaders = ["TAG", "STATUS", "MOTIVO", "PTS", "OS", "RETORNO", "CADEADO", "OBSERVACOES", "MODIFICADO_POR", "DATA"];
        
        if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
          throw new Error(`Cabeçalhos incorretos. Esperado: ${expectedHeaders.join(",")}. Encontrado: ${headers.join(",")}`);
        }

        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",");
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : "";
          });
          data.push(row);
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            type: "full_replace",
            data: data 
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          mostrarMensagem(`Planilha substituída com sucesso! ${data.length} registros foram carregados.`, "success");
          fileInput.value = "";
        } else {
          throw new Error(result.error || "Erro desconhecido ao processar o CSV");
        }
      } catch (error) {
        console.error("Erro ao processar CSV:", error);
        mostrarMensagem(`Erro ao processar CSV: ${error.message}`, "error");
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = function() {
      mostrarMensagem("Erro ao ler o arquivo CSV.", "error");
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

  const mostrarMensagem = (texto, tipo) => {
    setMensagem({ texto, tipo });
    setTimeout(() => {
      setMensagem('');
    }, 8000);
  };

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="page-title">Atualização Completa via CSV</div>
        <div className="page-description">Faça o upload de um arquivo CSV para substituir completamente todos os dados da planilha no Google Drive.</div>
        
        <div className="form-grid">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Upload de Arquivo CSV</div>
              <div className="card-description">Selecione um arquivo CSV com os dados dos equipamentos. <strong>Atenção:</strong> Todos os dados existentes serão substituídos.</div>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="csvFile">Selecione o arquivo CSV</label>
                  <input type="file" id="csvFile" className="form-input" accept=".csv" required />
                  <div className="form-help">Apenas arquivos .csv são aceitos</div>
                </div>

                <div className="form-group">
                  <div className="alert alert-warning">
                    <strong>⚠️ Aviso Importante:</strong> Esta operação irá substituir completamente todos os dados existentes na planilha do Google Drive. Certifique-se de que o arquivo CSV contém todos os dados necessários.
                  </div>
                </div>

                <button type="submit" className="form-button full-width" disabled={loading}>
                  <span style={{ display: loading ? 'none' : 'inline' }}>
                    Substituir Planilha Completa
                  </span>
                  <div className="loading-spinner" style={{ display: loading ? 'inline-block' : 'none' }}></div>
                </button>
                
                {mensagem && (
                  <div className={`message ${mensagem.tipo}`} style={{ display: 'block' }}>
                    {mensagem.texto}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Formato Obrigatório do CSV</div>
              <div className="card-description">O arquivo CSV deve seguir exatamente este formato:</div>
            </div>
            <div className="card-content">
              <pre className="code-block">TAG,STATUS,MOTIVO,PTS,OS,RETORNO,CADEADO,OBSERVACOES,MODIFICADO_POR,DATA</pre>
              <div className="form-help">
                <p><strong>Instruções importantes:</strong></p>
                <ul>
                  <li>A primeira linha deve conter exatamente esses cabeçalhos</li>
                  <li>Não altere a ordem ou os nomes dos cabeçalhos</li>
                  <li>Campos vazios podem ser deixados em branco, mas as vírgulas devem ser mantidas</li>
                  <li>Datas devem estar no formato ISO (YYYY-MM-DDTHH:MM:SS)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Exemplo de Dados</div>
              <div className="card-description">Exemplo de como os dados devem aparecer no CSV:</div>
            </div>
            <div className="card-content">
              <pre className="code-block">
{`TAG,STATUS,MOTIVO,PTS,OS,RETORNO,CADEADO,OBSERVACOES,MODIFICADO_POR,DATA
EQP001,OPE,,,,,,,Admin,2025-06-19T15:00:00
EQP002,ST-BY,Conveniencia operacional,,,,,,Admin,2025-06-19T15:00:00
EQP003,MANU,Manutencao preventiva,123,OS-001,2025-06-20T10:00,CADEADO-A,Teste,Admin,2025-06-19T15:00:00`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CsvUpdate;

