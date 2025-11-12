# Trade Routes v0.0.1 - MVP План разработки

## Цель версии 0.0.1
Создать **минимальный работающий прототип** для проверки базовой механики:
- Города производят и потребляют ресурсы
- Караваны перевозят ресурсы
- Игрок создает маршруты
- Ресурсы в городах уменьшаются → Game Over

**Время разработки:** 2-3 дня (вечера)

---

## Упрощенные правила для MVP

### Убрано из MVP (вернем позже)
- ❌ Сезоны
- ❌ Водные маршруты
- ❌ Улучшения (кроме нового каравана)
- ❌ Постоялые дворы
- ❌ Множественные типы ресурсов (пока только 2-3)
- ❌ Звук и музыка
- ❌ Главное меню

### Базовые механики v0.0.1

#### 1. Старт игры
```
Город А:
├─ Производит: 🌾 Пшеница
└─ Потребляет: ⚒️ Металл (запас: 100%)

Город Б:
├─ Производит: ⚒️ Металл
└─ Потребляет: 🌾 Пшеница (запас: 100%)

Расстояние между городами: ~300px
```

#### 2. Потребление ресурсов
- **Начальный запас:** 100% (100 единиц)
- **Скорость потребления:** -10% каждые 10 секунд
- **Game Over:** Когда любой ресурс достигает 0%

```
Время:  0s   10s   20s   30s   40s   50s   60s   70s   80s   90s  100s
Запас: 100%  90%   80%   70%   60%   50%   40%   30%   20%   10%   0% → GAME OVER
```

#### 3. Караваны
- **Вместимость:** 4 единицы ресурса
- **Скорость:** 100 пикселей/секунду (фиксированная)
- **Поведение:** Ходят по маршруту по кругу (A → B → A → B...)

**Логика загрузки (пример):**

**Простой случай (2 города):**
```
Маршрут: Город А (🌾) → Город Б (⚒️)

В Городе А:
- Караван загружается: +1 🌾 (потому что Город Б потребляет 🌾)

В Городе Б:
- Караван разгружается: -1 🌾 → Запас 🌾 в Городе Б = 100%
- Караван загружается: +1 ⚒️ (потому что Город А потребляет ⚒️)

Возвращается в Город А:
- Караван разгружается: -1 ⚒️ → Запас ⚒️ в Городе А = 100%
```

**Сложный случай (3 города, один ресурс нужен двум):**
```
Маршрут: Город А (🌾) → Город Б → Город В

Город А: производит 🌾
Город Б: потребляет 🌾
Город В: потребляет 🌾

В Городе А караван загружается ДВАЖДЫ:
- +1 🌾 для Города Б
- +1 🌾 для Города В
Итого: 2 единицы в караване

В Городе Б:
- Разгружается: -1 🌾 → Запас Города Б = 100%

В Городе В:
- Разгружается: -1 🌾 → Запас Города В = 100%
```

#### 4. Добавление караванов
- **Старт:** 1 караван на маршруте
- **Прирост:** +1 караван каждую минуту (автоматически)
- **Лимит:** Нет (пока)

#### 5. Появление новых городов
- **Частота:** Каждые 40 секунд
- **Правила:**
  - Производит: Один из существующих ресурсов (70% шанс) ИЛИ новый ресурс (30% шанс)
  - Потребляет: Всегда один из существующих ресурсов (случайный)
  - Начальный запас: 100%

**Пример последовательности:**
```
0:00 - Старт: Город А (🌾/⚒️), Город Б (⚒️/🌾)
0:40 - +Город В: производит 🌾, потребляет ⚒️
1:20 - +Город Г: производит 🧵 (новый!), потребляет 🌾
2:00 - +Город Д: производит ⚒️, потребляет 🧵
...
```

---

## Технический план v0.0.1

### Структура проекта (упрощенная)

```
/trade-routes-mvp
├── index.html
├── /src
│   ├── main.js              # Точка входа
│   ├── /scenes
│   │   └── GameScene.js     # Основная сцена (всё в одной!)
│   ├── /entities
│   │   ├── City.js          # Класс города
│   │   ├── Route.js         # Класс маршрута
│   │   └── Caravan.js       # Класс каравана
│   └── /config
│       └── GameConfig.js    # Константы
├── /assets
│   └── /images              # Простые иконки (можно рисовать в коде)
└── package.json
```

### Технологии
- **Phaser 3.70+**
- **JavaScript** (без TypeScript пока)
- **Vite** для сборки (быстрый старт)

---

## Детальный план разработки

### День 1: Базовая структура и визуал (3-4 часа)

#### Задача 1.1: Настройка проекта (30 мин)
```bash
npm create vite@latest trade-routes-mvp -- --template vanilla
cd trade-routes-mvp
npm install phaser
npm install
npm run dev
```

#### Задача 1.2: Создать GameScene (1 час)
**Файл: `src/scenes/GameScene.js`**

```javascript
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Фон
    this.cameras.main.setBackgroundColor('#f5e6d3');
    
    // Создать 2 города
    this.cities = [];
    this.createCity(300, 360, 'wheat', 'metal');    // Город А
    this.createCity(980, 360, 'metal', 'wheat');    // Город Б
    
    // UI
    this.createUI();
    
    // Игровые переменные
    this.gameTime = 0;
    this.lastCaravanSpawn = 0;
    this.lastCitySpawn = 0;
  }

  update(time, delta) {
    this.gameTime += delta;
    
    // Обновить все города
    this.cities.forEach(city => city.update(delta));
    
    // Проверить Game Over
    this.checkGameOver();
    
    // Добавить караван каждую минуту
    if (this.gameTime - this.lastCaravanSpawn > 60000) {
      this.addCaravan();
      this.lastCaravanSpawn = this.gameTime;
    }
    
    // Добавить город каждые 40 секунд
    if (this.gameTime - this.lastCitySpawn > 40000) {
      this.spawnNewCity();
      this.lastCitySpawn = this.gameTime;
    }
  }

  createCity(x, y, produces, consumes) {
    // Реализовать позже
  }

  createUI() {
    // Время, счет и т.д.
  }

  checkGameOver() {
    // Проверить запасы городов
  }
}
```

#### Задача 1.3: Реализовать класс City (1.5 часа)
**Файл: `src/entities/City.js`**

```javascript
export default class City {
  constructor(scene, x, y, produces, consumes) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.produces = produces;        // Тип ресурса (строка)
    this.consumes = consumes;        // Тип ресурса (строка)
    this.resourceLevel = 100;        // Запас потребляемого ресурса (0-100%)
    
    this.consumptionRate = 10;       // % каждые 10 секунд
    this.consumptionInterval = 10000; // мс
    this.lastConsumption = 0;
    
    this.render();
  }

  render() {
    // Нарисовать круг города
    this.circle = this.scene.add.circle(this.x, this.y, 30, 0x8b7355);
    this.circle.setStrokeStyle(3, 0x5a4a3a);
    
    // Иконка производимого ресурса
    this.produceIcon = this.scene.add.text(
      this.x, 
      this.y - 10, 
      this.getResourceIcon(this.produces),
      { fontSize: '24px' }
    ).setOrigin(0.5);
    
    // Иконка потребляемого ресурса
    this.consumeIcon = this.scene.add.text(
      this.x, 
      this.y + 15, 
      this.getResourceIcon(this.consumes),
      { fontSize: '16px', color: '#999' }
    ).setOrigin(0.5);
    
    // Прогресс-бар для запаса
    this.createProgressBar();
  }

  getResourceIcon(resourceType) {
    const icons = {
      'wheat': '🌾',
      'metal': '⚒️',
      'cloth': '🧵',
      'wood': '🌲',
      'wine': '🍷'
    };
    return icons[resourceType] || '❓';
  }

  createProgressBar() {
    // Фон бара
    this.barBg = this.scene.add.rectangle(
      this.x, 
      this.y - 50, 
      60, 
      8, 
      0x333333
    );
    
    // Заполнение
    this.bar = this.scene.add.rectangle(
      this.x, 
      this.y - 50, 
      60, 
      8, 
      0x4caf50
    );
  }

  update(delta) {
    // Уменьшать запас каждые 10 секунд
    this.lastConsumption += delta;
    
    if (this.lastConsumption >= this.consumptionInterval) {
      this.resourceLevel -= this.consumptionRate;
      this.lastConsumption = 0;
      
      if (this.resourceLevel < 0) {
        this.resourceLevel = 0;
      }
      
      this.updateProgressBar();
    }
  }

  updateProgressBar() {
    // Обновить ширину бара
    const width = (this.resourceLevel / 100) * 60;
    this.bar.width = width;
    this.bar.x = this.x - 30 + width / 2;
    
    // Изменить цвет в зависимости от уровня
    if (this.resourceLevel > 50) {
      this.bar.fillColor = 0x4caf50; // Зеленый
    } else if (this.resourceLevel > 20) {
      this.bar.fillColor = 0xffc107; // Желтый
    } else {
      this.bar.fillColor = 0xf44336; // Красный
    }
  }

  receiveResource(resourceType, amount = 1) {
    if (resourceType === this.consumes) {
      this.resourceLevel = 100; // Пополнить до максимума
      this.updateProgressBar();
      return true;
    }
    return false;
  }

  produceResource() {
    return this.produces;
  }
}
```

#### Задача 1.4: Тестирование визуала (30 мин)
- Проверить что города рисуются
- Проверить что прогресс-бары работают
- Проверить что ресурсы уменьшаются каждые 10 секунд

**Ожидаемый результат Дня 1:**
✅ На экране 2 города с иконками
✅ Прогресс-бары показывают запас ресурсов
✅ Ресурсы уменьшаются каждые 10 секунд
✅ Game Over при достижении 0%

---

### День 2: Маршруты и караваны (3-4 часа)

#### Задача 2.1: Создание маршрутов (кликами) (1.5 часа)
**Добавить в GameScene:**

```javascript
create() {
  // ... предыдущий код
  
  // Режим создания маршрута
  this.routeMode = false;
  this.selectedCities = [];
  this.currentRoute = null;
  
  // Делаем города кликабельными
  this.input.on('pointerdown', this.handleClick, this);
}

handleClick(pointer) {
  // Проверить клик на город
  this.cities.forEach(city => {
    const distance = Phaser.Math.Distance.Between(
      pointer.x, 
      pointer.y, 
      city.x, 
      city.y
    );
    
    if (distance < 30) { // Радиус города
      this.onCityClicked(city);
    }
  });
}

onCityClicked(city) {
  if (this.selectedCities.length === 0) {
    // Первый город
    this.selectedCities.push(city);
    this.highlightCity(city);
  } else if (this.selectedCities.length === 1) {
    // Второй город - создать маршрут
    this.selectedCities.push(city);
    this.createRoute(this.selectedCities);
    this.selectedCities = [];
  }
}

createRoute(cities) {
  const route = new Route(this, cities);
  this.routes.push(route);
  
  // Создать первый караван на маршруте
  const caravan = new Caravan(this, route);
  route.addCaravan(caravan);
  this.caravans.push(caravan);
}
```

#### Задача 2.2: Реализовать класс Route (1 час)
**Файл: `src/entities/Route.js`**

```javascript
export default class Route {
  constructor(scene, cities) {
    this.scene = scene;
    this.cities = cities;  // Массив городов [A, B] или [A, B, C...]
    this.caravans = [];
    this.graphics = scene.add.graphics();
    
    this.draw();
  }

  draw() {
    this.graphics.clear();
    this.graphics.lineStyle(3, 0x6b5544, 1);
    
    // Нарисовать пунктирную линию между городами
    for (let i = 0; i < this.cities.length - 1; i++) {
      const cityA = this.cities[i];
      const cityB = this.cities[i + 1];
      
      this.drawDashedLine(
        cityA.x, cityA.y,
        cityB.x, cityB.y
      );
    }
  }

  drawDashedLine(x1, y1, x2, y2) {
    const dashLength = 10;
    const gapLength = 5;
    const distance = Phaser.Math.Distance.Between(x1, y1, x2, y2);
    const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
    
    let currentDistance = 0;
    let drawing = true;
    
    while (currentDistance < distance) {
      const length = drawing ? dashLength : gapLength;
      const endDistance = Math.min(currentDistance + length, distance);
      
      if (drawing) {
        const startX = x1 + Math.cos(angle) * currentDistance;
        const startY = y1 + Math.sin(angle) * currentDistance;
        const endX = x1 + Math.cos(angle) * endDistance;
        const endY = y1 + Math.sin(angle) * endDistance;
        
        this.graphics.lineBetween(startX, startY, endX, endY);
      }
      
      currentDistance = endDistance;
      drawing = !drawing;
    }
  }

  addCaravan(caravan) {
    this.caravans.push(caravan);
  }

  getCities() {
    return this.cities;
  }
}
```

#### Задача 2.3: Реализовать класс Caravan (1.5 часа)
**Файл: `src/entities/Caravan.js`**

```javascript
export default class Caravan {
  constructor(scene, route) {
    this.scene = scene;
    this.route = route;
    this.cities = route.getCities();
    this.currentCityIndex = 0;
    this.targetCityIndex = 1;
    
    this.cargo = {};  // { 'wheat': 2, 'metal': 1 }
    this.capacity = 4;
    this.speed = 100; // пикселей в секунду
    
    // Текущая позиция
    const startCity = this.cities[0];
    this.x = startCity.x;
    this.y = startCity.y;
    
    // Визуал
    this.sprite = scene.add.rectangle(this.x, this.y, 15, 15, 0x8b4513);
    this.sprite.setRotation(Math.PI / 4); // Ромб
    
    // Сразу загрузиться в стартовом городе
    this.loadCargo();
    
    // Начать движение
    this.movingToNextCity = true;
  }

  update(delta) {
    if (this.movingToNextCity) {
      this.moveTowardsTarget(delta);
    }
  }

  moveTowardsTarget(delta) {
    const targetCity = this.cities[this.targetCityIndex];
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      targetCity.x, targetCity.y
    );
    
    if (distance < 5) {
      // Прибыли в город
      this.arriveAtCity(targetCity);
    } else {
      // Продолжаем движение
      const angle = Phaser.Math.Angle.Between(
        this.x, this.y,
        targetCity.x, targetCity.y
      );
      
      const moveDistance = (this.speed * delta) / 1000;
      this.x += Math.cos(angle) * moveDistance;
      this.y += Math.sin(angle) * moveDistance;
      
      this.sprite.setPosition(this.x, this.y);
    }
  }

  arriveAtCity(city) {
    // 1. Разгрузить нужные ресурсы
    this.unloadCargo(city);
    
    // 2. Загрузить производимые ресурсы
    this.loadCargo();
    
    // 3. Выбрать следующий город
    this.currentCityIndex = this.targetCityIndex;
    this.targetCityIndex = (this.targetCityIndex + 1) % this.cities.length;
    
    // 4. Небольшая пауза (1 секунда)
    this.movingToNextCity = false;
    this.scene.time.delayedCall(1000, () => {
      this.movingToNextCity = true;
    });
  }

  loadCargo() {
    const currentCity = this.cities[this.currentCityIndex];
    const producedResource = currentCity.produceResource();
    
    // Посчитать сколько раз этот ресурс нужен впереди на маршруте
    let neededCount = 0;
    
    for (let i = this.targetCityIndex; i < this.cities.length; i++) {
      const city = this.cities[i];
      if (city.consumes === producedResource) {
        neededCount++;
      }
    }
    
    // Если маршрут циклический, проверить города до текущего
    if (this.cities.length > 2) {
      for (let i = 0; i < this.currentCityIndex; i++) {
        const city = this.cities[i];
        if (city.consumes === producedResource) {
          neededCount++;
        }
      }
    }
    
    // Загрузить ресурсы (учитывая вместимость)
    const currentLoad = this.getTotalCargo();
    const canLoad = Math.min(neededCount, this.capacity - currentLoad);
    
    if (canLoad > 0) {
      if (!this.cargo[producedResource]) {
        this.cargo[producedResource] = 0;
      }
      this.cargo[producedResource] += canLoad;
    }
  }

  unloadCargo(city) {
    const neededResource = city.consumes;
    
    if (this.cargo[neededResource] && this.cargo[neededResource] > 0) {
      // Разгрузить 1 единицу
      this.cargo[neededResource]--;
      
      if (this.cargo[neededResource] === 0) {
        delete this.cargo[neededResource];
      }
      
      // Пополнить запас в городе
      city.receiveResource(neededResource, 1);
    }
  }

  getTotalCargo() {
    let total = 0;
    for (let resource in this.cargo) {
      total += this.cargo[resource];
    }
    return total;
  }
}
```

#### Задача 2.4: Интегрировать караваны в GameScene (30 мин)
```javascript
update(time, delta) {
  // ... предыдущий код
  
  // Обновить караваны
  this.caravans.forEach(caravan => caravan.update(delta));
}
```

**Ожидаемый результат Дня 2:**
✅ Можно кликнуть на два города и создать маршрут
✅ Караван появляется и движется по маршруту
✅ Караван загружается/разгружается в городах
✅ Запасы в городах пополняются при доставке

---

### День 3: Финальная механика и полировка (2-3 часа)

#### Задача 3.1: Добавление караванов каждую минуту (30 мин)
```javascript
addCaravan() {
  if (this.routes.length > 0) {
    // Добавить караван на первый маршрут
    const route = this.routes[0];
    const caravan = new Caravan(this, route);
    route.addCaravan(caravan);
    this.caravans.push(caravan);
    
    // Уведомление
    this.showNotification('+1 Караван');
  }
}

showNotification(text) {
  const notif = this.add.text(640, 100, text, {
    fontSize: '24px',
    color: '#4caf50'
  }).setOrigin(0.5);
  
  this.tweens.add({
    targets: notif,
    alpha: 0,
    y: 50,
    duration: 2000,
    onComplete: () => notif.destroy()
  });
}
```

#### Задача 3.2: Спавн новых городов каждые 40 секунд (1 час)
```javascript
spawnNewCity() {
  // Список существующих ресурсов
  const existingResources = [...new Set(
    this.cities.map(c => c.produces)
  )];
  
  // Новый ресурс или существующий?
  let produces;
  if (Math.random() < 0.3 && existingResources.length < 5) {
    // 30% шанс нового ресурса
    const allResources = ['wheat', 'metal', 'cloth', 'wood', 'wine'];
    const newResources = allResources.filter(
      r => !existingResources.includes(r)
    );
    produces = Phaser.Utils.Array.GetRandom(newResources);
  } else {
    // Существующий
    produces = Phaser.Utils.Array.GetRandom(existingResources);
  }
  
  // Потребляет случайный существующий
  const consumes = Phaser.Utils.Array.GetRandom(existingResources);
  
  // Случайная позиция (с проверкой минимального расстояния)
  let x, y, valid;
  do {
    x = Phaser.Math.Between(100, 1180);
    y = Phaser.Math.Between(100, 620);
    
    valid = true;
    for (let city of this.cities) {
      const distance = Phaser.Math.Distance.Between(x, y, city.x, city.y);
      if (distance < 150) {
        valid = false;
        break;
      }
    }
  } while (!valid);
  
  // Создать город
  const newCity = new City(this, x, y, produces, consumes);
  this.cities.push(newCity);
  
  this.showNotification('Новый город!');
}
```

#### Задача 3.3: Game Over экран (30 мин)
```javascript
checkGameOver() {
  for (let city of this.cities) {
    if (city.resourceLevel <= 0) {
      this.gameOver();
      break;
    }
  }
}

gameOver() {
  // Остановить игру
  this.scene.pause();
  
  // Затемнение
  const overlay = this.add.rectangle(
    640, 360, 1280, 720, 0x000000, 0.7
  );
  
  // Текст
  const gameOverText = this.add.text(640, 300, 'GAME OVER', {
    fontSize: '64px',
    color: '#f44336',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  const timeText = this.add.text(
    640, 380, 
    `Время: ${Math.floor(this.gameTime / 1000)} секунд`, 
    { fontSize: '24px', color: '#fff' }
  ).setOrigin(0.5);
  
  // Кнопка рестарта
  const restartBtn = this.add.text(640, 450, '[Начать заново]', {
    fontSize: '32px',
    color: '#4caf50'
  }).setOrigin(0.5);
  
  restartBtn.setInteractive({ useHandCursor: true });
  restartBtn.on('pointerdown', () => {
    this.scene.restart();
  });
}
```

#### Задача 3.4: UI (время, счет) (30 мин)
```javascript
createUI() {
  // Время
  this.timeText = this.add.text(20, 20, 'Время: 0:00', {
    fontSize: '20px',
    color: '#333'
  });
  
  // Количество городов
  this.cityCountText = this.add.text(20, 50, 'Города: 2', {
    fontSize: '20px',
    color: '#333'
  });
  
  // Количество караванов
  this.caravanCountText = this.add.text(20, 80, 'Караваны: 1', {
    fontSize: '20px',
    color: '#333'
  });
}

update(time, delta) {
  // ... предыдущий код
  
  // Обновить UI
  const seconds = Math.floor(this.gameTime / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  this.timeText.setText(
    `Время: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  );
  
  this.cityCountText.setText(`Города: ${this.cities.length}`);
  this.caravanCountText.setText(`Караваны: ${this.caravans.length}`);
}
```

**Ожидаемый результат Дня 3:**
✅ Новый караван добавляется каждую минуту
✅ Новый город появляется каждые 40 секунд
✅ Game Over при обнулении ресурса
✅ UI показывает время и статистику
✅ Можно рестартнуть игру

---

## Чек-лист версии 0.0.1

### Обязательный функционал
- [ ] 2 стартовых города (пшеница/металл)
- [ ] Ресурсы уменьшаются каждые 10 секунд на 10%
- [ ] Можно кликнуть на два города и создать маршрут
- [ ] Караван движется по маршруту
- [ ] Караван загружает ресурсы в городе-производителе
- [ ] Караван разгружает ресурсы в городе-потребителе
- [ ] Разгрузка пополняет ресурс до 100%
- [ ] Вместимость каравана: 4 единицы
- [ ] Логика множественной загрузки (один ресурс для нескольких городов)
- [ ] +1 караван каждую минуту
- [ ] +1 город каждые 40 секунд
- [ ] Game Over при ресурс = 0%
- [ ] Кнопка рестарта
- [ ] UI: время, количество городов, караванов

### Опционально (если успеем)
- [ ] Выбор цепочки городов (A → B → C) для маршрута
- [ ] Удаление маршрутов
- [ ] Анимация появления городов
- [ ] Звук клика

---

## Что НЕ делаем в v0.0.1

❌ Сезоны (вернем в v0.0.2)
❌ Водные маршруты (вернем в v0.0.2)
❌ Улучшения (кроме караванов)
❌ Звук и музыка
❌ Главное меню
❌ Сохранения
❌ Множественные маршруты одновременно (пока один)

---

## Критерии успеха v0.0.1

**Прототип считается успешным если:**
1. ✅ Можно запустить и играть 2-3 минуты
2. ✅ Понятна базовая механика без объяснений
3. ✅ Есть вызов (нужно успевать доставлять ресурсы)
4. ✅ Есть "One more try" фактор

**Вопросы для тестирования:**
- Понятно ли как создавать маршруты?
- Интересно ли наблюдать за караванами?
- Достаточно ли сложно или слишком просто?
- Хочется ли играть еще раз?

---

## Следующие версии (roadmap)

### v0.0.2 (после v0.0.1)
- Добавить сезоны
- Добавить водные маршруты
- Улучшить UI
- Добавить звук

### v0.0.3
- Система улучшений
- Постоялые дворы
- Множественные маршруты

### v0.1.0 (первая играбельная версия)
- Главное меню
- Туториал
- Музыка
- Балансировка

---

## Заметки для разработки

### Потенциальные проблемы
1. **Pathfinding:** В v0.0.1 используем прямые линии между городами. Если города перекрываются - добавим проверку
2. **Производительность:** Ограничить максимум 50 городов и 100 караванов
3. **Баланс:** Если слишком легко - уменьшить интервал потребления до 8 секунд

### Советы
- Тестировать после каждой задачи
- Коммитить в Git после каждого дня
- Записывать идеи для следующих версий

---

**Время на разработку v0.0.1:** 8-11 часов (3 вечера по 3-4 часа)

**Дата создания плана:** 10 ноября 2025  
**Версия:** 0.0.1 MVP
