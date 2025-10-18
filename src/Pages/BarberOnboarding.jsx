import React, { useState, useEffect, useRef } from "react";
import supabaseApi from "../api/supabaseAdapter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Textarea } from "../Components/ui/textarea";
import { Label } from "../Components/ui/label";
import { Badge } from "../Components/ui/badge";
import { Scissors, Upload, X, Plus, Trash2, Store } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Alert, AlertDescription } from "../Components/ui/alert";

const HAIR_TYPES = ["1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C", "4A", "4B", "4C", "All Types"];
const SPECIALTIES = ["Fades", "Braids", "Locs", "Color", "Perms", "Beard Styling", "Kids Cuts", "Women's Cuts"];

export default function BarberOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [shopOption, setShopOption] = useState("existing");
  const [error, setError] = useState(null);
  
  const [shopData, setShopData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    instagram: '',
    website: ''
  });

  const [barberData, setBarberData] = useState({
    name: '',
    bio: '',
    profile_image: '',
    portfolio_images: [],
    hair_type_specialties: [],
    years_experience: '',
    specialties: [],
    services: [],
    phone: '',
    instagram: '',
    shop_id: ''
  });

  const fileInputRef = useRef(null);
  const portfolioInputRef = useRef(null);

  const { data: shops } = useQuery({
    queryKey: ['shops'],
  queryFn: () => supabaseApi.entities.Shop.list(),
    initialData: [],
  });

  useEffect(() => {
  supabaseApi.auth.me().then(user => {
      setUser(user);
      setBarberData(prev => ({ ...prev, name: user.full_name, phone: user.phone }));
      setShopData(prev => ({ ...prev, email: user.email }));
    });
  }, []);

  const createShopMutation = useMutation({
    mutationFn: async (data) => {
  const result = await supabaseApi.integrations.Core.InvokeLLM({
        prompt: `Given this address: "${data.address}, ${data.postal_code} ${data.city}, Germany", 
        return the GPS coordinates (latitude and longitude) as accurate as possible.`,
        response_json_schema: {
          type: "object",
          properties: {
            latitude: { type: "number" },
            longitude: { type: "number" }
          }
        }
      });

  return await supabaseApi.entities.Shop.create({
        ...data,
        owner_email: user.email,
        country: "Germany",
        latitude: result.latitude,
        longitude: result.longitude
      });
    }
  });

  const createBarberMutation = useMutation({
  mutationFn: (data) => supabaseApi.entities.Barber.create({
      ...data,
      owner_email: user.email
    }),
    onSuccess: async () => {
  await supabaseApi.auth.updateMe({ is_barber: true });
      navigate(createPageUrl("ManageMyBarberProfile"));
    }
  });

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
  const { file_url } = await supabaseApi.integrations.Core.UploadFile({ file });
      setBarberData(prev => ({ ...prev, profile_image: file_url }));
    }
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
  const { file_url } = await supabaseApi.integrations.Core.UploadFile({ file });
      setBarberData(prev => ({
        ...prev,
        portfolio_images: [...prev.portfolio_images, file_url]
      }));
    }
  };

  const handleRemovePortfolioImage = (index) => {
    setBarberData(prev => ({
      ...prev,
      portfolio_images: prev.portfolio_images.filter((_, i) => i !== index)
    }));
  };

  const toggleHairType = (type) => {
    setBarberData(prev => ({
      ...prev,
      hair_type_specialties: prev.hair_type_specialties.includes(type)
        ? prev.hair_type_specialties.filter(t => t !== type)
        : [...prev.hair_type_specialties, type]
    }));
  };

  const toggleSpecialty = (specialty) => {
    setBarberData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const addService = () => {
    setBarberData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', price: 0, duration_minutes: 30 }]
    }));
  };

  const updateService = (index, field, value) => {
    setBarberData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const removeService = (index) => {
    setBarberData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    try {
      let shopId = barberData.shop_id;

      if (shopOption === "new") {
        if (!shopData.name || !shopData.address || !shopData.city) {
          setError("Please fill in all required shop fields");
          return;
        }
        const newShop = await createShopMutation.mutateAsync(shopData);
        shopId = newShop.id;
      }

      if (!shopId) {
        setError("Please select or create a shop");
        return;
      }

      if (!barberData.name || barberData.hair_type_specialties.length === 0) {
        setError("Please fill in all required barber fields");
        return;
      }

      await createBarberMutation.mutateAsync({
        ...barberData,
        shop_id: shopId
      });
    } catch (err) {
      setError("Failed to create profile. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Register as a Barber
          </h1>
          <p className="text-gray-600">Create your professional profile and start getting clients</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {step === 1 && (
          <Card className="border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
              <CardTitle className="flex items-center gap-2">
                <Store className="w-6 h-6" />
                Shop Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label>Do you have an existing shop or create a new one?</Label>
                <Select value={shopOption} onValueChange={setShopOption}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="existing">Select Existing Shop</SelectItem>
                    <SelectItem value="new">Create New Shop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {shopOption === "existing" ? (
                <div>
                  <Label>Select Shop</Label>
                  <Select value={barberData.shop_id} onValueChange={(value) => setBarberData(prev => ({ ...prev, shop_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a shop..." />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name} - {shop.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shop_name">Shop Name *</Label>
                    <Input
                      id="shop_name"
                      value={shopData.name}
                      onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
                      placeholder="e.g., Berlin Curls Studio"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shop_description">Description</Label>
                    <Textarea
                      id="shop_description"
                      value={shopData.description}
                      onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
                      placeholder="Describe your shop..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="shop_address">Address *</Label>
                    <Input
                      id="shop_address"
                      value={shopData.address}
                      onChange={(e) => setShopData({ ...shopData, address: e.target.value })}
                      placeholder="Street and number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shop_city">City *</Label>
                      <Input
                        id="shop_city"
                        value={shopData.city}
                        onChange={(e) => setShopData({ ...shopData, city: e.target.value })}
                        placeholder="Berlin, Munich, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="shop_postal">Postal Code</Label>
                      <Input
                        id="shop_postal"
                        value={shopData.postal_code}
                        onChange={(e) => setShopData({ ...shopData, postal_code: e.target.value })}
                        placeholder="10115"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shop_phone">Phone</Label>
                      <Input
                        id="shop_phone"
                        value={shopData.phone}
                        onChange={(e) => setShopData({ ...shopData, phone: e.target.value })}
                        placeholder="+49..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="shop_instagram">Instagram</Label>
                      <Input
                        id="shop_instagram"
                        value={shopData.instagram}
                        onChange={(e) => setShopData({ ...shopData, instagram: e.target.value })}
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                disabled={shopOption === "existing" ? !barberData.shop_id : (!shopData.name || !shopData.address || !shopData.city)}
              >
                Continue to Your Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
              <CardTitle className="flex items-center gap-2">
                <Scissors className="w-6 h-6" />
                Your Barber Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* ... keep existing code (name input) ... */}
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={barberData.name}
                  onChange={(e) => setBarberData({ ...barberData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>

              <div>
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  {barberData.profile_image ? (
                    <img src={barberData.profile_image} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <Scissors className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageUpload}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={barberData.bio}
                  onChange={(e) => setBarberData({ ...barberData, bio: e.target.value })}
                  placeholder="Tell clients about yourself..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Hair Type Specialties *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {HAIR_TYPES.map((type) => (
                    <Badge
                      key={type}
                      variant={barberData.hair_type_specialties.includes(type) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        barberData.hair_type_specialties.includes(type)
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500'
                          : ''
                      }`}
                      onClick={() => toggleHairType(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Additional Specialties</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SPECIALTIES.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant={barberData.specialties.includes(specialty) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        barberData.specialties.includes(specialty)
                          ? 'bg-blue-600'
                          : ''
                      }`}
                      onClick={() => toggleSpecialty(specialty)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    value={barberData.years_experience}
                    onChange={(e) => setBarberData({ ...barberData, years_experience: e.target.value })}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="barber_phone">Phone</Label>
                  <Input
                    id="barber_phone"
                    value={barberData.phone}
                    onChange={(e) => setBarberData({ ...barberData, phone: e.target.value })}
                    placeholder="+49..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  disabled={!barberData.name || barberData.hair_type_specialties.length === 0}
                >
                  Continue to Services
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
              <CardTitle>Services & Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Your Services</Label>
                  <Button onClick={addService} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
                <div className="space-y-3">
                  {barberData.services.map((service, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Service name"
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={service.price}
                          onChange={(e) => updateService(index, 'price', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Minutes"
                          value={service.duration_minutes}
                          onChange={(e) => updateService(index, 'duration_minutes', parseInt(e.target.value))}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Portfolio Photos</Label>
                <div className="mt-2 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {barberData.portfolio_images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={img} alt="Portfolio" className="w-full h-32 object-cover rounded-lg" />
                        <button
                          onClick={() => handleRemovePortfolioImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => portfolioInputRef.current?.click()} variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Portfolio Photos
                  </Button>
                  <input
                    ref={portfolioInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePortfolioUpload}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createShopMutation.isPending || createBarberMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                >
                  {createShopMutation.isPending || createBarberMutation.isPending ? 'Creating...' : 'Complete Registration'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}