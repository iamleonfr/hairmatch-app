import React, { useState, useEffect } from "react";
import supabaseApi from "../api/supabaseAdapter";
import { useQuery } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";
import BarberCard from "../Components/discovery/BarberCard";

export default function Favorites() {
  const [user, setUser] = useState(null);

  const { data: barbers, isLoading } = useQuery({
    queryKey: ['barbers'],
  queryFn: () => supabaseApi.entities.Barber.list(),
    initialData: [],
  });

  useEffect(() => {
  supabaseApi.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleToggleFavorite = async (barberId) => {
    if (!user) return;
    
    const favorites = user.favorite_barber_ids || [];
    const updated = favorites.filter(id => id !== barberId);
    
  await supabaseApi.auth.updateMe({ favorite_barber_ids: updated });
    setUser({ ...user, favorite_barber_ids: updated });
  };

  const favoriteBarbers = barbers.filter(barber => 
    user?.favorite_barber_ids?.includes(barber.id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            My Favorites
          </h1>
          <p className="text-lg text-gray-600">
            Your saved barbers and salons
          </p>
        </div>

        {favoriteBarbers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-orange-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">Start exploring and save your favorite barbers</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteBarbers.map((barber) => (
              <BarberCard
                key={barber.id}
                barber={barber}
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}