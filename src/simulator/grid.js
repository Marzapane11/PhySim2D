import * as THREE from 'three';

export function createGrid(scene) {
  const group = new THREE.Group();
  group.name = 'grid';

  const gridHelper = new THREE.GridHelper(20, 20, 0x2a3a5c, 0x1a2a4c);
  gridHelper.rotation.x = Math.PI / 2;
  group.add(gridHelper);

  const xMaterial = new THREE.LineBasicMaterial({ color: 0xff4444 });
  const xGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-10, 0, 0.01),
    new THREE.Vector3(10, 0, 0.01),
  ]);
  group.add(new THREE.Line(xGeometry, xMaterial));

  const yMaterial = new THREE.LineBasicMaterial({ color: 0x44ff44 });
  const yGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -10, 0.01),
    new THREE.Vector3(0, 10, 0.01),
  ]);
  group.add(new THREE.Line(yGeometry, yMaterial));

  group.add(createTextSprite('X', 10.5, 0, 0.01, 0xff4444));
  group.add(createTextSprite('Y', 0, 10.5, 0.01, 0x44ff44));

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
  sprite.scale.set(0.5, 0.5, 1);
  return sprite;
}

export function setGridVisible(gridGroup, visible) {
  gridGroup.visible = visible;
}
