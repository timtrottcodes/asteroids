import Phaser from "phaser";
import { phaserConfig } from "./game.config";
import PreloadScene from "./scenes/PreloadScene";
import IntroScene from "./scenes/IntroScene";
import MenuScene from "./scenes/MenuScene";
import GameScene from "./scenes/GameScene";
import UIScene from "./scenes/UIScene";

phaserConfig.scene = [PreloadScene, IntroScene, MenuScene, GameScene, UIScene];

window.addEventListener("load", () => {
  const game = new Phaser.Game(phaserConfig);
  // Expose game for debugging
  (window as any).game = game;
});
