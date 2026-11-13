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
    lander: image(data.assets.lander),
    rocket: image(data.assets.rocket),
    ship: image(data.assets.ship),
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
  assets.landerPixels = null;
  function prepareLander() {
    if (!assets.lander.complete || !assets.lander.naturalWidth) return;
    const keyed = document.createElement("canvas");
    keyed.width = assets.lander.naturalWidth; keyed.height = assets.lander.naturalHeight;
    const keyedCtx = keyed.getContext("2d", { willReadFrequently: true });
    keyedCtx.drawImage(assets.lander, 0, 0);
    const frame = keyedCtx.getImageData(0, 0, keyed.width, keyed.height), pixels = frame.data;
    const total = keyed.width * keyed.height, queue = new Int32Array(total);
    let head = 0, tail = 0;
    const addWhiteBackground = (index) => {
      const p = index * 4;
      const high = Math.max(pixels[p], pixels[p + 1], pixels[p + 2]);
      const low = Math.min(pixels[p], pixels[p + 1], pixels[p + 2]);
      if (pixels[p + 3] && low > 218 && high - low < 30) {
        pixels[p + 3] = 0; queue[tail++] = index;
      }
    };
    for (let x = 0; x < keyed.width; x++) {
      addWhiteBackground(x); addWhiteBackground((keyed.height - 1) * keyed.width + x);
    }
    for (let y = 1; y < keyed.height - 1; y++) {
      addWhiteBackground(y * keyed.width); addWhiteBackground(y * keyed.width + keyed.width - 1);
    }
    while (head < tail) {
      const index = queue[head++], x = index % keyed.width, y = (index / keyed.width) | 0;
      if (x) addWhiteBackground(index - 1);
      if (x + 1 < keyed.width) addWhiteBackground(index + 1);
      if (y) addWhiteBackground(index - keyed.width);
      if (y + 1 < keyed.height) addWhiteBackground(index + keyed.width);
    }
    keyedCtx.putImageData(frame, 0, 0);
    let minX = keyed.width, minY = keyed.height, maxX = -1, maxY = -1;
    for (let y = 0; y < keyed.height; y++) for (let x = 0; x < keyed.width; x++) {
      if (pixels[(y * keyed.width + x) * 4 + 3]) {
        minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
    }
    if (maxX < minX || maxY < minY) return;
    const cropped = document.createElement("canvas");
    cropped.width = maxX - minX + 1; cropped.height = maxY - minY + 1;
    cropped.getContext("2d").drawImage(keyed, minX, minY, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
    assets.landerPixels = cropped;
  }
  if (assets.lander.complete) prepareLander();
  else assets.lander.addEventListener("load", prepareLander, { once: true });
  assets.paxsiPixels = [];
  let state = null;
  const doorOpenAt = data.rooms.map(() => null);
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
        const storyImage = $("story-paxi");
        const briefingImage = $("briefing-paxsi");
        const worldPaxsiImage = $("world-paxsi");
        const endingImageElement = $("paxi-image");
        if (index === 0 && introImage) introImage.src = spriteUrl;
        if (index === 0 && storyImage) storyImage.src = spriteUrl;
        if (index === 0 && briefingImage) briefingImage.src = spriteUrl;
        if (index === 0 && worldPaxsiImage) worldPaxsiImage.src = spriteUrl;
        if (state?.done && index === 0 && endingImageElement) endingImageElement.src = spriteUrl;
      }
    };
    if (source.complete) prepare(); else source.addEventListener("load", prepare, { once: true });
  });
  const challengeCatalog = new Map();
  data.rooms.forEach((entry) => {
    if (entry.fixedFirst) challengeCatalog.set(entry.fixedFirst.id, entry.fixedFirst);
    entry.questionPool.forEach((challenge) => challengeCatalog.set(challenge.id, challenge));
  });
  challengeCatalog.set(data.finalChallenge.id, data.finalChallenge);
  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function createChallengeIds() {
    return data.rooms.map((entry, index) => {
      const selected = shuffle(entry.questionPool).slice(0, entry.randomCount).map((challenge) => challenge.id);
      const ids = [...(entry.fixedFirst ? [entry.fixedFirst.id] : []), ...selected];
      if (index === data.rooms.length - 1) ids.push(data.finalChallenge.id);
      return ids;
    });
  }
  function freshState() {
    const challengeIds = createChallengeIds();
    return { started: false, room: 0, challengeIds, stages: challengeIds.map(() => 0), evidence: challengeIds.map((ids) => ids.map(() => false)), x: 82, done: false };
  }
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved || !Array.isArray(saved.challengeIds) || saved.challengeIds.length !== data.rooms.length || !Array.isArray(saved.stages) || saved.stages.length !== data.rooms.length) return freshState();
      if (saved.challengeIds.some((ids) => !Array.isArray(ids) || ids.some((id) => !challengeCatalog.has(id)))) return freshState();
      if (saved.challengeIds.some((ids, index) => ids.length !== data.rooms[index].randomCount + (data.rooms[index].fixedFirst ? 1 : 0) + (index === data.rooms.length - 1 ? 1 : 0))) return freshState();
      delete saved.gateWarningUntil;
      return {
        ...saved,
        stages: saved.stages.map((n, i) => Math.max(0, Math.min(saved.challengeIds[i].length, Number(n) || 0))),
        evidence: saved.challengeIds.map((ids, i) => ids.map((_, j) => Boolean(saved.evidence?.[i]?.[j]))),
        room: Math.max(0, Math.min(data.rooms.length - 1, Number(saved.room) || 0))
      };
    } catch { return freshState(); }
  }
  state = loadState();
  if (state.room === 0 && state.stages[0] === 0 && state.x === 118) state.x = 82;
  function groundYAt(x, roomIndex = state.room) {
    if (roomIndex !== 0) return 225;
    if (x < 110) return 174;
    if (x < 128) return 182;
    if (x < 146) return 190;
    if (x < 164) return 198;
    if (x < 182) return 206;
    if (x < 200) return 214;
    if (x < 218) return 222;
    return 225;
  }
  function missionConsoleX(roomIndex = state.room) { return roomIndex === 0 ? 280 : 226; }
  const player = { x: state.x || 82, y: groundYAt(state.x || 82), vy: 0, direction: 1, grounded: true, frame: 0, anim: 0 };
  let quizOpen = false;
  let gameActive = false;
  let attempts = 3;
  let triedCodes = new Set();
  let activeEntryMode = "digits";
  let activeEntryLength = 6;
  const normalizeEntry = (value, mode = activeEntryMode, length = activeEntryLength) => mode === "digits"
    ? value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/\D/g, "").slice(0, length)
    : value.toLowerCase().replace(/[^a-z]/g, "").slice(0, length);
  let activeKeys = new Set();
  let lastFrame = 0;
  let endingImage = 0;
  let particles = [];
  let lastGateHitAt = 0;
  let gateWarningUntil = 0;
  const airlockDoorX = 435;
  const room = (index = state.room) => ({ ...data.rooms[index], challenges: state.challengeIds[index].map((id) => challengeCatalog.get(id)) });
  const stage = () => room().challenges[state.stages[state.room]];
  const evidenceFound = (roomIndex = state.room, challengeIndex = state.stages[state.room]) => Boolean(state.evidence?.[roomIndex]?.[challengeIndex]);
  const roomComplete = (index = state.room) => state.stages[index] >= room(index).challenges.length;
  function airlockGates(roomIndex = state.room) {
    return roomComplete(roomIndex) && roomIndex < data.rooms.length - 1
      ? [{ x: 366, top: 201 }]
      : [];
  }
  function burstPixels(x, y, colors, count = 18) {
    for (let i = 0; i < count; i++) particles.push({
      x, y, vx: (Math.random() - .5) * 3.2, vy: -Math.random() * 3.6 - .5,
      size: Math.random() > .7 ? 3 : 2, life: 30 + Math.random() * 18,
      color: colors[i % colors.length]
    });
  }
  function drawParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const spark = particles[i];
      spark.x += spark.vx * dt; spark.y += spark.vy * dt; spark.vy += .11 * dt; spark.life -= dt;
      if (spark.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, spark.life / 12); ctx.fillStyle = spark.color;
      ctx.fillRect(Math.round(spark.x), Math.round(spark.y), spark.size, spark.size);
    }
    ctx.globalAlpha = 1;
  }
  function save() { state.x = Math.round(player.x); try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {} }
  function paxsiDataUrl(index = 0) {
    const sprite = assets.paxsiPixels[index];
    return sprite ? sprite.toDataURL() : assets.paxsi[index].src;
  }

  function drawLanderFallback() {
    // A built-in pixel-art lander keeps the first room readable even if the PNG is missing online.
    ctx.save();
    const scale = .84;
    ctx.translate(0, 225 - 110 * scale); ctx.scale(scale, scale);
    ctx.fillStyle = "#161c31";
    ctx.fillRect(28, 17, 124, 54); ctx.fillRect(45, 7, 86, 10); ctx.fillRect(16, 27, 12, 34);
    ctx.fillRect(140, 34, 26, 37); ctx.fillRect(34, 71, 91, 9);
    ctx.fillStyle = "#eef2f5"; ctx.fillRect(45, 7, 86, 9); ctx.fillRect(30, 18, 120, 13);
    ctx.fillStyle = "#c5ced9"; ctx.fillRect(19, 31, 130, 18); ctx.fillRect(25, 49, 124, 13);
    ctx.fillStyle = "#42b4e8"; ctx.fillRect(51, 31, 17, 18); ctx.fillRect(82, 31, 17, 18); ctx.fillRect(113, 31, 17, 18);
    ctx.fillStyle = "#e94c56"; ctx.fillRect(17, 49, 133, 8);
    ctx.fillStyle = "#8b9bad"; ctx.fillRect(29, 58, 90, 13); ctx.fillRect(31, 71, 89, 7);
    ctx.fillStyle = "#59677b"; ctx.fillRect(58, 78, 14, 27); ctx.fillRect(118, 78, 14, 27);
    ctx.fillRect(48, 101, 34, 5); ctx.fillRect(108, 101, 34, 5);
    ctx.fillStyle = "#ffe18c"; ctx.fillRect(155, 51, 34, 22);
    ctx.fillStyle = "#f4c65a"; ctx.fillRect(143, 73, 76, 12); ctx.fillRect(196, 85, 42, 12); ctx.fillRect(223, 97, 27, 9);
    ctx.fillStyle = "#96671f"; ctx.fillRect(143, 85, 76, 11); ctx.fillRect(196, 96, 42, 10); ctx.fillRect(223, 106, 27, 4);
    ctx.fillStyle = "#ffd76e"; ctx.fillRect(0, 38, 12, 10); ctx.fillRect(12, 28, 8, 31);
    ctx.fillStyle = "#f49a26"; ctx.fillRect(0, 48, 13, 10); ctx.fillRect(13, 59, 7, 6);
    ctx.restore();
  }

  function drawLanderSteps() {
    // Raised landing deck and short, walkable steps down to the lunar surface.
    ctx.fillStyle = "#273245"; ctx.fillRect(62, 174, 50, 51);
    ctx.fillStyle = "#f2c75d"; ctx.fillRect(62, 171, 50, 5);
    ctx.fillStyle = "#96671f"; ctx.fillRect(62, 176, 50, 3);
    const steps = [[110, 182], [128, 190], [146, 198], [164, 206], [182, 214], [200, 222]];
    steps.forEach(([x, y]) => {
      ctx.fillStyle = "#273245"; ctx.fillRect(x, y, 18, 225 - y);
      ctx.fillStyle = "#96671f"; ctx.fillRect(x, y + 4, 18, Math.max(0, 225 - y - 4));
      ctx.fillStyle = "#f2c75d"; ctx.fillRect(x, y, 18, 4);
      ctx.fillStyle = "#ffe08a"; ctx.fillRect(x, y, 18, 1);
    });
  }

  function drawBackdrop(roomIndex, time) {
    if (roomIndex === 0) {
      if (assets.scene.complete && assets.scene.naturalWidth) ctx.drawImage(assets.scene, 0, 0, canvas.width, canvas.height);
      else { ctx.fillStyle = "#211a32"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      // Animated foreground specks create visible motion even when the GIF is paused by a browser.
      for (let i = 0; i < 24; i++) {
        const x = (i * 83 + time * (0.008 + (i % 4) * 0.003)) % canvas.width;
        const y = 28 + (i * 47) % 138;
        ctx.globalAlpha = .18 + .2 * (1 + Math.sin(time / 370 + i));
        ctx.fillStyle = i % 3 ? "#ffd98a" : "#a8dff0";
        ctx.fillRect(x, y, i % 7 === 0 ? 2 : 1, 1);
      }
      ctx.globalAlpha = 1;
      return;
    }
    if (roomIndex === 1) {
      const sky = ctx.createLinearGradient(0, 0, 0, 225);
      sky.addColorStop(0, "#07111f"); sky.addColorStop(1, "#182f43");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, 480, 270);
      for (let i = 0; i < 58; i++) {
        const x = (i * 127 + 19) % 480, y = (i * 43 + 13) % 190;
        ctx.globalAlpha = .32 + .45 * (1 + Math.sin(time / (280 + i % 5 * 45) + i));
        ctx.fillStyle = i % 6 ? "#d8eaff" : "#9ad9ce";
        ctx.fillRect(x, y, i % 11 === 0 ? 2 : 1, i % 11 === 0 ? 2 : 1);
      }
      ctx.globalAlpha = 1;
      // A slowly turning blue Earth makes this room feel like an orbital deck.
      ctx.fillStyle = "#102536"; ctx.beginPath(); ctx.arc(410, 72, 46, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#287da4"; ctx.beginPath(); ctx.arc(410, 72, 38, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#4a9b85"; ctx.fillRect(390 + Math.round(Math.sin(time / 1300) * 4), 56, 15, 8); ctx.fillRect(418, 77, 13, 10);
      ctx.fillStyle = "#bde3e9"; ctx.fillRect(376, 49, 9, 3); ctx.fillRect(431, 91, 10, 3);
      ctx.strokeStyle = "#9ad9ce66"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(410, 72, 61, 21, -.3, 0, Math.PI * 2); ctx.stroke();
      return;
    }
    const hangar = ctx.createLinearGradient(0, 0, 0, 225);
    hangar.addColorStop(0, "#17232e"); hangar.addColorStop(.62, "#293b43"); hangar.addColorStop(1, "#475047");
    ctx.fillStyle = hangar; ctx.fillRect(0, 0, 480, 270);
    ctx.fillStyle = "#52615d";
    for (let x = 18; x < 480; x += 64) { ctx.fillRect(x, 20, 4, 205); ctx.fillRect(x + 4, 26, 48, 2); }
    ctx.fillStyle = "#d5d29a";
    for (let x = 40; x < 480; x += 128) {
      const glow = .55 + .35 * Math.sin(time / 260 + x);
      ctx.globalAlpha = glow; ctx.fillRect(x, 30, 24, 3); ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "#17242a"; ctx.fillRect(0, 212, 480, 13);
    ctx.fillStyle = "#668078"; ctx.fillRect(0, 211, 480, 2);
  }

  function drawGround(roomIndex, accent) {
    if (roomIndex === 0) {
      ctx.fillStyle = "#555b62"; ctx.fillRect(0, 225, 480, 45);
      ctx.fillStyle = "#a7a59b"; ctx.fillRect(0, 225, 480, 3);
      ctx.fillStyle = "#777970";
      for (let x = 13; x < 480; x += 37) {
        const y = 233 + (x * 7 % 23);
        ctx.fillRect(x, y, 2 + x % 3, 1);
        ctx.fillRect((x + 17) % 480, y + 9, 2, 2);
      }
      ctx.fillStyle = "#454b52";
      for (let x = 25; x < 480; x += 71) ctx.fillRect(x, 225, 4, 1);
      return;
    }
    ctx.fillStyle = roomIndex === 1 ? "#263843" : "#303a39"; ctx.fillRect(0, 225, 480, 45);
    ctx.fillStyle = accent; ctx.globalAlpha = .8; ctx.fillRect(0, 223, 480, 2); ctx.globalAlpha = 1;
    for (let x = 10; x < 480; x += 40) {
      ctx.fillStyle = roomIndex === 1 ? "#344c56" : "#414d45"; ctx.fillRect(x, 232, 30, 2);
      ctx.fillStyle = "#89938a"; ctx.fillRect(x + 3, 241, 2, 2); ctx.fillRect(x + 25, 241, 2, 2);
    }
  }

  function drawRoom(time = 0) {
    const w = canvas.width, h = canvas.height, roomIndex = state.room;
    const palettes = [
      { accent: "#efb26f", tint: null },
      { accent: "#9ad9ce", tint: "rgba(29, 55, 70, .22)" },
      { accent: "#d9a4da", tint: "rgba(50, 31, 66, .3)" }
    ];
    const p = palettes[roomIndex];
    ctx.imageSmoothingEnabled = false;
    drawBackdrop(roomIndex, time);
    if (p.tint) { ctx.fillStyle = p.tint; ctx.fillRect(0, 0, w, h); }
    drawGround(roomIndex, p.accent);
    if (roomIndex === 0) drawFieldProps(time, p.accent);
    drawMissionSetpiece(roomIndex, time);
    // Artemis I opens at the crew's lander. The source art's dark backdrop is keyed out above.
    if (roomIndex === 0) {
      if (assets.landerPixels) {
        const ship = assets.landerPixels;
        ctx.drawImage(ship, 0, 225 - ship.height * (210 / ship.width), 210, ship.height * (210 / ship.width));
      } else drawLanderFallback();
      drawLanderSteps();
    }
    // Mission console
    const consoleX = missionConsoleX(roomIndex);
    ctx.fillStyle = "#111a25"; ctx.fillRect(consoleX - 18, 189, 36, 36);
    ctx.fillStyle = "#455563"; ctx.fillRect(consoleX - 14, 192, 28, 25);
    ctx.fillStyle = roomComplete() ? "#b8ed76" : p.accent; ctx.fillRect(consoleX - 10, 196, 20, 9);
    ctx.fillStyle = "#17232e"; ctx.fillRect(consoleX - 8, 198, 16, 2);
    ctx.fillStyle = "#d7e3e9"; ctx.fillRect(consoleX - 11, 209, 22, 2);
    ctx.fillStyle = "#17232e"; ctx.fillRect(consoleX - 4, 217, 8, 8);
    // Door uses the team's 32x32 closed sprite, followed by its opening animation.
    const doorX = airlockDoorX;
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
    drawAirlockGates(time, roomIndex);
    // Keep Paxi behind the final airlock until the crew reaches the rescue room.
    const paxsiSprite = assets.paxsiPixels[Math.floor(time / 560) % Math.max(1, assets.paxsiPixels.length)];
    if (roomIndex === 2 && paxsiSprite) {
      const bob = isDoorOpen ? 0 : Math.round(Math.sin(time / 360) * 1);
      ctx.drawImage(paxsiSprite, 420 - 16, 193 + bob, 32, 32);
    }
    const challenge = stage();
    const artifact = challenge?.artifact;
    const needsEvidence = Boolean(artifact && !evidenceFound());
    if (needsEvidence) drawFieldArtifact(artifact, time, p.accent);
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
    // Clear, readable HTML speech and interaction bubbles sit above the pixel scene.
    const targetX = roomComplete() ? doorX : needsEvidence ? artifact.x : consoleX;
    const canInteract = Math.abs(player.x - targetX) < 37 && player.grounded;
    updateWorldDialogue(canInteract, targetX, needsEvidence ? artifact : null);
    // A faint beacon marks the console if the player is far away.
    if (!roomComplete() && !canInteract) { ctx.globalAlpha = .55 + Math.sin(time / 220) * .2; ctx.fillStyle = p.accent; ctx.fillRect(consoleX - 1, 182, 2, 2); ctx.globalAlpha = 1; }
  }

  function drawMissionSetpiece(roomIndex, time) {
    if (roomIndex === 1) {
      // Artemis II orbital operations board: a moving crewed trajectory around the Moon.
      ctx.fillStyle = "#111a24"; ctx.fillRect(24, 66, 100, 61);
      ctx.fillStyle = "#7d9a98"; ctx.fillRect(22, 64, 104, 3); ctx.fillRect(22, 127, 104, 3);
      ctx.fillStyle = "#3398bd"; ctx.fillRect(37, 83, 18, 18); ctx.fillStyle = "#b3e3df"; ctx.fillRect(43, 79, 8, 4);
      ctx.fillStyle = "#b9b1a2"; ctx.fillRect(91, 76, 15, 15); ctx.fillStyle = "#e2d6bd"; ctx.fillRect(95, 72, 7, 4);
      ctx.strokeStyle = "#b6d27d"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(73, 91, 35, 17, -.25, .1, Math.PI * 1.9); ctx.stroke();
      const dotX = 73 + Math.cos(time / 900) * 34, dotY = 91 + Math.sin(time / 900) * 15;
      if (assets.ship.complete && assets.ship.naturalWidth) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(assets.ship, Math.round(dotX - 12), Math.round(dotY - 12), 24, 24);
      } else { ctx.fillStyle = "#ffe08a"; ctx.fillRect(dotX - 2, dotY - 2, 5, 5); }
      ctx.fillStyle = "#586a68"; ctx.fillRect(39, 130, 6, 95); ctx.fillRect(105, 130, 6, 95);
    } else if (roomIndex === 2) {
      // Artemis III lander test bay, docking target, and bright work lights.
      ctx.fillStyle = "#273245"; ctx.fillRect(48, 143, 5, 82); ctx.fillRect(148, 143, 5, 82); ctx.fillRect(44, 141, 113, 4);
      ctx.fillStyle = "#82908a"; ctx.fillRect(57, 151, 38, 34); ctx.fillRect(53, 148, 46, 4);
      ctx.fillStyle = "#f2c75d"; ctx.fillRect(68, 158, 17, 18); ctx.fillRect(63, 176, 5, 7); ctx.fillRect(85, 176, 5, 7);
      ctx.fillStyle = "#263f49"; ctx.fillRect(308, 86, 104, 55); ctx.fillStyle = "#a7dfe0"; ctx.fillRect(324, 101, 72, 4); ctx.fillRect(356, 89, 5, 49);
      ctx.fillStyle = "#ffe08a"; ctx.fillRect(351, 111, 15, 5); ctx.fillRect(356, 106, 5, 15);
      ctx.fillStyle = "#59677b"; ctx.fillRect(322, 141, 8, 84); ctx.fillRect(392, 141, 8, 84);
      // The uploaded rocket sprite is displayed as a test vehicle on its own floor mount.
      ctx.fillStyle = "#59677b"; ctx.fillRect(211, 220, 28, 5);
      ctx.fillStyle = "#a7dfe0"; ctx.fillRect(215, 218, 20, 2);
      if (assets.rocket.complete && assets.rocket.naturalWidth) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(assets.rocket, 213, 188, 24, 30);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawAirlockGates(time, roomIndex) {
    airlockGates(roomIndex).forEach((gate, index) => {
      const pulse = .62 + .32 * Math.sin(time / 90 + index);
      ctx.fillStyle = "#202a30"; ctx.fillRect(gate.x - 3, 210, 6, 15);
      ctx.fillStyle = "#87928a"; ctx.fillRect(gate.x - 5, 222, 10, 3);
      ctx.fillStyle = "#e77a6b"; ctx.globalAlpha = pulse; ctx.fillRect(gate.x - 2, gate.top, 4, 23);
      ctx.fillStyle = "#ffe08a"; ctx.fillRect(gate.x - 1, gate.top + 2, 2, 18);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#e77a6b"; ctx.globalAlpha = .18 + pulse * .12; ctx.fillRect(gate.x - 8, gate.top, 16, 2);
      ctx.globalAlpha = 1;
    });
  }

  function drawFieldArtifact(artifact, time, accent) {
    const x = Math.round(artifact.x), y = 195, blink = .68 + .32 * Math.sin(time / 190);
    ctx.globalAlpha = blink;
    ctx.fillStyle = accent; ctx.fillRect(x - 11, 220, 22, 3); ctx.fillRect(x - 7, 216, 14, 3);
    ctx.fillStyle = "#16212a"; ctx.fillRect(x - 10, y, 20, 20);
    ctx.fillStyle = accent; ctx.fillRect(x - 12, y - 2, 24, 2); ctx.fillRect(x - 12, y + 20, 24, 2);
    if (artifact.icon === "recorder") {
      ctx.fillStyle = "#9fb0b8"; ctx.fillRect(x - 6, y + 3, 12, 14); ctx.fillStyle = "#b9e6cf"; ctx.fillRect(x - 4, y + 5, 8, 6); ctx.fillStyle = "#efb26f"; ctx.fillRect(x - 3, y + 13, 6, 2);
    } else if (artifact.icon === "manifest") {
      ctx.fillStyle = "#e7e3ce"; ctx.fillRect(x - 6, y + 3, 12, 14); ctx.fillStyle = "#78867e"; ctx.fillRect(x - 3, y + 6, 7, 1); ctx.fillRect(x - 3, y + 9, 7, 1); ctx.fillRect(x - 3, y + 12, 5, 1);
    } else if (artifact.icon === "life-support") {
      ctx.fillStyle = "#72c8d2"; ctx.fillRect(x - 6, y + 5, 5, 11); ctx.fillRect(x + 1, y + 5, 5, 11); ctx.fillStyle = "#d8e4a0"; ctx.fillRect(x - 5, y + 3, 3, 2); ctx.fillRect(x + 2, y + 3, 3, 2);
    } else if (artifact.icon === "map") {
      ctx.fillStyle = "#d5d8c9"; ctx.fillRect(x - 7, y + 4, 14, 12); ctx.fillStyle = accent; ctx.fillRect(x - 5, y + 9, 3, 2); ctx.fillRect(x - 2, y + 6, 3, 2); ctx.fillRect(x + 1, y + 8, 3, 2); ctx.fillRect(x + 4, y + 5, 2, 2);
    } else if (artifact.icon === "beacon") {
      ctx.fillStyle = "#efb26f"; ctx.fillRect(x - 2, y + 4, 4, 12); ctx.fillRect(x - 5, y + 2, 10, 4); ctx.fillStyle = "#fff0a6"; ctx.fillRect(x - 2, y + 1, 4, 3);
    } else if (artifact.icon === "lander") {
      ctx.fillStyle = "#f2c75d"; ctx.fillRect(x - 5, y + 5, 10, 8); ctx.fillRect(x - 7, y + 13, 3, 3); ctx.fillRect(x + 4, y + 13, 3, 3); ctx.fillStyle = "#a7dfe0"; ctx.fillRect(x - 2, y + 6, 4, 3);
    } else if (artifact.icon === "target") {
      ctx.fillStyle = "#e6dcbf"; ctx.fillRect(x - 6, y + 3, 12, 2); ctx.fillRect(x - 6, y + 15, 12, 2); ctx.fillRect(x - 6, y + 3, 2, 14); ctx.fillRect(x + 4, y + 3, 2, 14); ctx.fillStyle = "#e77a6b"; ctx.fillRect(x - 2, y + 8, 5, 5);
    }
    ctx.globalAlpha = 1;
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

  function updateWorldDialogue(canInteract, targetX, artifact = null) {
    const bubble = $("world-dialogue"), prompt = $("world-interact");
    if (!gameActive || quizOpen || state.done) {
      bubble.classList.add("hidden"); prompt.classList.add("hidden"); return;
    }
    const paxsiX = 420;
    const nearPaxsi = state.room === 2 && Math.abs(player.x - paxsiX) < 54;
    const nearLander = state.room === 0 && Math.abs(player.x - 82) < 48;
    const nearArtifact = artifact && Math.abs(player.x - artifact.x) < 52;
    const speaker = nearPaxsi ? "PAXI" : "MISSION CONTROL";
    const line = nearPaxsi ? room().paxsiLine : nearArtifact
      ? `You found the ${artifact.name}. Get close and press E to scan its mission data.`
      : nearLander
      ? "Exit the lander and take the stairs down to the mission console."
      : roomComplete()
      ? "The next airlock is open. Come on!"
      : `The ${room().title} mission file is ready. Read the briefing before you answer.`;
    if ($("world-speaker").textContent !== speaker) $("world-speaker").textContent = speaker;
    if ($("world-dialogue-text").textContent !== line) $("world-dialogue-text").textContent = line;
    $("world-paxsi").classList.toggle("hidden", !nearPaxsi);
    bubble.dataset.speaker = nearPaxsi ? "paxsi" : "control";
    const anchorX = nearPaxsi ? paxsiX : nearArtifact ? artifact.x : nearLander ? 82 : targetX;
    bubble.style.left = `${Math.max(27, Math.min(73, anchorX / canvas.width * 100))}%`;
    bubble.style.top = `${state.room === 0 ? 30 : 9}%`;
    bubble.classList.toggle("hidden", !nearPaxsi && !nearLander && !nearArtifact && !canInteract);
    prompt.classList.toggle("hidden", !canInteract && !nearArtifact);
    if (canInteract) {
      prompt.classList.remove("auto-scan");
      $("world-interact-key").textContent = "E";
    prompt.style.left = `${Math.min(82, targetX / canvas.width * 100)}%`;
      $("world-interact-text").textContent = roomComplete()
        ? (state.room === data.rooms.length - 1 ? "RESCUE PAXI" : "ENTER NEXT ROOM")
        : artifact && !evidenceFound() ? `SCAN ${artifact.name.toUpperCase()}` : "OPEN MISSION BRIEFING";
    } else if (nearArtifact) {
      prompt.classList.add("auto-scan");
      $("world-interact-key").textContent = "E";
      prompt.style.left = `${Math.min(82, artifact.x / canvas.width * 100)}%`;
      $("world-interact-text").textContent = `MOVE CLOSER TO SCAN ${artifact.name.toUpperCase()}`;
    } else prompt.classList.remove("auto-scan");
  }

  function draw(time = 0) {
    const dt = Math.min((time - lastFrame) / 16.67 || 1, 2); lastFrame = time;
    const left = activeKeys.has("ArrowLeft") || activeKeys.has("a");
    const right = activeKeys.has("ArrowRight") || activeKeys.has("d");
    if (gameActive && !quizOpen && !state.done) {
      const previousX = player.x;
      if (left) { player.x -= 2.3 * dt; player.direction = -1; }
      if (right) { player.x += 2.3 * dt; player.direction = 1; }
      player.x = Math.max(18, Math.min(465, player.x));
      const floorY = groundYAt(player.x);
      if (floorY < player.y && player.y - floorY <= 12 && player.vy === 0) {
        player.y = floorY; player.grounded = true;
      } else if (floorY > player.y && player.grounded) player.grounded = false;
      player.y += player.vy * dt;
      if (!player.grounded) player.vy += .42 * dt;
      if (player.y >= floorY) { player.y = floorY; player.vy = 0; player.grounded = true; }
      const hitGate = player.vy >= 0 ? airlockGates().find((gate) => Math.abs(player.x - gate.x) < 9 && player.y > gate.top + 2) : null;
      if (hitGate) {
        player.x = previousX; player.y = groundYAt(player.x); player.vy = 0; player.grounded = true;
        if (performance.now() - lastGateHitAt > 650) {
          lastGateHitAt = performance.now(); gateWarningUntil = lastGateHitAt + 1700;
          burstPixels(hitGate.x, hitGate.top + 8, ["#ffe08a", "#e77a6b", "#ffffff"], 9);
          const wrap = $("game-wrap"); wrap.classList.remove("shake"); void wrap.offsetWidth; wrap.classList.add("shake");
          window.setTimeout(() => wrap.classList.remove("shake"), 240);
          updateHud(); window.setTimeout(updateHud, 1800);
        }
      }
    }
    drawRoom(time);
    drawParticles(dt);
    requestAnimationFrame(draw);
  }

  function updateHud() {
    const r = room();
    $("room-kicker").textContent = r.kicker;
    $("room-title").textContent = r.title;
    $("room-count").innerHTML = `ROOM 0${state.room + 1} <span>/ 0${data.rooms.length}</span>`;
    $("field-note").textContent = room().note || "Mission data is waiting to be scanned.";
    const total = data.rooms.reduce((n, entry, i) => n + room(i).challenges.length, 0);
    const complete = data.rooms.reduce((n, entry, i) => n + state.stages[i], 0);
    $("hud-progress").textContent = `DATA ${String(Math.round(complete / total * 100)).padStart(2, "0")}%`;
    const list = $("mission-list"); list.replaceChildren();
    data.rooms.forEach((entry, i) => {
      const item = document.createElement("div");
      item.className = `mission-item${i === state.room ? " active" : ""}${roomComplete(i) ? " done" : ""}`;
      const num = document.createElement("span"); num.className = "mission-number"; num.textContent = `0${i + 1}`;
      const desc = document.createElement("div"); const name = document.createElement("div"); name.className = "mission-name"; name.textContent = entry.title;
      const sub = document.createElement("div"); sub.className = "mission-sub"; sub.textContent = roomComplete(i) ? "CLEARED" : `${String(state.stages[i]).padStart(2, "0")} / ${String(room(i).challenges.length).padStart(2, "0")} DATA`; desc.append(name, sub);
      const check = document.createElement("span"); check.className = "mission-check"; check.textContent = roomComplete(i) ? "✓" : i === state.room ? "◉" : "·";
      item.append(num, desc, check); list.append(item);
    });
    const all = state.stages.reduce((n, x, i) => n + (x >= room(i).challenges.length ? 1 : 0), 0);
    const currentChallenge = stage();
    const neededArtifact = currentChallenge?.artifact && !evidenceFound() ? currentChallenge.artifact : null;
    $("objective-text").textContent = state.done ? "Paxi is safe. Return to Earth together."
      : roomComplete()
      ? (state.room < data.rooms.length - 1 ? "Jump over the energy gate, then press E at the airlock." : "All missions cleared. Paxi is just ahead!")
      : neededArtifact ? `Search for the ${neededArtifact.name}, move close, and press E to scan it.`
      : currentChallenge?.artifact ? "Evidence recovered. Return to the console to reopen the briefing."
      : "Find the mission console and press E.";
    const gateWarning = gateWarningUntil > performance.now();
    $("status-text").textContent = state.done ? "PAXI RESCUED" : gateWarning ? "ENERGY GATE · JUMP!" : roomComplete() ? "EXIT UNLOCKED" : "SYSTEMS NOMINAL";
    $("status-chip").querySelector(".status-light").style.background = state.done ? "#c7f36b" : gateWarning ? "#e77a6b" : roomComplete() ? "#8bd9f5" : "#c7f36b";
    if (all === data.rooms.length && !state.done) finishGame();
  }

  function renderPuzzleBoard(challenge) {
    const board = $("puzzle-board");
    board.replaceChildren();
    const addHeading = (text) => { const heading = document.createElement("h3"); heading.textContent = text; board.append(heading); };
    const addList = (title, values) => {
      const section = document.createElement("section");
      const heading = document.createElement("h4"); heading.textContent = title; section.append(heading);
      const list = document.createElement("ol");
      values.forEach((value) => { const item = document.createElement("li"); item.textContent = value; list.append(item); });
      section.append(list); return section;
    };
    if (challenge.matching) {
      addHeading("MISSION FILE · MATCH THE CLUES");
      const columns = document.createElement("div"); columns.className = "puzzle-columns";
      columns.append(addList("NUMBERED COMPONENTS", challenge.matching.categories), addList("DESCRIPTIONS · A–F", challenge.matching.descriptions));
      board.append(columns); board.classList.remove("hidden");
    } else if (challenge.cipher) {
      addHeading("ZIPPY SYMBOL KEY");
      const key = document.createElement("div"); key.className = "cipher-key";
      challenge.cipher.key.forEach(([symbol, letter]) => {
        const pair = document.createElement("span"); pair.className = "cipher-pair";
        const cipherSymbol = document.createElement("b"); cipherSymbol.textContent = symbol;
        const mappedLetter = document.createElement("i"); mappedLetter.textContent = letter;
        pair.append(cipherSymbol, mappedLetter); key.append(pair);
      });
      const messageLabel = document.createElement("h4"); messageLabel.textContent = "ENCRYPTED MESSAGE";
      const message = document.createElement("p"); message.className = "cipher-message"; message.textContent = challenge.cipher.message;
      board.append(key, messageLabel, message); board.classList.remove("hidden");
    } else board.classList.add("hidden");
  }
  function showQuiz() {
    if (roomComplete()) return;
    $("touch-controls").classList.add("hidden");
    quizOpen = true; attempts = 3;
    const challenge = stage();
    renderPuzzleBoard(challenge);
    const previous = state.stages[state.room] > 0 ? room().challenges[state.stages[state.room] - 1] : null;
    const recap = $("previous-recap");
    recap.classList.toggle("hidden", !previous);
    if (previous) {
      $("previous-recap-title").textContent = previous.title;
      $("previous-recap-answer").textContent = previous.type === "code"
        ? "Code entered: " + previous.answer + "."
        : previous.options?.[previous.answerIndex] || previous.prompt;
    }
    $("quiz-overlay").classList.remove("hidden");
    $("quiz-room-label").textContent = room().title.toUpperCase();
    $("quiz-number").textContent = `CHALLENGE ${String(state.stages[state.room] + 1).padStart(2, "0")} / ${String(room().challenges.length).padStart(2, "0")}`;
    $("quiz-progress").style.width = `${(state.stages[state.room] / room().challenges.length) * 100}%`;
    $("lesson-view").classList.remove("hidden");
    $("question-view").classList.add("hidden");
    $("lesson-title").textContent = challenge.title;
    const conciseBrief = challenge.brief || (challenge.artifact
      ? `Mission Control: the ${challenge.artifact.name} contains the key data for this test.`
      : challenge.lesson || "Review the mission notes, then use what you learned to answer.");
    $("lesson-body").textContent = conciseBrief;
    $("lesson-full").textContent = challenge.lesson || conciseBrief;
    $("lesson-more").classList.toggle("hidden", !challenge.lesson || challenge.lesson === conciseBrief);
    $("lesson-more").open = false;
    $("paxsi-lesson").textContent = challenge.paxsiTip || "Take a breath, read the briefing, and look for the clue that matches the mission.";
    const evidenceCard = $("evidence-found");
    if (challenge.artifact && evidenceFound()) {
      evidenceCard.classList.remove("hidden");
      $("evidence-title").textContent = challenge.artifact.name;
      $("evidence-clue").textContent = challenge.artifact.clue;
    } else evidenceCard.classList.add("hidden");
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
    triedCodes = new Set();
    $("attempts-label").textContent = "ATTEMPTS LEFT: 3";
    const answers = $("answer-list"); answers.replaceChildren();
    const codeForm = $("code-form"), codeInput = $("code-input");
    codeForm.classList.toggle("hidden", challenge.type !== "code");
    answers.classList.toggle("hidden", challenge.type === "code");
    if (challenge.type === "code") {
      activeEntryMode = challenge.answerMode || "digits";
      activeEntryLength = challenge.answerLength || 6;
      codeInput.value = "";
      codeInput.disabled = false;
      codeInput.inputMode = activeEntryMode === "digits" ? "numeric" : "text";
      codeInput.maxLength = activeEntryMode === "digits" ? activeEntryLength : 60;
      codeInput.classList.toggle("phrase-entry", activeEntryMode === "letters");
      codeInput.placeholder = challenge.placeholder || "ENTER CODE";
      codeInput.setAttribute("aria-label", challenge.prompt);
      codeForm.onsubmit = (event) => {
        event.preventDefault();
        const code = normalizeEntry(codeInput.value);
        const expected = normalizeEntry(challenge.answer, activeEntryMode, activeEntryLength);
        if (code.length !== activeEntryLength) {
          $("quiz-feedback").textContent = activeEntryMode === "digits"
            ? "Enter all " + activeEntryLength + " digits before unlocking."
            : "Enter the full decoded message before unlocking.";
          codeInput.focus();
          return;
        }
        if (triedCodes.has(code)) { $("quiz-feedback").textContent = "You already tried that code."; return; }
        triedCodes.add(code); checkAnswer(code === expected, null, challenge);
      };
      codeInput.focus({ preventScroll: true });
      requestAnimationFrame(() => { if (codeInput.isConnected && !codeForm.classList.contains("hidden")) codeInput.focus({ preventScroll: true }); });
    } else {
      codeForm.onsubmit = null;
      challenge.options.forEach((option, index) => {
        const button = document.createElement("button"); button.type = "button"; button.className = "answer-option";
        const letter = document.createElement("span"); letter.className = "answer-letter"; letter.textContent = String.fromCharCode(65 + index);
        const text = document.createElement("span"); text.textContent = option; button.append(letter, text);
        button.addEventListener("click", () => checkAnswer(index === challenge.answerIndex, button, challenge)); answers.append(button);
      });
    }
  }
  function checkAnswer(correct, button, challenge) {
    if (correct) {
      const codeInput = $("code-input");
      if (challenge.type === "code" && codeInput) codeInput.disabled = true;
      if (button) button.classList.add("correct");
      const card = $("quiz-overlay").querySelector(".overlay-card");
      card.classList.remove("answer-pop"); void card.offsetWidth; card.classList.add("answer-pop");
      window.setTimeout(() => card.classList.remove("answer-pop"), 500);
      burstPixels(player.x, player.y - 17, ["#c9d77b", "#ffe08a", "#f4f0d3"], 24);
      $("quiz-feedback").textContent = "Correct! Data accepted. The next lock is responding.";
      $("quiz-feedback").className = "quiz-feedback good";
      $("attempts-label").textContent = "ACCESS GRANTED";
      [...$("answer-list").querySelectorAll("button")].forEach((el) => { el.disabled = true; });
      window.setTimeout(() => {
        state.stages[state.room] += 1;
        if (roomComplete() && state.room === data.rooms.length - 1) finishGame();
        save(); closeQuiz(); updateHud();
        if (!state.done && !roomComplete() && !stage().artifact) showQuiz();
      }, 1650);
      return;
    }
    if (button) { button.classList.add("wrong"); button.disabled = true; }
    attempts -= 1;
    $("attempts-label").textContent = `ATTEMPTS LEFT: ${attempts}`;
    if (attempts > 0) {
      $("quiz-feedback").textContent = challenge.type === "code" ? "That code didn't work. Try again." : "Not quite. Try another answer.";
      // Keep a wrong option disabled for the rest of this question to prevent repeat-click retries.
    } else {
      const isLastChallengeInRoom = state.stages[state.room] === room().challenges.length - 1;
      $("quiz-feedback").textContent = isLastChallengeInRoom
        ? "Three strikes. This final challenge stays in this room. Review the clues and try again."
        : state.room === 0
          ? "Three strikes. Back to the lander console. Review the clues and try again."
          : "Three strikes. The airlock is sending you back one room…";
      const codeInput = $("code-input");
      if (challenge.type === "code" && codeInput) codeInput.disabled = true;
      $("answer-list").querySelectorAll("button").forEach((el) => { el.disabled = true; });
      window.setTimeout(() => isLastChallengeInRoom ? showQuiz() : retreat(), 1100);
    }
  }
  function closeQuiz() { quizOpen = false; $("quiz-overlay").classList.add("hidden"); activeKeys.clear(); if (gameActive && !state.done) $("touch-controls").classList.remove("hidden"); }
  function retreat() {
    closeQuiz(); gateWarningUntil = 0; state.room = Math.max(0, state.room - 1); player.x = state.room === 0 ? 82 : 420; player.y = groundYAt(player.x); player.vy = 0; player.grounded = true; save(); updateHud();
  }
  function advanceRoom() {
    if (!roomComplete()) { showQuiz(); return; }
    if (state.room < data.rooms.length - 1) { gateWarningUntil = 0; state.room += 1; player.x = 40; player.y = groundYAt(player.x); player.vy = 0; player.grounded = true; save(); updateHud(); }
  }
  function interact() {
    if (!gameActive || state.done || quizOpen) return;
    if (!roomComplete() && stage()?.artifact && !evidenceFound()) {
      const artifact = stage().artifact;
      if (Math.abs(player.x - artifact.x) >= 37 || !player.grounded) return;
      state.evidence[state.room][state.stages[state.room]] = true;
      burstPixels(artifact.x, 202, ["#c9d77b", "#f4f0d3", "#8bd9f5"], 16);
      save(); updateHud(); showQuiz();
      return;
    }
    const targetX = roomComplete() ? airlockDoorX : missionConsoleX();
    if (Math.abs(player.x - targetX) >= 37) return;
    if (roomComplete()) advanceRoom(); else showQuiz();
  }
  function finishGame() {
    if (state.done) return;
    state.done = true; state.started = true; gameActive = false; save();
    $("touch-controls").classList.add("hidden");
    $("ending-overlay").classList.remove("hidden");
    const endingImageElement = $("paxi-image");
    if (endingImageElement) endingImageElement.src = paxsiDataUrl(endingImage % assets.paxsi.length);
    updateHud();
  }
  function startGame() {
    $("intro-step").classList.add("hidden"); $("story-step").classList.remove("hidden");
  }
  function beginMission() {
    state.started = true; gameActive = true; $("touch-controls").classList.remove("hidden"); $("start-overlay").classList.add("hidden"); save();
    canvas.focus({ preventScroll: true });
  }
  function resetGame() {
    state = freshState(); gameActive = false; player.x = 82; player.y = groundYAt(player.x); player.vy = 0; player.grounded = true;
    gateWarningUntil = 0; $("touch-controls").classList.add("hidden");
    localStorage.removeItem(storageKey); $("ending-overlay").classList.add("hidden"); $("quiz-overlay").classList.add("hidden");
    quizOpen = false; $("intro-step").classList.remove("hidden"); $("story-step").classList.add("hidden"); $("start-label").textContent = "START MISSION"; updateHud(); $("start-overlay").classList.remove("hidden");
  }

  function controlKey(event) {
    const physical = { KeyA: "a", KeyD: "d", KeyE: "e", KeyW: "w", Space: " " };
    return physical[event.code] || event.key;
  }

  window.addEventListener("keydown", (event) => {
    const key = controlKey(event);
    const codeInput = $("code-input");
    const codeEntryOpen = quizOpen && stage()?.type === "code" && !$("question-view").classList.contains("hidden") && codeInput && !codeInput.disabled;
    if (codeEntryOpen && event.target !== codeInput && !event.ctrlKey && !event.altKey && !event.metaKey) {
      if ((activeEntryMode === "digits" && /^\d$/.test(event.key)) || (activeEntryMode === "letters" && /^[a-z]$/i.test(event.key))) {
        event.preventDefault();
        codeInput.value = (codeInput.value + event.key).slice(0, activeEntryLength);
        codeInput.dispatchEvent(new Event("input", { bubbles: true }));
        codeInput.focus({ preventScroll: true });
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        codeInput.value = codeInput.value.slice(0, -1);
        codeInput.dispatchEvent(new Event("input", { bubbles: true }));
        codeInput.focus({ preventScroll: true });
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        codeInput.form?.requestSubmit();
        return;
      }
    }
    const inQuiz = event.target instanceof HTMLElement && event.target.closest("#quiz-overlay");
    if (quizOpen && inQuiz) {
      if (event.key === "Escape") closeQuiz();
      return;
    }
    const editingCode = event.target instanceof HTMLElement && event.target.id === "code-input";
    if (editingCode) return;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(key)) event.preventDefault();
    if (["ArrowLeft", "ArrowRight", "a", "d"].includes(key)) activeKeys.add(key);
    if ((key === " " || key === "ArrowUp" || key === "w") && gameActive && !quizOpen && player.grounded) { event.preventDefault(); player.vy = -6.8; player.grounded = false; player.frame = 0; }
    if (key === "e" && !event.repeat) interact();
    if (event.key === "Escape" && quizOpen) closeQuiz();
  });
  window.addEventListener("keyup", (event) => { const key = controlKey(event); activeKeys.delete(key); activeKeys.delete(key.toLowerCase()); });
  window.addEventListener("blur", () => activeKeys.clear());
  $("code-input").addEventListener("input", (event) => {
    const input = event.currentTarget;
    if (activeEntryMode === "digits") {
      const normalized = normalizeEntry(input.value);
      if (input.value !== normalized) input.value = normalized;
    } else input.value = input.value.replace(/[^a-z\s]/gi, "").slice(0, 60);
  });
  $("code-input").addEventListener("keydown", (event) => event.stopPropagation());
  function bindTouchControls() {
    const hold = (id, key) => {
      const button = $(id);
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault(); button.setPointerCapture?.(event.pointerId); activeKeys.add(key);
      });
      const release = (event) => { event.preventDefault(); activeKeys.delete(key); };
      button.addEventListener("pointerup", release); button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", () => activeKeys.delete(key));
    };
    hold("touch-left", "a"); hold("touch-right", "d");
    $("touch-jump").addEventListener("pointerdown", (event) => {
      event.preventDefault(); if (gameActive && !quizOpen && player.grounded) { player.vy = -6.8; player.grounded = false; player.frame = 0; }
    });
    $("touch-use").addEventListener("pointerdown", (event) => { event.preventDefault(); interact(); });
  }
  bindTouchControls();
  $("start-button").addEventListener("click", startGame);
  $("begin-mission-button").addEventListener("click", beginMission);
  $("back-to-title").addEventListener("click", () => { $("story-step").classList.add("hidden"); $("intro-step").classList.remove("hidden"); });
  $("reset-button").addEventListener("click", () => { if (window.confirm("Reset all saved mission progress and start over?")) resetGame(); });
  $("play-again").addEventListener("click", resetGame);
  if (state.done) {
    $("ending-overlay").classList.remove("hidden");
    const endingImageElement = $("paxi-image");
    if (endingImageElement) endingImageElement.src = paxsiDataUrl(0);
  } else {
    $("start-label").textContent = state.started ? "RESUME MISSION" : "START MISSION";
    $("start-overlay").classList.remove("hidden");
  }
  updateHud(); requestAnimationFrame(draw);
})();
