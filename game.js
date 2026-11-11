(() => {
  "use strict";
  const data = window.GAME_DATA;
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const $ = (id) => document.getElementById(id);
  const storageKey = "orbital-escape-progress-v1";
  const image = (src) => { const img = new Image(); img.src = src; return img; };
  const assets = {
    scene: image(data.assets.scene),
    groundTop: image(data.assets.groundTop),
    groundFill: image(data.assets.groundFill),
    logo: image(data.assets.logo),
    walkRight: Array.from({ length: 8 }, (_, i) => image(`${data.assets.walkRight}/frame-${i + 1}.png`)),
    walkLeft: Array.from({ length: 8 }, (_, i) => image(`${data.assets.walkLeft}/frame-${i + 1}.png`)),
    jumpRight: Array.from({ length: 8 }, (_, i) => image(`${data.assets.jumpRight}/frame-${i + 1}.png`)),
    jumpLeft: Array.from({ length: 8 }, (_, i) => image(`${data.assets.jumpLeft}/frame-${i + 1}.png`)),
    doorClosed: image(data.assets.doorClosed),
    doorOpen: Array.from({ length: 8 }, (_, i) => image(`${data.assets.doorOpen}/frame-${i + 1}.png`)),
    paxsi: data.assets.paxsi.map(image)
  };
  assets.paxsiPixels = [];
  let state = null;
  const doorOpenAt = data.rooms.map(() => null);
  const roomNotes = [
    "A strange signal is coming from the Moon's far side. The Zippy Tribe is guarding the next door.",
    "Paxsi's voice is breaking up. The next signal is coming from the crew's flight log.",
    "One final room separates your crew from Paxsi. The tribe's newest questions are about the next mission."
  ];
  const roomRadios = ["“Can you hear me out there?”", "“I can see your signal getting closer!”", "“I'm right behind that door. Hurry!”"];
  function makePixelSprite(source) {
    if (!source.complete || !source.naturalWidth) return null;
    const width = source.naturalWidth, height = source.naturalHeight;
    const work = document.createElement("canvas"); work.width = width; work.height = height;
    const workCtx = work.getContext("2d", { willReadFrequently: true });
    workCtx.drawImage(source, 0, 0);
    const frame = workCtx.getImageData(0, 0, width, height), pixels = frame.data;
    const total = width * height, queue = new Int32Array(total);
    let head = 0, tail = 0;
    const addIfBackground = (index) => {
      const p = index * 4;
      const hi = Math.max(pixels[p], pixels[p + 1], pixels[p + 2]);
      const lo = Math.min(pixels[p], pixels[p + 1], pixels[p + 2]);
      if (pixels[p + 3] && lo > 222 && hi - lo < 24) {
        pixels[p + 3] = 0;
        queue[tail++] = index;
      }
    };
    // Remove only the connected white photo background, keeping isolated white art details.
    for (let x = 0; x < width; x++) { addIfBackground(x); addIfBackground((height - 1) * width + x); }
    for (let y = 1; y < height - 1; y++) { addIfBackground(y * width); addIfBackground(y * width + width - 1); }
    while (head < tail) {
      const index = queue[head++], x = index % width, y = (index / width) | 0;
      if (x) addIfBackground(index - 1);
      if (x + 1 < width) addIfBackground(index + 1);
      if (y) addIfBackground(index - width);
      if (y + 1 < height) addIfBackground(index + width);
    }
    workCtx.putImageData(frame, 0, 0);
    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3]) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    }
    if (maxX < minX) return null;
    const cropW = maxX - minX + 1, cropH = maxY - minY + 1;
    const scale = Math.min(30 / cropW, 30 / cropH), drawW = cropW * scale, drawH = cropH * scale;
    const sprite = document.createElement("canvas"); sprite.width = 32; sprite.height = 32;
    const spriteCtx = sprite.getContext("2d"); spriteCtx.imageSmoothingEnabled = false;
    spriteCtx.drawImage(work, minX, minY, cropW, cropH, (32 - drawW) / 2, (32 - drawH) / 2, drawW, drawH);
    return sprite;
  }
  assets.paxsi.forEach((source, index) => {
    const prepare = () => {
      assets.paxsiPixels[index] = makePixelSprite(source);
      if (assets.paxsiPixels[index]) {
        const spriteUrl = assets.paxsiPixels[index].toDataURL();
        const introImage = $("intro-paxsi") || document.querySelector(".intro-icon img");
        const briefingImage = $("briefing-paxsi");
        const endingImageElement = $("paxsi-image");
        if (index === 0 && introImage) introImage.src = spriteUrl;
        if (index === 0 && briefingImage) briefingImage.src = spriteUrl;
        if (state?.done && index === 0 && endingImageElement) endingImageElement.src = spriteUrl;
      }
    };
    if (source.complete) prepare(); else source.addEventListener("load", prepare, { once: true });
  });
  function freshState() { return { started: false, room: 0, stages: data.rooms.map(() => 0), x: 46, done: false }; }
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || !Array.isArray(saved.stages) || saved.stages.length !== data.rooms.length) return freshState();
      return { ...freshState(), ...saved, stages: saved.stages.map((n, i) => Math.max(0, Math.min(data.rooms[i].challenges.length, Number(n) || 0))), room: Math.max(0, Math.min(data.rooms.length - 1, Number(saved.room) || 0)) };
    } catch { return freshState(); }
  }
  state = loadState();
  const player = { x: state.x || 46, y: 225, vy: 0, direction: 1, grounded: true, frame: 0, anim: 0 };
  let quizOpen = false;
  let attempts = 3;
  let activeKeys = new Set();
  let lastFrame = 0;
  let nearby = false;
  let endingImage = 0;
  const room = () => data.rooms[state.room];
  const stage = () => room().challenges[state.stages[state.room]];
  const roomComplete = (index = state.room) => state.stages[index] >= data.rooms[index].challenges.length;
  function save() { state.x = Math.round(player.x); try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {} }
  function paxsiDataUrl(index = 0) {
    const sprite = assets.paxsiPixels[index];
    return sprite ? sprite.toDataURL() : assets.paxsi[index].src;
  }

  function drawRoom(time = 0) {
    const w = canvas.width, h = canvas.height, roomIndex = state.room;
    const palettes = [
      { accent: "#efb26f", tint: null },
      { accent: "#9ad9ce", tint: "rgba(29, 55, 70, .22)" },
      { accent: "#d9a4da", tint: "rgba(50, 31, 66, .3)" }
    ];
    const p = palettes[roomIndex];
    // The team's animated alien-world art is the real backdrop; the 32px tiles form a walkable foreground.
    ctx.imageSmoothingEnabled = false;
    if (assets.scene.complete && assets.scene.naturalWidth) ctx.drawImage(assets.scene, 0, 0, w, h);
    else { ctx.fillStyle = "#211a32"; ctx.fillRect(0, 0, w, h); }
    if (p.tint) { ctx.fillStyle = p.tint; ctx.fillRect(0, 0, w, h); }
    for (let x = 0; x < w; x += 32) {
      if (assets.groundTop.complete && assets.groundTop.naturalWidth) ctx.drawImage(assets.groundTop, x, 225, 32, 32);
      else { ctx.fillStyle = "#34404a"; ctx.fillRect(x, 225, 32, 32); }
      if (assets.groundFill.complete && assets.groundFill.naturalWidth) ctx.drawImage(assets.groundFill, x, 257, 32, 32);
    }
    drawFieldProps(time, p.accent);
    // Mission console
    const consoleX = 226;
    ctx.fillStyle = "#111a25"; ctx.fillRect(consoleX - 18, 189, 36, 36);
    ctx.fillStyle = "#455563"; ctx.fillRect(consoleX - 14, 192, 28, 25);
    ctx.fillStyle = roomComplete() ? "#b8ed76" : p.accent; ctx.fillRect(consoleX - 10, 196, 20, 9);
    ctx.fillStyle = "#17232e"; ctx.fillRect(consoleX - 8, 198, 16, 2);
    ctx.fillStyle = "#d7e3e9"; ctx.fillRect(consoleX - 11, 209, 22, 2);
    ctx.fillStyle = "#17232e"; ctx.fillRect(consoleX - 4, 217, 8, 8);
    // Door uses the team's 32x32 closed sprite, followed by its opening animation.
    const doorX = 435;
    const isDoorOpen = roomComplete();
    let doorSprite = assets.doorClosed;
    if (isDoorOpen) {
      if (doorOpenAt[roomIndex] === null) doorOpenAt[roomIndex] = time;
      const doorFrame = Math.min(7, Math.floor(Math.max(0, time - doorOpenAt[roomIndex]) / 105));
      doorSprite = assets.doorOpen[doorFrame];
    } else doorOpenAt[roomIndex] = null;
    if (doorSprite?.complete && doorSprite.naturalWidth) {
      ctx.drawImage(doorSprite, doorX - 23, 179, 46, 46);
    } else {
      ctx.fillStyle = "#101923"; ctx.fillRect(doorX - 16, 172, 32, 53);
      ctx.fillStyle = isDoorOpen ? "#b8ed76" : "#6e7a86"; ctx.fillRect(doorX - 11, 177, 22, 48);
    }
    // Use Paxsi's two supplied expressions as a small 32x32 pixel-art character.
    const paxsiSprite = assets.paxsiPixels[Math.floor(time / 560) % Math.max(1, assets.paxsiPixels.length)];
    if (paxsiSprite) {
      const bob = isDoorOpen ? 0 : Math.round(Math.sin(time / 360) * 1);
      ctx.drawImage(paxsiSprite, 302, 193 + bob, 32, 32);
    }
    // Character sprite; provided frames are 32x32 and kept crisp on the canvas.
    const moving = activeKeys.has("ArrowRight") || activeKeys.has("d") || activeKeys.has("ArrowLeft") || activeKeys.has("a");
    const jumping = !player.grounded;
    player.anim += 1;
    if (moving && player.anim % 8 === 0) player.frame = (player.frame + 1) % 8;
    if (!moving && player.grounded) player.frame = 0;
    const set = jumping ? (player.direction > 0 ? assets.jumpRight : assets.jumpLeft) : (moving ? (player.direction > 0 ? assets.walkRight : assets.walkLeft) : (player.direction > 0 ? assets.walkRight : assets.walkLeft));
    const sprite = set[player.frame];
    if (sprite?.complete && sprite.naturalWidth) ctx.drawImage(sprite, Math.round(player.x - 16), Math.round(player.y - 28), 32, 32);
    else { ctx.fillStyle = "#d4e5ed"; ctx.fillRect(player.x - 6, player.y - 25, 12, 25); ctx.fillStyle = "#cf554c"; ctx.fillRect(player.x - 6, player.y - 22, 12, 5); }
    // Interaction hint inside the world
    const targetX = roomComplete() ? doorX : consoleX;
    const canInteract = Math.abs(player.x - targetX) < 37 && player.grounded;
    nearby = canInteract;
    if (canInteract && !quizOpen && state.started && !state.done) {
      const label = roomComplete() ? "E  ENTER" : "E  INTERACT";
      ctx.font = "7px 'DM Mono', monospace"; const width = ctx.measureText(label).width + 12;
      ctx.fillStyle = "#101923e8"; ctx.fillRect(targetX - width / 2, 139, width, 15);
      ctx.strokeStyle = "#c7f36b99"; ctx.strokeRect(targetX - width / 2 + .5, 139.5, width - 1, 14);
      ctx.fillStyle = "#e8f2db"; ctx.textAlign = "center"; ctx.fillText(label, targetX, 149); ctx.textAlign = "left";
    }
    // A faint beacon marks the console if the player is far away.
    if (!roomComplete() && !canInteract) { ctx.globalAlpha = .55 + Math.sin(time / 220) * .2; ctx.fillStyle = p.accent; ctx.fillRect(consoleX - 1, 182, 2, 2); ctx.globalAlpha = 1; }
  }

  function drawFieldProps(time, accent) {
    // A parked survey rover anchors the left side of the landing zone.
    ctx.fillStyle = "#202a30"; ctx.fillRect(67, 207, 41, 12);
    ctx.fillStyle = "#69716b"; ctx.fillRect(72, 201, 25, 9);
    ctx.fillStyle = "#bcc49a"; ctx.fillRect(76, 203, 14, 5);
    ctx.fillStyle = "#28343a"; ctx.fillRect(70, 216, 9, 8); ctx.fillRect(96, 216, 9, 8);
    ctx.fillStyle = "#d5a66f"; ctx.fillRect(73, 218, 3, 4); ctx.fillRect(99, 218, 3, 4);
    ctx.fillStyle = "#506574"; ctx.fillRect(99, 202, 2, 7); ctx.fillRect(98, 201, 4, 2);
    ctx.fillStyle = "#b8d9d7"; ctx.fillRect(102, 204, 2, 2);
    // Stacked sample boxes, with a small label stripe.
    ctx.fillStyle = "#202a2e"; ctx.fillRect(141, 210, 17, 15); ctx.fillRect(159, 215, 13, 10);
    ctx.fillStyle = "#9a7659"; ctx.fillRect(143, 207, 13, 15); ctx.fillRect(161, 212, 9, 10);
    ctx.fillStyle = "#d2b587"; ctx.fillRect(146, 211, 7, 2); ctx.fillRect(163, 216, 5, 2);
    ctx.fillStyle = "#675445"; ctx.fillRect(148, 207, 2, 15); ctx.fillRect(164, 212, 2, 10);
    // A compact radio mast blinks in time with the incoming signal.
    ctx.fillStyle = "#28333a"; ctx.fillRect(369, 204, 7, 21);
    ctx.fillStyle = "#a9b8a8"; ctx.fillRect(371, 188, 3, 17); ctx.fillRect(366, 191, 13, 2);
    ctx.fillStyle = "#3b5555"; ctx.fillRect(365, 187, 15, 2); ctx.fillRect(367, 184, 11, 2);
    ctx.fillStyle = "#c7d77b"; ctx.fillRect(371, 180, 3, 3);
    ctx.globalAlpha = .3 + .25 * (1 + Math.sin(time / 170));
    ctx.fillStyle = accent; ctx.fillRect(368, 177, 9, 2); ctx.fillRect(370, 174, 5, 2);
    ctx.globalAlpha = 1;
    // A few ground-level signal pixels give the landing zone a little life.
    for (let i = 0; i < 5; i++) {
      const drift = (time / 65 + i * 59) % 480;
      ctx.globalAlpha = .25 + (i % 3) * .12;
      ctx.fillStyle = i % 2 ? "#e7d6aa" : accent;
      ctx.fillRect(drift, 217 + (i % 2) * 5, 2, 1);
    }
    ctx.globalAlpha = 1;
  }

  function draw(time = 0) {
    const dt = Math.min((time - lastFrame) / 16.67 || 1, 2); lastFrame = time;
    const left = activeKeys.has("ArrowLeft") || activeKeys.has("a");
    const right = activeKeys.has("ArrowRight") || activeKeys.has("d");
    if (state.started && !quizOpen && !state.done) {
      if (left) { player.x -= 2.3 * dt; player.direction = -1; }
      if (right) { player.x += 2.3 * dt; player.direction = 1; }
      player.x = Math.max(18, Math.min(465, player.x));
      player.y += player.vy * dt;
      if (!player.grounded) player.vy += .42 * dt;
      if (player.y >= 225) { player.y = 225; player.vy = 0; player.grounded = true; }
    }
    drawRoom(time);
    updateHud();
    requestAnimationFrame(draw);
  }

  function updateHud() {
    const r = room();
    $("room-kicker").textContent = r.kicker;
    $("room-title").textContent = r.title;
    $("room-count").innerHTML = `ROOM 0${state.room + 1} <span>/ 0${data.rooms.length}</span>`;
    $("field-note").textContent = roomNotes[state.room];
    $("radio-line").textContent = roomRadios[state.room];
    const total = data.rooms.reduce((n, entry) => n + entry.challenges.length, 0);
    const complete = data.rooms.reduce((n, entry, i) => n + state.stages[i], 0);
    $("hud-progress").textContent = `DATA ${String(Math.round(complete / total * 100)).padStart(2, "0")}%`;
    const list = $("mission-list"); list.replaceChildren();
    data.rooms.forEach((entry, i) => {
      const item = document.createElement("div");
      item.className = `mission-item${i === state.room ? " active" : ""}${roomComplete(i) ? " done" : ""}`;
      const num = document.createElement("span"); num.className = "mission-number"; num.textContent = `0${i + 1}`;
      const desc = document.createElement("div"); const name = document.createElement("div"); name.className = "mission-name"; name.textContent = entry.title;
      const sub = document.createElement("div"); sub.className = "mission-sub"; sub.textContent = roomComplete(i) ? "CLEARED" : `${String(state.stages[i]).padStart(2, "0")} / ${String(entry.challenges.length).padStart(2, "0")} DATA`; desc.append(name, sub);
      const check = document.createElement("span"); check.className = "mission-check"; check.textContent = roomComplete(i) ? "✓" : i === state.room ? "◉" : "·";
      item.append(num, desc, check); list.append(item);
    });
    const all = state.stages.reduce((n, x, i) => n + (x >= data.rooms[i].challenges.length ? 1 : 0), 0);
    $("objective-text").textContent = roomComplete() ? (state.room < data.rooms.length - 1 ? "Door unlocked. Press E at the exit to continue." : "All missions cleared. Paxsi is just ahead!") : "Find the mission console and press E.";
    $("status-text").textContent = state.done ? "PAXSI RESCUED" : roomComplete() ? "EXIT UNLOCKED" : "SYSTEMS NOMINAL";
    $("status-chip").querySelector(".status-light").style.background = state.done ? "#c7f36b" : roomComplete() ? "#8bd9f5" : "#c7f36b";
    if (all === data.rooms.length && !state.done) finishGame();
  }

  function showQuiz() {
    if (roomComplete()) return;
    quizOpen = true; attempts = 3;
    const challenge = stage();
    $("quiz-overlay").classList.remove("hidden");
    $("quiz-room-label").textContent = room().title.toUpperCase();
    $("quiz-number").textContent = `CHALLENGE ${String(state.stages[state.room] + 1).padStart(2, "0")} / ${String(room().challenges.length).padStart(2, "0")}`;
    $("quiz-progress").style.width = `${(state.stages[state.room] / room().challenges.length) * 100}%`;
    $("lesson-view").classList.remove("hidden");
    $("question-view").classList.add("hidden");
    $("lesson-title").textContent = challenge.title;
    $("lesson-body").textContent = challenge.lesson || "Review the mission notes, then use what you learned to answer.";
    $("paxsi-lesson").textContent = challenge.paxsiTip || "Take a breath, read the briefing, and look for the clue that matches the mission.";
    const briefingPaxsi = $("briefing-paxsi");
    const paxsiSprite = assets.paxsiPixels[0];
    if (briefingPaxsi && paxsiSprite) briefingPaxsi.src = paxsiSprite.toDataURL();
    $("attempts-label").textContent = "READ THE BRIEFING";
    const source = $("source-link");
    if (challenge.source) { source.href = challenge.source; source.classList.remove("hidden"); } else source.classList.add("hidden");
    $("answer-list").replaceChildren();
    $("continue-question").onclick = () => showQuestion(challenge);
    $("close-quiz").onclick = closeQuiz;
  }
  function showQuestion(challenge) {
    $("lesson-view").classList.add("hidden");
    $("question-view").classList.remove("hidden");
    $("quiz-title").textContent = challenge.title;
    $("quiz-prompt").textContent = challenge.prompt;
    $("quiz-feedback").textContent = ""; $("quiz-feedback").className = "quiz-feedback";
    attempts = 3;
    $("attempts-label").textContent = "ATTEMPTS LEFT: 3";
    const answers = $("answer-list"); answers.replaceChildren();
    if (challenge.type === "code") {
      const form = document.createElement("form"); form.className = "code-form";
      const input = document.createElement("input"); input.className = "code-input"; input.id = "code-input"; input.inputMode = "numeric"; input.autocomplete = "off"; input.maxLength = 4; input.setAttribute("aria-label", "Enter the escape code"); input.placeholder = "••";
      const button = document.createElement("button"); button.className = "primary-button"; button.type = "submit"; button.textContent = "UNLOCK →";
      form.append(input, button); form.addEventListener("submit", (event) => { event.preventDefault(); checkAnswer(input.value.trim() === challenge.answer, null, challenge); }); answers.append(form);
    } else {
      challenge.options.forEach((option, index) => {
        const button = document.createElement("button"); button.type = "button"; button.className = "answer-option";
        const letter = document.createElement("span"); letter.className = "answer-letter"; letter.textContent = String.fromCharCode(65 + index);
        const text = document.createElement("span"); text.textContent = option; button.append(letter, text);
        button.addEventListener("click", () => checkAnswer(index === challenge.answerIndex, button, challenge)); answers.append(button);
      });
    }
    if (challenge.type === "code") $("answer-list").querySelector("input")?.focus();
  }
  function checkAnswer(correct, button, challenge) {
    if (correct) {
      if (button) button.classList.add("correct");
      $("quiz-feedback").textContent = "Correct! Data accepted. The next lock is responding.";
      $("quiz-feedback").className = "quiz-feedback good";
      $("attempts-label").textContent = "ACCESS GRANTED";
      [...$("answer-list").querySelectorAll("button")].forEach((el) => { el.disabled = true; });
      window.setTimeout(() => {
        state.stages[state.room] += 1;
        if (roomComplete() && state.room === data.rooms.length - 1) finishGame();
        save(); closeQuiz(); updateHud();
      }, 750);
      return;
    }
    if (button) button.classList.add("wrong");
    attempts -= 1;
    $("attempts-label").textContent = `ATTEMPTS LEFT: ${attempts}`;
    if (attempts > 0) {
      $("quiz-feedback").textContent = challenge.type === "code" ? "That code didn't work. Try again." : "Not quite. Try another answer.";
      window.setTimeout(() => button?.classList.remove("wrong"), 450);
    } else {
      $("quiz-feedback").textContent = "Three strikes. The airlock is sending you back one room…";
      $("answer-list").querySelectorAll("button").forEach((el) => { el.disabled = true; });
      window.setTimeout(() => retreat(), 1100);
    }
  }
  function closeQuiz() { quizOpen = false; $("quiz-overlay").classList.add("hidden"); activeKeys.clear(); }
  function retreat() {
    closeQuiz(); state.room = Math.max(0, state.room - 1); player.x = state.room === 0 ? 46 : 420; player.y = 225; player.vy = 0; player.grounded = true; save(); updateHud();
  }
  function advanceRoom() {
    if (!roomComplete()) { showQuiz(); return; }
    if (state.room < data.rooms.length - 1) { state.room += 1; player.x = 40; player.y = 225; player.vy = 0; player.grounded = true; save(); updateHud(); }
  }
  function interact() {
    if (!state.started || state.done || quizOpen) return;
    const targetX = roomComplete() ? 435 : 226;
    if (Math.abs(player.x - targetX) >= 37) return;
    if (roomComplete()) advanceRoom(); else showQuiz();
  }
  function finishGame() {
    if (state.done) return;
    state.done = true; state.started = true; save();
    $("ending-overlay").classList.remove("hidden");
    const endingImageElement = $("paxsi-image");
    if (endingImageElement) endingImageElement.src = paxsiDataUrl(endingImage % assets.paxsi.length);
  }
  function startGame() { state.started = true; $("start-overlay").classList.add("hidden"); save(); }
  function resetGame() { state = freshState(); player.x = 46; player.y = 225; player.vy = 0; player.grounded = true; localStorage.removeItem(storageKey); $("ending-overlay").classList.add("hidden"); $("quiz-overlay").classList.add("hidden"); quizOpen = false; updateHud(); $("start-overlay").classList.remove("hidden"); }

  window.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(event.key)) event.preventDefault();
    if (["ArrowLeft", "ArrowRight", " ", "ArrowUp"].includes(event.key)) activeKeys.add(event.key);
    if (["a", "d", "A", "D"].includes(event.key)) activeKeys.add(event.key.toLowerCase());
    if ((event.key === " " || event.key === "ArrowUp" || event.key.toLowerCase() === "w") && state.started && !quizOpen && player.grounded) { player.vy = -6.8; player.grounded = false; player.frame = 0; }
    if (event.key.toLowerCase() === "e" && !event.repeat) interact();
    if (event.key === "Escape" && quizOpen) closeQuiz();
  });
  window.addEventListener("keyup", (event) => { activeKeys.delete(event.key); activeKeys.delete(event.key.toLowerCase()); });
  window.addEventListener("blur", () => activeKeys.clear());
  $("start-button").addEventListener("click", startGame);
  $("reset-button").addEventListener("click", () => { if (window.confirm("Reset all saved mission progress and start over?")) resetGame(); });
  $("play-again").addEventListener("click", resetGame);
  if (state.started) $("start-overlay").classList.add("hidden");
  if (state.done) {
    $("ending-overlay").classList.remove("hidden");
    const endingImageElement = $("paxsi-image");
    if (endingImageElement) endingImageElement.src = paxsiDataUrl(0);
  }
  updateHud(); requestAnimationFrame(draw);
})();
