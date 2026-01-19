export interface TractionParams {
  lateralGrip: number;
  rollingDrag: number;
  angularDrag: number;
  maxAngVel: number;
  yawStiffness: number;
}

export interface DriveParams {
  engineForce: number;
  maxLateralSpeed: number;
  steerAccel: number;
  maxSpeedDelta: number;
}

export const PLAYER_TRACTION: TractionParams = {
  lateralGrip: 0.12,
  rollingDrag: 0.02,
  angularDrag: 0.2,
  maxAngVel: 2.5,
  yawStiffness: 0.05,
};

export const AI_TRACTION: TractionParams = {
  lateralGrip: 0.1,
  rollingDrag: 0.03,
  angularDrag: 0.25,
  maxAngVel: 2.2,
  yawStiffness: 0.04,
};

export const STUN_TRACTION: TractionParams = {
  lateralGrip: 0.03,
  rollingDrag: 0.01,
  angularDrag: 0.15,
  maxAngVel: 3.5,
  yawStiffness: 0.01,
};

export const WRECKED_TRACTION: TractionParams = {
  lateralGrip: 0.2,
  rollingDrag: 0.1,
  angularDrag: 0.3,
  maxAngVel: 1.2,
  yawStiffness: 0.02,
};

export const PLAYER_DRIVE: DriveParams = {
  engineForce: 0.12,
  maxLateralSpeed: 4,
  steerAccel: 0.08,
  maxSpeedDelta: 20,
};

export const PLAYER_DRIVE_COAST: DriveParams = {
  engineForce: 0.06,
  maxLateralSpeed: 3.6,
  steerAccel: 0.07,
  maxSpeedDelta: 16,
};

export const PLAYER_DRIVE_BRAKE: DriveParams = {
  engineForce: 0.2,
  maxLateralSpeed: 3.2,
  steerAccel: 0.07,
  maxSpeedDelta: 20,
};

export const AI_DRIVE: DriveParams = {
  engineForce: 0.08,
  maxLateralSpeed: 3,
  steerAccel: 0.06,
  maxSpeedDelta: 15,
};

export const MAX_SPEED = 18;
export const BOOST_MAX = 100;
export const BOOST_DURATION = 1.4;
export const BOOST_RECHARGE_DELAY = 1.2;
export const BOOST_RECHARGE_RATE = 28;
export const BOOST_SPEED = 8;
export const SHIELD_DURATION = 4.5;
export const POWERUP_TTL = 10;

export const PLAYER_SPEED = {
  throttle: 9,
  coast: 5,
  brake: 2,
} as const;
