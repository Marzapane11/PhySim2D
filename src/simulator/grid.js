import * as THREE from 'three';

export function createGrid(scene) {
  const group = new THREE.Group();
  group.name = 'grid';

  const size = 100;
  const halfSize = size / 2;

  // Minor grid lines (every 1 unit)
  const minorMat = new THREE.LineBasicMaterial({ color: 0x1e2d4d, transparent: true, opacity: 0.5 });
  for (let i = -halfSize; i <= halfSize; i += 1) {
    if (i === 0) continue; // skip axes
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
  const majorMat = new THREE.LineBasicMaterial({ color: 0x2a3d5c, transparent: true, opacity: 0.7 });
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

  // X axis (red, extends across entire grid)
  const xGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-halfSize, 0, 0.01), new THREE.Vector3(halfSize, 0, 0.01)
  ]);
  group.add(new THREE.Line(xGeo, new THREE.LineBasicMaterial({ color: 0xff4444 })));

  // Y axis (green, extends across entire grid)
  const yGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -halfSize, 0.01), new THREE.Vector3(0, halfSize, 0.01)
  ]);
  group.add(new THREE.Line(yGeo, new THREE.LineBasicMaterial({ color: 0x44ff44 })));

  // Axis labels
  group.add(createTextSprite('X', halfSize - 1, -0.8, 0.01, 0xff4444));
  group.add(createTextSprite('Y', 0.8, halfSize - 1, 0.01, 0x44ff44));
  group.add(createTextSprite('O', -0.5, -0.5, 0.01, 0x888888));

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
