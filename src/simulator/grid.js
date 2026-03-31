import * as THREE from 'three';

export function createGrid(scene) {
  const group = new THREE.Group();
  group.name = 'grid';

  // Draw grid lines manually on XY plane
  const gridSize = 20;
  const divisions = 20;
  const step = gridSize / divisions;
  const halfSize = gridSize / 2;
  const gridMat = new THREE.LineBasicMaterial({ color: 0x1a2a4c });

  for (let i = -halfSize; i <= halfSize; i += step) {
    // Vertical lines
    const vGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, -halfSize, 0), new THREE.Vector3(i, halfSize, 0)
    ]);
    group.add(new THREE.Line(vGeo, gridMat));
    // Horizontal lines
    const hGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-halfSize, i, 0), new THREE.Vector3(halfSize, i, 0)
    ]);
    group.add(new THREE.Line(hGeo, gridMat));
  }

  // X axis (red)
  const xGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-halfSize, 0, 0.01), new THREE.Vector3(halfSize, 0, 0.01)
  ]);
  group.add(new THREE.Line(xGeo, new THREE.LineBasicMaterial({ color: 0xff4444 })));

  // Y axis (green)
  const yGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -halfSize, 0.01), new THREE.Vector3(0, halfSize, 0.01)
  ]);
  group.add(new THREE.Line(yGeo, new THREE.LineBasicMaterial({ color: 0x44ff44 })));

  // Labels
  group.add(createTextSprite('X', halfSize + 0.5, 0, 0.01, 0xff4444));
  group.add(createTextSprite('Y', 0, halfSize + 0.5, 0.01, 0x44ff44));

  scene.add(group);
  return group;
}

function createTextSprite(text, x, y, z, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  sprite.scale.set(0.8, 0.8, 1);
  return sprite;
}

export function setGridVisible(gridGroup, visible) {
  gridGroup.visible = visible;
}
