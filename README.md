# 🚀 Asteroids — 24 Hour Game Jam Test

This project was created as a **personal challenge in a 24-hour game jam (including sleep)**.  
The goal was to see how much of a polished game I could build within that limited time frame.

👉 Play online at [TimTrottCodes](https://timtrottcodes.github.io/)

---

## 🎮 Gameplay

Classic **Asteroids-style arcade gameplay** with some enhancements:

- **Player Ship**
  - Rotate left/right with arrow keys
  - Thrust forward with up arrow (momentum-based movement)
  - Fire bullets with spacebar (or tap/click on mobile)

- **Asteroids**
  - Break into smaller asteroids when hit
  - Size 3 → two size 2 asteroids  
  - Size 2 → two size 1 asteroids (faster)  
  - Size 1 → destroyed

- **Waves**
  - Each wave starts with an increasing number of asteroids
  - Between waves: a short pause with a wave banner
  - Background transitions with scaling and fade effect

- **Lives**
  - Start with 3 lives
  - On collision: lose a life, respawn after delay with temporary invincibility
  - Game over when all lives are lost

- **Extras**
  - Particle effects on explosions
  - Starfield background

---

## 🎨 Assets

- **Graphics & UI:** Generated using *Stable Diffusion* and refined with *Photoshop*
- **Backgrounds:** Procedurally swapped per wave (`bg_1` … `bg_10`)
- **Sprites:** Ship, asteroids, bullets, and effects hand-tuned for a retro feel

---

## 🔊 Sound Assets

- rock-destroy-6409.mp3 - Sound Effect by <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6409">freesound_community</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6409">Pixabay</a>  

- explosion-fx-343683.mp3 - Sound Effect by <a href="https://pixabay.com/users/soundreality-31074404/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=343683">Jurij</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=343683">Pixabay</a>  

- laser-1-72652.mp3 - Sound Effect by <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=72652">freesound_community</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=72652">Pixabay</a>  

---

## 🛠️ Tech Stack

- [Phaser 3.90](https://phaser.io/) — Game engine
- TypeScript — Core game logic
- Webpack — Build system

---

## 🚧 Notes

This game was developed under strict time constraints for fun and experimentation.  
Expect some rough edges, but it’s fully playable and showcases how much can be done in just one day.

---

## 📜 License

Code is released under the MIT license.  
Please respect the original asset licenses (see above for sound effect attributions).
