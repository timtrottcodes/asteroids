import Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    const { width } = this.cameras.main;

    // fixed position texts anchored to top of screen
    this.scoreText = this.add.text(20, 20, "Score: 0", {
      font: "18px monospace",
      color: "#ffffff"
    }).setScrollFactor(0);

    this.livesText = this.add.text(width - 120, 20, "Lives: 3", {
      font: "18px monospace",
      color: "#ffffff"
    }).setScrollFactor(0);

    this.levelText = this.add.text(width / 2, 20, "Level: 1", {
      font: "18px monospace",
      color: "#ffffff"
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // listen for events emitted from GameScene
    const gameScene = this.scene.get("GameScene");

    gameScene.events.on("scoreChanged", (score: number) => {
      this.scoreText.setText(`Score: ${score}`);
    });

    gameScene.events.on("livesChanged", (lives: number) => {
      this.livesText.setText(`Lives: ${lives}`);
    });

    gameScene.events.on("levelChanged", (level: number) => {
      this.levelText.setText(`Level: ${level}`);
    });

    gameScene.events.on("gameOver", () => {
      this.add.text(width / 2, 200, "GAME OVER", {
        font: "48px monospace",
        color: "#ff0000"
      }).setOrigin(0.5);
    });
  }
}
