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

    // spawn some asteroids
    for (let i = 0; i < 6; i++) this.spawnAsteroid();

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

  private spawnAsteroid(x?: number, y?: number) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const asteroid = this.asteroids.get(
      x ?? Phaser.Math.Between(0, w),
      y ?? Phaser.Math.Between(0, h),
      "asteroid"
    ) as Phaser.Physics.Arcade.Sprite;

    if (!asteroid) return;

    asteroid.setActive(true);
    asteroid.setVisible(true);
    asteroid.body!.enable = true;

    asteroid.setVelocity(Phaser.Math.Between(-80, 80), Phaser.Math.Between(-80, 80));
    asteroid.setAngularVelocity(Phaser.Math.Between(-50, 50));
    asteroid.setData("size", 3);
  }

  private bulletHitsAsteroid(bulletObj: Phaser.GameObjects.GameObject, asteroidObj: Phaser.GameObjects.GameObject) {
    const bullet = bulletObj as Phaser.Physics.Arcade.Sprite;
    const asteroid = asteroidObj as Phaser.Physics.Arcade.Sprite;

    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body!.enable = false;

    asteroid.setActive(false);
    asteroid.setVisible(false);
    asteroid.body!.enable = false;

    this.incrementScore(100);
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
