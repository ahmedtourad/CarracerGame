import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ShopProps {
  onBack: () => void;
}

export function Shop({ onBack }: ShopProps) {
  const player = useQuery(api.players.getOrCreatePlayer);
  const shopItems = useQuery(api.shop.getShopItems);
  
  const purchaseItem = useMutation(api.players.purchaseItem);
  const selectItem = useMutation(api.players.selectItem);

  const handlePurchase = async (itemId: string) => {
    try {
      await purchaseItem({ itemId });
      toast.success("Item purchased!");
    } catch (error: any) {
      toast.error(error.message || "Failed to purchase item");
    }
  };

  const handleSelect = async (type: "car" | "character", itemName: string) => {
    try {
      await selectItem({ type, itemName });
      toast.success(`${type} selected!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to select item");
    }
  };

  if (!player || !shopItems) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const cars = shopItems.filter(item => item.type === "car");
  const characters = shopItems.filter(item => item.type === "character");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">🛒 Shop</h2>
            <p className="text-gray-300">Your Points: {player.points}</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Cars Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">🏎️ Cars</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car) => {
            const isOwned = player.ownedCars.includes(car.name);
            const isSelected = player.selectedCar === car.name;
            
            return (
              <div key={car._id} className="bg-gray-700 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{car.imageUrl}</div>
                  <h4 className="font-bold text-white">{car.name}</h4>
                  <p className="text-sm text-gray-300">{car.description}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Speed:</span>
                    <div className="flex">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 mx-0.5 ${
                            i < car.stats.speed ? 'bg-yellow-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Acceleration:</span>
                    <div className="flex">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 mx-0.5 ${
                            i < car.stats.acceleration ? 'bg-green-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Handling:</span>
                    <div className="flex">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 mx-0.5 ${
                            i < car.stats.handling ? 'bg-blue-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {!isOwned ? (
                    <button
                      onClick={() => handlePurchase(car._id)}
                      disabled={player.points < car.price}
                      className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      Buy for {car.price} points
                    </button>
                  ) : isSelected ? (
                    <div className="w-full px-3 py-2 bg-yellow-600 rounded-lg text-center font-bold">
                      ✓ Selected
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelect("car", car.name)}
                      className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Characters Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">👤 Characters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => {
            const isOwned = player.ownedCharacters.includes(character.name);
            const isSelected = player.selectedCharacter === character.name;
            
            return (
              <div key={character._id} className="bg-gray-700 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{character.imageUrl}</div>
                  <h4 className="font-bold text-white">{character.name}</h4>
                  <p className="text-sm text-gray-300">{character.description}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Speed Bonus:</span>
                    <div className="flex">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 mx-0.5 ${
                            i < character.stats.speed ? 'bg-yellow-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Acceleration Bonus:</span>
                    <div className="flex">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 mx-0.5 ${
                            i < character.stats.acceleration ? 'bg-green-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Handling Bonus:</span>
                    <div className="flex">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 mx-0.5 ${
                            i < character.stats.handling ? 'bg-blue-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {!isOwned ? (
                    <button
                      onClick={() => handlePurchase(character._id)}
                      disabled={player.points < character.price}
                      className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      Buy for {character.price} points
                    </button>
                  ) : isSelected ? (
                    <div className="w-full px-3 py-2 bg-yellow-600 rounded-lg text-center font-bold">
                      ✓ Selected
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelect("character", character.name)}
                      className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
