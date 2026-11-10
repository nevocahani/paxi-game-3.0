# Rescue Paxsi! — Artemis Escape Room

A small, English-language pixel-art escape room about the Artemis missions. It is a static HTML/CSS/JavaScript site and uses the 32×32 character frames already in this repository.

## Play locally

Open `index.html` in a modern browser. No build step or package installation is required. For best results, serve the folder with any local static file server so all browsers load the image sequences consistently.

## Controls

- **A / D** or **← / →** — move
- **Space** or **↑** — jump
- **E** — interact with the mission console or unlocked exit
- **Escape** — close a challenge

## Editing questions

All rooms, prompts, options, correct answers, and NASA source links live in `questions.js`. `answerIndex` is zero-based. Use a `type: "question"` challenge for multiple choice, or `type: "code"` with an `answer` string for a numeric lock. The first room's lock expects `14` (question 1 joined to the first digit of 40,000 km/h).

The game keeps completed challenges and the current room in browser local storage. The **Reset Run** button clears that local progress.

## Art assets

Walking, mirrored walking, jump, and mirrored jump frames are loaded from the existing asset folders. The animated 480x270 `background_animated_480.gif` is the room backdrop, with `grass_top.png` and `dirt.png` forming the playable ground. `logo-pixelart-512-preview.png` is used for the page icon and field-log badge. The `sprite-fusion-pixel-art-generator-32x32.png` image is the closed door and `door-open-frames/` supplies its opening animation. The two images in `paxi/` are used as the in-game pixel character and rescue ending. The game removes their connected white photo background and reduces them to crisp 32x32 sprites at runtime. Add room backgrounds or other art as the team finishes them, then update the `assets` section in `questions.js` and the drawing code in `game.js`.

## Deploy on Render

The root `render.yaml` defines a static site that publishes this repository root. Connect the GitHub repository to Render and create the static site from its Blueprint. There is no build command. The game has no server and stores progress in each player's browser.

## Mission facts

Artemis II and Artemis III questions are based on the NASA pages linked directly in `questions.js`. Artemis III questions use NASA's current plan for in-space lander demonstrations, not the older draft assumption that Artemis III will land astronauts on the Moon.
