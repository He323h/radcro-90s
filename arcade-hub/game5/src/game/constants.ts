import { CheckpointInfo, WeatherMode, WeatherPreset } from './types';

// Track & World Dimensions
export const TRACK_TOTAL_DISTANCE = 10000; // 10,000 meters = 10.0 Km course
export const BASE_ROAD_WIDTH = 480;        // Width of the 4-lane highway in game units
export const LANE_COUNT = 4;
export const SHOULDER_WIDTH = 40;          // Guardrail/shoulder width on each side

// Speeds (Km/h)
export const MAX_NORMAL_SPEED = 360;       // Max player cruising speed
export const BOOST_SPEED = 410;            // Turbo boost speed
export const MIN_SPEED = 0;
export const ACCEL_RATE = 220;             // Km/h gained per sec
export const BRAKE_RATE = 400;             // Km/h lost per sec
export const NATURAL_DECEL_RATE = 110;     // Coasting deceleration

// Fuel Mechanics
export const INITIAL_FUEL = 100;
export const FUEL_BURN_LOW_SPEED = 1.0;    // Burn per sec under 180 km/h
export const FUEL_BURN_HIGH_SPEED = 3.2;   // Burn per sec near 360 km/h
export const FUEL_BURN_BOOST = 4.5;        // Burn per sec at turbo
export const FUEL_PICKUP_VALUE = 24;       // +24% fuel per battery/can
export const SUPER_BATTERY_VALUE = 45;     // +45% fuel
export const CRASH_FUEL_PENALTY = 14;      // Penalty when spinning out into a wall

// Steering Physics
export const STEER_SPEED_FACTOR = 360;     // Lateral speed in px/sec at full steer

// Environment Zone Boundaries (meters)
export const ZONE_RANGES = [
  { theme: 'suburban' as const, start: 0, end: 2000, name: 'Suburban Town' },
  { theme: 'sea_bridge' as const, start: 2000, end: 4000, name: 'Sea Bridge Pier' },
  { theme: 'desert' as const, start: 4000, end: 6000, name: 'Desert Canyon' },
  { theme: 'tropical' as const, start: 6000, end: 8000, name: 'Tropical Beach' },
  { theme: 'cargo_port' as const, start: 8000, end: 10000, name: 'Cargo Port' },
];

export const CHECKPOINTS: CheckpointInfo[] = [
  { distanceMeters: 2000, name: 'CHECKPOINT 1', theme: 'suburban', reached: false },
  { distanceMeters: 4000, name: 'CHECKPOINT 2', theme: 'sea_bridge', reached: false },
  { distanceMeters: 6000, name: 'CHECKPOINT 3', theme: 'desert', reached: false },
  { distanceMeters: 8000, name: 'CHECKPOINT 4', theme: 'tropical', reached: false },
  { distanceMeters: 10000, name: 'FINISH LINE', theme: 'cargo_port', reached: false },
];

// Color Palette for Themes
export const THEME_COLORS = {
  suburban: {
    ground: '#27702f',      // Lawn green
    groundDetail: '#1e5a25',
    curbLight: '#e2e8f0',
    curbDark: '#ef4444',
    roadColor: '#2b2d38',
    laneMarking: '#f8fafc',
    shoulderColor: '#1e293b',
  },
  sea_bridge: {
    ground: '#0284c7',      // Deep sea blue
    groundDetail: '#0369a1',
    curbLight: '#e0f2fe',
    curbDark: '#0284c7',
    roadColor: '#334155',
    laneMarking: '#f8fafc',
    shoulderColor: '#0f172a',
  },
  desert: {
    ground: '#d97706',      // Sandy golden amber
    groundDetail: '#b45309',
    curbLight: '#fef3c7',
    curbDark: '#d97706',
    roadColor: '#2d2724',
    laneMarking: '#fde68a',
    shoulderColor: '#451a03',
  },
  tropical: {
    ground: '#059669',      // Tropical lush palms & turquoise
    groundDetail: '#047857',
    curbLight: '#fef08a',
    curbDark: '#10b981',
    roadColor: '#262e35',
    laneMarking: '#ffffff',
    shoulderColor: '#134e4a',
  },
  cargo_port: {
    ground: '#3f3f46',      // Industrial tarmac & concrete
    groundDetail: '#27272a',
    curbLight: '#fbbf24',
    curbDark: '#18181b',
    roadColor: '#1e2025',
    laneMarking: '#facc15',
    shoulderColor: '#09090b',
  },
};

export const WEATHER_PRESETS: Record<WeatherMode, WeatherPreset> = {
  summer: {
    name: 'Summer Sun',
    icon: '☀️',
    skyOverlay: 'rgba(255, 235, 150, 0.04)',
    groundTint: '#000000',
    roadTint: '#000000',
    friction: 1.0,
    rainCount: 0,
    snowCount: 0,
    hasLightning: false,
  },
  winter: {
    name: 'Winter Blizzard',
    icon: '❄️',
    skyOverlay: 'rgba(219, 234, 254, 0.15)',
    groundOverride: '#e2e8f0',
    groundDetailOverride: '#cbd5e1',
    roadColorOverride: '#334155',
    curbLightOverride: '#ffffff',
    curbDarkOverride: '#38bdf8',
    friction: 0.82, // Icy road drift!
    rainCount: 0,
    snowCount: 65,
    hasLightning: false,
  },
  sunrise: {
    name: 'Dawn Sunrise',
    icon: '🌅',
    skyOverlay: 'rgba(249, 115, 22, 0.16)',
    groundTint: '#7c2d12',
    roadTint: '#431407',
    laneMarkingOverride: '#fed7aa',
    friction: 1.0,
    rainCount: 0,
    snowCount: 0,
    hasLightning: false,
  },
  rain: {
    name: 'Thunderstorm',
    icon: '🌧️',
    skyOverlay: 'rgba(15, 23, 42, 0.35)',
    groundOverride: '#1e293b',
    groundDetailOverride: '#0f172a',
    roadColorOverride: '#111827', // Dark wet shiny asphalt
    friction: 0.78, // Slick hydroplaning
    rainCount: 85,
    snowCount: 0,
    hasLightning: true,
  },
};

