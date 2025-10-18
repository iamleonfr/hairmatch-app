import supabaseApi from "../api/supabaseAdapter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../Components/ui/tabs";
import { Badge } from "../Components/ui/badge";
import { Users, Scissors, MessageSquare, TrendingUp, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Admin() {
  const queryClient = useQueryClient();

  const { data: barbers } = useQuery({
    queryKey: ['barbers'],
  queryFn: () => supabaseApi.entities.Barber.list('-created_date'),
    initialData: [],
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews'],
  queryFn: () => supabaseApi.entities.Review.list('-created_date'),
    initialData: [],
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
  queryFn: () => supabaseApi.entities.User.list('-created_date'),
    initialData: [],
  });

  const toggleBarberVerification = useMutation({
    mutationFn: ({ id, is_verified }) => 
  supabaseApi.entities.Barber.update(id, { is_verified: !is_verified }),
    onSuccess: () => {
      queryClient.invalidateQueries(['barbers']);
    },
  });

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage your HairMatch platform</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-2 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{users.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Total Barbers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-pink-600">{barbers.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{reviews.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="barbers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="barbers">Barbers ({barbers.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="barbers" className="space-y-4">
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Barber Management</CardTitle>
                  <a href="https://base44.app/dashboard/data/Barber" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Barber
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {barbers.map((barber) => (
                    <div key={barber.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <img
                          src={barber.profile_image || `https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&h=100&fit=crop`}
                          alt={barber.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold">{barber.name}</p>
                          <p className="text-sm text-gray-600">{barber.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {barber.is_verified ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge variant="outline">Unverified</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleBarberVerification.mutate({ 
                            id: barber.id, 
                            is_verified: barber.is_verified 
                          })}
                        >
                          {barber.is_verified ? 'Unverify' : 'Verify'}
                        </Button>
                        <Link to={createPageUrl(`BarberProfile?id=${barber.id}`)}>
                          <Button size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {user.hair_type && user.hair_type !== "Not Set" && (
                          <Badge className="bg-orange-100 text-orange-800">
                            {user.hair_type}
                          </Badge>
                        )}
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 10).map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{review.user_name}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i} className="text-yellow-400">★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                      {review.service_used && (
                        <Badge variant="outline" className="mt-2">
                          {review.service_used}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}