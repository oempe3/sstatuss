import React, { useState, useEffect } from 'react';
import Header from './Header';

const Status = () => {
  const [equipamentosData, setEquipamentosData] = useState([]);
  const [equipamentosFiltrados, setEquipamentosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState('');
  const [filtros, setFiltros] = useState({
    busca: '',
    status: ''
  });
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    operacao: 0,
    standby: 0,
    manutencao: 0
  });

  const endpoint = "https://script.google.com/macros/s/AKfycbwSwlJATYl9L0GHOwNrGzRnhRsrNbaZedUd0lLGujwiF4noP8xHP8dUH9SrfVh7fAi0Sw/exec";

  useEffect(() => {
    carregarEquipamentos();
    const interval = setInterval(carregarEquipamentos, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [equipamentosData, filtros]);

  const carregarEquipamentos = async () => {
    if (!loading) {
      setRefreshLoading(true);
    }
    
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setEquipamentosData(data);
      atualizarEstatisticas(data);
      atualizarUltimaAtualizacao();
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const aplicarFiltros = () => {
    const { busca, status } = filtros;
    
    const filtrados = equipamentosData.filter(equip => {
      const matchBusca = !busca || 
        (equip.TAG && equip.TAG.toLowerCase().includes(busca.toLowerCase())) ||
        (equip.NOME && equip.NOME.toLowerCase().includes(busca.toLowerCase()));
      
      const matchStatus = !status || equip.STATUS === status;
      
      return matchBusca && matchStatus;
    });
    
    setEquipamentosFiltrados(filtrados);
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      status: ''
    });
  };

  const atualizarEstatisticas = (data) => {
    const total = data.length;
    const operacao = data.filter(e => e.STATUS === "OPE").length;
    const standby = data.filter(e => e.STATUS === "ST-BY").length;
    const manutencao = data.filter(e => e.STATUS === "MANU").length;
    
    setEstatisticas({
      total,
      operacao,
      standby,
      manutencao
    });
  };

  const atualizarUltimaAtualizacao = () => {
    const agora = new Date();
    setUltimaAtualizacao(agora.toLocaleString("pt-BR"));
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="main-container">
          <div id="loading-container" className="text-center" style={{ padding: 'var(--spacing-8)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto var(--spacing-4)' }}></div>
            <div style={{ color: 'var(--gray-600)' }}>Carregando equipamentos...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="page-title">Status dos Equipamentos</div>
        <div className="page-description">Monitoramento em tempo real do status de todos os equipamentos</div>
        
        <div className="card mb-4">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm" style={{ color: 'var(--gray-600)' }}>Última atualização</div>
                <div className="font-medium">{ultimaAtualizacao || 'Carregando...'}</div>
              </div>
              <button onClick={carregarEquipamentos} className="form-button" disabled={refreshLoading}>
                <span style={{ display: refreshLoading ? 'none' : 'inline' }}>Atualizar</span>
                <div className="loading-spinner" style={{ display: refreshLoading ? 'inline-block' : 'none' }}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="card mb-4" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%)', color: 'white' }}>
          <div className="card-content">
            <div className="flex items-center gap-6">
              <div className="text-center" style={{ flex: 1 }}>
                <div className="text-3xl font-bold" style={{ color: 'white' }}>{estatisticas.total}</div>
                <div className="text-sm opacity-90">Total de Equipamentos</div>
              </div>
              <div className="text-center" style={{ flex: 1 }}>
                <div className="text-3xl font-bold" style={{ color: '#10b981' }}>{estatisticas.operacao}</div>
                <div className="text-sm opacity-90">Em Operação</div>
              </div>
              <div className="text-center" style={{ flex: 1 }}>
                <div className="text-3xl font-bold" style={{ color: '#f59e0b' }}>{estatisticas.standby}</div>
                <div className="text-sm opacity-90">Stand-by</div>
              </div>
              <div className="text-center" style={{ flex: 1 }}>
                <div className="text-3xl font-bold" style={{ color: '#ef4444' }}>{estatisticas.manutencao}</div>
                <div className="text-sm opacity-90">Em Manutenção</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <div className="card-content">
            <div className="modern-filters">
              <div className="filter-group">
                <div className="filter-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  Buscar
                </div>
                <input 
                  type="text" 
                  className="modern-input" 
                  placeholder="Digite o nome do equipamento..."
                  value={filtros.busca}
                  onChange={(e) => handleFiltroChange('busca', e.target.value)}
                />
              </div>
              
              <div className="filter-group">
                <div className="filter-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
                  </svg>
                  Status
                </div>
                <select 
                  className="modern-select"
                  value={filtros.status}
                  onChange={(e) => handleFiltroChange('status', e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="OPE">🟢 Em Operação</option>
                  <option value="ST-BY">🟡 Stand-by</option>
                  <option value="MANU">🔴 Em Manutenção</option>
                </select>
              </div>

              <div className="filter-actions">
                <button onClick={limparFiltros} className="filter-clear-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                  Limpar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {equipamentosFiltrados.length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--spacing-8)' }}>
            <div style={{ color: 'var(--gray-500)' }}>Nenhum equipamento encontrado com os filtros aplicados.</div>
          </div>
        ) : (
          <div className="equipamentos-grid">
            {equipamentosFiltrados.map((equip, index) => (
              <div key={index} className="equipamento-card fade-in">
                <div className="equipamento-header">
                  <div className="equipamento-nome">{equip.TAG || "N/A"}</div>
                  <span className={`status-badge ${(equip.STATUS || "").toLowerCase().replace("-", "")}`}>
                    {equip.STATUS || "N/A"}
                  </span>
                </div>
                <div className="equipamento-detalhes">
                  {equip.MOTIVO && (
                    <div className="equipamento-detail">
                      <span className="detail-label">Motivo:</span>
                      <span className="detail-value">{equip.MOTIVO}</span>
                    </div>
                  )}
                  {equip.PTS && (
                    <div className="equipamento-detail">
                      <span className="detail-label">PTS:</span>
                      <span className="detail-value">{equip.PTS}</span>
                    </div>
                  )}
                  {equip.OS && (
                    <div className="equipamento-detail">
                      <span className="detail-label">OS:</span>
                      <span className="detail-value">{equip.OS}</span>
                    </div>
                  )}
                  {equip.RETORNO && (
                    <div className="equipamento-detail">
                      <span className="detail-label">Retorno:</span>
                      <span className="detail-value">{new Date(equip.RETORNO).toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                  {equip.CADEADO && (
                    <div className="equipamento-detail">
                      <span className="detail-label">Cadeado:</span>
                      <span className="detail-value">{equip.CADEADO}</span>
                    </div>
                  )}
                  {equip.OBSERVACOES && (
                    <div className="equipamento-detail">
                      <span className="detail-label">Observações:</span>
                      <span className="detail-value">{equip.OBSERVACOES}</span>
                    </div>
                  )}
                </div>
                <div className="equipamento-footer">
                  {equip.MODIFICADO_POR && `Por: ${equip.MODIFICADO_POR}`} 
                  {equip.DATA && ` • ${new Date(equip.DATA).toLocaleString("pt-BR")}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Status;

