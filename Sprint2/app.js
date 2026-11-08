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
      src: "../assets/sprites/sprites_p1_clean.png",
      fallback: "../assets/sprites/sprites_p1.png",
      name: "IVÁN · ADMINISTRACIÓN"
    },
    p2: {
      id: "p2",
      src: "../assets/sprites/sprites_p2_clean.png",
      fallback: "../assets/sprites/sprites_p2.png",
      name: "MARIO · COMPRAS Y OPERACIONES"
    },
    p3: {
      id: "p3",
      src: "../assets/sprites/sprites_p3_clean.png",
      fallback: "../assets/sprites/sprites_p3.png",
      name: "NACHO · FRONTEND Y CÓDIGO"
    },
    p4: {
      id: "p4",
      src: "../assets/sprites/sprites_p4_clean.png",
      fallback: "../assets/sprites/sprites_p4.png",
      name: "NICOLÁS · SCRUM MASTER Y CIBERSEGURIDAD"
    }
  };

  const speakers = {
    p1: { ...speakerConfig.p1, loaded: false, frames: [], w: 0, h: 0 },
    p2: { ...speakerConfig.p2, loaded: false, frames: [], w: 0, h: 0 },
    p3: { ...speakerConfig.p3, loaded: false, frames: [], w: 0, h: 0 },
    p4: { ...speakerConfig.p4, loaded: false, frames: [], w: 0, h: 0 }
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
  const ivanLines = [
    "¡Llega factura de 4.870 €!",
    "¿La abro o aviso con el escudo de Sentinel?",
    "Si me fijo en el remitente, ribera.co es falso...",
    "¡Menos mal que nos fijamos antes de transferir!",
    "Con Sentinel ya nadie cae en Administración."
  ];
  const marioLines = [
    "¡El dominio .co es falso, Iván!",
    "Ningún banco cambia de cuenta por correo sin avisar.",
    "Avisa con el escudo verde y sumamos +50 XP.",
    "Hemos bajado del 38% a menos del 8% de clics.",
    "¡Buen trabajo equipo, riesgo controlado!"
  ];
  const nachoLines = [
    "¡Revisando el código de la pasarela!",
    "El phishing intenta suplantar el portal de pagos.",
    "Todo parcheado: certificados SSL y dominios validados.",
    "¡Sistema Sentinel en verde, cero vulnerabilidades!",
    "Buen trabajo controlando la intrusión."
  ];
  const nicoLines = [
    "¡Revisad los encabezados DKIM y SPF!",
    "Sprint en marcha: 0 incidentes reportados.",
    "Ciberseguridad activa: bloqueando dominios fraudulentos.",
    "¡Buen reporte! Eso suma puntos al equipo.",
    "Protección perimetral y concienciación al 100%."
  ];
  let ivanLineIdx = 0;
  let marioLineIdx = 0;
  let nachoLineIdx = 0;
  let nicoLineIdx = 0;

  // Estado de los 4 personajes en el mundo 2D Zelda
  const workers = {
    p1: {
      id: "p1",
      name: "IVÁN",
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
      name: "MARIO",
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
    },
    p3: {
      id: "p3",
      name: "NACHO",
      role: "DEV",
      color: "#10b981",
      x: 400,
      y: 340,
      targetX: 400,
      targetY: 340,
      speed: 1.6,
      facing: 1,
      state: "idle",
      walkTimer: 0,
      frameIdx: 0,
      bubbleText: "¡Revisando el código de pagos!",
      bubbleTimer: 5.5,
      waitTimer: 2.8,
      jumpOffset: 0
    },
    p4: {
      id: "p4",
      name: "NICOLÁS",
      role: "SCRUM",
      color: "#38bdf8",
      x: 520,
      y: 340,
      targetX: 520,
      targetY: 340,
      speed: 1.55,
      facing: -1,
      state: "idle",
      walkTimer: 0,
      frameIdx: 0,
      bubbleText: "¡Ciberseguridad perimetral activa!",
      bubbleTimer: 5.0,
      waitTimer: 3.2,
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

  // =========================================================================
  // SISTEMA DE CIELO NOCTURNO PIXEL ART (ESTRELLAS, LUNA Y NUBES ANIMADAS)
  // =========================================================================
  let heroScrollProgress = 0;
  const pixelStars = [];
  const pixelClouds = [];
  const shootingStars = [];
  let shootingStarTimer = 3.0;

  // Altura total del cielo nocturno para que sea amplio y no revele los sprites al inicio
  function getSkyHeight() {
    return Math.round(ch * 1.65);
  }

  function initPixelSkyElements() {
    pixelStars.length = 0;
    pixelClouds.length = 0;
    const skyH = getSkyHeight();

    // 1. Estrellas pixeladas (distribuidas en el cielo superior de -skyH a 0)
    const starCount = Math.max(120, Math.min(220, Math.floor(cw / 5.5)));
    const starColors = ["#ffffff", "#e0f2fe", "#00e5ff", "#fef08a", "#c084fc", "#93c5fd"];
    for (let i = 0; i < starCount; i++) {
      pixelStars.push({
        x: Math.floor(Math.random() * cw),
        y: Math.floor(-skyH * 0.98 + Math.random() * skyH * 0.95),
        size: Math.random() < 0.65 ? 2 : (Math.random() < 0.7 ? 3 : 4),
        color: starColors[Math.floor(Math.random() * starColors.length)],
        speed: 1.5 + Math.random() * 3.5,
        phase: Math.random() * Math.PI * 2,
        isCross: Math.random() < 0.22
      });
    }

    // 2. Nubes Pixel Art en 3 capas de paralaje escalonadas
    // Capa 0: Lejana, pequeña y sutil
    for (let i = 0; i < 5; i++) {
      pixelClouds.push({
        layer: 0,
        x: (cw / 4) * (i % 4) + (Math.random() - 0.5) * 80,
        y: -skyH * 0.84 + (i * 0.14) * skyH,
        w: 140 + (i % 3) * 35,
        h: 46,
        speed: 0.16 + (i % 2) * 0.05,
        colorBase: "#070e20",
        colorMid: "#0f1c3d",
        colorRim: "#1e3362",
        pixelSize: 4
      });
    }

    // Capa 1: Media, más visible
    for (let i = 0; i < 5; i++) {
      pixelClouds.push({
        layer: 1,
        x: (cw / 4) * (i % 4) + 40,
        y: -skyH * 0.60 + (i * 0.13) * skyH,
        w: 190 + (i % 2) * 45,
        h: 62,
        speed: 0.32 + (i % 2) * 0.08,
        colorBase: "#09142c",
        colorMid: "#152650",
        colorRim: "#2a4b88",
        pixelSize: 5
      });
    }

    // Capa 2: Primer plano (grandes y esponjosas en pixel art)
    for (let i = 0; i < 4; i++) {
      pixelClouds.push({
        layer: 2,
        x: (cw / 3) * (i % 3) + 20,
        y: -skyH * 0.35 + (i * 0.10) * skyH,
        w: 260 + (i % 2) * 60,
        h: 84,
        speed: 0.52 + (i % 2) * 0.1,
        colorBase: "#0d1a38",
        colorMid: "#1b3366",
        colorRim: "#38bdf8",
        pixelSize: 6
      });
    }
  }

  // Dibuja una nube retro en pixel art usando bloques escalonados
  function drawPixelCloud(ctx, cloud) {
    const p = cloud.pixelSize || 4;
    const cx = Math.floor(cloud.x / p) * p;
    const cy = Math.floor(cloud.y / p) * p;
    const w = Math.floor(cloud.w / p) * p;
    const h = Math.floor(cloud.h / p) * p;

    // Domes (lóbulos redondeados pixelados de la nube)
    const lobes = [
      { rx: w * 0.22, ry: h * 0.38, cx: cx + w * 0.24, cy: cy + h * 0.55 },
      { rx: w * 0.32, ry: h * 0.50, cx: cx + w * 0.52, cy: cy + h * 0.45 },
      { rx: w * 0.24, ry: h * 0.36, cx: cx + w * 0.78, cy: cy + h * 0.58 }
    ];

    // 1. Cuerpo base de la nube (colorBase)
    ctx.fillStyle = cloud.colorBase;
    ctx.fillRect(cx, cy + Math.floor(h * 0.55 / p) * p, w, Math.floor(h * 0.45 / p) * p);

    // 2. Relleno de los lóbulos pixelados (colorMid)
    ctx.fillStyle = cloud.colorMid;
    lobes.forEach(l => {
      const topY = Math.floor((l.cy - l.ry) / p) * p;
      const botY = Math.floor(l.cy / p) * p;
      for (let y = topY; y <= botY; y += p) {
        const dy = (y - l.cy) / l.ry;
        if (Math.abs(dy) <= 1) {
          const span = Math.floor(Math.sqrt(1 - dy * dy) * l.rx / p) * p;
          ctx.fillRect(l.cx - span, y, span * 2, p);
        }
      }
    });

    // 3. Brillo de luz de luna en el borde superior (colorRim)
    ctx.fillStyle = cloud.colorRim;
    lobes.forEach(l => {
      const topY = Math.floor((l.cy - l.ry) / p) * p;
      for (let y = topY; y <= topY + p * 2; y += p) {
        const dy = (y - l.cy) / l.ry;
        if (Math.abs(dy) <= 1) {
          const span = Math.floor(Math.sqrt(1 - dy * dy) * l.rx / p) * p;
          ctx.fillRect(l.cx - span + p, y, (span - p) * 2, p);
        }
      }
    });
  }

  // Actualiza la posición horizontal de las nubes y estrellas fugaces
  function updatePixelSky(dt) {
    pixelClouds.forEach(cloud => {
      cloud.x += cloud.speed * (dt * 60);
      if (cloud.x - cloud.w > cw) {
        cloud.x = -cloud.w - 40;
      }
    });

    // Estrellas fugaces periódicas
    const skyH = getSkyHeight();
    shootingStarTimer -= dt;
    if (shootingStarTimer <= 0) {
      shootingStarTimer = 3.5 + Math.random() * 4.0;
      shootingStars.push({
        x: Math.random() * cw * 0.7,
        y: -skyH * 0.95 + Math.random() * skyH * 0.45,
        vx: 6 + Math.random() * 3,
        vy: 2.8 + Math.random() * 1.5,
        life: 1.0,
        len: 40 + Math.random() * 25
      });
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += s.vx * (dt * 60);
      s.y += s.vy * (dt * 60);
      s.life -= dt * 1.4;
      if (s.life <= 0) {
        shootingStars.splice(i, 1);
      }
    }
  }

  function spawnSkyShootingStar(startX, startY) {
    const skyH = getSkyHeight();
    shootingStars.push({
      x: startX !== undefined ? startX : Math.random() * cw * 0.7,
      y: startY !== undefined ? startY : -skyH * 0.92 + Math.random() * skyH * 0.5,
      vx: 6 + Math.random() * 3,
      vy: 2.8 + Math.random() * 1.5,
      life: 1.0,
      len: 45
    });
  }

  // Renderiza el cielo nocturno pixel art
  function renderPixelSky(ctx, time, cw, ch) {
    const skyH = getSkyHeight();

    // 1. Gradiente del cielo nocturno profundo
    const skyGrad = ctx.createLinearGradient(0, -skyH, 0, 40);
    skyGrad.addColorStop(0.0, "#010308");
    skyGrad.addColorStop(0.28, "#04091a");
    skyGrad.addColorStop(0.60, "#08132e");
    skyGrad.addColorStop(0.88, "#0e1d42");
    skyGrad.addColorStop(1.0, "#050812");

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, -skyH - 20, cw, skyH + 65);

    // 2. Luna Creciente Pixel Art en la esquina superior derecha del cielo inicial
    const moonX = Math.floor(cw * 0.82 / 4) * 4;
    const moonY = Math.floor((-skyH + ch * 0.20) / 4) * 4;
    
    // Halo suave alrededor de la luna
    ctx.fillStyle = "rgba(254, 240, 138, 0.06)";
    ctx.beginPath();
    ctx.arc(moonX + 16, moonY + 16, 44, 0, Math.PI * 2);
    ctx.fill();

    // Luna pixelada
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(moonX + 6, moonY, 18, 4);
    ctx.fillRect(moonX + 2, moonY + 4, 26, 4);
    ctx.fillRect(moonX, moonY + 8, 30, 16);
    ctx.fillRect(moonX + 2, moonY + 24, 26, 4);
    ctx.fillRect(moonX + 6, moonY + 28, 18, 4);

    // Sombra que forma el cuarto creciente
    ctx.fillStyle = "#04091a";
    ctx.fillRect(moonX + 12, moonY + 4, 18, 4);
    ctx.fillRect(moonX + 10, moonY + 8, 22, 16);
    ctx.fillRect(moonX + 12, moonY + 24, 18, 4);

    // 3. Estrellas pixeladas titilando
    pixelStars.forEach(s => {
      const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = s.color;
      if (s.isCross) {
        ctx.fillRect(s.x, s.y, 2, 2);
        ctx.fillRect(s.x - 2, s.y, 2, 2);
        ctx.fillRect(s.x + 2, s.y, 2, 2);
        ctx.fillRect(s.x, s.y - 2, 2, 2);
        ctx.fillRect(s.x, s.y + 2, 2, 2);
      } else {
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
    });
    ctx.globalAlpha = 1.0;

    // 4. Estrellas fugaces
    shootingStars.forEach(s => {
      ctx.strokeStyle = `rgba(0, 229, 255, ${Math.max(0, s.life * 0.85)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x - (s.vx / 3) * s.len * 0.25, s.y - (s.vy / 3) * s.len * 0.25);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, s.life)})`;
      ctx.fillRect(s.x - 1, s.y - 1, 3, 3);
    });

    // 5. Nubes pixel art flotando
    pixelClouds.forEach(cloud => {
      drawPixelCloud(ctx, cloud);
    });
  }

  function resizeCanvas() {
    if (!zCanvas) return;
    const rect = zCanvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = Math.max(320, rect.width);
    ch = Math.max(480, rect.height);
    zCanvas.width = Math.floor(cw * dpr);
    zCanvas.height = Math.floor(ch * dpr);
    initPixelSkyElements();
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Puntos clave de navegación en la oficina (distribuidos en toda la pantalla)
  function getOfficeSpots() {
    return {
      desk1: { x: cw * 0.20, y: wallH + 85, label: "Puesto de Iván" },
      desk4: { x: cw * 0.50, y: wallH + 85, label: "Puesto de Nicolás" },
      desk2: { x: cw * 0.80, y: wallH + 85, label: "Puesto de Mario" },
      desk3: { x: cw * 0.32, y: ch * 0.52, label: "Puesto de Nacho" },
      terminal: { x: cw * 0.68, y: ch * 0.52, label: "Terminal Factura" },
      serverL: { x: cw * 0.10, y: ch * 0.78, label: "Servidor Alpha" },
      serverR: { x: cw * 0.90, y: ch * 0.78, label: "Servidor Beta" },
      coffee: { x: cw * 0.08, y: ch * 0.44, label: "Cafetera" },
      meeting: { x: cw * 0.50, y: ch * 0.78, label: "Punto de encuentro" }
    };
  }

  // Inicializar posiciones de los personajes en sus escritorios
  function initWorkerPositions() {
    const spots = getOfficeSpots();
    workers.p1.x = spots.desk1.x;
    workers.p1.y = spots.desk1.y;
    workers.p1.targetX = spots.desk1.x;
    workers.p1.targetY = spots.desk1.y;

    workers.p4.x = spots.desk4.x;
    workers.p4.y = spots.desk4.y;
    workers.p4.targetX = spots.desk4.x;
    workers.p4.targetY = spots.desk4.y;

    workers.p2.x = spots.desk2.x;
    workers.p2.y = spots.desk2.y;
    workers.p2.targetX = spots.desk2.x;
    workers.p2.targetY = spots.desk2.y;

    workers.p3.x = spots.desk3.x;
    workers.p3.y = spots.desk3.y;
    workers.p3.targetX = spots.desk3.x;
    workers.p3.targetY = spots.desk3.y;
  }

  // Dibujar mapa Zelda 2D: suelo amplio en toda la pantalla, alfombra cyber y muebles
  function renderZeldaMap(ctx, time) {
    const spots = getOfficeSpots();

    // 1. Suelo: Baldosas de 36x36 cubriendo toda la pantalla
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

    // 2. Alfombra central estilo Zelda / Cyber-Pad amplia que abarca toda la estancia
    const carpetX = cw * 0.06;
    const carpetY = wallH + 16;
    const carpetW = cw * 0.88;
    const carpetH = Math.max(260, ch - carpetY - 24);

    ctx.fillStyle = "rgba(14, 25, 48, 0.78)";
    ctx.fillRect(carpetX, carpetY, carpetW, carpetH);

    ctx.strokeStyle = "rgba(0, 229, 255, 0.32)";
    ctx.lineWidth = 2;
    ctx.strokeRect(carpetX, carpetY, carpetW, carpetH);

    ctx.strokeStyle = "rgba(0, 229, 255, 0.1)";
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
    drawDesk(ctx, d1.x, d1.y, "IVÁN · ADMÓN", "#00e5ff", "#10b981", time, true);

    const d4 = spots.desk4;
    drawDesk(ctx, d4.x, d4.y, "NICOLÁS · SCRUM", "#38bdf8", "#00e5ff", time, false);

    const d2 = spots.desk2;
    drawDesk(ctx, d2.x, d2.y, "MARIO · COMPRAS", "#f59e0b", "#00e5ff", time, false);

    const d3 = spots.desk3;
    drawDesk(ctx, d3.x, d3.y, "NACHO · DEV", "#10b981", "#00e5ff", time, true);

    const term = spots.terminal;
    drawCentralTerminal(ctx, term.x, term.y, time);

    const cof = spots.coffee;
    drawCoffeeStation(ctx, cof.x, cof.y, time);

    drawCyberPlant(ctx, 35, ch * 0.28);
    drawCyberPlant(ctx, 35, ch * 0.68);
    drawCyberPlant(ctx, cw - 65, ch * 0.28);
    drawCyberPlant(ctx, cw - 65, ch * 0.68);
  }

  function drawDesk(ctx, x, y, label, labelColor, screenColor, time, hasCoffee) {
    const dw = 104;
    const dh = 50;
    const dx = x - dw / 2;
    const dy = y + 25;

    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(dx - 4, dy + dh - 4, dw + 8, 8);

    ctx.fillStyle = "#152035";
    ctx.fillRect(dx, dy, dw, dh);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(dx, dy, dw, dh);

    const mw = 36;
    const mh = 24;
    const mx = dx + 14;
    const my = dy + 7;

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
    const targetW = 76;
    const targetH = 150;
    const posX = wObj.x - targetW / 2;
    const posY = wObj.y - targetH + 10 - (wObj.jumpOffset || 0);

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(wObj.x, wObj.y + 6, 26, 8, 0, 0, Math.PI * 2);
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

    if (wObj.bubbleText && wObj.bubbleTimer > 0 && heroScrollProgress > 0.45) {
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
        w.bubbleText = ivanLines[ivanLineIdx % ivanLines.length];
        ivanLineIdx++;
        w.bubbleTimer = 4.5;
      } else if (w.id === "p2") {
        w.bubbleText = marioLines[marioLineIdx % marioLines.length];
        marioLineIdx++;
        w.bubbleTimer = 4.5;
      } else if (w.id === "p3") {
        w.bubbleText = nachoLines[nachoLineIdx % nachoLines.length];
        nachoLineIdx++;
        w.bubbleTimer = 4.5;
      } else if (w.id === "p4") {
        w.bubbleText = nicoLines[nicoLineIdx % nicoLines.length];
        nicoLineIdx++;
        w.bubbleTimer = 4.5;
      }
    }
  }

  function pickNextGoal(w) {
    const spots = getOfficeSpots();
    const goals = [spots.desk1, spots.desk2, spots.desk3, spots.desk4, spots.terminal, spots.coffee, spots.meeting, spots.serverL, spots.serverR];
    const chosen = goals[Math.floor(Math.random() * goals.length)];
    w.targetX = Math.max(70, Math.min(cw - 70, chosen.x + (Math.random() - 0.5) * 80));
    w.targetY = Math.max(wallH + 50, Math.min(ch - 50, chosen.y + (Math.random() - 0.5) * 45));
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

      // Desplazamiento vertical de cámara según el progreso del Hero:
      // Cuando heroScrollProgress == 0: la cámara está en el cielo nocturno estrellado (cameraOffset = skyH)
      // Cuando heroScrollProgress == 1: la cámara está completamente en la oficina (cameraOffset = 0)
      const skyH = getSkyHeight();
      const cameraOffset = (1 - heroScrollProgress) * skyH;

      zctx.save();
      zctx.translate(0, cameraOffset);

      // 1. Cielo Nocturno y Nubes Pixel Art (en el rango vertical [-skyH, 0])
      updatePixelSky(dt);
      if (cameraOffset > -20) {
        renderPixelSky(zctx, timestamp / 1000, cw, ch);
      }

      // 2. Mapa y props de la oficina en el rango [0, ch]
      renderZeldaMap(zctx, timestamp / 1000);
      updateAndRenderParticles(zctx, dt);

      updateWorkerAI(workers.p1, workers.p2, dt);
      updateWorkerAI(workers.p2, workers.p3, dt);
      updateWorkerAI(workers.p3, workers.p4, dt);
      updateWorkerAI(workers.p4, workers.p1, dt);

      const renderList = [
        { w: workers.p1, s: speakers.p1 },
        { w: workers.p2, s: speakers.p2 },
        { w: workers.p3, s: speakers.p3 },
        { w: workers.p4, s: speakers.p4 }
      ].sort((a, b) => a.w.y - b.w.y);

      renderList.forEach(item => renderWorker(zctx, item.w, item.s));

      zctx.restore(); // restore cameraOffset
      zctx.restore(); // restore dpr
    }

    requestAnimationFrame(zeldaGameLoop);
  }

  zCanvas?.addEventListener("click", (e) => {
    const rect = zCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const skyH = getSkyHeight();
    const cameraOffset = (1 - heroScrollProgress) * skyH;
    const worldY = clickY - cameraOffset;

    // Si aún estamos principalmente en el cielo nocturno:
    if (heroScrollProgress < 0.70) {
      spawnSkyShootingStar(clickX, worldY);
      spawnParticle({
        type: "ripple",
        x: clickX,
        y: worldY,
        r: 6,
        life: 0.8
      });
      audio.playBlip(true);
      return;
    }

    spawnParticle({
      type: "ripple",
      x: clickX,
      y: worldY,
      r: 4,
      life: 0.8
    });

    audio.playBlip(true);

    const spots = getOfficeSpots();
    const distTerminal = Math.hypot(spots.terminal.x - clickX, spots.terminal.y - worldY);
    if (distTerminal < 55) {
      mailCard?.classList.remove("is-minimized");
      audio.playCoin();
      spawnXpBurst(spots.terminal.x, spots.terminal.y, 12);
      return;
    }

    const dist1 = Math.hypot(workers.p1.x - clickX, workers.p1.y - worldY);
    const dist2 = Math.hypot(workers.p2.x - clickX, workers.p2.y - worldY);
    const dist3 = Math.hypot(workers.p3.x - clickX, workers.p3.y - worldY);
    const dist4 = Math.hypot(workers.p4.x - clickX, workers.p4.y - worldY);

    let targetWorker = workers.p1;
    let minDist = dist1;
    if (dist2 < minDist) { targetWorker = workers.p2; minDist = dist2; }
    if (dist3 < minDist) { targetWorker = workers.p3; minDist = dist3; }
    if (dist4 < minDist) { targetWorker = workers.p4; minDist = dist4; }

    targetWorker.targetX = Math.max(70, Math.min(cw - 70, clickX));
    targetWorker.targetY = Math.max(wallH + 45, Math.min(ch - 50, worldY));
    targetWorker.waitTimer = 0;

    if (minDist < 70) {
      if (targetWorker.id === "p1") {
        ivanLineIdx = (ivanLineIdx + 1) % ivanLines.length;
        targetWorker.bubbleText = ivanLines[ivanLineIdx];
      } else if (targetWorker.id === "p2") {
        marioLineIdx = (marioLineIdx + 1) % marioLines.length;
        targetWorker.bubbleText = marioLines[marioLineIdx];
      } else if (targetWorker.id === "p3") {
        nachoLineIdx = (nachoLineIdx + 1) % nachoLines.length;
        targetWorker.bubbleText = nachoLines[nachoLineIdx];
      } else if (targetWorker.id === "p4") {
        nicoLineIdx = (nicoLineIdx + 1) % nicoLines.length;
        targetWorker.bubbleText = nicoLines[nicoLineIdx];
      }
      targetWorker.bubbleTimer = 5.0;
      targetWorker.jumpOffset = 12;
    }
  });

  ["p1", "p2", "p3", "p4"].forEach((key) => {
    loadSpeaker(speakers[key], (data) => {
      speakers[key].frames = data.frames;
      speakers[key].w = data.w;
      speakers[key].h = data.h;
      speakers[key].loaded = true;
    });
  });

  initWorkerPositions();
  requestAnimationFrame(zeldaGameLoop);

  $("#btn-ask-ivan")?.addEventListener("click", () => {
    audio.playBlip(true);
    workers.p1.facing = 1;
    ivanLineIdx = (ivanLineIdx + 1) % ivanLines.length;
    workers.p1.bubbleText = ivanLines[ivanLineIdx];
    workers.p1.bubbleTimer = 6.0;
    workers.p1.jumpOffset = 14;
  });

  $("#btn-ask-mario")?.addEventListener("click", () => {
    audio.playBlip(true);
    workers.p2.facing = -1;
    marioLineIdx = (marioLineIdx + 1) % marioLines.length;
    workers.p2.bubbleText = marioLines[marioLineIdx];
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
      workers.p3.state = "alarm";
      workers.p4.state = "alarm";
      workers.p1.bubbleText = "¡Uff, era una trampa! 😱";
      workers.p2.bubbleText = "¡Casi transferimos 4.870 €!";
      workers.p3.bubbleText = "¡Aislad la red inmediatamente!";
      workers.p4.bubbleText = "¡Alerta perimetral! Bloqueando conexión.";
      workers.p1.bubbleTimer = 6.0;
      workers.p2.bubbleTimer = 6.0;
      workers.p3.bubbleTimer = 6.0;
      workers.p4.bubbleTimer = 6.0;
      spawnAlertMark(workers.p1.x, workers.p1.y);
      spawnAlertMark(workers.p3.x, workers.p3.y);
      spawnAlertMark(workers.p4.x, workers.p4.y);

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
      workers.p3.state = "celebrate";
      workers.p4.state = "celebrate";
      workers.p1.jumpOffset = 22;
      workers.p2.jumpOffset = 22;
      workers.p3.jumpOffset = 22;
      workers.p4.jumpOffset = 22;
      workers.p1.bubbleText = "¡Amenaza frenada! 🏆";
      workers.p2.bubbleText = "¡+50 XP sumados! Buen trabajo.";
      workers.p3.bubbleText = "¡Reglas actualizadas en Sentinel!";
      workers.p4.bubbleText = "¡Protocolo completado con éxito! 🛡️";
      workers.p1.bubbleTimer = 6.0;
      workers.p2.bubbleTimer = 6.0;
      workers.p3.bubbleTimer = 6.0;
      workers.p4.bubbleTimer = 6.0;

      spawnXpBurst(workers.p1.x, workers.p1.y, 25);
      spawnXpBurst(workers.p2.x, workers.p2.y, 25);
      spawnXpBurst(workers.p3.x, workers.p3.y, 25);
      spawnXpBurst(workers.p4.x, workers.p4.y, 25);

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
      workers.p3.state = "idle";
      workers.p4.state = "idle";
      workers.p1.bubbleText = "¡Llega factura de 4.870 €!";
      workers.p2.bubbleText = "¡El dominio .co es falso!";
      workers.p3.bubbleText = "¡Revisando el código de pagos!";
      workers.p4.bubbleText = "¡Ciberseguridad perimetral activa!";
      workers.p1.bubbleTimer = 5.0;
      workers.p2.bubbleTimer = 5.0;
      workers.p3.bubbleTimer = 5.0;
      workers.p4.bubbleTimer = 5.0;

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

  // 01. EL PROBLEMA: Carrusel horizontal de 3 escenas centradas a pantalla completa
  const problemTrack = $("#problem-track");
  const problemSlider = $("#problem-slider");
  let currentProblemScene = 0;

  function updateProblemScene(progress) {
    if (!problemSlider) return;
    let nextScene = currentProblemScene;

    // Umbrales con histeresis para evitar oscilaciones rápidas:
    // Requiere un scroll deliberado y sostenido para cambiar de escena.
    if (currentProblemScene === 0) {
      if (progress > 0.36) nextScene = 1;
    } else if (currentProblemScene === 1) {
      if (progress < 0.28) nextScene = 0;
      else if (progress > 0.70) nextScene = 2;
    } else if (currentProblemScene === 2) {
      if (progress < 0.62) nextScene = 1;
    }

    if (nextScene !== currentProblemScene) {
      currentProblemScene = nextScene;
      audio?.playBlip?.(false);
    }

    // Cada escena queda siempre 100% centrada (0vw, -100vw, -200vw). Imposible quedarse a medias.
    problemSlider.style.transform = `translateX(-${currentProblemScene * 100}vw)`;
  }

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
    activeSolutionStep = clamped;
    if (playSound) audio.playBlip(true);

    const stageGrid = $(".solution-stage-grid");
    if (stageGrid) {
      stageGrid.dataset.activeStep = String(clamped);
    }
    const solVis = $("#solution-visualizer");
    if (solVis) {
      solVis.dataset.stepState = String(clamped);
    }

    stepTabs.forEach((tab, i) => {
      const on = i === clamped;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", String(on));
    });
    stepPanels.forEach((panel, i) => {
      const on = i === clamped;
      panel.classList.toggle("is-active", on);
    });
    visCards.forEach((card, i) => card.classList.toggle("is-active", i === clamped));

    if (visStatePill) {
      visStatePill.textContent = stepStateLabels[clamped];
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

    // Progreso dentro del Hero (Cielo Nocturno -> Oficina con Sprites)
    const heroTrack = $("#hero");
    const heroBrand = $("#hero-brand");
    if (heroTrack) {
      const heroRect = heroTrack.getBoundingClientRect();
      const heroScrollable = heroTrack.offsetHeight - window.innerHeight;
      if (heroScrollable > 0) {
        heroScrollProgress = Math.min(1, Math.max(0, -heroRect.top / heroScrollable));
      } else {
        heroScrollProgress = 1;
      }

      if (heroBrand) {
        // En scroll = 0: Escala grande (1.45) y centrado total en el cielo nocturno.
        // Al scrollear: se va reduciendo (escala 0.58) y asciende suavemente
        // hasta quedarse centrado arriba del todo en el centro (header estilo arcade retro)
        const scale = 1.45 - heroScrollProgress * 0.87;
        const translateY = -heroScrollProgress * (window.innerHeight * 0.44);
        heroBrand.style.transform = `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`;
      }
    }

    // Posición vertical del objeto viajero y llenado de la línea
    if (railFill) railFill.style.height = `${totalProgress * 100}%`;
    if (packetEl) packetEl.style.top = `${totalProgress * 84}%`;

    // 01. EL PROBLEMA: Carrusel horizontal de 3 escenas centradas a pantalla completa
    if (problemTrack) {
      const pRect = problemTrack.getBoundingClientRect();
      const pScrollable = problemTrack.offsetHeight - window.innerHeight;
      if (pScrollable > 0) {
        const pProgress = Math.min(1, Math.max(0, -pRect.top / pScrollable));
        updateProblemScene(pProgress);
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
