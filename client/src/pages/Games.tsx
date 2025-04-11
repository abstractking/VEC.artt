
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
    id: "galactic-hit",
    title: "Galactic Hit",
    thumbnail: "/images/galactic-hit-thumb.jpg",
    url: "/games/galactic-hit.html"
  },
  {
    id: "crypto-racer",
    title: "Crypto Racer",
    thumbnail: "/images/crypto-racer-thumb.jpg",
    url: "/games/index.html"
  },
  {
    id: "chain-heroes",
    title: "Chain Heroes",
    thumbnail: "/images/chain-heroes-thumb.jpg",
    url: "/games/index.html"
  }
];

export default function Games() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Gaming Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link key={game.id} href={game.url}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <img 
                  src={game.thumbnail} 
                  alt={game.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h2 className="text-xl font-semibold">{game.title}</h2>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
