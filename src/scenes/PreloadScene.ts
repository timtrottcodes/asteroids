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

    this.load.image("star", "assets/star.png"); // small star for parallax
    this.load.image("logo", "assets/logo.png");
    this.load.image("title", "assets/title.png");
    this.load.image("ship", "assets/ship.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.image("asteroid_1_1", "assets/asteroid_1_1.png");
    this.load.image("asteroid_2_1", "assets/asteroid_2_1.png");
    this.load.image("asteroid_3_1", "assets/asteroid_3_1.png");
    this.load.image("asteroid_4_1", "assets/asteroid_4_1.png");
    this.load.image("asteroid_1_2", "assets/asteroid_1_2.png");
    this.load.image("asteroid_2_2", "assets/asteroid_2_2.png");
    this.load.image("asteroid_3_2", "assets/asteroid_3_2.png");
    this.load.image("asteroid_4_2", "assets/asteroid_4_2.png");
    this.load.image("asteroid_1_3", "assets/asteroid_1_3.png");
    this.load.image("asteroid_2_3", "assets/asteroid_2_3.png");
    this.load.image("asteroid_3_3", "assets/asteroid_3_3.png");
    this.load.image("asteroid_4_3", "assets/asteroid_4_3.png");
    this.load.image("asteroid_particle", "assets/asteroid_particle.png");
    this.load.image("ship_particle", "assets/ship_particle.png");

    this.load.image("title_bg", "assets/bg/title_bg.jpg");
    this.load.image("bg_1", "assets/bg/bg_1.jpg");
    this.load.image("bg_2", "assets/bg/bg_2.jpg");
    this.load.image("bg_3", "assets/bg/bg_3.jpg");
    this.load.image("bg_4", "assets/bg/bg_4.jpg");
    this.load.image("bg_5", "assets/bg/bg_5.jpg");
    this.load.image("bg_6", "assets/bg/bg_6.jpg");
    this.load.image("bg_7", "assets/bg/bg_7.jpg");
    this.load.image("bg_8", "assets/bg/bg_8.jpg");
    this.load.image("bg_9", "assets/bg/bg_9.jpg");
    this.load.image("bg_10", "assets/bg/bg_10.jpg");

    this.load.audio("shoot", "assets/sfx/laser-1-72652.mp3");
    this.load.audio("explode", "assets/sfx/rock-destroy-6409.mp3");
    this.load.audio("life_lost", "assets/sfx/explosion-fx-343683.mp3");
  }

  create() {
    // go to intro
    this.scene.start("IntroScene");
  }
}
