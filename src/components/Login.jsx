import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    entrar();
  };

  const entrar = () => {
    const loginValue = login.toLowerCase().trim();
    
    // Limpar mensagem anterior
    setMensagem('');
    
    // Mostrar loading
    setLoading(true);
    
    // Simular delay de autenticação
    setTimeout(() => {
      if (loginValue === "admin" && senha === "admin") {
        setMensagem("Login realizado com sucesso!");
        setTimeout(() => {
          navigate('/entrada');
        }, 1000);
      } else if (loginValue === "operador" && senha === "operador") {
        setMensagem("Login realizado com sucesso!");
        setTimeout(() => {
          navigate('/status');
        }, 1000);
      } else {
        setMensagem("Usuário ou senha inválidos.");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <img src="/logomarca.png" alt="Logo Pernambuco III" className="logo" />
          <h1 className="system-title">Quadro de Disponibilidade</h1>
          <p className="system-subtitle">Sistema de Monitoramento de Equipamentos</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="login" className="input-label">Usuário</label>
            <input 
              type="text" 
              id="login" 
              className="input-field" 
              placeholder="Digite seu usuário" 
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="senha" className="input-label">Senha</label>
            <input 
              type="password" 
              id="senha" 
              className="input-field" 
              placeholder="Digite sua senha" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            <span className="button-text" style={{ display: loading ? 'none' : 'block' }}>
              Entrar
            </span>
            <div className="button-loader" style={{ display: loading ? 'block' : 'none' }}></div>
          </button>
          
          {mensagem && (
            <div className={`message ${mensagem.includes('sucesso') ? 'success-message' : 'error-message show'}`}>
              {mensagem}
            </div>
          )}
        </form>
        
        <div className="login-footer">
          <p>Sistema desenvolvido para monitoramento em tempo real</p>
        </div>
      </div>
      
      <div className="background-pattern"></div>
    </div>
  );
};

export default Login;

