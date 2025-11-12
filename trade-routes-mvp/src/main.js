import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import { GAME_CONFIG } from './config/GameConfig.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.COLORS.background,
  scene: [GameScene],
};

const game = new Phaser.Game(config);
