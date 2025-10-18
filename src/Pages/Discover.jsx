import React, { useState, useEffect } from "react";
import supabaseApi from "../api/supabaseAdapter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import HairTypeDetector from "../Components/discovery/HairTypeDetector";
import SearchFilters from "../Components/discovery/SearchFilters";
import BarberCard from "../Components/discovery/BarberCard";

export default function Discovery() {
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    city: 'all',
    hairTypes: []
  });

  const { data: barbers, isLoading } = useQuery({
    queryKey: ['barbers'],
  queryFn: () => supabaseApi.entities.Barber.list('-rating_average'),
    initialData: [],
  });

  const { data: shops, isLoading: loadingShops } = useQuery({
    queryKey: ['shops'],
  queryFn: () => supabaseApi.entities.Shop.list(),
    initialData: [],
  });

  useEffect(() => {
  supabaseApi.auth.me().then(user => {
      setUser(user);
      if (user.hair_type && user.hair_type !== "Not Set") {
        setFilters(prev => ({ ...prev, hairTypes: [user.hair_type] }));
      }
    }).catch(() => {});
  }, []);

  const handleDetectionComplete = async (hairType) => {
  const updatedUser = await supabaseApi.auth.me();
    setUser(updatedUser);
    setFilters(prev => ({ ...prev, hairTypes: [hairType] }));
  };

  const handleToggleFavorite = async (barberId) => {
    if (!user) return;
    
    const favorites = user.favorite_barber_ids || [];
    const updated = favorites.includes(barberId)
      ? favorites.filter(id => id !== barberId)
      : [...favorites, barberId];
    
  await supabaseApi.auth.updateMe({ favorite_barber_ids: updated });
    setUser({ ...user, favorite_barber_ids: updated });
  };

  const barbersWithShops = barbers.map(barber => {
    const shop = shops.find(s => s.id === barber.shop_id);
    return { ...barber, shop };
  });

  const filteredBarbers = barbersWithShops.filter(barber => {
    if (!barber.shop) return false;
    
    if (filters.search && !barber.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.city && filters.city !== 'all' && barber.shop.city !== filters.city) {
      return false;
    }
    if (filters.hairTypes?.length > 0) {
      const hasMatch = filters.hairTypes.some(type => 
        barber.hair_type_specialties?.includes(type) || 
        barber.hair_type_specialties?.includes("All Types")
      );
      if (!hasMatch) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Find Your Perfect Barber
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-powered matching for your unique hair type
          </p>
        </div>

        {user && (!user.hair_type || user.hair_type === "Not Set") && (
          <div className="max-w-2xl mx-auto">
            <HairTypeDetector 
              onDetectionComplete={handleDetectionComplete}
              currentHairType={user.hair_type}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <SearchFilters 
                filters={filters} 
                onFiltersChange={setFilters}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            {isLoading || loadingShops ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : filteredBarbers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No barbers found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Found <span className="font-semibold text-orange-600">{filteredBarbers.length}</span> barber{filteredBarbers.length !== 1 ? 's' : ''} 
                  {user?.hair_type && user.hair_type !== "Not Set" && (
                    <span> specializing in <span className="font-semibold text-orange-600">{user.hair_type}</span> hair</span>
                  )}
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBarbers.map((barber) => (
                    <BarberCard
                      key={barber.id}
                      barber={barber}
                      isFavorite={user?.favorite_barber_ids?.includes(barber.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}