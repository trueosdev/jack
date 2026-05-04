"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const JACK = "/jack.jpg";
const HALFTONE = "/jackhalftone.webp";

/** Idle after last brush stroke before the color photo heals back in (reverse draw order). */
const JACK_RESET_IDLE_MS = 750;
/** Dab centers recorded for rewind; oldest dropped when exceeded. */
const MAX_HEAL_HISTORY = 4500;
/** Canvas-space radius that covers one brush dab for healing (device pixels). */
const HEAL_RADIUS = 120;
/** How many dab sites to restore per animation frame. */
const HEAL_BATCH_PER_FRAME = 20;

/**
 * Same geometry as CSS `object-fit: cover` + `object-position` (percentage pair).
 * If you change framing, update `OBJECT_POSITION_*` and the comment in `app/globals.css`
 * near `.photo-reveal__canvas`.
 */
const OBJECT_POSITION_X = 0.5; // 50% / center
const OBJECT_POSITION_Y = 0.28; // 28%

function drawObjectFitCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
  posX: number,
  posY: number,
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;

  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const ox = posX * (cw - dw);
  const oy = posY * (ch - dh);

  ctx.drawImage(img, ox, oy, dw, dh);
}

function healDab(
  ctx: CanvasRenderingContext2D,
  jack: HTMLImageElement,
  px: number,
  py: number,
  cw: number,
  ch: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, HEAL_RADIUS, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalCompositeOperation = "source-over";
  drawObjectFitCover(ctx, jack, cw, ch, OBJECT_POSITION_X, OBJECT_POSITION_Y);
  ctx.restore();
}

function dabPaintbrush(ctx: CanvasRenderingContext2D, px: number, py: number) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";

  const bristles: [number, number, number][] = [
    [0, 0, 1],
    [-6 + Math.random() * 12, -5 + Math.random() * 10, 0.55],
    [5 + Math.random() * 8, 4 + Math.random() * 8, 0.4],
    [-8 + Math.random() * 14, 6 + Math.random() * 6, 0.35],
  ];

  for (const [ox, oy, scale] of bristles) {
    const x = px + ox;
    const y = py + oy;
    const radius = (100 + Math.random() * 10) * scale;

    const g = ctx.createRadialGradient(x, y, radius * 0.05, x, y, radius);
    g.addColorStop(0, "rgba(0, 0, 0, 0.92)");
    g.addColorStop(0.42, "rgba(0, 0, 0, 0.68)");
    g.addColorStop(0.78, "rgba(0, 0, 0, 0.32)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.02, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function PortraitReveal() {
  const shellRef = useRef<HTMLDivElement>(null);
  const halftoneCanvasRef = useRef<HTMLCanvasElement>(null);
  const jackCanvasRef = useRef<HTMLCanvasElement>(null);
  const halftoneImgRef = useRef<HTMLImageElement | null>(null);
  const jackImgRef = useRef<HTMLImageElement | null>(null);
  const lastRef = useRef<{ px: number; py: number } | null>(null);
  const healHistoryRef = useRef<{ px: number; py: number }[]>([]);
  const idleResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const healAnimRef = useRef<number | null>(null);

  const [layersReady, setLayersReady] = useState(false);

  const cancelJackResetIdle = useCallback(() => {
    if (healAnimRef.current != null) {
      cancelAnimationFrame(healAnimRef.current);
      healAnimRef.current = null;
    }
    if (idleResetTimerRef.current) {
      clearTimeout(idleResetTimerRef.current);
      idleResetTimerRef.current = null;
    }
    const fg = jackCanvasRef.current;
    if (fg) {
      fg.style.transition = "";
      fg.style.opacity = "";
    }
  }, []);

  const paintLayers = useCallback(() => {
    cancelJackResetIdle();

    const shell = shellRef.current;
    const bg = halftoneCanvasRef.current;
    const fg = jackCanvasRef.current;
    const halftone = halftoneImgRef.current;
    const jack = jackImgRef.current;
    if (!shell || !bg || !fg || !halftone?.naturalWidth || !jack?.naturalWidth) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const w = Math.round(shell.clientWidth);
    const h = Math.round(shell.clientHeight);
    if (!w || !h) return;

    const iw = Math.round(w * dpr);
    const ih = Math.round(h * dpr);
    bg.width = iw;
    bg.height = ih;
    fg.width = iw;
    fg.height = ih;

    const ctxBg = bg.getContext("2d", { alpha: false });
    const ctxFg = fg.getContext("2d", { alpha: true });
    if (!ctxBg || !ctxFg) return;

    ctxBg.setTransform(1, 0, 0, 1, 0, 0);
    ctxFg.setTransform(1, 0, 0, 1, 0, 0);
    ctxBg.clearRect(0, 0, iw, ih);
    ctxFg.clearRect(0, 0, iw, ih);

    drawObjectFitCover(
      ctxBg,
      halftone,
      iw,
      ih,
      OBJECT_POSITION_X,
      OBJECT_POSITION_Y,
    );
    drawObjectFitCover(
      ctxFg,
      jack,
      iw,
      ih,
      OBJECT_POSITION_X,
      OBJECT_POSITION_Y,
    );

    healHistoryRef.current = [];
    lastRef.current = null;
  }, [cancelJackResetIdle]);

  const paintLayersRef = useRef(paintLayers);
  paintLayersRef.current = paintLayers;

  const pushHealPoint = (px: number, py: number) => {
    const h = healHistoryRef.current;
    h.push({ px, py });
    if (h.length > MAX_HEAL_HISTORY) {
      h.splice(0, h.length - MAX_HEAL_HISTORY);
    }
  };

  const runReverseHealReset = () => {
    const fg = jackCanvasRef.current;
    const jack = jackImgRef.current;
    if (!fg?.width || !jack?.naturalWidth) {
      paintLayersRef.current();
      return;
    }

    if (healHistoryRef.current.length === 0) {
      paintLayersRef.current();
      return;
    }

    const ctx = fg.getContext("2d");
    if (!ctx) {
      paintLayersRef.current();
      return;
    }

    const cw = fg.width;
    const ch = fg.height;

    const step = () => {
      healAnimRef.current = null;

      if (healHistoryRef.current.length === 0) {
        paintLayersRef.current();
        return;
      }

      for (
        let b = 0;
        b < HEAL_BATCH_PER_FRAME && healHistoryRef.current.length > 0;
        b++
      ) {
        const pt = healHistoryRef.current.pop();
        if (pt) healDab(ctx, jack, pt.px, pt.py, cw, ch);
      }

      if (healHistoryRef.current.length === 0) {
        paintLayersRef.current();
        return;
      }

      healAnimRef.current = requestAnimationFrame(step);
    };

    healAnimRef.current = requestAnimationFrame(step);
  };

  const scheduleJackResetAfterIdle = useCallback(() => {
    if (idleResetTimerRef.current) {
      clearTimeout(idleResetTimerRef.current);
    }
    idleResetTimerRef.current = setTimeout(() => {
      idleResetTimerRef.current = null;
      runReverseHealReset();
    }, JACK_RESET_IDLE_MS);
  }, []);

  useEffect(() => {
    let cancelled = false;

    function load(src: string) {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new window.Image();
        im.decoding = "async";
        im.onload = () => resolve(im);
        im.onerror = () => reject(new Error(`Failed to load ${src}`));
        im.src = src;
      });
    }

    Promise.all([load(JACK), load(HALFTONE)])
      .then(([jack, halftone]) => {
        if (cancelled) return;
        jackImgRef.current = jack;
        halftoneImgRef.current = halftone;
        setLayersReady(true);
        requestAnimationFrame(paintLayers);
      })
      .catch(() => {
        if (!cancelled) setLayersReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [paintLayers]);

  useEffect(() => {
    return () => {
      if (healAnimRef.current != null) {
        cancelAnimationFrame(healAnimRef.current);
        healAnimRef.current = null;
      }
      if (idleResetTimerRef.current) {
        clearTimeout(idleResetTimerRef.current);
        idleResetTimerRef.current = null;
      }
      const fg = jackCanvasRef.current;
      if (fg) {
        fg.style.transition = "";
        fg.style.opacity = "";
      }
    };
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", paintLayers);
      return () => window.removeEventListener("resize", paintLayers);
    }

    const ro = new ResizeObserver(() => paintLayers());
    ro.observe(shell);
    return () => ro.disconnect();
  }, [paintLayers]);

  useEffect(() => {
    if (layersReady) requestAnimationFrame(paintLayers);
  }, [layersReady, paintLayers]);

  const eraseAlongStroke = useCallback((px: number, py: number) => {
    const canvas = jackCanvasRef.current;
    if (!canvas?.width || !jackImgRef.current) return;

    cancelJackResetIdle();

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prev = lastRef.current;
    if (prev) {
      const dx = px - prev.px;
      const dy = py - prev.py;
      const dist = Math.hypot(dx, dy);
      const step = Math.max(8, dist / 24);
      const steps = Math.max(1, Math.ceil(dist / step));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = prev.px + dx * t;
        const cy = prev.py + dy * t;
        dabPaintbrush(ctx, cx, cy);
        pushHealPoint(cx, cy);
      }
    } else {
      dabPaintbrush(ctx, px, py);
      pushHealPoint(px, py);
    }

    lastRef.current = { px, py };
    scheduleJackResetAfterIdle();
  }, [cancelJackResetIdle, scheduleJackResetAfterIdle]);

  const clientToCanvas = useCallback((clientX: number, clientY: number) => {
    const canvas = jackCanvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !canvas.width || !shell) return null;
    const rect = shell.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return { px: x * sx, py: y * sy };
  }, []);

  return (
    <div
      className="photo-frame photo-frame--reveal"
      ref={shellRef}
      role="img"
      aria-label="Portrait of Jack Lyons. Brush across the portrait to reveal a halftone underneath; the color photo then heals back in reverse brush order after you pause."
      onPointerMove={(e) => {
        if (!layersReady) return;
        const p = clientToCanvas(e.clientX, e.clientY);
        if (p) eraseAlongStroke(p.px, p.py);
      }}
      onPointerLeave={() => {
        lastRef.current = null;
      }}
    >

      <div className="photo-reveal__stack">
        <canvas
          ref={halftoneCanvasRef}
          className="photo-reveal__canvas photo-reveal__canvas--back"
          aria-hidden
        />
        <canvas
          ref={jackCanvasRef}
          className="photo-reveal__canvas photo-reveal__canvas--front"
          aria-hidden
        />
      </div>
    </div>
  );
}
