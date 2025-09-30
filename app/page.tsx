'use client'

import { useState, useEffect } from 'react'

export default function HomePage() {
  const [contentType, setContentType] = useState('games')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [items, setItems] = useState([])
  const [timerDisplay, setTimerDisplay] = useState('00:00:00')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [auctionMode, setAuctionMode] = useState('cards')
  const [auctionSubMode, setAuctionSubMode] = useState('instant')

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-container">
            <a href="#" className="logo">StreamAuction</a>
            
            <div className="content-type-selector">
              <button 
                className={`content-type-btn ${contentType === 'games' ? 'active' : ''}`}
                onClick={() => setContentType('games')}
              >
                🎮 Игры
              </button>
              <button 
                className={`content-type-btn ${contentType === 'movies' ? 'active' : ''}`}
                onClick={() => setContentType('movies')}
              >
                🎬 Фильмы и сериалы
              </button>
            </div>
            
            <div className="user-profile">
              <span>Стример</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        <div className="dashboard-layout">
          {/* Left Sidebar */}
          <div className="dashboard-left">
            <div className="sidebar-sticky-content">
              {/* Timer */}
              <div className="sidebar-module">
                <div className="timer-header">
                  <div className="settings-title">Таймер</div>
                  <button className="set-time-btn">Set</button>
                </div>
                <div className="timer-display">{timerDisplay}</div>
                <div className="timer-controls">
                  <button className="timer-btn" id="timer-start-pause">
              {/* Auction Settings */}
              <div className="sidebar-module">
                <div className="settings-title">Настройки аукциона</div>
                
                <div className="control-section">
                  <div className="settings-title">Режим показа</div>
                  <div className="segmented">
                    <button 
                      className={`segmented__btn ${auctionMode === 'cards' ? 'is-active' : ''}`}
                      onClick={() => setAuctionMode('cards')}
                    >
                      🃏 Карточки
                    </button>
                    <button 
                      className={`segmented__btn ${auctionMode === 'roulette' ? 'is-active' : ''}`}
                      onClick={() => setAuctionMode('roulette')}
                    >
                      🎰 Рулетка
                    </button>
                    <div className="segmented__indicator"></div>
                  </div>
                </div>
                    <span className="play-icon">▶</span>
                <div className="control-section">
                  <div className="settings-title">Подрежим</div>
                  <div className="segmented">
                    <button 
                      className={`segmented__btn ${auctionSubMode === 'instant' ? 'is-active' : ''}`}
                      onClick={() => setAuctionSubMode('instant')}
                    >
                      Моментальный
                    </button>
                    <button 
                      className={`segmented__btn ${auctionSubMode === 'elimination' ? 'is-active' : ''}`}
                      onClick={() => setAuctionSubMode('elimination')}
                    >
                      На выбывание
                    </button>
                    <div className="segmented__indicator"></div>
                  </div>
                </div>
                    <span className="pause-icon">⏸</span>
                <hr className="section-divider" />
                
                <button className="btn-launch btn--lg w-100" disabled={items.length < 2}>
                  Начать аукцион
                </button>
                
                <button className="btn-ghost w-100" style={{marginTop: '8px'}}>
                  Сбросить всё
                </button>
              </div>
            </div>
          </div>
                  </button>
          {/* Main Area */}
          <div className="dashboard-main">
            {/* Search Panel */}
            <div className="panel-module top-control-bar">
              <div className="add-item-form">
                <div className="search-field-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Поиск по названию..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isSearching && (
                    <div className="search-results-dropdown visible">
                      <div className="search-loading">Поиск...</div>
                    </div>
                  )}
                </div>
                <input type="number" className="form-input" placeholder="Сумма" min="1" />
                <button className="btn-launch">Добавить</button>
                <button className="btn-danger">Очистить</button>
              </div>
            </div>
                  <button className="timer-btn">⏹</button>
            {/* Auction Area */}
            <div className="auction-area">
              <div className="auction-info-header">
                <div className="auction-status">Начните поиск</div>
                <div id="sub-status-display">Введите название для поиска в библиотеке</div>
              </div>
              
              <div className="cards-field-wrapper">
                <div className="cards-field">
                  {/* Cards will be rendered here */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '300px',
                    color: 'var(--text-muted-color)',
                    fontSize: '1.2rem'
                  }}>
                    🔍 Найдите контент для добавления в аукцион
                  </div>
                </div>
              </div>
            </div>
          </div>
                </div>
          {/* Right Sidebar */}
          <div className="dashboard-right">
            <div className="gsb-panel">
              <div className="gsb-header">
                <div className="gsb-header-row">
                  <h3 className="gsb-title">
                    📋 Список лотов
                    <span className="gsb-badge">{items.length}</span>
                  </h3>
                  <button className="gsb-clear" title="Очистить список">
                    🗑️
                  </button>
                </div>
                
                <div className="gsb-search">
                  <div className="gsb-search-wrap">
                    <input
                      type="text"
                      className="gsb-input"
                      placeholder="Поиск по названию..."
                    />
                    <button className="gsb-input-clear">×</button>
                  </div>
                </div>
              </div>
              
              <div className="gsb-scroll">
                <ul className="gsb-list">
                  {items.length === 0 ? (
                    <li style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '2rem 1rem',
                      color: 'var(--text-muted-color)'
                    }}>
                      📝 Список пуст<br />
                      <small>Добавьте лоты из библиотеки</small>
                    </li>
                  ) : (
                    items.map((item, index) => (
                      <li key={index}>
                        <img src="/placeholder.png" alt="" className="gsb-thumb" />
                        <span className="gsb-name">Пример лота</span>
                        <div className="gsb-sum">
                          <span className="gsb-amount">100 ₽</span>
                        </div>
                        <div className="gsb-actions">
                          <button className="gsb-ico">✏️</button>
                          <button className="gsb-ico" data-danger>🗑️</button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
              </div>
      {/* Footer */}
      <footer className="footer footer--fixed">
        <div className="container">
          Made with ❤️ for streamers
        </div>
      </footer>
    </>
  )
}