import * as THREE from 'three';
import { springForce } from '../../../math/force-math.js';
import { createArrow } from '../../vector-renderer.js';

export function computeSpring(params) { return springForce(params); }

export function getSpringConfig() {
  return { id: 'spring', label: 'Molla (Hooke)', defaults: { k: 100, x: 0.5 } };
}

export function renderSpring(sceneManager, state, visibility) {
  const calc = computeSpring(state);
  const restLength = 3;
  const displacement = state.x * 3;

  const groundY = -1;
  const boxW = 1;
  const boxH = 1;

  // Ground surface
  const groundGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-5, groundY, 0.01), new THREE.Vector3(8, groundY, 0.01)
  ]);
  sceneManager.objects.add(new THREE.Line(groundGeo, new THREE.LineBasicMaterial({ color: 0x4a4a6a })));
  // Ground hatching
  for (let i = -5; i < 8; i++) {
    const hGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, groundY, 0.01), new THREE.Vector3(i - 0.3, groundY - 0.4, 0.01)
    ]);
    sceneManager.objects.add(new THREE.Line(hGeo, new THREE.LineBasicMaterial({ color: 0x3a3a5a })));
  }

  // Wall (taller, touching ground)
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-4.15, groundY);
  wallShape.lineTo(-4, groundY);
  wallShape.lineTo(-4, 1.5);
  wallShape.lineTo(-4.15, 1.5);
  wallShape.closePath();
  sceneManager.objects.add(new THREE.Mesh(
    new THREE.ShapeGeometry(wallShape),
    new THREE.MeshBasicMaterial({ color: 0x4a4a6a, side: THREE.DoubleSide })
  ));
  // Wall hatching
  for (let y = groundY; y < 1.5; y += 0.3) {
    const hGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-4.15, y, 0.01), new THREE.Vector3(-4.35, y + 0.2, 0.01)
    ]);
    sceneManager.objects.add(new THREE.Line(hGeo, new THREE.LineBasicMaterial({ color: 0x3a3a5a })));
  }

  // Spring coils (horizontal, at mid-box height)
  const springY = groundY + boxH / 2;
  const springStart = -4;
  const springEnd = springStart + restLength + displacement;
  const coils = 8;
  const coilWidth = 0.4;
  const points = [new THREE.Vector3(springStart, springY, 0.01)];
  const segLen = (springEnd - springStart) / (coils * 2);
  for (let i = 0; i < coils * 2; i++) {
    const x = springStart + segLen * (i + 1);
    const y = springY + (i % 2 === 0 ? coilWidth : -coilWidth);
    points.push(new THREE.Vector3(x, y, 0.01));
  }
  points.push(new THREE.Vector3(springEnd, springY, 0.01));
  sceneManager.objects.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x4fc3f7 })
  ));

  if (visibility.body) {
    // Box sitting on ground (2D ShapeGeometry)
    const boxLeft = springEnd;
    const boxBottom = groundY;
    const bShape = new THREE.Shape();
    bShape.moveTo(boxLeft, boxBottom);
    bShape.lineTo(boxLeft + boxW, boxBottom);
    bShape.lineTo(boxLeft + boxW, boxBottom + boxH);
    bShape.lineTo(boxLeft, boxBottom + boxH);
    bShape.closePath();
    sceneManager.objects.add(new THREE.Mesh(
      new THREE.ShapeGeometry(bShape),
      new THREE.MeshBasicMaterial({ color: 0xff7043, side: THREE.DoubleSide })
    ));
    // Box outline
    const boxOutline = [
      new THREE.Vector3(boxLeft, boxBottom, 0.02),
      new THREE.Vector3(boxLeft + boxW, boxBottom, 0.02),
      new THREE.Vector3(boxLeft + boxW, boxBottom + boxH, 0.02),
      new THREE.Vector3(boxLeft, boxBottom + boxH, 0.02),
      new THREE.Vector3(boxLeft, boxBottom, 0.02),
    ];
    sceneManager.objects.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(boxOutline),
      new THREE.LineBasicMaterial({ color: 0xff8a65 })
    ));

    if (visibility.forceArrows && calc.force > 0.01) {
      const boxCenterX = boxLeft + boxW / 2;
      const boxCenterY = boxBottom + boxH / 2;
      const forceDir = state.x > 0 ? -1 : 1;
      const arrow = createArrow({ x: boxCenterX, y: boxCenterY }, { x: forceDir * calc.force * 0.03, y: 0 }, 0x66bb6a, 'Fe');
      if (arrow) sceneManager.objects.add(arrow);
    }
  }

  // Rest position marker
  const restPos = springStart + restLength;
  const restGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(restPos, -1.5, 0.01), new THREE.Vector3(restPos, 1.5, 0.01),
  ]);
  const restLine = new THREE.Line(restGeo, new THREE.LineDashedMaterial({ color: 0xffff00, dashSize: 0.2, gapSize: 0.1 }));
  restLine.computeLineDistances();
  sceneManager.objects.add(restLine);
}
