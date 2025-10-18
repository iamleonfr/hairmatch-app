import React, { useState, useEffect } from "react";
import supabaseApi from "../api/supabaseAdapter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Textarea } from "../Components/ui/textarea";
import { Label } from "../Components/ui/label";
import { Badge } from "../Components/ui/badge";
import { Scissors, Save, Plus, Trash2, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "../Components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

const HAIR_TYPES = ["1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C", "4A", "4B", "4C", "All Types"];
const SPECIALTIES = ["Fades", "Braids", "Locs", "Color", "Perms", "Beard Styling", "Kids Cuts", "Women's Cuts"];

export default function ManageMyBarberProfile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [barberData, setBarberData] = useState(null);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);
  const fileInputRef = React.useRef(null);
  const portfolioInputRef = React.useRef(null);

  useEffect(() => {
  supabaseApi.auth.me().then(async (userData) => {
      setUser(userData);
  const barbers = await supabaseApi.entities.Barber.filter({ owner_email: userData.email });
      if (barbers[0]) {
        setBarberData(barbers[0]);
        setFormData(barbers[0]);
      }
    });
  }, []);

  const updateBarberMutation = useMutation({
  mutationFn: (data) => supabaseApi.entities.Barber.update(barberData.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['barber']);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
  const { file_url } = await supabaseApi.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_image: file_url }));
    }
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
  const { file_url } = await supabaseApi.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        portfolio_images: [...(prev.portfolio_images || []), file_url]
      }));
    }
  };

  const handleRemovePortfolioImage = (index) => {
    setFormData(prev => ({
      ...prev,
      portfolio_images: prev.portfolio_images.filter((_, i) => i !== index)
    }));
  };

  const toggleHairType = (type) => {
    setFormData(prev => ({
      ...prev,
      hair_type_specialties: prev.hair_type_specialties.includes(type)
        ? prev.hair_type_specialties.filter(t => t !== type)
        : [...prev.hair_type_specialties, type]
    }));
  };

  const toggleSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: (prev.specialties || []).includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...(prev.specialties || []), specialty]
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...(prev.services || []), { name: '', price: 0, duration_minutes: 30 }]
    }));
  };

  const updateService = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    updateBarberMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!barberData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Scissors className="w-16 h-16 mx-auto mb-4 text-orange-600" />
            <h2 className="text-2xl font-bold mb-2">Not Registered as Barber</h2>
            <p className="text-gray-600 mb-6">You haven't created a barber profile yet.</p>
            <Link to={createPageUrl("BarberOnboarding")}>
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                Register Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Manage Your Profile
            </h1>
            <p className="text-gray-600 mt-2">Update your barber information</p>
          </div>
          <Link to={createPageUrl(`BarberProfile?id=${barberData.id}`)}>
            <Button variant="outline">View Public Profile</Button>
          </Link>
        </div>

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">Profile updated successfully!</AlertDescription>
          </Alert>
        )}

        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* ... keep existing code (profile photo and inputs) ... */}
            <div>
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4 mt-2">
                {formData.profile_image ? (
                  <img src={formData.profile_image} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <Scissors className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Change Photo
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  value={formData.years_experience || ''}
                  onChange={(e) => setFormData({ ...formData, years_experience: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram || ''}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
            <CardTitle>Specialties</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label>Hair Type Specialties</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {HAIR_TYPES.map((type) => (
                  <Badge
                    key={type}
                    variant={formData.hair_type_specialties?.includes(type) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      formData.hair_type_specialties?.includes(type)
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
                    variant={formData.specialties?.includes(specialty) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      formData.specialties?.includes(specialty)
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
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
            <CardTitle className="flex items-center justify-between">
              <span>Services</span>
              <Button onClick={addService} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {formData.services?.map((service, index) => (
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
                      placeholder="€"
                      value={service.price}
                      onChange={(e) => updateService(index, 'price', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="min"
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
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {formData.portfolio_images?.map((img, index) => (
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
                Add Portfolio Photos
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
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={updateBarberMutation.isPending}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateBarberMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}