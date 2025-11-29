
export interface Position {
  x: number;
  y: number;
}

export enum Direction {
  NORTH = 0,
  EAST = 1,
  SOUTH = 2,
  WEST = 3,
}

export type CommandType = 'MOVE' | 'TURN_LEFT' | 'TURN_RIGHT' | 'COLLECT' | 'RESET';

export interface Command {
  type: CommandType;
  payload?: string;
}

export interface LevelConfig {
  id: number;
  title: string;
  description: string;
  hint: string;
  startPos: Position;
  goalPos: Position;
  fuelPos?: Position; // Optional fuel tank position
  startDir: Direction;
  gridSize: number;
  obstacles: Position[]; // Walls
  allowedBlocks: string; // XML string for toolbox
  idealBlockCount: number; // For hint 3/4
}

export interface GameState {
  characterPos: Position;
  characterDir: Direction;
  isCompleted: boolean;
  message: string | null;
  isRunning: boolean;
  visited: Position[]; // Trail
  hasFuel: boolean; // Does the level have fuel?
  fuelCollected: boolean; // Has the fuel been collected?
}
