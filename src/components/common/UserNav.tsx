
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Briefcase, Heart, LogOut, User as UserIcon, LayoutGrid } from "lucide-react";
import Link from "next/link";
import * as React from 'react';
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export function UserNav() {
  const { user, logout, sessionStatus } = useAuth();
  const loading = sessionStatus === 'loading';

  // While loading auth state, show a skeleton to prevent UI flash.
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  // If user is not logged in, show Login/Sign Up buttons.
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/auth/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }
  
  const userRole = user.role;
  const isAdmin = userRole && !['USER', 'ORGANIZER'].includes(userRole);

  // Common dropdown elements
  const UserDropdownTrigger = (
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar" />
          <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
  );

  const UserDropdownHeader = (
    <>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user.email}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
    </>
  );
  
  const UserDropdownFooter = (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </>
  );
  
  const getRoleSpecificMenu = () => {
    if (isAdmin) {
      return (
        <Link href="/admin/dashboard">
          <DropdownMenuItem className="cursor-pointer">
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </DropdownMenuItem>
        </Link>
      );
    }

    switch (userRole) {
      case 'ORGANIZER':
        return (
          <Link href="/trip-organiser/dashboard">
            <DropdownMenuItem className="cursor-pointer">
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>Organizer Dashboard</span>
            </DropdownMenuItem>
          </Link>
        );
      case 'USER':
      default:
        return (
          <DropdownMenuGroup>
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/bookings">
              <DropdownMenuItem className="cursor-pointer">
                <Briefcase className="mr-2 h-4 w-4" />
                <span>My Bookings</span>
              </DropdownMenuItem>
            </Link>
             <Link href="/wishlist">
              <DropdownMenuItem className="cursor-pointer">
                <Heart className="mr-2 h-4 w-4" />
                <span>Wishlist</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
        );
    }
  };

  // If user is logged in, show the Avatar dropdown menu with role-specific items.
  return (
    <DropdownMenu>
      {UserDropdownTrigger}
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {UserDropdownHeader}
        {getRoleSpecificMenu()}
        {UserDropdownFooter}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
