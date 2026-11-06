// ==========================================================================
// SENTINEL — Scrollytelling, Live Office Sprite Diorama & Interactive Engine
// ==========================================================================

(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* --------------------------------------------------------------------------
     1. RETRO AUDIO ENGINE (Silenciado temporalmente a petición del usuario)
     -------------------------------------------------------------------------- */
  class RetroAudioEngine {
    constructor() {
      this.ctx = null;
      this.muted = true;
    }

    init() {}
    toggleMute() { return false; }
    playCoin() {}
    playBlip() {}
    playBump() {}
    playVictory() {}
    playGlitch() {}
  }

  const audio = new RetroAudioEngine();

  /* Header Tools: SFX & CRT Toggles */
  const soundBtn = $("#btn-toggle-sound");
  const crtBtn = $("#btn-toggle-crt");
  const crtOverlay = $("#crt-overlay");

  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      const on = audio.toggleMute();
      soundBtn.querySelector(".tool-label").textContent = on ? "SFX: ON" : "SFX: OFF";
      soundBtn.querySelector(".tool-icon").textContent = on ? "🔊" : "🔇";
    });
  }

  if (crtBtn && crtOverlay) {
    crtBtn.addEventListener("click", () => {
      audio.playBlip(true);
      const isOff = crtOverlay.classList.toggle("disabled");
      crtBtn.querySelector(".tool-label").textContent = isOff ? "CRT: OFF" : "CRT: ON";
    });
  }

  /* --------------------------------------------------------------------------
     2. MOTOR 2D RETRO ROLLO ZELDA (NIVEL 01: OFICINA CENTRAL)
     Mario e Iván libres moviéndose por la sala con animación de andar, props
     de oficina, interactividad por clic, bocadillos de diálogo y partículas.
     -------------------------------------------------------------------------- */
  const speakerConfig = {
    p1: {
      id: "p1",
      src: "assets/sprites/sprites_p1_clean.png",
      fallback: "assets/sprites/sprites_p1.png",
      name: "MARIO · ADMINISTRACIÓN"
    },
    p2: {
      id: "p2",
      src: "assets/sprites/sprites_p2_clean.png",
      fallback: "assets/sprites/sprites_p2.png",
      name: "IVÁN · COMPRAS Y OPERACIONES"
    }
  };

  const speakers = {
    p1: { ...speakerConfig.p1, loaded: false, frames: [], w: 0, h: 0 },
    p2: { ...speakerConfig.p2, loaded: false, frames: [], w: 0, h: 0 }
  };

  // Carga y recorte de los 6 fotogramas de cada spritesheet
  function loadSpeaker(speakerObj, onDone) {
    const img = new Image();
    let triedFallback = false;

    img.onload = () => {
      const fullW = img.naturalWidth || img.width;
      const fullH = img.naturalHeight || img.height;
      const frameW = Math.floor(fullW / 6);
      const sourceH = fullW / fullH < 2.2 ? Math.floor(fullH * 0.58) : fullH;

      const memCanvas = document.createElement("canvas");
      memCanvas.width = fullW;
      memCanvas.height = sourceH;
      const memCtx = memCanvas.getContext("2d", { willReadFrequently: true });
      memCtx.drawImage(img, 0, 0, fullW, sourceH, 0, 0, fullW, sourceH);

      try {
        const imgData = memCtx.getImageData(0, 0, fullW, sourceH);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 1] > 140 && d[i + 1] > d[i] * 1.25 && d[i + 1] > d[i + 2] * 1.25) {
            d[i + 3] = 0;
          }
        }
        memCtx.putImageData(imgData, 0, 0);
      } catch (e) {
        // Modo alfa nativo
      }

      const frames = [];
      for (let f = 0; f < 6; f++) {
        const fCanvas = document.createElement("canvas");
        fCanvas.width = frameW;
        fCanvas.height = sourceH;
        const fCtx = fCanvas.getContext("2d");
        fCtx.drawImage(memCanvas, f * frameW, 0, frameW, sourceH, 0, 0, frameW, sourceH);
        frames.push(fCanvas);
      }

      onDone({ frames, w: frameW, h: sourceH });
    };

    img.onerror = () => {
      if (!triedFallback && speakerObj.fallback) {
        triedFallback = true;
        img.src = speakerObj.fallback;
      }
    };

    img.src = speakerObj.src;
  }

  // Elementos de telemetría y HUD
  const bubbleName = $("#bubble-name");
  const bubbleMsg = $("#bubble-msg");
  const officeScene = $("#office-scene");
  const wallStatusText = $("#wall-status-text");
  const wallRisk = $("#wall-risk");
  const wallReports = $("#wall-reports");

  const zCanvas = $("#zelda-game-canvas");
  const zctx = zCanvas?.getContext("2d");

  // Frases de diálogo para cada trabajador
  const marioLines = [
    "¡Llega factura de 4.870 €!",
    "¿La abro o aviso con el escudo de Sentinel?",
    "Si me fijo en el remitente, ribera.co es falso...",
    "¡Menos mal que nos fijamos antes de transferir!",
    "Con Sentinel ya nadie cae en Administración."
  ];
  const ivanLines = [
    "¡El dominio .co es falso, Mario!",
    "Ningún banco cambia de cuenta por correo sin avisar.",
    "Avisa con el escudo verde y sumamos +50 XP.",
    "Hemos bajado del 38% a menos del 8% de clics.",
    "¡Buen trabajo equipo, riesgo controlado!"
  ];
  let marioLineIdx = 0;
  let ivanLineIdx = 0;

  // Estado de los 2 personajes en el mundo 2D Zelda
  const workers = {
    p1: {
      id: "p1",
      name: "MARIO",
      role: "ADMÓN",
      color: "#00e5ff",
      x: 180,
      y: 360,
      targetX: 180,
      targetY: 360,
      speed: 1.7,
      facing: 1,
      state: "idle",
      walkTimer: 0,
      frameIdx: 0,
      bubbleText: "¡Llega factura de 4.870 €!",
      bubbleTimer: 5.0,
      waitTimer: 2.0,
      jumpOffset: 0
    },
    p2: {
      id: "p2",
      name: "IVÁN",
      role: "COMPRAS",
      color: "#f59e0b",
      x: 620,
      y: 360,
      targetX: 620,
      targetY: 360,
      speed: 1.5,
      facing: -1,
      state: "idle",
      walkTimer: 0,
      frameIdx: 0,
      bubbleText: "¡El dominio .co es falso!",
      bubbleTimer: 6.0,
      waitTimer: 3.5,
      jumpOffset: 0
    }
  };

  // Sistema de partículas del juego (ripples de clic, chispas de XP, vapor, alertas)
  const zParticles = [];
  function spawnParticle(p) {
    zParticles.push(p);
  }

  function spawnXpBurst(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 3.5;
      spawnParticle({
        type: "xp-star",
        x,
        y: y - 40,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 2,
        life: 1.0,
        color: Math.random() > 0.4 ? "#10b981" : "#fbbf24",
        size: 3 + Math.random() * 3
      });
    }
    spawnParticle({
      type: "xp-text",
      x,
      y: y - 50,
      text: "+50 XP",
      life: 1.4,
      vy: -1.2
    });
  }

  function spawnAlertMark(x, y) {
    spawnParticle({
      type: "alert-mark",
      x,
      y: y - 75,
      life: 1.5,
      vy: -0.6
    });
  }

  // Resize del canvas según el contenedor
  let cw = 1200;
  let ch = 700;
  let dpr = 1;
  const wallH = 68;

  function resizeCanvas() {
    if (!zCanvas) return;
    const rect = zCanvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = Math.max(320, rect.width);
    ch = Math.max(480, rect.height);
    zCanvas.width = Math.floor(cw * dpr);
    zCanvas.height = Math.floor(ch * dpr);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Puntos clave de navegación en la oficina según dimensiones
  function getOfficeSpots() {
    const floorY = Math.max(320, ch * 0.60);
    return {
      desk1: { x: cw * 0.18, y: floorY + 45, label: "Puesto de Mario" },
      desk2: { x: cw * 0.82, y: floorY + 45, label: "Puesto de Iván" },
      terminal: { x: cw * 0.50, y: floorY + 70, label: "Terminal Factura" },
      serverL: { x: cw * 0.12, y: floorY - 50, label: "Servidor Alpha" },
      serverR: { x: cw * 0.88, y: floorY - 50, label: "Servidor Beta" },
      coffee: { x: cw * 0.08, y: floorY + 15, label: "Cafetera" },
      meeting: { x: cw * 0.50, y: floorY, label: "Punto de encuentro" }
    };
  }

  // Inicializar posiciones de los personajes en sus escritorios
  function initWorkerPositions() {
    const spots = getOfficeSpots();
    workers.p1.x = spots.desk1.x;
    workers.p1.y = spots.desk1.y;
    workers.p1.targetX = spots.desk1.x;
    workers.p1.targetY = spots.desk1.y;

    workers.p2.x = spots.desk2.x;
    workers.p2.y = spots.desk2.y;
    workers.p2.targetX = spots.desk2.x;
    workers.p2.targetY = spots.desk2.y;
  }

  // Dibujar mapa Zelda 2D: suelo, alfombra cyber, paredes y muebles
  function renderZeldaMap(ctx, time) {
    const spots = getOfficeSpots();
    const floorY = Math.max(320, ch * 0.60);

    // 1. Suelo: Baldosas de 36x36
    const tileSize = 36;
    for (let x = 0; x < cw; x += tileSize) {
      for (let y = 0; y < ch; y += tileSize) {
        const isAlt = ((x / tileSize + y / tileSize) % 2 === 0);
        ctx.fillStyle = isAlt ? "#080e1b" : "#0c1527";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // 2. Alfombra central estilo Zelda / Cyber-Pad
    const carpetX = cw * 0.12;
    const carpetY = floorY - 60;
    const carpetW = cw * 0.76;
    const carpetH = Math.max(220, ch - carpetY - 35);

    ctx.fillStyle = "rgba(14, 25, 48, 0.75)";
    ctx.fillRect(carpetX, carpetY, carpetW, carpetH);

    ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(carpetX, carpetY, carpetW, carpetH);

    ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(carpetX + 12, carpetY + 12, carpetW - 24, carpetH - 24);

    [
      [carpetX, carpetY],
      [carpetX + carpetW, carpetY],
      [carpetX, carpetY + carpetH],
      [carpetX + carpetW, carpetY + carpetH]
    ].forEach(([cx, cy]) => {
      ctx.fillStyle = "#00e5ff";
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Pared Superior estilo Zelda (Dungeon/Tech wall)
    ctx.fillStyle = "#050812";
    ctx.fillRect(0, 0, cw, wallH);

    ctx.fillStyle = "rgba(0, 229, 255, 0.05)";
    ctx.fillRect(0, wallH - 4, cw, 4);

    for (let bx = 30; bx < cw - 40; bx += 58) {
      ctx.fillStyle = "#090f1d";
      ctx.fillRect(bx, 10, 44, 48);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.strokeRect(bx, 10, 44, 48);

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(bx + 4, 14, 36, 6);
      ctx.fillRect(bx + 4, 24, 36, 6);

      const onG = Math.sin(time * 3 + bx) > 0.1;
      const onR = Math.sin(time * 2 + bx * 0.5) > 0.4;
      const onC = Math.sin(time * 4 + bx * 0.3) > 0;

      ctx.fillStyle = onG ? "#10b981" : "#042217";
      ctx.fillRect(bx + 6, 36, 4, 4);
      ctx.fillStyle = onR ? "#ff3366" : "#2b0a12";
      ctx.fillRect(bx + 14, 36, 4, 4);
      ctx.fillStyle = onC ? "#00e5ff" : "#061a29";
      ctx.fillRect(bx + 22, 36, 4, 4);
    }

    // 4. Props de la Oficina
    const d1 = spots.desk1;
    drawDesk(ctx, d1.x, d1.y, "MARIO · ADMÓN", "#00e5ff", "#10b981", time, true);

    const d2 = spots.desk2;
    drawDesk(ctx, d2.x, d2.y, "IVÁN · COMPRAS", "#f59e0b", "#00e5ff", time, false);

    const term = spots.terminal;
    drawCentralTerminal(ctx, term.x, term.y, time);

    const cof = spots.coffee;
    drawCoffeeStation(ctx, cof.x, cof.y, time);

    drawCyberPlant(ctx, 40, ch * 0.38);
    drawCyberPlant(ctx, cw - 65, ch * 0.38);
  }

  function drawDesk(ctx, x, y, label, labelColor, screenColor, time, hasCoffee) {
    const dw = 96;
    const dh = 48;
    const dx = x - dw / 2;
    const dy = y + 25;

    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(dx - 4, dy + dh - 4, dw + 8, 8);

    ctx.fillStyle = "#152035";
    ctx.fillRect(dx, dy, dw, dh);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(dx, dy, dw, dh);

    const mw = 32;
    const mh = 22;
    const mx = dx + 12;
    const my = dy + 6;

    ctx.fillStyle = "#0c1220";
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = "#253550";
    ctx.strokeRect(mx, my, mw, mh);

    ctx.fillStyle = screenColor;
    ctx.fillRect(mx + 3, my + 3, mw - 6, mh - 6);
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(mx + 5, my + 6, mw - 10, 2);
    ctx.fillRect(mx + 5, my + 11, mw - 14, 2);

    ctx.fillStyle = "#0b101c";
    ctx.fillRect(mx, my + mh + 4, mw, 8);

    if (hasCoffee) {
      ctx.fillStyle = "#f4f7fc";
      ctx.fillRect(dx + dw - 22, dy + 14, 10, 10);
      ctx.fillStyle = "#8a5832";
      ctx.fillRect(dx + dw - 20, dy + 15, 6, 3);

      if (Math.random() < 0.1) {
        spawnParticle({
          type: "steam",
          x: dx + dw - 17,
          y: dy + 14,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.6 - Math.random() * 0.4,
          life: 1.0
        });
      }
    }

    ctx.font = "9px 'Share Tech Mono', monospace";
    ctx.fillStyle = labelColor;
    ctx.textAlign = "center";
    ctx.fillText(label, dx + dw / 2, dy + dh - 6);
  }

  function drawCentralTerminal(ctx, x, y, time) {
    const pulse = Math.sin(time * 3) * 3;
    const bob = Math.sin(time * 2.8) * 5;

    ctx.fillStyle = "rgba(0, 229, 255, 0.15)";
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 32 + pulse, 12 + pulse * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#0f1a2e";
    ctx.fillRect(x - 14, y - 6, 28, 26);
    ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
    ctx.strokeRect(x - 14, y - 6, 28, 26);

    const envY = y - 26 + bob;
    ctx.fillStyle = "rgba(0, 229, 255, 0.22)";
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x - 18, envY - 12, 36, 24, 4) : ctx.rect(x - 18, envY - 12, 36, 24);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 18, envY - 12);
    ctx.lineTo(x, envY);
    ctx.lineTo(x + 18, envY - 12);
    ctx.stroke();

    ctx.font = "bold 9px 'Share Tech Mono', monospace";
    ctx.fillStyle = "#00e5ff";
    ctx.textAlign = "center";
    ctx.fillText("CORREO TRAMPA · 4.870 €", x, y + 42);
  }

  function drawCoffeeStation(ctx, x, y, time) {
    ctx.fillStyle = "#121b2d";
    ctx.fillRect(x - 16, y - 8, 32, 28);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.strokeRect(x - 16, y - 8, 32, 28);

    ctx.fillStyle = "#334155";
    ctx.fillRect(x - 8, y - 22, 16, 16);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(x - 6, y - 18, 12, 10);
  }

  function drawCyberPlant(ctx, x, y) {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x, y + 10, 22, 16);
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(x + 11, y + 6, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#059669";
    ctx.beginPath();
    ctx.arc(x + 8, y + 4, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  function renderWorker(ctx, wObj, sObj) {
    if (!sObj || !sObj.loaded || !sObj.frames[wObj.frameIdx]) return;

    const frameCanvas = sObj.frames[wObj.frameIdx];
    const targetW = 68;
    const targetH = 135;
    const posX = wObj.x - targetW / 2;
    const posY = wObj.y - targetH + 10 - (wObj.jumpOffset || 0);

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(wObj.x, wObj.y + 6, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    if (wObj.facing === -1) {
      ctx.translate(posX + targetW, posY);
      ctx.scale(-1, 1);
      ctx.drawImage(frameCanvas, 0, 0, targetW, targetH);
    } else {
      ctx.drawImage(frameCanvas, posX, posY, targetW, targetH);
    }
    ctx.restore();

    if (wObj.bubbleText && wObj.bubbleTimer > 0) {
      drawCanvasBubble(ctx, wObj.x, posY - 10, wObj.name, wObj.color, wObj.bubbleText);
    }
  }

  function drawCanvasBubble(ctx, x, y, name, tagColor, text) {
    ctx.save();
    ctx.font = "bold 11px 'Plus Jakarta Sans', system-ui, sans-serif";
    const textW = ctx.measureText(text).width;
    const padX = 14;
    const bW = Math.max(160, Math.min(260, textW + padX * 2));
    const bH = 36;
    const bX = Math.max(12, Math.min(cw - bW - 12, x - bW / 2));
    const bY = y - bH - 6;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bX + 2, bY + 3, bW, bH, 8) : ctx.rect(bX + 2, bY + 3, bW, bH);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bX, bY, bW, bH, 8) : ctx.rect(bX, bY, bW, bH);
    ctx.fill();

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x - 6, bY + bH);
    ctx.lineTo(x, bY + bH + 7);
    ctx.lineTo(x + 6, bY + bH);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(x - 6, bY + bH);
    ctx.lineTo(x, bY + bH + 7);
    ctx.lineTo(x + 6, bY + bH);
    ctx.stroke();

    ctx.font = "9px 'Press Start 2P', monospace";
    ctx.fillStyle = tagColor;
    ctx.textAlign = "left";
    ctx.fillText(name, bX + 10, bY + 12);

    ctx.font = "600 11px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = "#070a12";
    ctx.textAlign = "left";
    ctx.fillText(text, bX + 10, bY + 27);

    ctx.restore();
  }

  function updateAndRenderParticles(ctx, dt) {
    for (let i = zParticles.length - 1; i >= 0; i--) {
      const p = zParticles[i];
      p.life -= dt;
      if (p.life <= 0) {
        zParticles.splice(i, 1);
        continue;
      }

      if (p.type === "ripple") {
        p.r += 35 * dt;
        ctx.strokeStyle = `rgba(0, 229, 255, ${p.life * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === "steam") {
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = `rgba(200, 220, 240, ${p.life * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + (1 - p.life) * 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "xp-star") {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "xp-text") {
        p.y += p.vy;
        ctx.font = "bold 14px 'Press Start 2P', monospace";
        ctx.fillStyle = `rgba(16, 185, 129, ${p.life})`;
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === "alert-mark") {
        p.y += p.vy;
        ctx.font = "bold 18px 'Press Start 2P', monospace";
        ctx.fillStyle = `rgba(255, 51, 102, ${p.life})`;
        ctx.textAlign = "center";
        ctx.fillText("!", p.x, p.y);
      }
    }
  }

  function updateWorkerAI(w, other, dt) {
    w.bubbleTimer -= dt;
    w.waitTimer -= dt;

    if (w.jumpOffset > 0) {
      w.jumpOffset = Math.max(0, w.jumpOffset - 25 * dt);
    }

    const dx = w.targetX - w.x;
    const dy = w.targetY - w.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 4) {
      w.state = "walk";
      w.facing = dx < 0 ? -1 : 1;
      const stepDist = Math.min(dist, w.speed);
      w.x += (dx / dist) * stepDist;
      w.y += (dy / dist) * stepDist;

      w.walkTimer += dt * 6.5;
      w.jumpOffset = Math.abs(Math.sin(w.walkTimer * 3.5)) * 3;
      w.frameIdx = Math.floor(w.walkTimer) % 4;
    } else {
      if (w.state === "walk") {
        w.state = "idle";
        w.jumpOffset = 0;
        w.frameIdx = 0;
        w.waitTimer = 2.5 + Math.random() * 3.0;
      }

      if (w.waitTimer > 0) {
        if (w.waitTimer < 1.8 && Math.random() < 0.05) {
          w.frameIdx = (w.frameIdx === 1) ? 2 : 1;
        }
      } else {
        pickNextGoal(w);
      }
    }

    const distToOther = Math.hypot(w.x - other.x, w.y - other.y);
    if (distToOther < 120 && w.bubbleTimer <= 0 && other.bubbleTimer <= 0) {
      w.facing = w.x < other.x ? 1 : -1;
      other.facing = other.x < w.x ? 1 : -1;
      if (w.id === "p1") {
        w.bubbleText = marioLines[marioLineIdx % marioLines.length];
        marioLineIdx++;
        w.bubbleTimer = 4.5;
      } else {
        w.bubbleText = ivanLines[ivanLineIdx % ivanLines.length];
        ivanLineIdx++;
        w.bubbleTimer = 4.5;
      }
    }
  }

  function pickNextGoal(w) {
    const spots = getOfficeSpots();
    const goals = [spots.desk1, spots.desk2, spots.terminal, spots.coffee, spots.meeting];
    const chosen = goals[Math.floor(Math.random() * goals.length)];
    const floorY = Math.max(320, ch * 0.60);
    w.targetX = Math.max(60, Math.min(cw - 60, chosen.x + (Math.random() - 0.5) * 60));
    w.targetY = Math.max(floorY - 40, Math.min(ch - 50, chosen.y + (Math.random() - 0.5) * 35));
    w.waitTimer = 2.5 + Math.random() * 2.5;
  }

  let lastTime = 0;
  function zeldaGameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min(0.1, (timestamp - lastTime) / 1000);
    lastTime = timestamp;

    if (zctx && zCanvas) {
      zctx.save();
      zctx.scale(dpr, dpr);

      zctx.clearRect(0, 0, cw, ch);

      renderZeldaMap(zctx, timestamp / 1000);
      updateAndRenderParticles(zctx, dt);

      updateWorkerAI(workers.p1, workers.p2, dt);
      updateWorkerAI(workers.p2, workers.p1, dt);

      const renderList = [
        { w: workers.p1, s: speakers.p1 },
        { w: workers.p2, s: speakers.p2 }
      ].sort((a, b) => a.w.y - b.w.y);

      renderList.forEach(item => renderWorker(zctx, item.w, item.s));

      zctx.restore();
    }

    requestAnimationFrame(zeldaGameLoop);
  }

  zCanvas?.addEventListener("click", (e) => {
    const rect = zCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    spawnParticle({
      type: "ripple",
      x: clickX,
      y: clickY,
      r: 4,
      life: 0.8
    });

    audio.playBlip(true);

    const spots = getOfficeSpots();
    const distTerminal = Math.hypot(spots.terminal.x - clickX, spots.terminal.y - clickY);
    if (distTerminal < 55) {
      mailCard?.classList.remove("is-minimized");
      audio.playCoin();
      spawnXpBurst(spots.terminal.x, spots.terminal.y, 12);
      return;
    }

    const distM = Math.hypot(workers.p1.x - clickX, workers.p1.y - clickY);
    const distI = Math.hypot(workers.p2.x - clickX, workers.p2.y - clickY);
    const targetWorker = distM < distI ? workers.p1 : workers.p2;

    const floorY = Math.max(320, ch * 0.60);
    targetWorker.targetX = Math.max(60, Math.min(cw - 60, clickX));
    targetWorker.targetY = Math.max(floorY - 45, Math.min(ch - 50, clickY));
    targetWorker.waitTimer = 0;

    if (Math.min(distM, distI) < 70) {
      if (targetWorker.id === "p1") {
        marioLineIdx = (marioLineIdx + 1) % marioLines.length;
        targetWorker.bubbleText = marioLines[marioLineIdx];
      } else {
        ivanLineIdx = (ivanLineIdx + 1) % ivanLines.length;
        targetWorker.bubbleText = ivanLines[ivanLineIdx];
      }
      targetWorker.bubbleTimer = 5.0;
      targetWorker.jumpOffset = 12;
    }
  });

  ["p1", "p2"].forEach((key) => {
    loadSpeaker(speakers[key], (data) => {
      speakers[key].frames = data.frames;
      speakers[key].w = data.w;
      speakers[key].h = data.h;
      speakers[key].loaded = true;
    });
  });

  initWorkerPositions();
  requestAnimationFrame(zeldaGameLoop);

  $("#btn-ask-mario")?.addEventListener("click", () => {
    audio.playBlip(true);
    workers.p1.facing = 1;
    marioLineIdx = (marioLineIdx + 1) % marioLines.length;
    workers.p1.bubbleText = marioLines[marioLineIdx];
    workers.p1.bubbleTimer = 6.0;
    workers.p1.jumpOffset = 14;
  });

  $("#btn-ask-ivan")?.addEventListener("click", () => {
    audio.playBlip(true);
    workers.p2.facing = -1;
    ivanLineIdx = (ivanLineIdx + 1) % ivanLines.length;
    workers.p2.bubbleText = ivanLines[ivanLineIdx];
    workers.p2.bubbleTimer = 6.0;
    workers.p2.jumpOffset = 14;
  });

  const mailCard = $("#mail-card");
  const btnToggleChallenge = $("#btn-toggle-challenge");
  const btnCloseChallenge = $("#btn-close-challenge");
  const sceneEnvelope = $("#scene-envelope");

  btnToggleChallenge?.addEventListener("click", () => {
    audio.playBlip(true);
    mailCard?.classList.toggle("is-minimized");
  });

  sceneEnvelope?.addEventListener("click", () => {
    audio.playCoin();
    mailCard?.classList.toggle("is-minimized");
  });

  btnCloseChallenge?.addEventListener("click", () => {
    audio.playBlip(false);
    mailCard?.classList.add("is-minimized");
  });

  /* --------------------------------------------------------------------------
     3. RETO DEL CORREO TRAMPA EN LA TERMINAL HUD
     -------------------------------------------------------------------------- */
  const trapBtn = $("#trap");
  const reportBtn = $("#report");
  const statusTip = $("#status");
  const actionsBar = $("#mail-actions");
  const failOutcome = $("#outcome-fail");
  const winOutcome = $("#outcome-win");
  const badgeFlagged = $("#badge-flagged");

  const showInspectUrl = () => {
    if (statusTip && trapBtn) {
      statusTip.innerHTML = `Enlace real: <b style="color:var(--danger)">${trapBtn.dataset.url}</b>`;
    }
    workers.p1.bubbleText = "¡Cuidado! El enlace lleva a una web falsa para robar claves.";
    workers.p1.bubbleTimer = 5.0;
  };

  const hideInspectUrl = () => {
    if (statusTip) {
      statusTip.textContent = "Pasa el ratón por el botón para ver a dónde lleva";
    }
  };

  if (trapBtn) {
    trapBtn.addEventListener("mouseenter", showInspectUrl);
    trapBtn.addEventListener("focus", showInspectUrl);
    trapBtn.addEventListener("mouseleave", hideInspectUrl);
    trapBtn.addEventListener("blur", hideInspectUrl);

    trapBtn.addEventListener("click", (e) => {
      e.preventDefault();
      audio.playGlitch();

      mailCard?.classList.add("revealed");
      if (badgeFlagged) badgeFlagged.hidden = false;
      if (actionsBar) actionsBar.hidden = true;
      if (winOutcome) winOutcome.hidden = true;
      if (failOutcome) failOutcome.hidden = false;

      workers.p1.state = "alarm";
      workers.p2.state = "alarm";
      workers.p1.bubbleText = "¡Uff, era una trampa! 😱";
      workers.p2.bubbleText = "¡Casi transferimos 4.870 €!";
      workers.p1.bubbleTimer = 6.0;
      workers.p2.bubbleTimer = 6.0;
      spawnAlertMark(workers.p1.x, workers.p1.y);

      if (wallRisk) wallRisk.textContent = "CRÍTICO (FALLO)";
      failOutcome?.focus({ preventScroll: true });
    });
  }

  if (reportBtn) {
    reportBtn.addEventListener("click", () => {
      audio.playVictory();
      audio.playCoin();

      mailCard?.classList.add("revealed");
      if (badgeFlagged) badgeFlagged.hidden = false;
      if (actionsBar) actionsBar.hidden = true;
      if (failOutcome) failOutcome.hidden = true;
      if (winOutcome) winOutcome.hidden = false;

      workers.p1.state = "celebrate";
      workers.p2.state = "celebrate";
      workers.p1.jumpOffset = 22;
      workers.p2.jumpOffset = 22;
      workers.p1.bubbleText = "¡Amenaza frenada! 🏆";
      workers.p2.bubbleText = "¡+50 XP sumados! Buen trabajo.";
      workers.p1.bubbleTimer = 6.0;
      workers.p2.bubbleTimer = 6.0;

      spawnXpBurst(workers.p1.x, workers.p1.y, 25);
      spawnXpBurst(workers.p2.x, workers.p2.y, 25);

      if (wallRisk) wallRisk.textContent = "PROTEGIDO (<8%)";
      winOutcome?.focus({ preventScroll: true });
    });
  }

  $$("[data-reset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      audio.playBlip(false);
      mailCard?.classList.remove("revealed");
      if (badgeFlagged) badgeFlagged.hidden = true;
      if (failOutcome) failOutcome.hidden = true;
      if (winOutcome) winOutcome.hidden = true;
      if (actionsBar) actionsBar.hidden = false;

      workers.p1.state = "idle";
      workers.p2.state = "idle";
      workers.p1.bubbleText = "¡Llega factura de 4.870 €!";
      workers.p2.bubbleText = "¡El dominio .co es falso!";
      workers.p1.bubbleTimer = 5.0;
      workers.p2.bubbleTimer = 5.0;

      if (wallRisk) wallRisk.textContent = "ALTO (38%)";
      hideInspectUrl();
      reportBtn?.focus();
    });
  });

  /* --------------------------------------------------------------------------
     4. SCROLLYTELLING: OBJETO VIAJERO + SECCIÓN STICKY DE 4 PASOS
     -------------------------------------------------------------------------- */
  const railFill = $("#scrolly-rail-fill");
  const packetEl = $("#traveling-packet");
  const packetIcon = $("#packet-icon");
  const packetStage = $("#packet-stage");
  const packetLabel = $("#packet-label");
  const packetBadge = $("#packet-badge");

  const firewallGate = $("#firewall-gate");
  const gateStatusBadge = $("#gate-status-badge");

  const solutionTrack = $("#solution-track");
  const stepTabs = $$(".step-tab");
  const stepPanels = $$(".sol-step-panel");
  const visCards = $$(".vis-card");
  const visStatePill = $("#vis-state-pill");
  const solCounter = $("#sol-counter");
  const solPrevBtn = $("#sol-prev");
  const solNextBtn = $("#sol-next");
  const navLinks = $$(".main-nav .nav-link");

  const stepStateLabels = [
    "FASE 1: SEÑUELO INOFENSIVO",
    "FASE 2: SUSTO DIDÁCTICO (0 SEG)",
    "FASE 3: HÁBITO Y +50 XP",
    "FASE 4: RIESGO < 10% EN 90 DÍAS"
  ];

  let activeSolutionStep = 0;

  function setSolutionStep(idx, playSound = false) {
    const clamped = Math.max(0, Math.min(3, idx));
    if (clamped === activeSolutionStep && !playSound) return;
    const isStepChange = clamped !== activeSolutionStep;
    activeSolutionStep = clamped;
    if (playSound) audio.playBlip(true);

    const stageGrid = $(".solution-stage-grid");
    if (stageGrid && isStepChange) {
      stageGrid.classList.remove("glitch-active");
      void stageGrid.offsetWidth;
      stageGrid.classList.add("glitch-active");
      setTimeout(() => {
        stageGrid.classList.remove("glitch-active");
      }, 350);
    }

    stepTabs.forEach((tab, i) => {
      const on = i === clamped;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", String(on));
    });
    stepPanels.forEach((panel, i) => {
      const on = i === clamped;
      panel.classList.toggle("is-active", on);
      if (on && isStepChange) {
        const badge = panel.querySelector(".sol-step-badge");
        if (badge) {
          badge.classList.remove("is-glitching");
          void badge.offsetWidth;
          badge.classList.add("is-glitching");
        }
      }
    });
    visCards.forEach((card, i) => card.classList.toggle("is-active", i === clamped));

    if (visStatePill) {
      visStatePill.textContent = stepStateLabels[clamped];
      if (isStepChange) {
        visStatePill.classList.remove("is-glitching");
        void visStatePill.offsetWidth;
        visStatePill.classList.add("is-glitching");
      }
    }
    if (solCounter) solCounter.textContent = `PASO 0${clamped + 1} / 04`;
  }

  stepTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const idx = parseInt(tab.dataset.step, 10) || 0;
      setSolutionStep(idx, true);
    });
  });

  solPrevBtn?.addEventListener("click", () => setSolutionStep(activeSolutionStep - 1, true));
  solNextBtn?.addEventListener("click", () => setSolutionStep(activeSolutionStep + 1, true));

  function setPacketVisualState(mode, icon, stageText, labelText, badgeText) {
    if (!packetEl) return;
    packetEl.className = `traveling-packet ${mode}`;
    if (packetIcon) packetIcon.textContent = icon;
    if (packetStage) packetStage.textContent = stageText;
    if (packetLabel) packetLabel.textContent = labelText;
    if (packetBadge) packetBadge.textContent = badgeText;
  }

  function updateScrollytelling() {
    const scrollY = window.scrollY;
    const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const totalProgress = Math.min(1, Math.max(0, scrollY / docHeight));

    // Posición vertical del objeto viajero y llenado de la línea
    if (railFill) railFill.style.height = `${totalProgress * 100}%`;
    if (packetEl) packetEl.style.top = `${totalProgress * 84}%`;

    // Comprobar paso por la barrera de Antivirus en 01. EL PROBLEMA
    if (firewallGate) {
      const gateRect = firewallGate.getBoundingClientRect();
      const breached = gateRect.top < window.innerHeight * 0.65;
      firewallGate.classList.toggle("is-breached", breached);
      if (gateStatusBadge) {
        gateStatusBadge.textContent = breached
          ? "⚠️ SIN ARCHIVOS INFECTADOS: EL ANTIVIRUS LO DEJA PASAR"
          : "ESPERANDO CORREO...";
      }
    }

    // Progreso dentro de la sección sticky 02. LA SOLUCIÓN
    if (solutionTrack && window.innerWidth > 960) {
      const rect = solutionTrack.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (rect.top <= 90 && rect.bottom >= window.innerHeight * 0.5 && scrollable > 0) {
        const localRatio = Math.min(0.999, Math.max(0, -rect.top / scrollable));
        const stepIdx = Math.floor(localRatio * 4);
        setSolutionStep(stepIdx, false);
      }
    }

    // Transformación del Objeto Viajero según la sección actual en pantalla
    const problemSec = $("#problema")?.getBoundingClientRect();
    const solutionSec = $("#solucion")?.getBoundingClientRect();
    const videoSec = $("#video")?.getBoundingClientRect();
    const faqSec = $("#faq")?.getBoundingClientRect();
    const ctaSec = $("#demo")?.getBoundingClientRect();
    const triggerLine = window.innerHeight * 0.45;

    let currentNav = "";

    if (ctaSec && ctaSec.top < triggerLine) {
      currentNav = "demo";
      setPacketVisualState("state-shield", "🚀", "04. PRUEBA PILOTO", "1 Simulacro Gratis", "0 €");
    } else if (faqSec && faqSec.top < triggerLine) {
      currentNav = "faq";
      setPacketVisualState("state-shield", "💬", "Q&A // RESOLVEMOS DUDAS", "Cero letra pequeña", "CLARO");
    } else if (videoSec && videoSec.top < triggerLine) {
      currentNav = "video";
      setPacketVisualState("state-shield", "🎬", "03. VÍDEO 30 SEG", "Caso real de Marta", "PLAY");
    } else if (solutionSec && solutionSec.top < triggerLine) {
      currentNav = "solucion";
      if (activeSolutionStep < 2) {
        setPacketVisualState("state-intercept", "🎯", "02. ESCUDO SENTINEL", "Simulacro y aprendizaje", "0 SEG");
      } else {
        setPacketVisualState("state-shield", "🛡️", "02. AMENAZA FRENADA", "Riesgo < 10% en 90 días", "+50 XP");
      }
    } else if (problemSec && problemSec.top < triggerLine) {
      currentNav = "problema";
      setPacketVisualState("state-breach", "🔓", "01. BYPASS ANTIVIRUS", "95% error humano (35k–80k€)", "BRECHA");
    } else {
      setPacketVisualState("state-mail", "✉️", "CORREO ENTRANDO", "Factura_1184.pdf (4.870 €)", "EN RUTA");
    }

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.nav === currentNav);
    });
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollytelling();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  updateScrollytelling();

  /* --------------------------------------------------------------------------
     5. VÍDEO CONCEPTUAL INTERACTIVO DE 30 SEGUNDOS
     -------------------------------------------------------------------------- */
  const player = $("#player");
  const scenes = $$(".v-scene", player);
  const chapters = $$(".cinema-chapters button", player);
  const caption = $("#caption");
  const playBtn = $("#play");
  const playBig = $("#play-big");
  const timerEl = $("#cinema-timer");

  const script = [
    "Lunes, 09:12. A Marta, de administración, le llega un correo urgente de un proveedor habitual.",
    "Tiene 15 pagos pendientes antes del mediodía y pulsa el enlace para ver la factura sin fijarse en el remitente.",
    "Sentinel interviene en 0 segundos: era un simulacro inofensivo. Le muestra al instante las 3 señales que delataban el engaño.",
    "Dos semanas después llega otro correo trampa. Esta vez Marta lo detecta, avisa en 1 clic y suma +50 XP para su equipo.",
    "En 90 días, el gerente comprueba que los clics caen a menos del 10%, con más del 80% de avisos y cumplimiento RGPD."
  ];

  const SCENE_DURATION = 6000; // 5 escenas x 6s = 30s
  let currentScene = 0;
  let isPlaying = false;
  let startT = 0;
  let elapsed = 0;
  let animFrame = 0;

  function formatSec(sec) {
    const s = Math.min(30, Math.max(0, Math.floor(sec)));
    return `00:${String(s).padStart(2, "0")} / 00:30`;
  }

  function showScene(idx) {
    currentScene = idx;
    scenes.forEach((s, i) => s.classList.toggle("is-on", i === idx));
    chapters.forEach((c, i) => {
      c.setAttribute("aria-current", i === idx ? "true" : "false");
      c.classList.toggle("done-ch", i < idx);
      const bar = $(".bar i", c);
      if (bar) bar.style.width = i < idx ? "100%" : "0";
    });
    if (caption && script[idx]) caption.textContent = script[idx];
    if (timerEl) timerEl.textContent = formatSec(idx * 6);
  }

  function videoLoop(now) {
    if (!isPlaying) return;
    if (!startT) startT = now - elapsed;
    elapsed = now - startT;

    const progress = Math.min(elapsed / SCENE_DURATION, 1);
    const curBar = $(".bar i", chapters[currentScene]);
    if (curBar) curBar.style.width = `${progress * 100}%`;

    const totalSec = currentScene * 6 + progress * 6;
    if (timerEl) timerEl.textContent = formatSec(totalSec);

    if (progress >= 1) {
      if (currentScene === scenes.length - 1) {
        pauseVideo();
        elapsed = 0;
        return;
      }
      showScene(currentScene + 1);
      audio.playBlip(true);
      startT = now;
      elapsed = 0;
    }
    animFrame = requestAnimationFrame(videoLoop);
  }

  function playVideo() {
    if (!player) return;
    if (currentScene === scenes.length - 1 && elapsed === 0) showScene(0);
    player.classList.add("started");
    isPlaying = true;
    startT = 0;
    audio.playCoin();
    if (playBtn) playBtn.textContent = "⏸";
    animFrame = requestAnimationFrame(videoLoop);
  }

  function pauseVideo() {
    isPlaying = false;
    cancelAnimationFrame(animFrame);
    if (playBtn) playBtn.textContent = "▶";
  }

  playBtn?.addEventListener("click", () => (isPlaying ? pauseVideo() : playVideo()));
  playBig?.addEventListener("click", playVideo);

  chapters.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      player?.classList.add("started");
      showScene(idx);
      elapsed = 0;
      startT = 0;
      audio.playBlip(true);
      if (!isPlaying) playVideo();
    });
  });

  if (player && "IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && isPlaying) pauseVideo();
      },
      { threshold: 0.2 }
    ).observe(player);
  }

  showScene(0);

  /* --------------------------------------------------------------------------
     6. FORMULARIO DE SIMULACRO PILOTO GRATUITO
     -------------------------------------------------------------------------- */
  const form = $("#form");
  const formErr = $("#form-error");
  const doneCard = $("#done");
  const doneText = $("#done-text");
  const doneRef = $("#done-ref");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const requiredFields = $$("input[required], select[required]", form);
      let firstBad = null;

      requiredFields.forEach((f) => {
        const ok = f.checkValidity() && f.value.trim() !== "";
        f.setAttribute("aria-invalid", String(!ok));
        if (!ok && !firstBad) firstBad = f;
      });

      if (firstBad) {
        audio.playBump();
        const label = $(`label[for="${firstBad.id}"]`, form)?.textContent.toLowerCase() || "este campo";
        if (formErr) {
          formErr.textContent =
            firstBad.type === "email" && firstBad.value
              ? "Introduce un email de empresa válido (con @ y dominio)."
              : `Por favor, indica ${label}.`;
          formErr.hidden = false;
        }
        firstBad.focus();
        return;
      }

      if (formErr) formErr.hidden = true;
      audio.playVictory();
      audio.playCoin();

      const data = Object.fromEntries(new FormData(form));
      const ref = `SNT-${Math.floor(10000 + Math.random() * 90000)}`;

      try {
        const saved = JSON.parse(localStorage.getItem("sentinel-demos") || "[]");
        saved.push({ ...data, ref, at: new Date().toISOString() });
        localStorage.setItem("sentinel-demos", JSON.stringify(saved));
      } catch (err) {}

      if (doneText) {
        const firstName = (data.name || "").split(" ")[0] || "Hola";
        doneText.textContent = `Gracias, ${firstName}. Hemos reservado el simulacro piloto gratuito para ${data.company || "tu empresa"}. Te escribiremos a ${data.email} en menos de 24 horas laborables para activarlo en 15 minutos.`;
      }
      if (doneRef) doneRef.textContent = ref;

      form.hidden = true;
      if (doneCard) {
        doneCard.hidden = false;
        doneCard.focus();
      }
    });

    form.addEventListener("input", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true" && e.target.checkValidity() && e.target.value.trim()) {
        e.target.setAttribute("aria-invalid", "false");
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. ACORDEÓN Q&A EXCLUSIVO (ACCORDION TOGGLE FALLBACK)
     -------------------------------------------------------------------------- */
  const faqItems = $$(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item && other.open) {
            other.open = false;
          }
        });
      }
    });
  });
})();
