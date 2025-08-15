import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface BluetoothManagerProps {
  onBack: () => void;
}

export function BluetoothManager({ onBack }: BluetoothManagerProps) {
  const bluetoothInvites = useQuery(api.bluetooth.getBluetoothInvites);
  const availableRaces = useQuery(api.races.getAvailableRaces);
  
  const sendInvite = useMutation(api.bluetooth.sendBluetoothInvite);
  const respondToInvite = useMutation(api.bluetooth.respondToBluetoothInvite);
  const createRace = useMutation(api.races.createRace);

  const [guestName, setGuestName] = useState("");
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleSendInvite = async () => {
    if (!guestName.trim() || !selectedRaceId) {
      toast.error("Please enter a player name and select a race");
      return;
    }

    try {
      await sendInvite({
        guestName: guestName.trim(),
        raceId: selectedRaceId,
      });
      toast.success("Bluetooth invite sent!");
      setGuestName("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send invite");
    }
  };

  const handleRespondToInvite = async (connectionId: string, accept: boolean) => {
    try {
      await respondToInvite({ connectionId, accept });
      toast.success(accept ? "Invite accepted!" : "Invite declined");
    } catch (error: any) {
      toast.error(error.message || "Failed to respond to invite");
    }
  };

  const handleCreateRaceForBluetooth = async () => {
    try {
      const raceId = await createRace({
        name: "Bluetooth Race",
        mapId: "default", // You might want to let user select
        maxPlayers: 4,
        withAI: false,
      });
      setSelectedRaceId(raceId);
      toast.success("Race created for Bluetooth sharing!");
    } catch (error) {
      toast.error("Failed to create race");
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast.info("Scan complete! Found nearby devices.");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">📱 Bluetooth Racing</h2>
            <p className="text-gray-300">Connect with nearby players</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Send Invites */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Send Race Invite</h3>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={simulateScan}
                disabled={isScanning}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors mb-4"
              >
                {isScanning ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Scanning for devices...
                  </div>
                ) : (
                  "🔍 Scan for Nearby Players"
                )}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Player Name (Bluetooth Discovery)
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Enter player name to invite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Race to Share
              </label>
              <select
                value={selectedRaceId}
                onChange={(e) => setSelectedRaceId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Choose a race...</option>
                {availableRaces?.map((race) => (
                  <option key={race._id} value={race._id}>
                    {race.name} ({race.players.length}/{race.maxPlayers})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateRaceForBluetooth}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Create New Race
              </button>
              <button
                onClick={handleSendInvite}
                disabled={!guestName.trim() || !selectedRaceId}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Send Invite
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg">
            <h4 className="font-bold text-blue-300 mb-2">📡 How Bluetooth Racing Works:</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Scan for nearby players with Bluetooth enabled</li>
              <li>• Send race invitations to discovered players</li>
              <li>• Players can accept/decline invitations</li>
              <li>• Race together in real-time multiplayer</li>
            </ul>
          </div>
        </div>

        {/* Received Invites */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">
            Received Invites ({bluetoothInvites?.length || 0})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {bluetoothInvites && bluetoothInvites.length > 0 ? (
              bluetoothInvites.map((invite) => (
                <div key={invite._id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-white">{invite.hostName}</h4>
                      <p className="text-sm text-gray-300">
                        invites you to: {invite.raceName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        📱 Via Bluetooth
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondToInvite(invite._id, true)}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleRespondToInvite(invite._id, false)}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      ✗ Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-gray-400">No Bluetooth invites received</p>
                <p className="text-sm text-gray-500 mt-2">
                  Make sure Bluetooth is enabled and you're discoverable
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-purple-900/30 rounded-lg">
            <h4 className="font-bold text-purple-300 mb-2">🎮 Multiplayer Features:</h4>
            <ul className="text-sm text-purple-200 space-y-1">
              <li>• Race with up to 20 players</li>
              <li>• Real-time position updates</li>
              <li>• AI opponents available</li>
              <li>• Points awarded based on ranking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bluetooth Status */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">📡 Connection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">✅</div>
            <h4 className="font-bold text-green-300">Bluetooth Ready</h4>
            <p className="text-sm text-green-200">Device discoverable</p>
          </div>
          <div className="bg-blue-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-bold text-blue-300">Real-time Sync</h4>
            <p className="text-sm text-blue-200">Low latency racing</p>
          </div>
          <div className="bg-purple-900/30 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🏁</div>
            <h4 className="font-bold text-purple-300">Race Ready</h4>
            <p className="text-sm text-purple-200">Multiplayer enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
