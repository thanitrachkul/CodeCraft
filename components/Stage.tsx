
import React from 'react';
import { GameState, LevelConfig, Direction, Position } from '../types';
import { Trophy, Star, Navigation, Fuel } from 'lucide-react';

interface StageProps {
  level: LevelConfig;
  gameState: GameState;
}

const Stage: React.FC<StageProps> = ({ level, gameState }) => {
  const { gridSize } = level;
  const cellSize = 100 / gridSize;

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const isObstacle = level.obstacles.some(o => o.x === x && o.y === y);
        const isGoal = level.goalPos.x === x && level.goalPos.y === y;
        const isFuel = level.fuelPos && level.fuelPos.x === x && level.fuelPos.y === y;
        
        // Check if visited (green trail)
        const isVisited = gameState.visited.some(v => v.x === x && v.y === y);
        
        cells.push(
          <div
            key={`${x}-${y}`}
            className={`
              border border-blue-100 relative flex items-center justify-center transition-colors duration-500
              ${isObstacle ? 'bg-slate-700 rounded-sm shadow-inner' : (isVisited ? 'bg-green-100' : 'bg-white/80')}
              ${isGoal ? 'bg-yellow-100' : ''}
              ${isFuel ? 'bg-orange-50' : ''}
            `}
            style={{ width: `${cellSize}%`, height: `${cellSize}%` }}
          >
            {isGoal && !gameState.isCompleted && (
              <Star className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 animate-spin-slow drop-shadow-md" fill="currentColor" />
            )}
            {/* Show Fuel Tank if it exists and hasn't been collected */}
            {isFuel && !gameState.fuelCollected && (
                <Fuel className="w-6 h-6 md:w-8 md:h-8 text-orange-500 animate-bounce drop-shadow-md" fill="currentColor" />
            )}
          </div>
        );
      }
    }
    return cells;
  };

  const getRotation = (dir: Direction) => {
    switch (dir) {
      case Direction.NORTH: return 'rotate(0deg)';
      case Direction.EAST: return 'rotate(90deg)';
      case Direction.SOUTH: return 'rotate(180deg)';
      case Direction.WEST: return 'rotate(270deg)';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-indigo-50 p-4 rounded-xl relative border-t-4 border-indigo-200">
      <div className="absolute -top-5 bg-indigo-500 text-white px-6 py-2 rounded-full font-bold shadow-md z-10 flex items-center gap-2">
         <Navigation size={18} /> ส่วนแสดงผล
      </div>

      <div className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mt-4">
        <Navigation className="w-5 h-5 text-indigo-500" />
        ผลลัพธ์
      </div>
      
      {/* Aspect Ratio Box for Grid */}
      <div className="relative w-full max-w-[400px] aspect-square bg-indigo-200/50 p-2 rounded-2xl shadow-xl border-4 border-white">
        <div className="absolute inset-2 flex flex-wrap bg-blue-50/50 rounded-xl overflow-hidden">
          {renderGrid()}
        </div>

        {/* Character Layer */}
        <div className="absolute inset-2 pointer-events-none">
            <div
            className="absolute transition-all duration-700 ease-in-out z-10 flex items-center justify-center"
            style={{
                left: `${gameState.characterPos.x * cellSize}%`,
                top: `${gameState.characterPos.y * cellSize}%`,
                width: `${cellSize}%`,
                height: `${cellSize}%`,
                transform: getRotation(gameState.characterDir)
            }}
            >
            {/* Cute Robot SVG */}
            <div className="w-4/5 h-4/5 relative animate-wiggle">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                    {/* Body */}
                    <rect x="20" y="30" width="60" height="50" rx="10" fill="#6366f1" />
                    <rect x="30" y="40" width="40" height="30" rx="5" fill="#e0e7ff" />
                    {/* Head */}
                    <circle cx="50" cy="20" r="15" fill="#6366f1" />
                    {/* Eyes */}
                    <circle cx="45" cy="18" r="3" fill="white" />
                    <circle cx="55" cy="18" r="3" fill="white" />
                    {/* Antenna */}
                    <line x1="50" y1="5" x2="50" y2="0" stroke="#6366f1" strokeWidth="3" />
                    <circle cx="50" cy="0" r="3" fill="#ef4444" />
                    {/* Arms */}
                    <rect x="10" y="35" width="10" height="30" rx="5" fill="#4f46e5" />
                    <rect x="80" y="35" width="10" height="30" rx="5" fill="#4f46e5" />
                </svg>
            </div>
            </div>
        </div>
        
        {/* Victory Overlay */}
        {gameState.isCompleted && (
           <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 rounded-xl">
              <Trophy className="w-24 h-24 text-yellow-400 mb-4 drop-shadow-2xl animate-bounce" fill="currentColor" />
              <h2 className="text-4xl font-black text-white drop-shadow-md tracking-wider">สุดยอด!</h2>
              <p className="text-white text-xl font-bold mt-2">ทำสำเร็จแล้ว</p>
           </div>
        )}
      </div>

      {/* Message Bubble */}
      {gameState.message && (
        <div className="absolute -bottom-2 left-4 right-4 bg-white p-4 rounded-2xl shadow-xl border-4 border-yellow-400 animate-in slide-in-from-bottom-4 z-30">
          <p className="text-lg text-center font-bold text-gray-700">
             "{gameState.message}"
          </p>
        </div>
      )}
    </div>
  );
};

export default Stage;
