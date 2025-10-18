import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Star, MapPin, Heart, ExternalLink, Phone, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function BarberCard({ barber, isFavorite, onToggleFavorite }) {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-orange-200">
      <div className="relative h-48 overflow-hidden">
        <img
          src={barber.profile_image || `https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop`}
          alt={barber.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {barber.is_premium && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            Premium
          </Badge>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(barber.id);
          }}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-xl mb-1">{barber.name}</h3>
          <div className="flex items-center gap-1 text-white/90 text-sm">
            <MapPin className="w-3 h-3" />
            <span>{barber.shop?.name}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-lg">{barber.rating_average?.toFixed(1) || 'New'}</span>
            <span className="text-sm text-gray-500">({barber.rating_count || 0})</span>
          </div>
          <div className="flex gap-2">
            {barber.phone && (
              <a href={`tel:${barber.phone}`} className="text-gray-400 hover:text-orange-600 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            )}
            {barber.instagram && (
              <a href={barber.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {barber.hair_type_specialties?.slice(0, 4).map((type) => (
            <Badge key={type} variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
              {type}
            </Badge>
          ))}
        </div>

        {barber.years_experience && (
          <p className="text-sm text-gray-600">
            {barber.years_experience} years experience
          </p>
        )}

        <p className="text-sm text-gray-600 line-clamp-2">
          {barber.bio || "Expert barber specializing in various hair types"}
        </p>

        <Link to={createPageUrl(`BarberProfile?id=${barber.id}`)}>
          <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
            View Profile
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}