export type HighscoreEntry = { name: string; score: number; date: string };

const STORAGE_KEY = "asteroids_highscores_v1";

export class HighscoreManager {
  static getHighscores(): HighscoreEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as HighscoreEntry[];
    } catch {
      return [];
    }
  }

  static saveScore(name: string, score: number) {
    const list = this.getHighscores();
    list.push({ name, score, date: new Date().toISOString() });
    list.sort((a,b) => b.score - a.score);
    const trimmed = list.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}
