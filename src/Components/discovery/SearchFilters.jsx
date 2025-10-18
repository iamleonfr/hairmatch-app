import React from "react";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Search, X } from "lucide-react";
import { Button } from "../ui/button";

const HAIR_TYPES = ["1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C", "4A", "4B", "4C", "All Types"];
const CITIES = ["Berlin", "Frankfurt", "Stuttgart", "Munich", "Hamburg", "Cologne", "Düsseldorf"];

export default function SearchFilters({ filters, onFiltersChange }) {
  const handleHairTypeToggle = (type) => {
    const current = filters.hairTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, hairTypes: updated });
  };

  return (
    <Card className="border-2 border-orange-200 shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-3 block">
            Search by Name
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search barbers..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-3 block">
            City
          </Label>
          <Select
            value={filters.city || ''}
            onValueChange={(value) => onFiltersChange({ ...filters, city: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-semibold text-gray-700">
              Hair Type Specialties
            </Label>
            {filters.hairTypes?.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFiltersChange({ ...filters, hairTypes: [] })}
                className="text-xs h-auto py-1"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {HAIR_TYPES.map((type) => {
              const isSelected = filters.hairTypes?.includes(type);
              return (
                <Badge
                  key={type}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0'
                      : 'hover:bg-orange-50 border-orange-200'
                  }`}
                  onClick={() => handleHairTypeToggle(type)}
                >
                  {type}
                  {isSelected && <X className="w-3 h-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center pt-2">
          {filters.hairTypes?.length > 0 && (
            <span>Filtering by {filters.hairTypes.length} hair type{filters.hairTypes.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}