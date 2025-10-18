import React, { useState, useEffect } from "react";
import supabaseApi from "../api/supabaseAdapter";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Badge } from "../Components/ui/badge";
import { User, Mail, Sparkles, Save } from "lucide-react";
import HairTypeDetector from "../Components/discovery/HairTypeDetector";

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location_city: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
  const userData = await supabaseApi.auth.me();
    setUser(userData);
    setFormData({
      full_name: userData.full_name || '',
      phone: userData.phone || '',
      location_city: userData.location_city || ''
    });
  };

  const handleSave = async () => {
  await supabaseApi.auth.updateMe(formData);
    await loadUser();
    setIsEditing(false);
  };

  const handleDetectionComplete = async () => {
    await loadUser();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="+49..."
                />
              </div>

              <div>
                <Label htmlFor="location_city">City</Label>
                <Input
                  id="location_city"
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Berlin, Munich, etc."
                />
              </div>

              <div className="flex gap-3">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          full_name: user.full_name || '',
                          phone: user.phone || '',
                          location_city: user.location_city || ''
                        });
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-2 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Your Hair Type
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {user.hair_type && user.hair_type !== "Not Set" ? (
                  <div className="text-center space-y-4">
                    <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-2xl px-6 py-3">
                      {user.hair_type}
                    </Badge>
                    {user.hair_type_photo && (
                      <img
                        src={user.hair_type_photo}
                        alt="Hair Type"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <p className="text-sm text-gray-600">
                      Update your hair type anytime by uploading a new photo below
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Not detected yet</p>
                )}
              </CardContent>
            </Card>

            <HairTypeDetector 
              onDetectionComplete={handleDetectionComplete}
              currentHairType={user.hair_type}
            />
          </div>
        </div>

        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {user.favorite_barber_ids?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Favorites</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-600">
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </p>
                <p className="text-sm text-gray-600">Account Type</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {user.hair_type !== "Not Set" ? '✓' : '✗'}
                </p>
                <p className="text-sm text-gray-600">Hair Type Set</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {user.location_city || '-'}
                </p>
                <p className="text-sm text-gray-600">Location</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}