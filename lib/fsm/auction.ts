/**
 * Finite State Machine для управления состояниями аукциона
 * 
 * Допустимые переходы:
 * idle → configured → running → paused → running|finished → archived
 * 
 * События: configure, start, pause, resume, finish, archive, reset
 */

export type AuctionStatus = 'idle' | 'configured' | 'running' | 'paused' | 'finished' | 'archived'

export type AuctionEvent = 'configure' | 'start' | 'pause' | 'resume' | 'finish' | 'archive' | 'reset'

export interface AuctionFSMState {
  status: AuctionStatus
  allowedEvents: AuctionEvent[]
  allowedTransitions: AuctionStatus[]
}

/**
 * Определение состояний FSM и допустимых переходов
 */
export const AUCTION_FSM_STATES: Record<AuctionStatus, AuctionFSMState> = {
  idle: {
    status: 'idle',
    allowedEvents: ['configure'],
    allowedTransitions: ['configured']
  },
  configured: {
    status: 'configured',
    allowedEvents: ['start', 'reset'],
    allowedTransitions: ['running', 'idle']
  },
  running: {
    status: 'running',
    allowedEvents: ['pause', 'finish'],
    allowedTransitions: ['paused', 'finished']
  },
  paused: {
    status: 'paused',
    allowedEvents: ['resume', 'finish'],
    allowedTransitions: ['running', 'finished']
  },
  finished: {
    status: 'finished',
    allowedEvents: ['archive', 'reset'],
    allowedTransitions: ['archived', 'idle']
  },
  archived: {
    status: 'archived',
    allowedEvents: [],
    allowedTransitions: []
  }
}

/**
 * Проверяет, допустим ли переход из текущего состояния в целевое
 */
export function isTransitionAllowed(
  currentStatus: AuctionStatus,
  targetStatus: AuctionStatus
): boolean {
  const currentState = AUCTION_FSM_STATES[currentStatus]
  return currentState.allowedTransitions.includes(targetStatus)
}

/**
 * Проверяет, допустимо ли событие для текущего состояния
 */
export function isEventAllowed(
  currentStatus: AuctionStatus,
  event: AuctionEvent
): boolean {
  const currentState = AUCTION_FSM_STATES[currentStatus]
  return currentState.allowedEvents.includes(event)
}

/**
 * Возвращает целевое состояние для события
 */
export function getTargetStatus(
  currentStatus: AuctionStatus,
  event: AuctionEvent
): AuctionStatus | null {
  if (!isEventAllowed(currentStatus, event)) {
    return null
  }

  const transitions: Record<AuctionStatus, Record<AuctionEvent, AuctionStatus>> = {
    idle: {
      configure: 'configured',
      start: 'idle', // Invalid
      pause: 'idle', // Invalid
      resume: 'idle', // Invalid
      finish: 'idle', // Invalid
      archive: 'idle', // Invalid
      reset: 'idle'
    },
    configured: {
      configure: 'configured', // Invalid
      start: 'running',
      pause: 'configured', // Invalid
      resume: 'configured', // Invalid
      finish: 'configured', // Invalid
      archive: 'configured', // Invalid
      reset: 'idle'
    },
    running: {
      configure: 'running', // Invalid
      start: 'running', // Invalid
      pause: 'paused',
      resume: 'running', // Invalid
      finish: 'finished',
      archive: 'running', // Invalid
      reset: 'running' // Invalid
    },
    paused: {
      configure: 'paused', // Invalid
      start: 'paused', // Invalid
      pause: 'paused', // Invalid
      resume: 'running',
      finish: 'finished',
      archive: 'paused', // Invalid
      reset: 'paused' // Invalid
    },
    finished: {
      configure: 'finished', // Invalid
      start: 'finished', // Invalid
      pause: 'finished', // Invalid
      resume: 'finished', // Invalid
      finish: 'finished', // Invalid
      archive: 'archived',
      reset: 'idle'
    },
    archived: {
      configure: 'archived', // Invalid
      start: 'archived', // Invalid
      pause: 'archived', // Invalid
      resume: 'archived', // Invalid
      finish: 'archived', // Invalid
      archive: 'archived', // Invalid
      reset: 'archived' // Invalid
    }
  }

  return transitions[currentStatus][event] || null
}

/**
 * Возвращает список доступных действий для текущего состояния
 */
export function getAvailableActions(currentStatus: AuctionStatus): Array<{
  event: AuctionEvent
  label: string
  variant: 'primary' | 'secondary' | 'destructive'
}> {
  const state = AUCTION_FSM_STATES[currentStatus]
  
  const actionLabels: Record<AuctionEvent, { label: string; variant: 'primary' | 'secondary' | 'destructive' }> = {
    configure: { label: 'Настроить аукцион', variant: 'primary' },
    start: { label: 'Начать аукцион', variant: 'primary' },
    pause: { label: 'Пауза', variant: 'secondary' },
    resume: { label: 'Продолжить', variant: 'primary' },
    finish: { label: 'Завершить', variant: 'destructive' },
    archive: { label: 'Архивировать', variant: 'secondary' },
    reset: { label: 'Сбросить', variant: 'secondary' }
  }

  return state.allowedEvents.map(event => ({
    event,
    ...actionLabels[event]
  }))
}

/**
 * Возвращает человекочитаемое название статуса
 */
export function getStatusLabel(status: AuctionStatus): string {
  const labels: Record<AuctionStatus, string> = {
    idle: 'Готов к настройке',
    configured: 'Настроен',
    running: 'Идёт',
    paused: 'Пауза',
    finished: 'Завершён',
    archived: 'Архивирован'
  }
  
  return labels[status]
}

/**
 * Возвращает CSS класс для статуса
 */
export function getStatusVariant(status: AuctionStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<AuctionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    idle: 'outline',
    configured: 'secondary',
    running: 'default',
    paused: 'secondary',
    finished: 'destructive',
    archived: 'outline'
  }
  
  return variants[status]
}

/**
 * Проверяет валидность FSM конфигурации
 */
export function validateFSMTransition(
  currentStatus: AuctionStatus,
  event: AuctionEvent,
  targetStatus: AuctionStatus
): { valid: boolean; error?: string } {
  if (!isEventAllowed(currentStatus, event)) {
    return {
      valid: false,
      error: `Событие '${event}' недопустимо для состояния '${currentStatus}'`
    }
  }

  if (!isTransitionAllowed(currentStatus, targetStatus)) {
    return {
      valid: false,
      error: `Переход '${currentStatus}' → '${targetStatus}' недопустим`
    }
  }

  const expectedTarget = getTargetStatus(currentStatus, event)
  if (expectedTarget !== targetStatus) {
    return {
      valid: false,
      error: `Событие '${event}' должно привести к состоянию '${expectedTarget}', а не '${targetStatus}'`
    }
  }

  return { valid: true }
}