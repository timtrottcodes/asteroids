import Phaser from "phaser";
import { HighscoreManager } from "../ui/Highscore";

export default class GameScene extends Phaser.Scene {
  private ship!: Phaser.Physics.Arcade.Image;
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
    this.ship = this.physics.add.image(width/2, height/2, "ship").setDamping(true).setDrag(0.5).setMaxVelocity(400);
    this.ship.setCollideWorldBounds(false); // we will wrap manually

    // bullets group
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    // asteroids
    this.asteroids = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: true
    });

    // spawn some asteroids
    for (let i = 0; i < 6; i++) this.spawnAsteroid();

    // collisions
    this.physics.add.overlap(this.bullets, this.asteroids, this.bulletHitsAsteroid, undefined, this);
    this.physics.add.overlap(this.ship, this.asteroids, this.shipHitAsteroid, undefined, this);

    // inputs
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // touches -> simple virtual fire control: tap to fire, drag to rotate/thrust (basic)
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      // simple tap to shoot
      if (p.getDuration() < 200) this.fireBullet();
    });

    // score UI
    this.scoreText = this.add.text(10, 10, "Score: 0", { font: "18px monospace" }).setDepth(100);

    // simple pause/resume on blur
    this.game.events.on('hidden', () => this.scene.pause());
    this.game.events.on('visible', () => this.scene.resume());
  }

  update(time: number, delta: number) {
    // delta is ms since last update
    // rotate
    const rotSpeed = 200; // degrees/sec
    const rotationRadSpeed = Phaser.Math.DegToRad(rotSpeed);

    if (this.cursors.left?.isDown) this.ship.rotation -= rotationRadSpeed * (delta/1000);
    if (this.cursors.right?.isDown) this.ship.rotation += rotationRadSpeed * (delta/1000);

    // thrust (up arrow)
    if (this.cursors.up?.isDown) {
      this.physics.velocityFromRotation(this.ship.rotation - Math.PI/2, 200, this.ship.body.velocity);
      // better: add acceleration instead of overriding velocity; simplified here
    }

    // shooting
    const space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if ((space && space.isDown) || this.input.activePointer.isDown) {
      if (time > this.firingCooldown) {
        this.fireBullet();
        this.firingCooldown = time + 250; // 4 shots/sec
      }
    }

    // wrap objects when they go off screen
    this.wrapObject(this.ship);
    this.asteroids.getChildren().forEach((a: any) => this.wrapObject(a));
    this.bullets.getChildren().forEach((b: any) => this.wrapObject(b));
  }

  private fireBullet() {
    const bullet = this.physics.add.image(this.ship.x, this.ship.y, "bullet") as Phaser.Physics.Arcade.Image;
    bullet.setDepth(50);
    bullet.setScale(0.6);
    // bullets fly in ship forward direction (ship sprite oriented such that rotation 0 faces right; adjust)
    this.physics.velocityFromRotation(this.ship.rotation - Math.PI/2, 500, bullet.body.velocity);
    // set lifespan
    this.time.delayedCall(1700, () => bullet.destroy());
    this.bullets.add(bullet);
    // play shoot sound if present
    const snd = this.sound.get("shoot");
    if (snd) snd.play();
  }

  private spawnAsteroid(x?: number, y?: number) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const posX = x ?? Phaser.Math.Between(0, w);
    const posY = y ?? Phaser.Math.Between(0, h);
    const a = this.physics.add.image(posX, posY, "asteroid");
    a.setVelocity(Phaser.Math.Between(-80, 80), Phaser.Math.Between(-80, 80));
    a.setAngularVelocity(Phaser.Math.Between(-50, 50));
    a.setData("size", 3); // 3 = big, 2 = med, 1 = small (for splitting)
    this.asteroids.add(a);
  }

  private bulletHitsAsteroid(bullet: Phaser.GameObjects.GameObject, asteroid: Phaser.GameObjects.GameObject) {
    bullet.destroy();
    asteroid.destroy();
    this.incrementScore(100);
    const snd = this.sound.get("explode");
    if (snd) snd.play();

    // spawn two smaller asteroids for variety
    this.spawnAsteroid(Phaser.Math.Between(0, this.cameras.main.width), Phaser.Math.Between(0, this.cameras.main.height));
  }

  private shipHitAsteroid() {
    // simple game over
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
