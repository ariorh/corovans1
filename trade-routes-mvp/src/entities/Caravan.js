import { GAME_CONFIG } from '../config/GameConfig.js';

export default class Caravan {
  constructor(scene, route) {
    this.scene = scene;
    this.route = route;
    this.cities = route.getCities();
    this.currentCityIndex = 0;
    this.targetCityIndex = 1;

    this.cargo = {}; // { 'wheat': 2, 'metal': 1 }
    this.capacity = GAME_CONFIG.CARAVAN_CAPACITY;
    this.speed = GAME_CONFIG.CARAVAN_BASE_SPEED;

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
    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetCity.x, targetCity.y);

    if (distance < 5) {
      // Прибыли в город
      this.arriveAtCity(targetCity);
    } else {
      // Продолжаем движение
      const angle = Phaser.Math.Angle.Between(this.x, this.y, targetCity.x, targetCity.y);

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

    // Проверить все города впереди
    for (let i = 0; i < this.cities.length; i++) {
      if (i === this.currentCityIndex) continue;

      const city = this.cities[i];
      if (city.consumes === producedResource) {
        neededCount++;
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

  destroy() {
    this.sprite.destroy();
  }
}
