import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Scissors, Home, User, Shield, Heart, LogOut } from "lucide-react";
import supabaseApi from "./api/supabaseAdapter";
import { useAuth } from './contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  } from "./Components/ui/sidebar";
import { Button } from "./Components/ui/button";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    {
      title: "Discover",
      url: createPageUrl("Discovery"),
      icon: Home,
    },
    {
      title: "My Profile",
      url: createPageUrl("MyProfile"),
      icon: User,
    },
    {
      title: "Favorites",
      url: createPageUrl("Favorites"),
      icon: Heart,
    },
  ];

  if (user?.is_barber) {
    navigationItems.push({
      title: "My Barber Profile",
      url: createPageUrl("ManageMyBarberProfile"),
      icon: Scissors,
    });
  }

  if (user?.role === "admin") {
    navigationItems.push({
      title: "Admin",
      url: createPageUrl("Admin"),
      icon: Shield,
    });
  }

  const handleLogout = async () => {
    await supabaseApi.auth.logout(createPageUrl("Discovery"));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <Sidebar className="border-r border-orange-100 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-orange-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  HairMatch
                </h2>
                <p className="text-xs text-gray-500">Find Your Perfect Barber</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url
                            ? 'bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 shadow-sm'
                            : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {!user?.is_barber && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <Link to={createPageUrl("BarberOnboarding")}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
                      <Scissors className="w-4 h-4 mr-2" />
                      Register as Barber
                    </Button>
                  </Link>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-orange-100 p-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to={createPageUrl('Login')}>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white">Login</Button>
                </Link>
                <Link to={createPageUrl('Signup')}>
                  <Button className="w-full border">Sign Up</Button>
                </Link>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-orange-50 p-2 rounded-lg transition-colors duration-200" />
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-orange-600" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  HairMatch
                </h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
