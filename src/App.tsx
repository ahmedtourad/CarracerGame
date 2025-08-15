import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { GameMenu } from "./components/GameMenu";
import { RaceGame } from "./components/RaceGame";
import { Shop } from "./components/Shop";
import { BluetoothManager } from "./components/BluetoothManager";
import { useState, useEffect } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur-sm h-16 flex justify-between items-center border-b border-gray-700 shadow-sm px-4">
        <h2 className="text-xl font-bold text-yellow-400">🏁 Racing Championship</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [currentView, setCurrentView] = useState<"menu" | "race" | "shop" | "bluetooth">("menu");
  const [currentRaceId, setCurrentRaceId] = useState<string | null>(null);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Authenticated>
        {currentView === "menu" && (
          <GameMenu 
            onStartRace={(raceId) => {
              setCurrentRaceId(raceId);
              setCurrentView("race");
            }}
            onOpenShop={() => setCurrentView("shop")}
            onOpenBluetooth={() => setCurrentView("bluetooth")}
          />
        )}
        {currentView === "race" && currentRaceId && (
          <RaceGame 
            raceId={currentRaceId}
            onBackToMenu={() => {
              setCurrentView("menu");
              setCurrentRaceId(null);
            }}
          />
        )}
        {currentView === "shop" && (
          <Shop onBack={() => setCurrentView("menu")} />
        )}
        {currentView === "bluetooth" && (
          <BluetoothManager onBack={() => setCurrentView("menu")} />
        )}
      </Authenticated>
      
      <Unauthenticated>
        <div className="text-center py-16">
          <h1 className="text-6xl font-bold text-yellow-400 mb-8">🏁 Racing Championship</h1>
          <p className="text-xl text-gray-300 mb-8">
            Race against friends via Bluetooth or challenge AI opponents!
          </p>
          <div className="max-w-md mx-auto">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
