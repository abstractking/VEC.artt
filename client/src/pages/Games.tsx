
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface Game {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

const games: Game[] = [
  {
    id: "asteroidzuna",
    title: "AsteroidZUNA",
    thumbnail: "/images/asteroid-zuna-thumb.svg",
    url: "/games/asteroid-zuna"
  },
  {
    id: "galactic-hit",
    title: "Galactic Hit",
    thumbnail: "/images/galactic-hit-thumb.svg",
    url: "/games/galactic-hit"
  },
  {
    id: "crypto-racer",
    title: "Crypto Racer",
    thumbnail: "/images/crypto-racer-thumb.svg",
    url: "/games/crypto-racer"
  },
  {
    id: "chain-heroes",
    title: "Chain Heroes",
    thumbnail: "/images/chain-heroes-thumb.svg",
    url: "/games/chain-heroes"
  }
];

export default function Games() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold mb-4">Gaming Hub</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Play blockchain-powered games and earn rewards on the VeChain network
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <Link key={game.id} href={game.url}>
            <Card className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="relative">
                <img 
                  src={game.thumbnail} 
                  alt={game.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h2 className="absolute bottom-2 left-4 text-xl font-bold text-white">
                  {game.title}
                </h2>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">VeChain-powered</span>
                  <span className="inline-flex items-center bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full dark:bg-emerald-900 dark:text-emerald-300">
                    Play Now
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="mt-16 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">About Blockchain Gaming</h2>
        <p className="mb-4">
          Our games are powered by VeChain technology, allowing players to earn and trade
          in-game assets as NFTs. Connect your wallet to start playing and collecting unique digital items.
        </p>
        <p>
          New games are added regularly. Check back often to discover the latest blockchain gaming experiences.
        </p>
      </div>
    </div>
  );
}
