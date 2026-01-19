import { describe, it, expect } from 'vitest';
import * as Matter from 'matter-js';
import { applyRoadBounds } from './bounds';
import { ROAD_LEFT, ROAD_RIGHT } from '../game/road';

describe('applyRoadBounds', () => {
  it('applies no force when vehicle is in center of road', () => {
    const body = Matter.Bodies.rectangle(0, 0, 20, 40);
    Matter.Body.setMass(body, 10);

    applyRoadBounds(body);

    expect(body.force.x).toBe(0);
  });

  it('applies rightward force when too far left', () => {
    const body = Matter.Bodies.rectangle(ROAD_LEFT - 20, 0, 20, 40);
    Matter.Body.setMass(body, 10);

    applyRoadBounds(body);

    expect(body.force.x).toBeGreaterThan(0);
  });

  it('applies leftward force when too far right', () => {
    const body = Matter.Bodies.rectangle(ROAD_RIGHT + 20, 0, 20, 40);
    Matter.Body.setMass(body, 10);

    applyRoadBounds(body);

    expect(body.force.x).toBeLessThan(0);
  });

  it('force scales with distance from boundary', () => {
    const bodyNear = Matter.Bodies.rectangle(ROAD_LEFT - 5, 0, 20, 40);
    Matter.Body.setMass(bodyNear, 10);

    const bodyFar = Matter.Bodies.rectangle(ROAD_LEFT - 50, 0, 20, 40);
    Matter.Body.setMass(bodyFar, 10);

    applyRoadBounds(bodyNear);
    applyRoadBounds(bodyFar);

    expect(bodyFar.force.x).toBeGreaterThan(bodyNear.force.x);
  });

  it('respects custom margin parameter', () => {
    const margin = 30;
    const body = Matter.Bodies.rectangle(ROAD_LEFT + margin - 5, 0, 20, 40);
    Matter.Body.setMass(body, 10);

    applyRoadBounds(body, 0.002, margin);

    // Vehicle is within margin, should get force
    expect(body.force.x).toBeGreaterThan(0);
  });

  it('respects custom spring parameter', () => {
    const weakSpring = 0.001;
    const strongSpring = 0.01;

    const weakBody = Matter.Bodies.rectangle(ROAD_LEFT - 20, 0, 20, 40);
    Matter.Body.setMass(weakBody, 10);

    const strongBody = Matter.Bodies.rectangle(ROAD_LEFT - 20, 0, 20, 40);
    Matter.Body.setMass(strongBody, 10);

    applyRoadBounds(weakBody, weakSpring);
    applyRoadBounds(strongBody, strongSpring);

    expect(strongBody.force.x).toBeGreaterThan(weakBody.force.x);
  });
});
