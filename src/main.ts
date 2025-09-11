import Phaser from "phaser";
import { phaserConfig } from "./game.config";
import PreloadScene from "./scenes/PreloadScene";
import IntroScene from "./scenes/IntroScene";
import MenuScene from "./scenes/MenuScene";
import GameScene from "./scenes/GameScene";

phaserConfig.scene = [PreloadScene, IntroScene, MenuScene, GameScene];

window.addEventListener("load", () => {
  const game = new Phaser.Game(phaserConfig);
  // Expose game for debugging
  (window as any).game = game;
});
