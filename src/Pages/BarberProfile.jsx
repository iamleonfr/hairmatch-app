import React, { useState, useEffect } from "react";
import supabaseApi from "../api/supabaseAdapter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Card, CardContent } from "../Components/ui/card";
import { ArrowLeft, MapPin, Phone, Instagram, Globe, Heart, Star, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import ReviewList from "../Components/barber/ReviewList";
import ReviewForm from "../Components/barber/ReviewForm";

export default function BarberProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const barberId = urlParams.get('id');
  const [user, setUser] = useState(null);

  const { data: barber, isLoading: loadingBarber } = useQuery({
    queryKey: ['barber', barberId],
    queryFn: async () => {
      const barbers = await supabaseApi.entities.Barber.filter({ id: barberId });
      return barbers[0];
    },
    enabled: !!barberId,
  });

  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', barberId],
  queryFn: () => supabaseApi.entities.Review.filter({ barber_id: barberId }, '-created_date'),
    initialData: [],
    enabled: !!barberId,
  });

  useEffect(() => {
  supabaseApi.auth.me().then(setUser).catch(() => {});
  }, []);

  const isFavorite = user?.favorite_barber_ids?.includes(barberId);

  const handleToggleFavorite = async () => {
    if (!user) return;
    
    const favorites = user.favorite_barber_ids || [];
    const updated = favorites.includes(barberId)
      ? favorites.filter(id => id !== barberId)
      : [...favorites, barberId];
    
  await supabaseApi.auth.updateMe({ favorite_barber_ids: updated });
    setUser({ ...user, favorite_barber_ids: updated });
  };

  const handleReviewSubmitted = async () => {
    await queryClient.invalidateQueries(['reviews', barberId]);
    
  const reviews = await supabaseApi.entities.Review.filter({ barber_id: barberId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
  await supabaseApi.entities.Barber.update(barberId, {
      rating_average: avgRating,
      rating_count: reviews.length
    });
    
    await queryClient.invalidateQueries(['barber', barberId]);
  };

  if (loadingBarber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Barber not found</h2>
          <Button onClick={() => navigate(createPageUrl("Discovery"))}>
            Back to Discovery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-pink-50">
      <div className="relative h-96 overflow-hidden">
        <img
          src={barber.profile_image || `https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=400&fit=crop`}
          alt={barber.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute top-6 left-6">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate(createPageUrl("Discovery"))}
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute top-6 right-6">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleToggleFavorite}
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{barber.name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{barber.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{barber.rating_average?.toFixed(1) || 'New'}</span>
                  <span>({barber.rating_count || 0})</span>
                </div>
              </div>
            </div>
            {barber.is_premium && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-lg px-4 py-2">
                Premium
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-2 border-orange-200">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">
                  {barber.description || "Professional barber with years of experience"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Hair Type Specialties</h2>
                <div className="flex flex-wrap gap-3">
                  {barber.hair_type_specialties?.map((type) => (
                    <Badge key={type} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-lg px-4 py-2">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {barber.services?.length > 0 && (
              <Card className="border-2 border-orange-200">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Services & Pricing</h2>
                  <div className="space-y-4">
                    {barber.services.map((service, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">{service.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-lg font-bold text-orange-600">
                          <DollarSign className="w-5 h-5" />
                          <span>{service.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {barber.portfolio_images?.length > 0 && (
              <Card className="border-2 border-orange-200">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {barber.portfolio_images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Portfolio ${i + 1}`}
                        className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-4">Reviews ({reviews.length})</h2>
              <div className="space-y-6">
                <ReviewForm barberId={barberId} onReviewSubmitted={handleReviewSubmitted} />
                <ReviewList reviews={reviews} isLoading={loadingReviews} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-orange-200 sticky top-4">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Contact Information</h3>
                
                {barber.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-gray-600">
                        {barber.address}<br />
                        {barber.postal_code} {barber.city}
                      </p>
                    </div>
                  </div>
                )}

                {barber.phone && (
                  <a href={`tel:${barber.phone}`} className="flex items-center gap-3 hover:bg-orange-50 p-3 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{barber.phone}</p>
                    </div>
                  </a>
                )}

                {barber.instagram && (
                  <a href={barber.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:bg-orange-50 p-3 rounded-lg transition-colors">
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="font-medium">Instagram</p>
                      <p className="text-sm text-gray-600">@{barber.instagram.split('/').pop()}</p>
                    </div>
                  </a>
                )}

                {barber.website && (
                  <a href={barber.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:bg-orange-50 p-3 rounded-lg transition-colors">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Website</p>
                      <p className="text-sm text-gray-600">Visit website</p>
                    </div>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}