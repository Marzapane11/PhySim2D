import * as THREE from 'three';
import { getState } from '../state.js';

function getGridColors() {
  const theme = getState().theme;
  if (theme === 'light') {
    return { minor: 0xc8d0dc, major: 0xb0b8c8, xAxis: 0xdd3333, yAxis: 0x33aa33, label: 0x888888 };
  }
  return { minor: 0x1e2d4d, major: 0x2a3d5c, xAxis: 0xff4444, yAxis: 0x44ff44, label: 0x888888 };
}

export function createGrid(scene) {
  const group = new THREE.Group();
  group.name = 'grid';

  const size = 100;
  const halfSize = size / 2;
  const colors = getGridColors();

  // Minor grid lines (every 1 unit)
  const minorMat = new THREE.LineBasicMaterial({ color: colors.minor, transparent: true, opacity: 0.5 });
  for (let i = -halfSize; i <= halfSize; i += 1) {
    if (i === 0) continue;
    const vGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, -halfSize, 0), new THREE.Vector3(i, halfSize, 0)
    ]);
    group.add(new THREE.Line(vGeo, minorMat));
    const hGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfSize, i, 0), new THREE.Vector3(halfSize, i, 0)
    ]);
    group.add(new THREE.Line(hGeo, minorMat));
  }

  // Major grid lines (every 5 units)
  const majorMat = new THREE.LineBasicMaterial({ color: colors.major, transparent: true, opacity: 0.7 });
  for (let i = -halfSize; i <= halfSize; i += 5) {
    if (i === 0) continue;
    const vGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, -halfSize, 0), new THREE.Vector3(i, halfSize, 0)
    ]);
    group.add(new THREE.Line(vGeo, majorMat));
    const hGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfSize, i, 0), new THREE.Vector3(halfSize, i, 0)
    ]);
    group.add(new THREE.Line(hGeo, majorMat));
  }

  // Axes (can be hidden separately)
  const axesGroup = new THREE.Group();
  axesGroup.name = 'axes';

  const xGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-halfSize, 0, 0.01), new THREE.Vector3(halfSize, 0, 0.01)
  ]);
  axesGroup.add(new THREE.Line(xGeo, new THREE.LineBasicMaterial({ color: colors.xAxis })));

  const yGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -halfSize, 0.01), new THREE.Vector3(0, halfSize, 0.01)
  ]);
  axesGroup.add(new THREE.Line(yGeo, new THREE.LineBasicMaterial({ color: colors.yAxis })));

  axesGroup.add(createTextSprite('X', halfSize - 1, -0.8, 0.01, colors.xAxis));
  axesGroup.add(createTextSprite('Y', 0.8, halfSize - 1, 0.01, colors.yAxis));
  axesGroup.add(createTextSprite('O', -0.5, -0.5, 0.01, colors.label));

  group.add(axesGroup);

  scene.add(group);
  return group;
}

function createTextSprite(text, x, y, z, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  sprite.scale.set(0.7, 0.7, 1);
  return sprite;
}

export function setGridVisible(gridGroup, visible) {
  gridGroup.visible = visible;
}

export function setAxesVisible(gridGroup, visible) {
  const axes = gridGroup.getObjectByName('axes');
  if (axes) axes.visible = visible;
}
