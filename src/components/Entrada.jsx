import React, { useState, useEffect } from 'react';
import Header from './Header';

const Entrada = () => {
  const [equipamentosData, setEquipamentosData] = useState([]);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [formData, setFormData] = useState({
    dispositivo: '',
    status: '',
    motivoStandby: '',
    motivoManutencao: '',
    pts: '',
    os: '',
    retorno: '',
    cadeado: '',
    observacoes: '',
    modificadoPor: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [registros, setRegistros] = useState([]);

  const endpoint = "https://script.google.com/macros/s/AKfycbwSwlJATYl9L0GHOwNrGzRnhRsrNbaZedUd0lLGujwiF4noP8xHP8dUH9SrfVh7fAi0Sw/exec";

  useEffect(() => {
    carregarEquipamentosDoSheet();
    carregarRegistros();
    const interval = setInterval(carregarRegistros, 30000);
    return () => clearInterval(interval);
  }, []);

  const carregarEquipamentosDoSheet = async () => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setEquipamentosData(data);
    } catch (error) {
      console.error("Erro ao carregar equipamentos do Google Sheet:", error);
      mostrarMensagem("Erro ao carregar a lista de equipamentos. Verifique sua conexão ou a configuração do Google Sheet.", "error");
    }
  };

  const carregarDadosEquipamento = (tag) => {
    if (tag) {
      const equipamento = equipamentosData.find(e => e.TAG === tag);
      if (equipamento) {
        setEquipamentoSelecionado(equipamento);
        setFormData({
          dispositivo: tag,
          status: equipamento.STATUS || '',
          motivoStandby: equipamento.STATUS === 'ST-BY' ? (equipamento.MOTIVO || '') : '',
          motivoManutencao: equipamento.STATUS === 'MANU' ? (equipamento.MOTIVO || '') : '',
          pts: equipamento.PTS || '',
          os: equipamento.OS || '',
          retorno: equipamento.RETORNO ? new Date(equipamento.RETORNO).toISOString().slice(0,16) : '',
          cadeado: equipamento.CADEADO || '',
          observacoes: equipamento.OBSERVACOES || '',
          modificadoPor: equipamento.MODIFICADO_POR || 'admin'
        });
      }
    } else {
      setEquipamentoSelecionado(null);
      setFormData({
        ...formData,
        dispositivo: '',
        status: '',
        motivoStandby: '',
        motivoManutencao: '',
        pts: '',
        os: '',
        retorno: '',
        cadeado: '',
        observacoes: ''
      });
    }
  };

  const carregarRegistros = async () => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setRegistros(data.slice(0, 10));
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    salvarEquipamento();
  };

  const salvarEquipamento = async () => {
    if (!formData.dispositivo || !equipamentoSelecionado) {
      mostrarMensagem("Por favor, selecione um equipamento.", "error");
      return;
    }
    
    if (!formData.status) {
      mostrarMensagem("Por favor, selecione um status.", "error");
      return;
    }
    
    setLoading(true);
    
    let motivo = "";
    if (formData.status === "ST-BY") {
      motivo = formData.motivoStandby || "";
    } else if (formData.status === "MANU") {
      motivo = formData.motivoManutencao || "";
    }
    
    const dados = {
      type: "update_row",
      TAG: formData.dispositivo,
      STATUS: formData.status,
      MOTIVO: motivo,
      PTS: formData.pts || "",
      OS: formData.os || "",
      RETORNO: formData.retorno || "",
      CADEADO: formData.cadeado || "",
      OBSERVACOES: formData.observacoes || "",
      MODIFICADO_POR: formData.modificadoPor || "admin",
      DATA: new Date().toISOString()
    };
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        mostrarMensagem("Equipamento atualizado com sucesso!", "success");
        await carregarEquipamentosDoSheet();
        carregarRegistros();
        carregarDadosEquipamento(formData.dispositivo);
      } else {
        mostrarMensagem(`Erro ao atualizar equipamento: ${result.error || "Erro desconhecido"}`, "error");
      }
      
    } catch (error) {
      console.error("Erro:", error);
      mostrarMensagem("Erro ao atualizar equipamento. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensagem = (texto, tipo) => {
    setMensagem({ texto, tipo });
    setTimeout(() => {
      setMensagem('');
    }, 5000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="page-title">Atualização de Status dos Equipamentos</div>
        <div className="page-description">Atualize o status dos equipamentos em tempo real com sincronização automática</div>
        
        <div className="form-grid">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Formulário de Atualização</div>
              <div className="card-description">Selecione um equipamento e edite suas informações</div>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="dispositivo">Selecione o Equipamento</label>
                  <select 
                    id="dispositivo" 
                    className="form-select" 
                    value={formData.dispositivo}
                    onChange={(e) => {
                      handleInputChange('dispositivo', e.target.value);
                      carregarDadosEquipamento(e.target.value);
                    }}
                    required
                  >
                    <option value="">-- Selecione um equipamento --</option>
                    {equipamentosData.map(equip => (
                      <option key={equip.TAG} value={equip.TAG}>{equip.TAG}</option>
                    ))}
                  </select>
                </div>

                {equipamentoSelecionado && (
                  <div id="dados-equipamento">
                    <div className="form-group">
                      <label className="form-label" htmlFor="status">Status</label>
                      <select 
                        id="status" 
                        className="form-select" 
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        required
                      >
                        <option value="">-- Selecione o status --</option>
                        <option value="OPE">Em Operação</option>
                        <option value="ST-BY">Em Stand-by</option>
                        <option value="MANU">Em Manutenção</option>
                      </select>
                    </div>

                    {formData.status === 'ST-BY' && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="motivo">Motivo do Stand-by</label>
                        <select 
                          id="motivo-standby" 
                          className="form-select"
                          value={formData.motivoStandby}
                          onChange={(e) => handleInputChange('motivoStandby', e.target.value)}
                        >
                          <option value="">-- Selecione o motivo --</option>
                          <option value="Conveniencia operacional">Conveniência operacional</option>
                          <option value="Conveniencia do sistema">Conveniência do sistema</option>
                        </select>
                      </div>
                    )}

                    {formData.status === 'MANU' && (
                      <div className="form-group">
                        <label className="form-label" htmlFor="motivo-manutencao">Motivo da Manutenção</label>
                        <input 
                          type="text" 
                          id="motivo-manutencao" 
                          className="form-input" 
                          placeholder="Digite o motivo da manutenção"
                          value={formData.motivoManutencao}
                          onChange={(e) => handleInputChange('motivoManutencao', e.target.value)}
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label" htmlFor="pts">Nº da PTS</label>
                      <input 
                        type="text" 
                        id="pts" 
                        className="form-input" 
                        placeholder="Digite o número da PTS"
                        value={formData.pts}
                        onChange={(e) => handleInputChange('pts', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="os">Nº da OS</label>
                      <input 
                        type="text" 
                        id="os" 
                        className="form-input" 
                        placeholder="Digite o número da OS"
                        value={formData.os}
                        onChange={(e) => handleInputChange('os', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="retorno">Previsão de retorno</label>
                      <input 
                        type="datetime-local" 
                        id="retorno" 
                        className="form-input"
                        value={formData.retorno}
                        onChange={(e) => handleInputChange('retorno', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cadeado">Nº do Cadeado</label>
                      <input 
                        type="text" 
                        id="cadeado" 
                        className="form-input" 
                        placeholder="Digite o número do cadeado"
                        value={formData.cadeado}
                        onChange={(e) => handleInputChange('cadeado', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="observacoes">Observações (Máx. 100 caracteres)</label>
                      <textarea 
                        id="observacoes" 
                        className="form-textarea" 
                        maxLength="100" 
                        rows="3" 
                        placeholder="Adicione observações sobre o status..."
                        value={formData.observacoes}
                        onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="modificado_por">Modificado por</label>
                      <input 
                        type="text" 
                        id="modificado_por" 
                        className="form-input" 
                        placeholder="Nome do responsável pela modificação"
                        value={formData.modificadoPor}
                        onChange={(e) => handleInputChange('modificadoPor', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="form-button full-width" disabled={loading}>
                  <span style={{ display: loading ? 'none' : 'inline' }}>
                    Atualizar Equipamento
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
              <div className="card-title">Registro de Modificações</div>
              <div className="card-description">Histórico das últimas atualizações realizadas</div>
            </div>
            <div className="card-content">
              <div id="registro-lista">
                {registros.length === 0 ? (
                  <p className="text-center text-sm" style={{ color: 'var(--gray-500)' }}>
                    Nenhuma modificação registrada ainda.
                  </p>
                ) : (
                  registros.map((registro, index) => (
                    <div key={index} className="equipamento-card" style={{ marginBottom: 'var(--spacing-4)' }}>
                      <div className="equipamento-header">
                        <div className="equipamento-nome">{registro.TAG || "N/A"}</div>
                        <span className={`status-badge ${(registro.STATUS || "").toLowerCase()}`}>
                          {registro.STATUS || "N/A"}
                        </span>
                      </div>
                      <div className="equipamento-detalhes">
                        {registro.MOTIVO && (
                          <div className="equipamento-detail">
                            <span className="detail-label">Motivo:</span>
                            <span className="detail-value">{registro.MOTIVO}</span>
                          </div>
                        )}
                        {registro.PTS && (
                          <div className="equipamento-detail">
                            <span className="detail-label">PTS:</span>
                            <span className="detail-value">{registro.PTS}</span>
                          </div>
                        )}
                        {registro.OS && (
                          <div className="equipamento-detail">
                            <span className="detail-label">OS:</span>
                            <span className="detail-value">{registro.OS}</span>
                          </div>
                        )}
                        {registro.OBSERVACOES && (
                          <div className="equipamento-detail">
                            <span className="detail-label">Observações:</span>
                            <span className="detail-value">{registro.OBSERVACOES}</span>
                          </div>
                        )}
                      </div>
                      <div className="equipamento-footer">
                        Por: {registro.MODIFICADO_POR || "N/A"} • {registro.DATA ? new Date(registro.DATA).toLocaleString("pt-BR") : "N/A"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Entrada;

