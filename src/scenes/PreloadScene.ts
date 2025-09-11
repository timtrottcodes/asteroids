import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: "PreloadScene" }); }

  preload() {    
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.add.text(w/2, h/2 - 20, "Loading...", { font: "18px monospace" }).setOrigin(0.5);
    const progressText = this.add.text(w/2, h/2 + 10, "0%", { font: "14px monospace" }).setOrigin(0.5);

    this.load.on("progress", (p: number) => {
      progressText.setText(Math.round(p * 100) + "%");
    });

    this.load.image("star", "/src/assets/star.png"); // small star for parallax
    this.load.image("logo", "/src/assets/logo.png");
    this.load.image("ship", "/src/assets/ship.png");
    this.load.image("bullet", "/src/assets/bullet.png");
    this.load.image("asteroid", "/src/assets/asteroid.png");

    this.load.audio("shoot", "/src/assets/shoot.wav");
    this.load.audio("explode", "/src/assets/explode.wav");
  }

  create() {
    // go to intro
    this.scene.start("IntroScene");
  }
}
