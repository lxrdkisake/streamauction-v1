export const messages = {
  en: {
    // Navigation
    nav: {
      preparation: 'Preparation',
      library: 'Library',
      auction: 'Auction',
      history: 'History',
      feedback: 'Feedback'
    },
    
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirmation: 'Confirmation',
      yes: 'Yes',
      no: 'No'
    },
    
    // Auction FSM
    auction: {
      status: {
        idle: 'Ready to Configure',
        configured: 'Configured',
        running: 'Running',
        paused: 'Paused',
        finished: 'Finished',
        archived: 'Archived'
      },
      actions: {
        configure: 'Configure Auction',
        start: 'Start Auction',
        pause: 'Pause',
        resume: 'Resume',
        finish: 'Finish',
        archive: 'Archive',
        reset: 'Reset'
      }
    },
    
    // Categories
    categories: {
      games: 'Games',
      movies: 'Movies & Series'
    },
    
    // Modes
    modes: {
      cards: 'Cards',
      roulette: 'Roulette'
    }
  },
  
  ru: {
    // Navigation
    nav: {
      preparation: 'Подготовка',
      library: 'Библиотека',
      auction: 'Аукцион',
      history: 'История',
      feedback: 'Обратная связь'
    },
    
    // Common
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      create: 'Создать',
      search: 'Поиск',
      filter: 'Фильтр',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      confirmation: 'Подтверждение',
      yes: 'Да',
      no: 'Нет'
    },
    
    // Auction FSM
    auction: {
      status: {
        idle: 'Готов к настройке',
        configured: 'Настроен',
        running: 'Идёт',
        paused: 'Пауза',
        finished: 'Завершён',
        archived: 'Архивирован'
      },
      actions: {
        configure: 'Настроить аукцион',
        start: 'Начать аукцион',
        pause: 'Пауза',
        resume: 'Продолжить',
        finish: 'Завершить',
        archive: 'Архивировать',
        reset: 'Сбросить'
      }
    },
    
    // Categories
    categories: {
      games: 'Игры',
      movies: 'Фильмы и сериалы'
    },
    
    // Modes
    modes: {
      cards: 'Карточки',
      roulette: 'Рулетка'
    }
  }
} as const

export type Locale = keyof typeof messages
export type MessageKey = keyof typeof messages.ru

export function useTranslations(locale: Locale = 'ru') {
  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = messages[locale]
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) {
        console.warn(`Missing translation for key: ${key}`)
        return key
      }
    }
    
    return value as string
  }
  
  return { t }
}