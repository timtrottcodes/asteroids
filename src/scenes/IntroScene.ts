import Phaser from "phaser";

export default class IntroScene extends Phaser.Scene {
  private starEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  constructor() { super({ key: "IntroScene" }); }

  create() {
    const { width, height } = this.cameras.main;

    // layers config
    const layers = [
      { speed: 10, scale: 0.2, alpha: 0.3, frequency: 80 },
      { speed: 30, scale: 0.5, alpha: 0.65, frequency: 60 },
      { speed: 60, scale: 1, alpha: 1, frequency: 40 }
    ];

    // For each layer we create a ParticleEmitterManager with an emitter config.
    // This avoids calling particles.createEmitter(...) directly.
    layers.forEach(layer => {
      this.add.particles('star', [
        {
          x: { min: 0, max: width },
          y: { min: 0, max: height },
          lifespan: 4000,
          quantity: 1,
          frequency: layer.frequency,
          speedY: layer.speed,
          scale: { start: layer.scale, end: 0.1 },
          alpha: { start: layer.alpha, end: 0 },
          blendMode: 'ADD'
        }
      ]);
    });

    // a blackout layer to do fade in/out
    const blackout = this.add.rectangle(0,0,width,height,0x000000).setOrigin(0).setDepth(10);
    blackout.alpha = 1;

    // Logo and title (start invisible)
    const logo = this.add.image(width/2, height/2 - 40, "logo").setDepth(11).setScale(0.8).setAlpha(0);
    const title = this.add.text(width/2, height/2 + 80, "ASTEROIDS", { font: "48px monospace" }).setOrigin(0.5).setDepth(11).setAlpha(0);

    // sequence:
    // 1) fadeout starfield reveal (fade blackout -> 0)
    // 2) small delay, then fade-in logo/title
    // 3) hold, then fade-out to black and start MenuScene

    this.tweens.add({
      targets: blackout,
      alpha: 0,
      duration: 1200,
      ease: "Quad.easeOut",
      onComplete: () => {
        // logo in
        this.time.delayedCall(600, () => {
          this.tweens.add({
            targets: [logo, title],
            alpha: 1,
            duration: 900,
            ease: "Quad.easeInOut"
          });
        });
      }
    });

    // after logo visible for some time, fade out everything
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: [logo, title],
        alpha: 0,
        duration: 600,
        ease: "Quad.easeIn"
      });
      this.tweens.add({
        targets: blackout,
        alpha: 1,
        duration: 800,
        ease: "Quad.easeIn",
        delay: 600,
        onComplete: () => {
          this.scene.start("MenuScene");
        }
      });
    });

    // allow skipping (tap/click)
    this.input.once("pointerdown", () => {
      this.scene.start("MenuScene");
    });
  }
}
