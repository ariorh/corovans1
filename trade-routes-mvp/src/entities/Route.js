import { GAME_CONFIG } from '../config/GameConfig.js';

export default class Route {
  constructor(scene, cities) {
    this.scene = scene;
    this.cities = cities; // Массив городов [A, B] или [A, B, C...]
    this.caravans = [];
    this.graphics = scene.add.graphics();

    this.draw();
  }

  draw() {
    this.graphics.clear();
    this.graphics.lineStyle(3, parseInt(GAME_CONFIG.COLORS.routeLine.replace('#', '0x')), 1);

    // Нарисовать пунктирную линию между городами
    for (let i = 0; i < this.cities.length - 1; i++) {
      const cityA = this.cities[i];
      const cityB = this.cities[i + 1];

      this.drawDashedLine(cityA.x, cityA.y, cityB.x, cityB.y);
    }

    // Замкнуть маршрут (вернуться к первому городу)
    if (this.cities.length > 1) {
      const lastCity = this.cities[this.cities.length - 1];
      const firstCity = this.cities[0];
      this.drawDashedLine(lastCity.x, lastCity.y, firstCity.x, firstCity.y);
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

  destroy() {
    // Уничтожить все караваны на маршруте
    this.caravans.forEach(caravan => caravan.destroy());
    this.graphics.destroy();
  }
}
