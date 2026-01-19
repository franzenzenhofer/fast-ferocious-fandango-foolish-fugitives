import * as Matter from 'matter-js';
import { ROAD_LEFT, ROAD_RIGHT } from '../game/road';

/**
 * Apply spring forces to keep vehicle within road bounds.
 * @param body The physics body to constrain
 * @param spring Spring constant for the boundary force
 * @param margin Distance from road edge where force starts
 */
export const applyRoadBounds = (
  body: Matter.Body,
  spring = 0.002,
  margin = 10
): void => {
  const leftLimit = ROAD_LEFT + margin;
  const rightLimit = ROAD_RIGHT - margin;

  if (body.position.x < leftLimit) {
    const dist = leftLimit - body.position.x;
    Matter.Body.applyForce(body, body.position, {
      x: dist * spring * body.mass,
      y: 0,
    });
  } else if (body.position.x > rightLimit) {
    const dist = body.position.x - rightLimit;
    Matter.Body.applyForce(body, body.position, {
      x: -dist * spring * body.mass,
      y: 0,
    });
  }
};
