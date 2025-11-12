// Константы игры
export const GAME_CONFIG = {
  // Размеры
  width: 1920,
  height: 1080,

  // Производство
  PRODUCTION_INTERVAL: 5000, // мс

  // Города
  STARTING_SATISFACTION: 100,
  SATISFACTION_DECAY_RATE: 10, // % каждые 10 секунд
  CONSUMPTION_INTERVAL: 10000, // мс
  MIN_CITY_DISTANCE: 150,

  // Караваны
  CARAVAN_BASE_SPEED: 100, // пикселей в секунду
  CARAVAN_CAPACITY: 4,
  STARTING_CARAVANS: 1,

  // Таймеры
  CARAVAN_SPAWN_INTERVAL: 60000, // 1 минута
  CITY_SPAWN_INTERVAL: 40000, // 40 секунд

  // Цвета
  COLORS: {
    background: '#f5e6d3',
    cityFill: '#8b7355',
    cityStroke: '#5a4a3a',
    routeLine: '#6b5544',
    barGreen: '#4caf50',
    barYellow: '#ffc107',
    barRed: '#f44336',
  },

  // Ресурсы
  RESOURCES: ['wheat', 'metal', 'cloth', 'wood', 'wine'],

  RESOURCE_ICONS: {
    wheat: '🌾',
    metal: '⚒️',
    cloth: '🧵',
    wood: '🌲',
    wine: '🍷'
  }
};
