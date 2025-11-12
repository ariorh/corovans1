import { GAME_CONFIG } from '../config/GameConfig.js';

export default class City {
  constructor(scene, x, y, produces, consumes) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.produces = produces; // Тип производимого ресурса
    this.consumes = consumes; // Тип потребляемого ресурса
    this.resourceLevel = 100; // Запас потребляемого ресурса (0-100%)

    this.consumptionRate = GAME_CONFIG.SATISFACTION_DECAY_RATE;
    this.consumptionInterval = GAME_CONFIG.CONSUMPTION_INTERVAL;
    this.lastConsumption = 0;

    this.render();
  }

  render() {
    // Нарисовать круг города
    this.circle = this.scene.add.circle(
      this.x,
      this.y,
      30,
      parseInt(GAME_CONFIG.COLORS.cityFill.replace('#', '0x'))
    );
    this.circle.setStrokeStyle(3, parseInt(GAME_CONFIG.COLORS.cityStroke.replace('#', '0x')));

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
    return GAME_CONFIG.RESOURCE_ICONS[resourceType] || '❓';
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
      parseInt(GAME_CONFIG.COLORS.barGreen.replace('#', '0x'))
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
      this.bar.fillColor = parseInt(GAME_CONFIG.COLORS.barGreen.replace('#', '0x'));
    } else if (this.resourceLevel > 20) {
      this.bar.fillColor = parseInt(GAME_CONFIG.COLORS.barYellow.replace('#', '0x'));
    } else {
      this.bar.fillColor = parseInt(GAME_CONFIG.COLORS.barRed.replace('#', '0x'));
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

  isClickedAt(x, y) {
    const distance = Phaser.Math.Distance.Between(x, y, this.x, this.y);
    return distance < 30;
  }

  highlight(isHighlighted) {
    if (isHighlighted) {
      this.circle.setStrokeStyle(5, 0xffff00);
    } else {
      this.circle.setStrokeStyle(3, parseInt(GAME_CONFIG.COLORS.cityStroke.replace('#', '0x')));
    }
  }

  destroy() {
    this.circle.destroy();
    this.produceIcon.destroy();
    this.consumeIcon.destroy();
    this.barBg.destroy();
    this.bar.destroy();
  }
}
