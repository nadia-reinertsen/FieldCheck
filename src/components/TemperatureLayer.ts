/**
 * Temperature heatmap canvas overlay for Leaflet.
 * Renders a smooth colour gradient across the map viewport based on
 * interpolated temperature values from a grid of measurement points.
 */

import L from 'leaflet';

export interface TempGridPoint {
  lat: number;
  lon: number;
  temperature: number;
}

export class TemperatureLayer extends L.Layer {
  private _canvas!: HTMLCanvasElement;
  private _ctx!: CanvasRenderingContext2D;
  private _grid: TempGridPoint[] = [];
  private _leafletMap!: L.Map;

  constructor(grid: TempGridPoint[], options?: L.LayerOptions) {
    super(options);
    this._grid = grid;
  }

  setGrid(grid: TempGridPoint[]) {
    this._grid = grid;
    if (this._leafletMap) this._draw();
  }

  onAdd(map: L.Map) {
    this._leafletMap = map;
    const size = map.getSize();

    this._canvas = L.DomUtil.create('canvas', 'temp-canvas') as HTMLCanvasElement;
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._canvas.style.position = 'absolute';
    this._canvas.style.top = '0';
    this._canvas.style.left = '0';
    this._canvas.style.pointerEvents = 'none';
    this._canvas.style.zIndex = '440';
    this._canvas.style.opacity = '0.45';

    map.getPanes().overlayPane!.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d')!;

    this._draw();

    map.on('moveend', this._reset, this);
    map.on('zoomend', this._reset, this);
    map.on('resize', this._resize, this);

    return this;
  }

  onRemove(map: L.Map) {
    map.getPanes().overlayPane!.removeChild(this._canvas);
    map.off('moveend', this._reset, this);
    map.off('zoomend', this._reset, this);
    map.off('resize', this._resize, this);
    return this;
  }

  private _resize = () => {
    const size = this._leafletMap.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._draw();
  };

  private _reset = () => {
    const topLeft = this._leafletMap.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._draw();
  };

  private _interpolateTemp(lat: number, lon: number): number {
    let sumT = 0, sumW = 0;
    for (const p of this._grid) {
      const dlat = lat - p.lat;
      const dlon = lon - p.lon;
      const d2 = dlat * dlat + dlon * dlon;
      if (d2 < 0.0001) return p.temperature;
      const w = 1 / (d2 * d2); // sharper falloff
      sumT += p.temperature * w;
      sumW += w;
    }
    return sumW === 0 ? 0 : sumT / sumW;
  }

  private _draw() {
    if (!this._grid.length) return;

    const { x: w, y: h } = this._leafletMap.getSize();
    const ctx = this._ctx;
    const bounds = this._leafletMap.getBounds();
    const latRange = bounds.getNorth() - bounds.getSouth();
    const lonRange = bounds.getEast() - bounds.getWest();

    // Render at lower resolution then scale up for performance
    const step = 6;
    const imgData = ctx.createImageData(w, h);

    for (let py = 0; py < h; py += step) {
      for (let px = 0; px < w; px += step) {
        const lon = bounds.getWest() + (px / w) * lonRange;
        const lat = bounds.getNorth() - (py / h) * latRange;
        const temp = this._interpolateTemp(lat, lon);
        const [r, g, b] = tempToColor(temp);

        // Fill the step×step block
        for (let dy = 0; dy < step && py + dy < h; dy++) {
          for (let dx = 0; dx < step && px + dx < w; dx++) {
            const idx = ((py + dy) * w + (px + dx)) * 4;
            imgData.data[idx] = r;
            imgData.data[idx + 1] = g;
            imgData.data[idx + 2] = b;
            imgData.data[idx + 3] = 180;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }
}

/**
 * Convert temperature (°C) to an RGB colour.
 * Range: -30 → deep blue … 0 → cyan … 10 → green … 20 → yellow … 35+ → deep red
 */
function tempToColor(temp: number): [number, number, number] {
  const stops: [number, number, number, number][] = [
    [-30, 20, 0, 120],
    [-15, 40, 60, 200],
    [-5,  60, 140, 240],
    [0,   80, 210, 240],
    [5,   80, 240, 180],
    [10,  100, 240, 80],
    [15,  200, 240, 40],
    [20,  240, 220, 40],
    [25,  240, 160, 40],
    [30,  240, 80, 30],
    [40,  180, 20, 20],
  ];

  if (temp <= stops[0][0]) return [stops[0][1], stops[0][2], stops[0][3]];
  for (let i = 1; i < stops.length; i++) {
    if (temp <= stops[i][0]) {
      const t = (temp - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
      return [
        Math.round(stops[i - 1][1] + t * (stops[i][1] - stops[i - 1][1])),
        Math.round(stops[i - 1][2] + t * (stops[i][2] - stops[i - 1][2])),
        Math.round(stops[i - 1][3] + t * (stops[i][3] - stops[i - 1][3])),
      ];
    }
  }
  const last = stops[stops.length - 1];
  return [last[1], last[2], last[3]];
}
