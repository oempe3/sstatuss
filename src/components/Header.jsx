import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [relogio, setRelogio] = useState('');
  const location = useLocation();

  useEffect(() => {
    const atualizarRelogio = () => {
      const agora = new Date();
      setRelogio(agora.toLocaleString("pt-BR"));
    };

    atualizarRelogio();
    const interval = setInterval(atualizarRelogio, 1000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="header-left">
          <img src="/logomarca.png" alt="Logo Pernambuco III" className="header-logo" />
          <div>
            <div className="header-title">Quadro de Disponibilidade</div>
            <div className="header-subtitle">Sistema de Monitoramento de Equipamentos</div>
          </div>
        </div>
        <div className="header-right">
          <div className="header-time">{relogio}</div>
          <nav className="header-nav">
            <Link 
              to="/status" 
              className={`nav-button ${isActive('/status') ? 'primary' : ''}`}
            >
              Ver Status
            </Link>
            <Link 
              to="/entrada" 
              className={`nav-button ${isActive('/entrada') ? 'primary' : ''}`}
            >
              Atualizar
            </Link>
            <Link 
              to="/csv-update" 
              className={`nav-button ${isActive('/csv-update') ? 'primary' : ''}`}
            >
              Atualizar CSV
            </Link>
            <Link to="/" className="nav-button danger">
              Sair
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

