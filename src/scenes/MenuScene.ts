import Phaser from "phaser";
import { HighscoreManager } from "../ui/Highscore";

export default class MenuScene extends Phaser.Scene {
  constructor() { super({ key: "MenuScene" }); }

  create() {
    const { width, height } = this.cameras.main;

    this.add.text(width/2, 60, "ASTEROIDS", { font: "56px monospace" }).setOrigin(0.5);

    // New Game button (simple text button)
    const newGame = this.add.text(width/2, height/2 - 40, "NEW GAME", { font: "28px monospace", backgroundColor: "#222", padding: { x: 14, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    newGame.on("pointerup", () => {
      this.scene.start("GameScene");
    });

    // Highscores
    const hs = HighscoreManager.getHighscores();
    this.add.text(width/2 - 120, height/2 + 40, "Highscores:", { font: "18px monospace" }).setOrigin(0,0);
    for (let i = 0; i < Math.min(5, hs.length); i++) {
      this.add.text(width/2 - 120, height/2 + 80 + i * 28, `${i+1}. ${hs[i].name} - ${hs[i].score}`, { font: "16px monospace" }).setOrigin(0,0);
    }

    // simple controls help
    this.add.text(width/2, height - 60, "← Rotate   → Rotate   ↑ Thrust   Space Fire", { font: "14px monospace" }).setOrigin(0.5);

    // on mobile, show a touch hint
    this.input.once("pointerdown", () => {
      // do nothing — keeps menu interactive
    });
  }
}
