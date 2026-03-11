/**
 * Animated wind-particle canvas overlay for Leaflet.
 * Inspired by earth.nullschool.net wind visualisation.
 *
 * Takes a grid of { lat, lon, u, v } measurements where
 *   u = east-ward wind component (m/s)
 *   v = north-ward wind component (m/s)
 * and draws thousands of semi-transparent moving particles whose
 * speed and heading match the interpolated wind field.
 */

import L from 'leaflet';

export interface WindGridPoint {
  lat: number;
  lon: number;
  u: number; // east-ward component m/s
  v: number; // north-ward component m/s
  speed: number;
}

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
}

const PARTICLE_COUNT = 3000;
const PARTICLE_LINE_WIDTH = 1.4;
const PARTICLE_MAX_AGE = 80;
const FADE_FILL = 'rgba(0, 0, 0, 0.04)';

export class WindLayer extends L.Layer {
  private _canvas!: HTMLCanvasElement;
  private _ctx!: CanvasRenderingContext2D;
  private _particles: Particle[] = [];
  private _grid: WindGridPoint[] = [];
  private _animFrame = 0;
  private _leafletMap!: L.Map;
  private _running = false;
  private _colorScale: (speed: number) => string;

  constructor(grid: WindGridPoint[], options?: L.LayerOptions) {
    super(options);
    this._grid = grid;
    this._colorScale = buildWindColorScale();
  }

  setGrid(grid: WindGridPoint[]) {
    this._grid = grid;
  }

  onAdd(map: L.Map) {
    this._leafletMap = map;
    const size = map.getSize();

    this._canvas = L.DomUtil.create('canvas', 'wind-canvas') as HTMLCanvasElement;
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._canvas.style.position = 'absolute';
    this._canvas.style.top = '0';
    this._canvas.style.left = '0';
    this._canvas.style.pointerEvents = 'none';
    this._canvas.style.zIndex = '450';

    map.getPanes().overlayPane!.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d')!;

    this._initParticles();
    this._running = true;
    this._animate();

    map.on('moveend', this._reset, this);
    map.on('zoomend', this._reset, this);
    map.on('resize', this._resize, this);

    return this;
  }

  onRemove(map: L.Map) {
    this._running = false;
    cancelAnimationFrame(this._animFrame);
    map.getPanes().overlayPane!.removeChild(this._canvas);
    map.off('moveend', this._reset, this);
    map.off('zoomend', this._reset, this);
    map.off('resize', this._resize, this);
    return this;
  }

  /* ---- internals ---- */

  private _resize = () => {
    const size = this._leafletMap.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._initParticles();
  };

  private _reset = () => {
    const topLeft = this._leafletMap.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._initParticles();
  };

  private _initParticles() {
    const { x: w, y: h } = this._leafletMap.getSize();
    this._particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this._particles.push(this._randomParticle(w, h));
    }
  }

  private _randomParticle(w: number, h: number): Particle {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      age: Math.floor(Math.random() * PARTICLE_MAX_AGE),
      maxAge: PARTICLE_MAX_AGE + Math.floor(Math.random() * 20),
    };
  }

  private _interpolateWind(lat: number, lon: number): { u: number; v: number; speed: number } {
    // Inverse-distance-weighted interpolation of nearby grid points
    let sumU = 0, sumV = 0, sumW = 0;
    for (const p of this._grid) {
      const dlat = lat - p.lat;
      const dlon = lon - p.lon;
      const d2 = dlat * dlat + dlon * dlon;
      if (d2 < 0.0001) return { u: p.u, v: p.v, speed: p.speed };
      const w = 1 / d2;
      sumU += p.u * w;
      sumV += p.v * w;
      sumW += w;
    }
    if (sumW === 0) return { u: 0, v: 0, speed: 0 };
    const u = sumU / sumW;
    const v = sumV / sumW;
    return { u, v, speed: Math.sqrt(u * u + v * v) };
  }

  private _animate = () => {
    if (!this._running) return;

    const { x: w, y: h } = this._leafletMap.getSize();
    const ctx = this._ctx;
    const bounds = this._leafletMap.getBounds();

    // Fade previous frame
    ctx.fillStyle = FADE_FILL;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    const latRange = bounds.getNorth() - bounds.getSouth();
    const lonRange = bounds.getEast() - bounds.getWest();
    const speedScale = 0.4; // pixels per m/s per frame

    for (const p of this._particles) {
      // Map pixel → lat/lon
      const lon = bounds.getWest() + (p.x / w) * lonRange;
      const lat = bounds.getNorth() - (p.y / h) * latRange;
      const wind = this._interpolateWind(lat, lon);

      const prevX = p.x;
      const prevY = p.y;

      // u → east direction → positive x; v → north → negative y
      p.x += wind.u * speedScale;
      p.y -= wind.v * speedScale;
      p.age++;

      if (p.age > p.maxAge || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        Object.assign(p, this._randomParticle(w, h));
        continue;
      }

      // Draw line segment
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = this._colorScale(wind.speed);
      ctx.lineWidth = PARTICLE_LINE_WIDTH;
      ctx.stroke();
    }

    this._animFrame = requestAnimationFrame(this._animate);
  };
}

/* ---- colour helpers ---- */

function buildWindColorScale(): (speed: number) => string {
  // Nullschool-like colour ramp from calm blue → green → yellow → red → magenta
  const stops: [number, number, number, number][] = [
    //  speed, R,   G,   B
    [0, 60, 120, 240],
    [3, 80, 200, 220],
    [6, 80, 240, 120],
    [10, 240, 240, 60],
    [15, 240, 120, 40],
    [20, 240, 40, 60],
    [30, 200, 40, 200],
  ];

  return (speed: number) => {
    if (speed <= stops[0][0]) return `rgba(${stops[0][1]},${stops[0][2]},${stops[0][3]},0.8)`;
    for (let i = 1; i < stops.length; i++) {
      if (speed <= stops[i][0]) {
        const t = (speed - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
        const r = Math.round(stops[i - 1][1] + t * (stops[i][1] - stops[i - 1][1]));
        const g = Math.round(stops[i - 1][2] + t * (stops[i][2] - stops[i - 1][2]));
        const b = Math.round(stops[i - 1][3] + t * (stops[i][3] - stops[i - 1][3]));
        return `rgba(${r},${g},${b},0.8)`;
      }
    }
    const last = stops[stops.length - 1];
    return `rgba(${last[1]},${last[2]},${last[3]},0.8)`;
  };
}
