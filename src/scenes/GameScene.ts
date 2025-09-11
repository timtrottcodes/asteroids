import Phaser from "phaser";
import { HighscoreManager } from "../ui/Highscore";

export default class GameScene extends Phaser.Scene {
  private ship!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private bullets!: Phaser.Physics.Arcade.Group;
  private asteroids!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private firingCooldown = 0;
  private wave = 1;               // current wave
  private waveBaseAsteroids = 2;  // starting asteroids
  private waveText!: Phaser.GameObjects.Text;
  private waveInProgress = false; // prevent multiple wave starts

  constructor() { super({ key: "GameScene" }); }

  create() {
    const { width, height } = this.cameras.main;
    this.score = 0;

    // create ship in center
    this.ship = this.physics.add.sprite(width/2, height/2, "ship")
      .setDamping(true)
      .setDrag(0.3)
      .setMaxVelocity(400);
    this.ship.setCollideWorldBounds(false); // wrap manually

    // bullets group
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 50,
      runChildUpdate: false
    });

    // asteroids group
    this.asteroids = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 50,
      runChildUpdate: true
    });

    this.startWave();

    // collisions
    this.physics.add.overlap(
      this.bullets,
      this.asteroids,
      (bullet, asteroid) => this.bulletHitsAsteroid(
        bullet as Phaser.Physics.Arcade.Sprite,
        asteroid as Phaser.Physics.Arcade.Sprite
      )
    );
    this.physics.add.overlap(this.ship, this.asteroids, this.shipHitAsteroid, undefined, this);

    // inputs
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // pointer input
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.getDuration() < 200) this.fireBullet();
    });

    // score UI
    this.scoreText = this.add.text(10, 10, "Score: 0", { font: "18px monospace" }).setDepth(100);

    // pause/resume on blur
    this.game.events.on('hidden', () => this.scene.pause());
    this.game.events.on('visible', () => this.scene.resume());
  }

  private startWave() {
      this.waveInProgress = true;

      // show wave number
      if (!this.waveText) {
          this.waveText = this.add.text(
              this.cameras.main.width / 2,
              this.cameras.main.height / 3,
              `WAVE ${this.wave}`,
              { font: "48px monospace", color: "#ffffff" }
          ).setOrigin(0.5).setDepth(100);
      } else {
          this.waveText.setText(`WAVE ${this.wave}`);
          this.waveText.setVisible(true);
      }

      // delay before spawning asteroids
      this.time.delayedCall(2000, () => {
          const numAsteroids = this.waveBaseAsteroids + (this.wave - 1);
          for (let i = 0; i < numAsteroids; i++) {
              this.spawnAsteroid();
          }
          this.waveText.setVisible(false);
          this.waveInProgress = false;
      });
  }

  update(time: number, delta: number) {
    const rotSpeed = 200; // degrees/sec
    const rotationRadSpeed = Phaser.Math.DegToRad(rotSpeed);

    if (this.cursors.left?.isDown) this.ship.rotation -= rotationRadSpeed * (delta/1000);
    if (this.cursors.right?.isDown) this.ship.rotation += rotationRadSpeed * (delta/1000);

    // thrust
    const thrust = 300; // pixels/sec^2
    if (this.cursors.up?.isDown) {
        const body = this.ship.body as Phaser.Physics.Arcade.Body;
        const angle = this.ship.rotation - Math.PI / 2;
        body.acceleration.set(
            Math.cos(angle) * thrust,
            Math.sin(angle) * thrust
        );
    } else {
        // no thrust, stop accelerating
        this.ship.setAcceleration(0);
    }

    // shooting
    const space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if ((space && space.isDown) || this.input.activePointer.isDown) {
      if (time > this.firingCooldown) {
        this.fireBullet();
        this.firingCooldown = time + 250;
      }
    }

    // wrap objects
    this.wrapObject(this.ship);
    this.asteroids.getChildren().forEach((a: any) => this.wrapObject(a));

    // check if all asteroids are destroyed
    const activeAsteroids = this.asteroids.getChildren().filter((a: any) => a.active);
    if (activeAsteroids.length === 0 && !this.waveInProgress) {
        this.wave++;
        this.startWave();
    }
  }

  private fireBullet() {
    const angle = this.ship.rotation - Math.PI/2;
    const speed = 500;

    // Get bullet from group
    const bullet = this.bullets.get(this.ship.x, this.ship.y, "bullet") as Phaser.Physics.Arcade.Sprite;
    if (!bullet) return;

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body!.enable = true;
    bullet.setScale(0.6);
    bullet.setDepth(50);
    bullet.setCollideWorldBounds(false);

    // Set velocity
    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Auto disable/destroy
    this.time.delayedCall(1700, () => {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body!.enable = false;
    });

    const snd = this.sound.get("shoot");
    if (snd) snd.play();
  }

  private bulletHitsAsteroid(
      bulletObj: Phaser.GameObjects.GameObject,
      asteroidObj: Phaser.GameObjects.GameObject
  ) {
      const bullet = bulletObj as Phaser.Physics.Arcade.Sprite;
      const asteroid = asteroidObj as Phaser.Physics.Arcade.Sprite;

      // deactivate bullet
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body!.enable = false;

      const size = asteroid.getData("size") as number;

      // deactivate asteroid
      asteroid.setActive(false);
      asteroid.setVisible(false);
      asteroid.body!.enable = false;

      this.incrementScore(100);

      // spawn smaller asteroids if size > 1
      if (size > 1) {
          const newSize = size - 1;
          for (let i = 0; i < 2; i++) {
              this.spawnAsteroid(
                  asteroid.x,
                  asteroid.y,
                  newSize
              );
          }
      }
  }

  // patched spawnAsteroid to accept size
  private spawnAsteroid(x?: number, y?: number, size: number = 3) {
      const w = this.cameras.main.width;
      const h = this.cameras.main.height;

      const asteroid = this.asteroids.get(
          x ?? Phaser.Math.Between(0, w),
          y ?? Phaser.Math.Between(0, h),
          `asteroid_${size}`
      ) as Phaser.Physics.Arcade.Sprite;

      if (!asteroid) return;

      asteroid.setActive(true);
      asteroid.setVisible(true);
      asteroid.body!.enable = true;

      // smaller asteroids are faster
      const speedMultiplier = 1 + (3 - size) * 0.5;

      asteroid.setVelocity(
          Phaser.Math.Between(-80, 80) * speedMultiplier,
          Phaser.Math.Between(-80, 80) * speedMultiplier
      );
      asteroid.setAngularVelocity(Phaser.Math.Between(-50, 50));
      asteroid.setData("size", size);
  }


  private shipHitAsteroid() {
    this.scene.pause();
    const name = prompt("Game Over — enter name for highscores") || "ANON";
    HighscoreManager.saveScore(name.toUpperCase().slice(0,8), this.score);
    this.scene.stop();
    this.scene.start("MenuScene");
  }

  private incrementScore(amount: number) {
    this.score += amount;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  private wrapObject(obj: any) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    if (!obj || !obj.body) return;
    if (obj.x < -20) obj.x = w + 20;
    if (obj.x > w + 20) obj.x = -20;
    if (obj.y < -20) obj.y = h + 20;
    if (obj.y > h + 20) obj.y = -20;
  }
}
