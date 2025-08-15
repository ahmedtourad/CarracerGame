import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface RaceGameProps {
  raceId: string;
  onBackToMenu: () => void;
}

export function RaceGame({ raceId, onBackToMenu }: RaceGameProps) {
  const race = useQuery(api.races.getRace, { raceId });
  const player = useQuery(api.players.getOrCreatePlayer);
  const maps = useQuery(api.maps.getAllMaps);
  
  const startRace = useMutation(api.races.startRace);
  const updatePosition = useMutation(api.races.updatePlayerPosition);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 100 });
  const [currentLap, setCurrentLap] = useState(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const animationRef = useRef<number>();

  const currentMap = maps?.find(m => m._id === race?.mapId);
  const isHost = race?.hostId === player?.userId;
  const currentPlayer = race?.players.find(p => p.playerId === player?._id && !p.isAI);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key);
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (race?.status === "racing") {
      const gameLoop = () => {
        updatePlayerMovement();
        drawGame();
        animationRef.current = requestAnimationFrame(gameLoop);
      };
      gameLoop();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [race?.status, keys, playerPosition, currentLap]);

  const updatePlayerMovement = () => {
    if (!race || race.status !== "racing") return;

    let newX = playerPosition.x;
    let newY = playerPosition.y;
    const speed = 3;

    if (keys.has('ArrowUp') || keys.has('w')) newY -= speed;
    if (keys.has('ArrowDown') || keys.has('s')) newY += speed;
    if (keys.has('ArrowLeft') || keys.has('a')) newX -= speed;
    if (keys.has('ArrowRight') || keys.has('d')) newX += speed;

    // Keep player within bounds
    newX = Math.max(0, Math.min(500, newX));
    newY = Math.max(0, Math.min(400, newY));

    // Check checkpoint collision (simplified)
    if (currentMap) {
      const checkpoints = currentMap.trackData.checkpoints;
      const currentCheckpoint = checkpoints[currentLap % checkpoints.length];
      const distance = Math.sqrt(
        Math.pow(newX - currentCheckpoint.x, 2) + Math.pow(newY - currentCheckpoint.y, 2)
      );

      if (distance < 30) {
        const newLap = Math.floor((currentLap + 1) / checkpoints.length);
        if (newLap !== Math.floor(currentLap / checkpoints.length)) {
          setCurrentLap(prev => prev + 1);
        } else {
          setCurrentLap(prev => prev + 1);
        }
      }
    }

    setPlayerPosition({ x: newX, y: newY });

    // Update position in database
    updatePosition({
      raceId,
      position: { x: newX, y: newY },
      lap: Math.floor(currentLap / (currentMap?.trackData.checkpoints.length || 4)),
    });
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas || !race || !currentMap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw track (simplified)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const checkpoints = currentMap.trackData.checkpoints;
    ctx.moveTo(currentMap.trackData.startPosition.x, currentMap.trackData.startPosition.y);
    checkpoints.forEach(checkpoint => {
      ctx.lineTo(checkpoint.x, checkpoint.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Draw checkpoints
    ctx.fillStyle = '#10b981';
    checkpoints.forEach((checkpoint, index) => {
      ctx.beginPath();
      ctx.arc(checkpoint.x, checkpoint.y, 15, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), checkpoint.x, checkpoint.y + 4);
      ctx.fillStyle = '#10b981';
    });

    // Draw obstacles
    ctx.fillStyle = '#ef4444';
    currentMap.trackData.obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw players
    race.players.forEach((racePlayer, index) => {
      const isCurrentPlayer = racePlayer.playerId === player?._id && !racePlayer.isAI;
      ctx.fillStyle = isCurrentPlayer ? '#fbbf24' : racePlayer.isAI ? '#8b5cf6' : '#3b82f6';
      
      const pos = isCurrentPlayer ? playerPosition : racePlayer.position;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Draw player name
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(racePlayer.name, pos.x, pos.y - 15);
    });

    // Draw current checkpoint indicator
    const targetCheckpoint = checkpoints[currentLap % checkpoints.length];
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetCheckpoint.x, targetCheckpoint.y, 20, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const handleStartRace = async () => {
    try {
      await startRace({ raceId });
      toast.success("Race started!");
    } catch (error) {
      toast.error("Failed to start race");
    }
  };

  if (!race || !player) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Race Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">{race.name}</h2>
            <p className="text-gray-300">
              Map: {currentMap?.name} | Status: {race.status}
            </p>
          </div>
          <button
            onClick={onBackToMenu}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Back to Menu
          </button>
        </div>

        {race.status === "waiting" && (
          <div className="flex justify-between items-center">
            <p className="text-gray-300">
              Players: {race.players.length}/{race.maxPlayers}
            </p>
            {isHost && (
              <button
                onClick={handleStartRace}
                disabled={race.players.length < 2}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
              >
                Start Race
              </button>
            )}
          </div>
        )}
      </div>

      {/* Game Canvas */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-white">
            <p>Lap: {Math.floor(currentLap / (currentMap?.trackData.checkpoints.length || 4)) + 1}/3</p>
            <p>Checkpoint: {(currentLap % (currentMap?.trackData.checkpoints.length || 4)) + 1}/{currentMap?.trackData.checkpoints.length || 4}</p>
          </div>
          {race.status === "racing" && (
            <div className="text-sm text-gray-300">
              Use arrow keys or WASD to move
            </div>
          )}
        </div>

        <canvas
          ref={canvasRef}
          width={500}
          height={400}
          className="border border-gray-600 rounded-lg bg-gray-900 mx-auto block"
        />
      </div>

      {/* Players List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">Players</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {race.players.map((racePlayer, index) => (
            <div
              key={`${racePlayer.playerId}-${racePlayer.isAI ? 'ai' : 'human'}-${index}`}
              className={`p-3 rounded-lg ${
                racePlayer.finished ? 'bg-green-700' : 'bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">
                  {racePlayer.name} {racePlayer.isAI ? '🤖' : '👤'}
                </span>
                {racePlayer.finished && racePlayer.rank && (
                  <span className="text-yellow-400 font-bold">
                    #{racePlayer.rank}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-300">
                Lap: {racePlayer.lap + 1}/3
              </div>
            </div>
          ))}
        </div>
      </div>

      {race.status === "finished" && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-yellow-400 mb-4">🏁 Race Finished!</h3>
          <p className="text-gray-300 mb-4">
            {currentPlayer?.finished ? `You finished in position #${currentPlayer.rank}!` : "Better luck next time!"}
          </p>
          <button
            onClick={onBackToMenu}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold transition-colors"
          >
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}
