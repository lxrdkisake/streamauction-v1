'use client'

import { useState, useEffect } from 'react'
import useAuctionStore, { useTimerRestore } from '@/store/auction'

export default function HomePage() {
  const [contentType, setContentType] = useState('games')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [donationAmount, setDonationAmount] = useState('')
  
  const { 
    lots, 
    mode, 
    subMode, 
    setMode, 
    setSubMode, 
    timer,
    setTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    clearAll
  } = useAuctionStore()

  // Restore timer on mount
  useTimerRestore()

  const lotsList = Object.values(lots)
  const canStartAuction = lotsList.length >= 2

  // Format timer display
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const endpoint = contentType === 'games' ? '/api/library/games' : '/api/library/movies'
      const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data.ok) {
        setSearchResults(data.items || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchQuery, contentType])

  const handleAddItem = (item: any) => {
    const amount = parseInt(donationAmount) || 100
    useAuctionStore.getState().addOrIncrease({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      category: item.category,
      eliminated: false
    }, amount)
    setDonationAmount('')
  }

  const handleTimerSet = () => {
    // Simple timer set - could be enhanced with modal
    const minutes = prompt('Установить таймер (минуты):')
    if (minutes) {
      const mins = parseInt(minutes)
      if (mins > 0) {
        setTimer(0, mins, 0)
      }
    }
  }

  const totalAmount = lotsList.reduce((sum, lot) => sum + lot.sum, 0)

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
                  <button className="set-time-btn" onClick={handleTimerSet}>Set</button>
                </div>
                <div className="timer-display">{formatTime(timer.leftMs)}</div>
                <div className="timer-controls">
                  <button 
                    className="timer-btn" 
                    onClick={timer.running ? pauseTimer : startTimer}
                    disabled={timer.leftMs === 0}
                  >
                    {timer.running ? (
                      <span className="pause-icon">⏸</span>
                    ) : (
                      <span className="play-icon">▶</span>
                    )}
                  </button>
                  <button className="timer-btn" onClick={resetTimer}>⏹</button>
                </div>
              </div>

              {/* Auction Settings */}
              <div className="sidebar-module">
                <div className="settings-title">Настройки аукциона</div>
                
                <div className="control-section">
                  <div className="settings-title">Режим показа</div>
                  <div className="segmented">
                    <button 
                      className={`segmented__btn ${mode === 'cards' ? 'is-active' : ''}`}
                      onClick={() => setMode('cards')}
                    >
                      🃏 Карточки
                    </button>
                    <button 
                      className={`segmented__btn ${mode === 'roulette' ? 'is-active' : ''}`}
                      onClick={() => setMode('roulette')}
                    >
                      🎰 Рулетка
                    </button>
                    <div className="segmented__indicator"></div>
                  </div>
                </div>

                <div className="control-section">
                  <div className="settings-title">Подрежим</div>
                  <div className="segmented">
                    <button 
                      className={`segmented__btn ${subMode === 'instant' ? 'is-active' : ''}`}
                      onClick={() => setSubMode('instant')}
                    >
                      Моментальный
                    </button>
                    <button 
                      className={`segmented__btn ${subMode === 'elimination' ? 'is-active' : ''}`}
                      onClick={() => setSubMode('elimination')}
                    >
                      На выбывание
                    </button>
                    <div className="segmented__indicator"></div>
                  </div>
                </div>
                
                <hr className="section-divider" />
                
                <button 
                  className={`btn-launch btn--lg w-100 ${!canStartAuction ? 'disabled' : ''}`}
                  disabled={!canStartAuction}
                >
                  Начать аукцион
                </button>
                
                <button className="btn-ghost w-100" style={{marginTop: '8px'}} onClick={clearAll}>
                  Сбросить всё
                </button>
              </div>
            </div>
          </div>

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
                  {searchResults.length > 0 && !isSearching && (
                    <div className="search-results-dropdown visible">
                      {searchResults.slice(0, 8).map((item: any) => (
                        <div 
                          key={item.id} 
                          className="search-result-item"
                          onClick={() => handleAddItem(item)}
                        >
                          <img 
                            src={item.imageUrl || '/placeholder.png'} 
                            alt={item.title}
                            className="search-result-thumb"
                          />
                          <div className="search-result-info">
                            <div className="search-result-title">{item.title}</div>
                            <div className="search-result-category">
                              {item.category === 'games' ? '🎮 Игра' : '🎬 Фильм'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Сумма" 
                  min="1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                />
                <button className="btn-launch">Добавить</button>
                <button className="btn-danger" onClick={() => setSearchQuery('')}>Очистить</button>
              </div>
            </div>

            {/* Auction Area */}
            <div className="auction-area">
              <div className="auction-info-header">
                <div className="auction-status">
                  {searchQuery ? 'Результаты поиска' : 'Начните поиск'}
                </div>
                <div id="sub-status-display">
                  {searchQuery 
                    ? `Найдено: ${searchResults.length} результатов`
                    : 'Введите название для поиска в библиотеке'
                  }
                </div>
              </div>
              
              <div className="cards-field-wrapper">
                <div className="cards-field">
                  {searchResults.length === 0 && !isSearching ? (
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
                  ) : (
                    <div className="search-results-grid">
                      {searchResults.map((item: any) => (
                        <div 
                          key={item.id} 
                          className="search-result-card"
                          onClick={() => handleAddItem(item)}
                        >
                          <img 
                            src={item.imageUrl || '/placeholder.png'} 
                            alt={item.title}
                            className="search-result-card-image"
                          />
                          <div className="search-result-card-info">
                            <div className="search-result-card-title">{item.title}</div>
                            <div className="search-result-card-category">
                              {item.category === 'games' ? '🎮' : '🎬'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <span className="gsb-badge">{lotsList.length}</span>
                  </h3>
                  <button className="gsb-clear" title="Очистить список" onClick={clearAll}>
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
                  {lotsList.length === 0 ? (
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
                    lotsList.map((lot) => (
                      <li key={lot.id}>
                        <img 
                          src={lot.imageUrl || '/placeholder.png'} 
                          alt={lot.title} 
                          className="gsb-thumb" 
                        />
                        <span className="gsb-name">{lot.title}</span>
                        <div className="gsb-sum">
                          <span className="gsb-amount">{lot.sum.toLocaleString()} ₽</span>
                        </div>
                        <div className="gsb-actions">
                          <button className="gsb-ico">✏️</button>
                          <button 
                            className="gsb-ico" 
                            data-danger
                            onClick={() => useAuctionStore.getState().remove(lot.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              
              {/* Total Amount */}
              {totalAmount > 0 && (
                <div className="gsb-footer">
                  <div className="gsb-total">
                    Общая сумма: <strong>{totalAmount.toLocaleString()} ₽</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer footer--fixed">
        <div className="container">
          Made with ❤️ for streamers
        </div>
      </footer>
    </>
  )
}