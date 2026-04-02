import { addVectors, magnitude, direction } from '../../../math/vector-math.js';
import { createArrow, createResultantArrow, getNextColor, resetColorIndex } from '../../vector-renderer.js';

export function computePointForces(forces) {
  if (forces.length === 0) return { resultant: { x: 0, y: 0 }, magnitude: 0, direction: 0 };
  const r = addVectors(...forces);
  return { resultant: r, magnitude: magnitude(r), direction: direction(r) };
}

export function getPointForcesConfig() {
  return {
    id: 'point-forces',
    label: 'Forze su un punto',
    defaultForces: [{ x: 3, y: 0, name: 'F\u20D71' }, { x: 0, y: 4, name: 'F\u20D72' }],
  };
}

export function renderPointForces(sceneManager, forces, visibility) {
  resetColorIndex();
  if (visibility.forceArrows) {
    forces.forEach((f) => {
      const color = getNextColor();
      f._color = color;
      const arrow = createArrow({ x: 0, y: 0 }, f, color, f.name);
      if (arrow) sceneManager.objects.add(arrow);
    });
  }
  const result = computePointForces(forces);
  if (result.magnitude > 0.001 && visibility.forceArrows) {
    const rArrow = createResultantArrow({ x: 0, y: 0 }, result.resultant);
    if (rArrow) sceneManager.objects.add(rArrow);
  }
  return { result };
}
