import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig.js';
import City from '../entities/City.js';
import Route from '../entities/Route.js';
import Caravan from '../entities/Caravan.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Фон
    this.cameras.main.setBackgroundColor(GAME_CONFIG.COLORS.background);

    // Создать 2 стартовых города
    this.cities = [];
    this.routes = [];
    this.caravans = [];

    this.createCity(300, 360, 'wheat', 'metal'); // Город А
    this.createCity(980, 360, 'metal', 'wheat'); // Город Б

    // UI
    this.createUI();

    // Игровые переменные
    this.gameTime = 0;
    this.lastCaravanSpawn = 0;
    this.lastCitySpawn = 0;
    this.gameOver = false;

    // Режим создания маршрута
    this.selectedCities = [];

    // Обработка кликов
    this.input.on('pointerdown', this.handleClick, this);
  }

  createCity(x, y, produces, consumes) {
    const city = new City(this, x, y, produces, consumes);
    this.cities.push(city);
    return city;
  }

  handleClick(pointer) {
    if (this.gameOver) return;

    // Проверить клик на город
    this.cities.forEach((city) => {
      if (city.isClickedAt(pointer.x, pointer.y)) {
        this.onCityClicked(city);
      }
    });
  }

  onCityClicked(city) {
    if (this.selectedCities.length === 0) {
      // Первый город
      this.selectedCities.push(city);
      city.highlight(true);
    } else {
      // Второй город - создать маршрут
      this.selectedCities.push(city);
      this.createRoute(this.selectedCities);

      // Убрать подсветку
      this.selectedCities.forEach((c) => c.highlight(false));
      this.selectedCities = [];
    }
  }

  createRoute(cities) {
    const route = new Route(this, cities);
    this.routes.push(route);

    // Создать первый караван на маршруте
    for (let i = 0; i < GAME_CONFIG.STARTING_CARAVANS; i++) {
      const caravan = new Caravan(this, route);
      route.addCaravan(caravan);
      this.caravans.push(caravan);
    }

    this.showNotification('+1 Маршрут');
  }

  createUI() {
    // Время
    this.timeText = this.add.text(20, 20, 'Time: 0:00', {
      fontSize: '20px',
      color: '#333',
    });

    // Количество городов
    this.cityCountText = this.add.text(20, 50, 'Города: 2', {
      fontSize: '20px',
      color: '#333',
    });

    // Количество караванов
    this.caravanCountText = this.add.text(20, 80, 'Караваны: 0', {
      fontSize: '20px',
      color: '#333',
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    this.gameTime += delta;

    // Обновить все города
    this.cities.forEach((city) => city.update(delta));

    // Обновить караваны
    this.caravans.forEach((caravan) => caravan.update(delta));

    // Проверить Game Over
    this.checkGameOver();

    // Добавить караван каждую минуту
    if (this.gameTime - this.lastCaravanSpawn > GAME_CONFIG.CARAVAN_SPAWN_INTERVAL) {
      this.addCaravan();
      this.lastCaravanSpawn = this.gameTime;
    }

    // Добавить город каждые 40 секунд
    if (this.gameTime - this.lastCitySpawn > GAME_CONFIG.CITY_SPAWN_INTERVAL) {
      this.spawnNewCity();
      this.lastCitySpawn = this.gameTime;
    }

    // Обновить UI
    this.updateUI();
  }

  updateUI() {
    const seconds = Math.floor(this.gameTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    this.timeText.setText(
      `Time: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    );

    this.cityCountText.setText(`Города: ${this.cities.length}`);
    this.caravanCountText.setText(`Караваны: ${this.caravans.length}`);
  }

  checkGameOver() {
    for (let city of this.cities) {
      if (city.resourceLevel <= 0) {
        this.triggerGameOver();
        break;
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.scene.pause();

    // Затемнение
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);

    // Текст
    const gameOverText = this.add
      .text(640, 300, 'GAME OVER', {
        fontSize: '64px',
        color: '#f44336',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const timeText = this.add
      .text(960, 570, `Time: ${Math.floor(this.gameTime / 1000)} seconds`, {
        fontSize: '24px',
        color: '#fff',
      })
      .setOrigin(0.5);

    // Кнопка рестарта
    const restartBtn = this.add
      .text(640, 450, '[Начать заново]', {
        fontSize: '32px',
        color: '#4caf50',
      })
      .setOrigin(0.5);

    restartBtn.setInteractive({ useHandCursor: true });
    restartBtn.on('pointerdown', () => {
      this.scene.restart();
    });
  }

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

  spawnNewCity() {
    // Список существующих ресурсов
    const existingResources = [...new Set(this.cities.map((c) => c.produces))];

    // Новый ресурс или существующий?
    let produces;
    if (Math.random() < 0.3 && existingResources.length < GAME_CONFIG.RESOURCES.length) {
      // 30% шанс нового ресурса
      const newResources = GAME_CONFIG.RESOURCES.filter(
        (r) => !existingResources.includes(r)
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
    let attempts = 0;
    do {
      x = Phaser.Math.Between(100, 1180);
      y = Phaser.Math.Between(100, 620);

      valid = true;
      for (let city of this.cities) {
        const distance = Phaser.Math.Distance.Between(x, y, city.x, city.y);
        if (distance < GAME_CONFIG.MIN_CITY_DISTANCE) {
          valid = false;
          break;
        }
      }
      attempts++;
    } while (!valid && attempts < 50);

    if (valid) {
      // Создать город
      const newCity = this.createCity(x, y, produces, consumes);
      this.showNotification('Новый город!');
    }
  }

  showNotification(text) {
    const notif = this.add
      .text(640, 100, text, {
        fontSize: '24px',
        color: '#4caf50',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: notif,
      alpha: 0,
      y: 50,
      duration: 2000,
      onComplete: () => notif.destroy(),
    });
  }
}
