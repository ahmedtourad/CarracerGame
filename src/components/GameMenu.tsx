import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface GameMenuProps {
  onStartRace: (raceId: string) => void;
  onOpenShop: () => void;
  onOpenBluetooth: () => void;
}

export function GameMenu({ onStartRace, onOpenShop, onOpenBluetooth }: GameMenuProps) {
  const player = useQuery(api.players.getOrCreatePlayer);
  const maps = useQuery(api.maps.getAllMaps);
  const availableRaces = useQuery(api.availableRaces.getAvailableRaces);
  const bluetoothInvites = useQuery(api.bluetooth.getBluetoothInvites);
  
  const createRace = useMutation(api.races.createRace);
  const joinRace = useMutation(api.races.joinRace);
  const initializeMaps = useMutation(api.maps.initializeMaps);
  const initializeShop = useMutation(api.shop.initializeShop);
  const updatePlayerName = useMutation(api.players.updatePlayerName);

  const [selectedMap, setSelectedMap] = useState<string>("");
  const [raceName, setRaceName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [withAI, setWithAI] = useState(true);
  const [playerName, setPlayerName] = useState("");
  const [showNameEdit, setShowNameEdit] = useState(false);

  useEffect(() => {
    initializeMaps();
    initializeShop();
  }, []);

  useEffect(() => {
    if (player && !playerName) {
      setPlayerName(player.name);
    }
  }, [player]);

  const handleCreateRace = async () => {
    if (!selectedMap || !raceName.trim()) {
      toast.error("Please select a map and enter a race name");
      return;
    }

    try {
      const raceId = await createRace({
        name: raceName,
        mapId: selectedMap,
        maxPlayers,
        withAI,
      });
      onStartRace(raceId);
      toast.success("Race created!");
    } catch (error) {
      toast.error("Failed to create race");
    }
  };

  const handleJoinRace = async (raceId: string) => {
    try {
      await joinRace({ raceId });
      onStartRace(raceId);
      toast.success("Joined race!");
    } catch (error) {
      toast.error("Failed to join race");
    }
  };

  const handleUpdateName = async () => {
    if (!playerName.trim()) return;
    
    try {
      await updatePlayerName({ name: playerName });
      setShowNameEdit(false);
      toast.success("Name updated!");
    } catch (error) {
      toast.error("Failed to update name");
    }
  };

  if (!player || !maps) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const unlockedMaps = maps.filter(map => map.unlocked);

  return (
    <div className="space-y-8">
      {/* Player Info */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">Welcome, {player.name}!</h2>
            <p className="text-gray-300">Points: {player.points}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNameEdit(!showNameEdit)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Edit Name
            </button>
            <button
              onClick={onOpenShop}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              🛒 Shop
            </button>
            <button
              onClick={onOpenBluetooth}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              📱 Bluetooth ({bluetoothInvites?.length || 0})
            </button>
          </div>
        </div>

        {showNameEdit && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Enter your name"
            />
            <button
              onClick={handleUpdateName}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Selected Car:</span>
            <span className="ml-2 text-yellow-400">{player.selectedCar}</span>
          </div>
          <div>
            <span className="text-gray-400">Selected Character:</span>
            <span className="ml-2 text-yellow-400">{player.selectedCharacter}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create Race */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Create New Race</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Race Name
              </label>
              <input
                type="text"
                value={raceName}
                onChange={(e) => setRaceName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Enter race name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Map
              </label>
              <select
                value={selectedMap}
                onChange={(e) => setSelectedMap(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Choose a map...</option>
                {unlockedMaps.map((map) => (
                  <option key={map._id} value={map._id}>
                    {map.name} ({map.difficulty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Players: {maxPlayers}
              </label>
              <input
                type="range"
                min="2"
                max="20"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="withAI"
                checked={withAI}
                onChange={(e) => setWithAI(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="withAI" className="text-gray-300">
                Include AI opponents
              </label>
            </div>

            <button
              onClick={handleCreateRace}
              className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold transition-colors"
            >
              🏁 Create Race
            </button>
          </div>
        </div>

        {/* Join Race */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Available Races</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableRaces && availableRaces.length > 0 ? (
              availableRaces.map((race) => (
                <div key={race._id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{race.name}</h4>
                    <span className="text-sm text-gray-400">
                      {race.players.length}/{race.maxPlayers}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Map: {maps.find(m => m._id === race.mapId)?.name || "Unknown"}
                  </p>
                  <button
                    onClick={() => handleJoinRace(race._id)}
                    disabled={race.players.length >= race.maxPlayers}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {race.players.length >= race.maxPlayers ? "Full" : "Join Race"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">
                No races available. Create one to get started!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Maps Preview */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">Available Maps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maps.map((map) => (
            <div
              key={map._id}
              className={`p-4 rounded-lg border-2 ${
                map.unlocked
                  ? "bg-gray-700 border-green-500"
                  : "bg-gray-800 border-gray-600 opacity-50"
              }`}
            >
              <h4 className="font-bold text-white mb-2">{map.name}</h4>
              <p className="text-sm text-gray-300 mb-2">{map.description}</p>
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded ${
                  map.difficulty === "easy" ? "bg-green-600" :
                  map.difficulty === "medium" ? "bg-yellow-600" : "bg-red-600"
                }`}>
                  {map.difficulty.toUpperCase()}
                </span>
                {!map.unlocked && (
                  <span className="text-xs text-gray-400">🔒 Locked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
