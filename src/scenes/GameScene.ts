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
  private wave = 1; // current wave
  private waveBaseAsteroids = 2; // starting asteroids
  private waveText!: Phaser.GameObjects.Text;
  private waveInProgress = false; // prevent multiple wave starts
  private lives = 3; // starting lives
  private livesText!: Phaser.GameObjects.Text;
  private isInvincible = false;
  private invincibilityDuration = 2000; // 2 seconds
  private respawnDelay = 1000; // 1 second before respawn
  private currentBg!: Phaser.GameObjects.Image;
  private nextBg!: Phaser.GameObjects.Image;
  private bgNumber = 1;
  private maxBgNumber = 10;

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.score = 0;

    this.currentBg = this.add.image(width/2, height/2, `bg_${this.bgNumber}`).setOrigin(0.5, 0.5);

    // create ship in center
    this.ship = this.physics.add
      .sprite(width / 2, height / 2, "ship")
      .setDamping(true)
      .setDrag(0.3)
      .setMaxVelocity(400);
    this.ship.setCollideWorldBounds(false); // wrap manually

    // bullets group
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 50,
      runChildUpdate: false,
    });

    // asteroids group
    this.asteroids = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 50,
      runChildUpdate: true,
    });

    this.startWave();

    // collisions
    this.physics.add.overlap(this.bullets, this.asteroids, (bullet, asteroid) => this.bulletHitsAsteroid(bullet as Phaser.Physics.Arcade.Sprite, asteroid as Phaser.Physics.Arcade.Sprite));
    this.physics.add.overlap(this.ship, this.asteroids, this.shipHitAsteroid, undefined, this);

    // inputs
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // pointer input
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (p.getDuration() < 200) this.fireBullet();
    });

    // score UI
    this.scoreText = this.add.text(10, 10, "Score: 0", { font: "18px monospace" }).setDepth(100);

    // lives UI
    this.livesText = this.add.text(10, 30, `Lives: ${this.lives}`, { font: "18px monospace" }).setDepth(100);

    // pause/resume on blur
    this.game.events.on("hidden", () => this.scene.pause());
    this.game.events.on("visible", () => this.scene.resume());
  }

  private startWave() {
    this.waveInProgress = true;

    // show wave number
    if (!this.waveText) {
      this.waveText = this.add
        .text(this.cameras.main.width / 2, this.cameras.main.height / 3, `WAVE ${this.wave}`, { font: "48px monospace", color: "#ffffff" })
        .setOrigin(0.5)
        .setDepth(100);
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

    if (this.cursors.left?.isDown) this.ship.rotation -= rotationRadSpeed * (delta / 1000);
    if (this.cursors.right?.isDown) this.ship.rotation += rotationRadSpeed * (delta / 1000);

    // thrust
    const thrust = 300; // pixels/sec^2
    if (this.cursors.up?.isDown) {
      const body = this.ship.body as Phaser.Physics.Arcade.Body;
      const angle = this.ship.rotation - Math.PI / 2;
      body.acceleration.set(Math.cos(angle) * thrust, Math.sin(angle) * thrust);
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
      this.transitionBackground();
      this.startWave();
    }
  }

  private fireBullet() {
    const angle = this.ship.rotation - Math.PI / 2;
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

  private bulletHitsAsteroid(bulletObj: Phaser.GameObjects.GameObject, asteroidObj: Phaser.GameObjects.GameObject) {
    const bullet = bulletObj as Phaser.Physics.Arcade.Sprite;
    const asteroid = asteroidObj as Phaser.Physics.Arcade.Sprite;

    // play explode sound
    const snd = this.sound.get("explode");
    if (snd) snd.play();

    // deactivate bullet
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body!.enable = false;

    const size = asteroid.getData("size") as number;

    // deactivate asteroid
    asteroid.setActive(false);
    asteroid.setVisible(false);
    asteroid.body!.enable = false;

    this.spawnExplosionParticles('asteroid_particle', asteroid.x, asteroid.y, asteroid.getData('size'));

    this.incrementScore(100);

    // spawn smaller asteroids if size > 1
    if (size > 1) {
      const newSize = size - 1;
      for (let i = 0; i < 2; i++) {
        this.spawnAsteroid(asteroid.x, asteroid.y, newSize);
      }
    }
  }
  
  private spawnExplosionParticles(type: string, x: number, y: number, size: number = 3) {
      const particleCount = size * 5; // more particles for bigger asteroids

      // Create ParticleEmitterManager at asteroid position
      const particles = this.add.particles(x, y, type, {
          x: { min: -10, max: 10 }, // small spread relative to manager
          y: { min: -10, max: 10 },
          lifespan: 1000,
          speedX: { min: -100, max: 100 },
          speedY: { min: -100, max: 100 },
          quantity: particleCount,
          scale: { start: 0.4 * size / 3, end: 0 },
          alpha: { start: 1, end: 0 },
          blendMode: 'ADD',
          gravityY: 0,
          frequency: 0,
          maxParticles: particleCount
      });

      // Explode all particles immediately
      particles.emitParticleAt(0, 0, particleCount);

      // Destroy the ParticleEmitterManager after lifespan
      this.time.delayedCall(1200, () => particles.destroy());
  }

  private spawnAsteroid(x?: number, y?: number, size: number = 3) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const asteroid = this.asteroids.get(x ?? Phaser.Math.Between(0, w), y ?? Phaser.Math.Between(0, h), `asteroid_${size}`) as Phaser.Physics.Arcade.Sprite;

    if (!asteroid) return;

    asteroid.setActive(true);
    asteroid.setVisible(true);
    asteroid.body!.enable = true;

    // smaller asteroids are faster
    const speedMultiplier = 1 + (3 - size) * 0.5;

    asteroid.setVelocity(Phaser.Math.Between(-80, 80) * speedMultiplier, Phaser.Math.Between(-80, 80) * speedMultiplier);
    asteroid.setAngularVelocity(Phaser.Math.Between(-50, 50));
    asteroid.setData("size", size);
  }

  private shipHitAsteroid() {
    if (this.isInvincible) return; // ignore hits during invincibility

    // play life lost sound
    const snd = this.sound.get("life_lost");
    if (snd) snd.play();
    
    this.spawnExplosionParticles('ship_particle', this.ship.x, this.ship.y, 1);
    
    this.lives--;
    this.livesText.setText(`Lives: ${this.lives}`);

    if (this.lives > 0) {
      // temporarily hide ship
      this.ship.setVisible(false);
      this.ship.body!.enable = false;

      // delay before respawn
      this.time.delayedCall(this.respawnDelay, () => {
        const { width, height } = this.cameras.main;
        this.ship.setPosition(width / 2, height / 2);
        this.ship.setVelocity(0, 0);
        this.ship.setAcceleration(0, 0);
        this.ship.rotation = 0;

        this.ship.setVisible(true);
        this.ship.body!.enable = true;

        // start invincibility
        this.isInvincible = true;

        // blinking effect
        const blinkEvent = this.time.addEvent({
          delay: 200, // blink interval
          repeat: this.invincibilityDuration / 200 - 1,
          callback: () => {
            this.ship.setVisible(!this.ship.visible);
          },
          callbackScope: this,
        });

        // end invincibility
        this.time.delayedCall(this.invincibilityDuration, () => {
          this.isInvincible = false;
          this.ship.setVisible(true);
          blinkEvent.remove();
        });
      });
    } else {
      // game over
      this.scene.pause();
      const name = prompt("Game Over — enter name for highscores") || "ANON";
      HighscoreManager.saveScore(name.toUpperCase().slice(0, 8), this.score);
      this.scene.stop();
      this.scene.start("MenuScene");
    }
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

  private transitionBackground() {
    const { width, height } = this.scale;

    // Load next background
    const nextBgNumber = this.bgNumber < this.maxBgNumber ? this.bgNumber + 1 : 1;
    const nextTexture = `bg_${nextBgNumber}`;

    // Create new background at 0 alpha, normal scale
    this.nextBg = this.add.image(width/2, height/2, nextTexture).setAlpha(0).setScale(1);

    // Stretch current background vertically to 1000% over 1.5s
    this.tweens.add({
        targets: this.currentBg,
        scaleY: 10, // 1000% taller
        ease: 'Power2',
        duration: 1500,
        onComplete: () => {
            // Fade out to black
            this.tweens.add({
                targets: this.currentBg,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    // Destroy old background
                    this.currentBg.destroy();

                    // Fade in new background
                    this.tweens.add({
                        targets: this.nextBg,
                        alpha: 1,
                        duration: 500,
                        onComplete: () => {
                            // Set current background to next
                            this.currentBg = this.nextBg;
                            this.bgNumber = nextBgNumber;
                        }
                    });
                }
            });
        }
    });
  }
}
