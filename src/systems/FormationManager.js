export class FormationManager {
  static point(name, i, n, spacing = 1) {
    const t = i / Math.max(1, n - 1),
      a = t * Math.PI * 2,
      k = i % 6,
      row = Math.floor(i / 6),
      rows = Math.ceil(n / 6),
      rowY = (row / Math.max(1, rows - 1) - 0.5) * 1.5;
    let x = 0,
      y = 0;
    switch (name) {
      case "GRID":
        x = (k - 2.5) * 0.3;
        y = rowY;
        break;
      case "V":
        x = (t - 0.5) * 1.8;
        y = Math.abs(t - 0.5) * 1.4 - 0.4;
        break;
      case "INVERTED_V":
        x = (t - 0.5) * 1.8;
        y = -Math.abs(t - 0.5) * 1.4 + 0.3;
        break;
      case "RING":
      case "ORBIT":
        x = Math.cos(a) * 0.8;
        y = Math.sin(a) * 0.65;
        break;
      case "DOUBLE_RING":
        x = Math.cos(a * 2) * (i % 2 ? 0.85 : 0.45);
        y = Math.sin(a * 2) * (i % 2 ? 0.7 : 0.36);
        break;
      case "SPIRAL":
        x = Math.cos(a * 2) * (0.15 + t * 0.7);
        y = Math.sin(a * 2) * (0.15 + t * 0.6);
        break;
      case "SNAKE":
        x = Math.sin(t * Math.PI * 3) * 0.75;
        y = t * 1.4 - 0.7;
        break;
      case "DOUBLE_SNAKE":
        x = Math.sin(t * Math.PI * 3) * (i % 2 ? -0.75 : 0.75);
        y = t * 1.4 - 0.7;
        break;
      case "HEART":
        x = Math.pow(Math.sin(a), 3) * 0.82;
        y =
          -(
            13 * Math.cos(a) -
            5 * Math.cos(2 * a) -
            2 * Math.cos(3 * a) -
            Math.cos(4 * a)
          ) * 0.047;
        break;
      case "DIAMOND":
        x =
          (Math.cos(a) / (Math.abs(Math.cos(a)) + Math.abs(Math.sin(a)))) *
          0.85;
        y =
          (Math.sin(a) / (Math.abs(Math.cos(a)) + Math.abs(Math.sin(a)))) *
          0.75;
        break;
      case "CROSS":
        x = i % 2 ? (t - 0.5) * 1.7 : 0;
        y = i % 2 ? 0 : (t - 0.5) * 1.5;
        break;
      case "WINGS":
        x = (t - 0.5) * 1.8;
        y = Math.sin(t * Math.PI * 3) * 0.4;
        break;
      case "WAVE":
      case "MOVING_ROWS":
        x = (k - 2.5) * 0.3;
        y = (row - 2) * 0.26 + Math.sin(k) * 0.16;
        break;
      case "ZIGZAG":
        x = (t - 0.5) * 1.8;
        y = ((i % 3) - 1) * 0.5;
        break;
      case "COLUMN_SWEEP":
        x = ((i % 3) - 1) * 0.55;
        y = (Math.floor(i / 3) / (n / 3) - 0.5) * 1.5;
        break;
      case "TUNNEL":
        x = Math.cos(a) * (0.45 + (i % 3) * 0.17);
        y = Math.sin(a) * 0.8;
        break;
      case "FLOWER":
        x = Math.cos(a) * (0.5 + 0.3 * Math.cos(a * 5));
        y = Math.sin(a) * (0.5 + 0.3 * Math.cos(a * 5));
        break;
      case "ARROW":
        x = (k - 2.5) * 0.28;
        y = rowY + Math.abs(k - 2.5) * 0.16;
        break;
      case "HOURGLASS":
        x = (k - 2.5) * 0.3 * Math.max(0.25, Math.abs(row - 2) / 2);
        y = (row - 2) * 0.32;
        break;
      case "CLUSTERS":
        x = ((i % 3) - 1) * 0.58 + Math.cos(a * 5) * 0.22;
        y = Math.sin(a * 5) * 0.38;
        break;
      case "PINWHEEL":
        x = Math.cos(a * 3) * t * 0.9;
        y = Math.sin(a * 3) * t * 0.8;
        break;
      case "CHAOS_SWARM":
        x = Math.sin(i * 127.1) * 0.85;
        y = Math.cos(i * 311.7) * 0.7;
        break;
      default:
        x = Math.cos(a) * 0.8;
        y = Math.sin(a) * 0.8;
    }
    return { x: x * spacing, y: y * spacing };
  }
  static entrance(type, t, index, x, y, w, h) {
    const ease = 1 - Math.pow(1 - t, 3),
      a = (1 - t) * Math.PI * 3 + index * 0.22;
    let sx, sy;
    switch (type % 17) {
      case 0:
      case 5:
      case 8:
      case 11:
        sx = w / 2 + Math.cos(a) * w * 0.8;
        sy = -h * 0.3 + Math.sin(a) * h * 0.3;
        break;
      case 1:
      case 10:
        sx = -150 - index * 25;
        sy = h * 0.25 + Math.sin(index * 0.5) * 120;
        break;
      case 2:
        sx = w + 150 + index * 25;
        sy = h * 0.25 + Math.sin(index * 0.5) * 120;
        break;
      case 3:
        sx = w / 2 + Math.sin(a) * w;
        sy = -100 + Math.sin(a * 2) * 200;
        break;
      case 4:
        sx = index % 2 ? -100 : w + 100;
        sy = -200 - index * 20;
        break;
      case 6:
        sx = -200;
        sy = -200 - index * 18;
        break;
      case 7:
        sx = index % 2 ? -200 : w + 200;
        sy = index % 2 ? h * 0.5 : -200;
        break;
      case 12:
        sx = w / 2;
        sy = h * 0.25;
        break;
      case 13:
        sx = w / 2 + Math.cos(index) * w;
        sy = h * 0.3 + Math.sin(index) * h;
        break;
      case 14:
        sx = -200 - index * 20;
        sy = h * 0.2 + Math.sin(t * 8 + index) * 100;
        break;
      case 15:
        sx = index % 2 ? -100 : w + 100;
        sy = h * 0.6;
        break;
      case 16:
        sx = index % 2 ? -100 : w + 100;
        sy = index % 3 ? -100 : h + 100;
        break;
      default:
        sx = x;
        sy = -200 - index * 15;
    }
    return { x: sx + (x - sx) * ease, y: sy + (y - sy) * ease };
  }
}
