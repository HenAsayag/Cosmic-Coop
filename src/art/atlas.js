// Original vector-painted art, rasterized once into a shared transparent atlas.
export function buildAtlas(scene) {
  const size = 256,
    cols = 8,
    names = [
      "ship",
      ...Array.from({ length: 9 }, (_, i) => `bird${i}`),
      ...Array.from({ length: 8 }, (_, i) => `boss${i}`),
      ...Array.from({ length: 7 }, (_, i) => `shot${i}`),
      "egg",
      "orb",
      "rocket",
      "spark",
      "feather",
      "smoke",
      "ring",
      ...Array.from({ length: 6 }, (_, i) => `pickup${i}`),
      ...Array.from({ length: 7 }, (_, i) => `food${i}`),
      "star",
    ];
  const painted = scene.textures.exists("painted")
    ? scene.textures.get("painted").getSourceImage()
    : null;
  const paintedRects = {
    ship: [0, 0, 293, 280],
    bird0: [298, 0, 252, 271],
    bird1: [552, 0, 288, 270],
    bird2: [843, 0, 287, 276],
    bird3: [1135, 0, 267, 269],
    bird4: [0, 284, 299, 229],
    bird5: [301, 268, 263, 262],
    bird6: [568, 276, 277, 248],
    bird7: [850, 279, 267, 244],
    bird8: [1124, 270, 278, 249],
    boss0: [0, 516, 288, 288],
    boss1: [286, 529, 284, 269],
    boss2: [573, 528, 265, 274],
    boss3: [841, 533, 281, 268],
    boss4: [1128, 546, 274, 252],
    boss5: [0, 812, 302, 307],
    boss6: [304, 804, 276, 304],
    boss7: [585, 811, 390, 309],
  };
  const texture = scene.textures.createCanvas(
      "atlas",
      cols * size,
      Math.ceil(names.length / cols) * size,
    ),
    c = texture.context;
  const oval = (x, y, rx, ry, color) => {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fill();
  };
  const path = (pts, fill, stroke) => {
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fillStyle = fill;
    c.fill();
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = 3;
      c.stroke();
    }
  };
  const grad = (a, b, x = 100, y = 70, r = 100) => {
    const g = c.createRadialGradient(x, y, 3, 128, 128, r);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    return g;
  };
  const bird = (n, boss = false) => {
    const colors = [
      ["#fffba0", "#d69a19"],
      ["#eafcff", "#708bb9"],
      ["#dbd7e8", "#475268"],
      ["#b8ed84", "#2e745e"],
      ["#dbb4ff", "#6d34b6"],
      ["#89edff", "#2565c4"],
      ["#9faec9", "#26324a"],
      ["#ffa576", "#a6354c"],
      ["#f7dc7c", "#784881"],
    ];
    const col = colors[n % 9];
    c.save();
    if (boss) {
      c.translate(128, 130);
      c.scale(0.87, 0.87);
      c.translate(-128, -128);
    }
    // Feet, rear wings and long feathers create individual silhouettes.
    for (const side of [-1, 1]) {
      c.save();
      c.translate(128, 133);
      c.scale(side, 1);
      for (let f = 0; f < 4; f++) {
        c.save();
        c.translate(60 + f * 11, -f * 9);
        c.rotate(0.3 + f * 0.28);
        oval(0, 0, 15, 43, grad(col[0], col[1]));
        c.restore();
      }
      c.restore();
      oval(107 + side * 22, 210, 18, 9, "#f4a330");
    }
    oval(
      128,
      141,
      n === 0 ? 56 : 64,
      n === 0 ? 64 : 73,
      grad(col[0], col[1], 106, 97, 101),
    );
    oval(125, 161, 43, 43, grad("#ffffffdd", col[0], 111, 140, 65));
    // Fine scalloped breast feathers.
    c.strokeStyle = "#ffffff36";
    c.lineWidth = 2;
    for (let r = 0; r < 3; r++)
      for (let k = 0; k < 4; k++) {
        c.beginPath();
        c.arc(101 + k * 17 + (r % 2) * 6, 154 + r * 13, 7, 0.25, 2.9);
        c.stroke();
      }
    for (let k = 0; k < 3; k++) {
      c.save();
      c.translate(114 + k * 13, 66 - (k % 2) * 9);
      c.rotate((k - 1) * 0.4);
      oval(0, 0, 12, 25, grad("#ff9672", "#be2842", 110, 51, 90));
      c.restore();
    }
    oval(105, 105, 23, 28, "#293655");
    oval(151, 105, 23, 28, "#293655");
    oval(104, 102, 20, 25, "#fff");
    oval(150, 102, 20, 25, "#fff");
    oval(110, 108, 10, 15, "#172b41");
    oval(144, 108, 10, 15, "#172b41");
    oval(107, 102, 4, 6, "#fff");
    oval(141, 102, 4, 6, "#fff");
    oval(128, 145, 10, 20, "#e7474a");
    path(
      [
        [109, 129],
        [128, 115],
        [149, 129],
        [128, 148],
      ],
      grad("#ffe887", "#e58516", 122, 121, 50),
      "#b16c26",
    );
    path(
      [
        [112, 129],
        [143, 129],
        [128, 136],
      ],
      "#a95422",
    );
    if (n === 2 || n === 6) {
      path(
        [
          [70, 155],
          [94, 140],
          [105, 179],
          [153, 179],
          [166, 142],
          [190, 155],
          [183, 200],
          [74, 200],
        ],
        grad("#8998aa", "#283449"),
        "#d6e6f0",
      );
      for (const x of [85, 171]) oval(x, 178, 5, 5, "#f7ce6e");
    }
    if (n === 3) {
      for (const x of [73, 183]) {
        oval(x, 130, 21, 25, "#314a40");
        oval(x, 128, 15, 18, "#fbb467");
        oval(x, 125, 9, 12, "#223d40");
      }
      c.fillStyle = "#344b43";
      c.fillRect(69, 145, 117, 17);
    }
    if (n === 4) {
      path(
        [
          [68, 97],
          [112, 77],
          [106, 96],
        ],
        "#523064",
      );
      path(
        [
          [188, 97],
          [143, 77],
          [148, 96],
        ],
        "#523064",
      );
    }
    if (n === 5) {
      c.strokeStyle = "#71efff";
      c.lineWidth = 5;
      c.beginPath();
      c.arc(128, 130, 103, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = "#c5fcff50";
      c.lineWidth = 10;
      c.stroke();
    }
    if (n === 6) {
      for (const x of [59, 197]) {
        path(
          [
            [x - 14, 157],
            [x, 111],
            [x + 14, 157],
            [x + 14, 198],
            [x - 14, 198],
          ],
          "#d5e9f8",
          "#617e9b",
        );
        path(
          [
            [x - 10, 199],
            [x, 237],
            [x + 10, 199],
          ],
          "#ffbe6b",
        );
      }
    }
    if (n === 7) {
      c.fillStyle = "#496478";
      c.fillRect(124, 28, 8, 27);
      oval(128, 29, 88, 7, "#a6ccd7");
      oval(128, 27, 12, 10, "#ffd571");
    }
    if (n === 8 || boss) {
      path(
        [
          [94, 73],
          [85, 33],
          [114, 50],
          [128, 20],
          [142, 50],
          [171, 33],
          [162, 73],
        ],
        grad("#fff1a0", "#d28a35", 110, 35, 100),
        "#ffeab3",
      );
      oval(128, 60, 7, 10, "#72f3ed");
    }
    if (boss) {
      c.strokeStyle = [
        "#ffbc61",
        "#b0d1eb",
        "#fff",
        "#9bedb1",
        "#b9a4ff",
        "#72ecff",
        "#ffe57e",
        "#fd92be",
      ][n % 8];
      c.lineWidth = 7;
      for (let k = 0; k < 3; k++) {
        c.beginPath();
        c.arc(128, 130, 113 + k * 7, Math.PI * 0.08, Math.PI * 0.92);
        c.stroke();
      }
    }
    c.restore();
  };
  names.forEach((name, i) => {
    const x = (i % cols) * size,
      y = Math.floor(i / cols) * size;
    c.save();
    c.translate(x, y);
    c.beginPath();
    c.rect(0, 0, size, size);
    c.clip();
    if (name === "ship") {
      oval(128, 194, 24, 52, grad("#baffff", "#1686d900", 128, 175, 70));
      path(
        [
          [111, 182],
          [128, 247],
          [145, 182],
        ],
        grad("#efffff", "#35a9ff", 126, 190, 65),
      );
      path(
        [
          [128, 21],
          [158, 112],
          [228, 168],
          [231, 205],
          [167, 184],
          [128, 198],
          [89, 184],
          [25, 205],
          [28, 168],
          [98, 112],
        ],
        grad("#e2f5fa", "#59738d", 107, 103, 150),
        "#b8d4e2",
      );
      path(
        [
          [32, 174],
          [99, 128],
          [84, 176],
          [32, 196],
        ],
        "#284561",
      );
      path(
        [
          [224, 174],
          [157, 128],
          [172, 176],
          [224, 196],
        ],
        "#284561",
      );
      path(
        [
          [43, 174],
          [91, 147],
          [79, 170],
          [43, 188],
        ],
        "#f37c54",
      );
      path(
        [
          [213, 174],
          [165, 147],
          [177, 170],
          [213, 188],
        ],
        "#f37c54",
      );
      path(
        [
          [128, 30],
          [148, 115],
          [142, 174],
          [128, 189],
          [114, 174],
          [108, 115],
        ],
        grad("#f7ffff", "#92b4c2", 122, 67, 120),
      );
      oval(128, 118, 18, 38, "#142a48");
      oval(126, 113, 12, 28, grad("#a8ffff", "#276299", 120, 98, 43));
      oval(122, 104, 4, 15, "#d2ffffa0");
      for (const xx of [68, 188]) {
        path(
          [
            [xx - 6, 164],
            [xx, 128],
            [xx + 6, 164],
            [xx + 6, 201],
            [xx - 6, 201],
          ],
          "#7f9aac",
        );
        oval(xx, 200, 7, 8, "#83edff");
      }
      path(
        [
          [119, 171],
          [128, 181],
          [137, 171],
        ],
        "#ff9867",
      );
    } else if (name.startsWith("bird")) bird(+name.slice(4));
    else if (name.startsWith("boss")) {
      let n = +name.slice(4);
      bird(n + 1, true);
      if (n === 1 || n === 3 || n === 7) {
        c.strokeStyle = "#a9d8e5";
        c.lineWidth = 8;
        c.strokeRect(47, 150, 162, 62);
        for (let k = 0; k < 4; k++)
          oval(67 + k * 40, 180, 12, 16, grad("#b5faff", "#377399"));
      }
      if (n === 4) {
        c.globalAlpha = 0.8;
        oval(40, 80, 21, 31, "#ba91fc");
        oval(216, 80, 21, 31, "#ba91fc");
      }
      if (n === 5) {
        oval(128, 176, 25, 25, grad("#fff", "#16bce2"));
      }
    } else if (name.startsWith("shot")) {
      let n = +name.slice(4),
        colors = [
          "#70cfff",
          "#99ff8e",
          "#ffec83",
          "#83fff3",
          "#ffb366",
          "#d4a0ff",
          "#9cffff",
        ];
      c.shadowColor = colors[n];
      c.shadowBlur = 25;
      oval(
        128,
        128,
        n === 6 ? 26 : 12,
        n === 2 ? 112 : n === 4 ? 23 : 47,
        colors[n],
      );
      oval(
        125,
        120,
        n === 6 ? 13 : 5,
        n === 2 ? 107 : n === 4 ? 16 : 38,
        "#fff",
      );
    } else if (name === "egg") {
      oval(128, 132, 40, 55, grad("#fffbed", "#a295c0", 113, 112, 74));
      oval(114, 111, 10, 19, "#ffffffae");
    } else if (name === "orb") {
      oval(128, 128, 33, 33, grad("#fff9bf", "#ff546b", 118, 117, 52));
    } else if (name === "rocket") {
      path(
        [
          [128, 58],
          [147, 111],
          [147, 161],
          [109, 161],
          [109, 111],
        ],
        "#ee7890",
        "#ffe2cf",
      );
      path(
        [
          [114, 161],
          [128, 209],
          [142, 161],
        ],
        "#ffe880",
      );
    } else if (name === "spark" || name === "star") {
      oval(128, 128, 60, 60, grad("#fff", "#ffffff00", 128, 128, 60));
      path(
        [
          [128, 81],
          [134, 122],
          [175, 128],
          [134, 134],
          [128, 175],
          [122, 134],
          [81, 128],
          [122, 122],
        ],
        "#fff",
      );
    } else if (name === "feather") {
      c.save();
      c.translate(128, 128);
      c.rotate(0.5);
      oval(0, 0, 15, 51, grad("#fff", "#eacb89"));
      c.strokeStyle = "#bb9c6b";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, -42);
      c.lineTo(0, 62);
      c.stroke();
      c.restore();
    } else if (name === "smoke") {
      oval(128, 128, 65, 65, grad("#c4dbefbb", "#abc6df00", 128, 128, 65));
    } else if (name === "ring") {
      c.strokeStyle = "#fff";
      c.lineWidth = 7;
      c.beginPath();
      c.arc(128, 128, 100, 0, Math.PI * 2);
      c.stroke();
    } else if (name.startsWith("pickup")) {
      let n = +name.slice(6),
        col = [
          "#90eaff",
          "#b4a3ff",
          "#73e5ef",
          "#ff9ca8",
          "#8af3b0",
          "#ffe181",
        ][n];
      c.shadowColor = col;
      c.shadowBlur = 20;
      path(
        [
          [128, 57],
          [189, 93],
          [189, 164],
          [128, 199],
          [67, 164],
          [67, 93],
        ],
        grad(col, "#254662", 104, 91, 100),
        col,
      );
      c.shadowBlur = 0;
      c.fillStyle = "#fff";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.font = "bold 74px sans-serif";
      c.fillText(["↑", "◆", "⬡", "∩", "❄", "×2"][n], 128, 131);
    } else if (name.startsWith("food")) {
      let n = +name.slice(4);
      c.font = '110px "Segoe UI Emoji",sans-serif';
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(["🍗", "🍟", "🌮", "🍩", "🍔", "🍕", "🍪"][n], 128, 133);
    }
    if (painted && paintedRects[name]) {
      c.clearRect(0, 0, size, size);
      const r = paintedRects[name],
        factor = 232 / Math.max(r[2], r[3]);
      c.drawImage(
        painted,
        ...r,
        (size - r[2] * factor) / 2,
        (size - r[3] * factor) / 2,
        r[2] * factor,
        r[3] * factor,
      );
    }
    c.restore();
    texture.add(name, 0, x, y, size, size);
  });
  texture.refresh();
}
