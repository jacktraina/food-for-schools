'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building2,
  ChevronDown,
  ClipboardList,
  Eye,
  FileText,
  Home,
  Settings,
  UserCog,
  Users,
  Wrench,
  PlusCircle,
  Calendar,
  Award,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { LoginResponseUser } from '@/types/auth';

type UserData = LoginResponseUser;

export function DashboardSidebar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bidManagementOpen, setBidManagementOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserData;
        setUserData(parsedUser);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  // Helper function to check if user has a specific permission
  const hasPermission = (permission: string) => {
    if (!userData) return false;
    return (
      userData.roles.some((role) =>
        role.permissions.some((permission) => permission.name === 'all')
      ) ||
      userData.roles.some((role) =>
        role.permissions.some((permission) => permission.name === 'all')
      )
    );
  };

  // Helper function to check if user has a specific bid permission
  const hasBidPermission = (permission: string) => {
    if (
      !userData ||
      !userData.bidRoles.some((bidRoles) => bidRoles.permissions)
    )
      return false;
    return userData.bidRoles.some((bidRole) =>
      bidRole.permissions.some(
        (bidRolePermission) => bidRolePermission.name === permission
      )
    );
  };

  // If user data is not loaded yet, show a loading state
  if (!userData) {
    return <div className="p-4">Loading...</div>;
  }

  // Determine which navigation items to show based on user role and permissions
  const getNavigationItems = () => {
    // All users can see the dashboard
    const items = [{ name: 'Dashboard', href: '/dashboard', icon: Home }];

    // Organization-specific item based on role and organization type
    if (
      userData.roles.some((role) => role.type === 'Group Admin') &&
      userData.cooperativeId
    ) {
      items.push({
        name: 'Group Management',
        href: '/dashboard/districts',
        icon: Users,
      });
    } else if (
      userData.roles.some((role) => role.type === 'District Admin') &&
      userData.districtId
    ) {
      items.push({
        name: 'My District',
        href: `/dashboard/districts/${userData.districtId}`,
        icon: Building2,
      });
    } else if (
      userData.roles.some((role) => role.type === 'School Admin') &&
      userData.schoolId
    ) {
      items.push({
        name: 'My School',
        href: `/dashboard/schools/${userData.schoolId}`,
        icon: Building2,
      });
    }

    // Bid Management - show for all users
    items.push({
      name: 'Bid Management',
      href: '/dashboard/bids',
      icon: ClipboardList,
      submenu: true,
    });

    // User Management - only for Group Admin and District Admin
    if (
      userData.roles.some((role) => role.type === 'Group Admin') ||
      userData.roles.some((role) => role.type === 'District Admin') ||
      hasPermission('manage_users')
    ) {
      items.push({
        name: 'User Management',
        href: '/dashboard/users',
        icon: UserPlus,
      });
    }

    // Reports - all users can see reports
    items.push({
      name: 'Reports',
      href: '/dashboard/reports',
      icon: BarChart3,
    });

    // Documents - All users can see documents
    items.push({
      name: 'Documents',
      href: '/dashboard/documents',
      icon: FileText,
    });

    return items;
  };

  const navigationItems = getNavigationItems();

  // Determine which bid management submenu items to show based on user role
  const getBidManagementItems = () => {
    const items = [];

    // View Bids - for all users
    items.push({
      name: 'View Bids',
      href: '/dashboard/bids/view',
      icon: Eye,
    });

    // Create/Edit Bid - only for Bid Administrator
    if (
      userData.bidRoles.some(
        (bidRole) => bidRole.type === 'Bid Administrator'
      ) ||
      hasBidPermission('create_bids')
    ) {
      items.push({
        name: 'Create/Edit Bid',
        href: '/dashboard/bids/create/page',
        icon: PlusCircle,
      });
    }

    // Bid Opening Management - only for Bid Administrator
    if (
      userData.bidRoles.some(
        (bidRole) => bidRole.type === 'Bid Administrator'
      ) ||
      hasBidPermission('create_bids')
    ) {
      items.push({
        name: 'Bid Opening Management',
        href: '/dashboard/bids/opening',
        icon: Calendar,
      });
    }

    // Award Bids - Bid Administrator and Bid Manager
    if (
      userData.bidRoles.some(
        (bidRole) => bidRole.type === 'Bid Administrator'
      ) ||
      userData.bidRoles.some((bidRole) => bidRole.type === 'Bid Manager') ||
      hasBidPermission('edit_bids')
    ) {
      items.push({
        name: 'Award Bids',
        href: '/dashboard/bids/award',
        icon: Award,
      });
    }

    return items;
  };

  const bidManagementItems = getBidManagementItems();

  // Settings submenu items - all users can see account settings
  const settingsSubItems = [
    { name: 'Account Settings', href: '/dashboard/settings', icon: UserCog },
  ];

  // Only Group Admin and District Admin can see Organization Settings
  if (
    userData.roles.some((role) => role.type === 'Group Admin') ||
    userData.roles.some((role) => role.type === 'District Admin') ||
    hasPermission('manage_district') ||
    hasPermission('manage_coop')
  ) {
    settingsSubItems.push({
      name: 'Organization Settings',
      href: '/dashboard/settings/organization',
      icon: Wrench,
    });
  }

  return (
    <Sidebar className="bg-white">
      <SidebarHeader className="border-b flex justify-center items-center py-4">
        <Image
          src="/images/bid_pro_logo.png"
          alt="BidPro by Food For Schools Logo"
          width={180}
          height={60}
          priority
          className="h-auto"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname === '/dashboard' || pathname === '/dashboard/'
                  }
                >
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Home className="h-5 w-5 shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Organization specific item */}
              {(userData.role === 'Group Admin' ||
                userData.role === 'District Admin' ||
                userData.role === 'School Admin') && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      userData.role === 'Group Admin'
                        ? pathname.startsWith('/dashboard/districts')
                        : userData.role === 'District Admin'
                        ? pathname.startsWith(
                            `/dashboard/districts/${userData.organizationId}`
                          )
                        : pathname.startsWith(
                            `/dashboard/schools/${userData.schoolId}`
                          )
                    }
                  >
                    <Link
                      href={
                        userData.role === 'Group Admin'
                          ? '/dashboard/districts'
                          : userData.role === 'District Admin'
                          ? `/dashboard/districts/${userData.organizationId}`
                          : `/dashboard/schools/${userData.schoolId}`
                      }
                      className="flex items-center gap-2"
                    >
                      {userData.role === 'Group Admin' ? (
                        <Users className="h-5 w-5 shrink-0" />
                      ) : (
                        <Building2 className="h-5 w-5 shrink-0" />
                      )}
                      <span>
                        {userData.role === 'Group Admin'
                          ? 'Group Management'
                          : userData.role === 'District Admin'
                          ? 'My District'
                          : 'My School'}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Bid Management with submenu */}
              <Collapsible
                open={bidManagementOpen}
                onOpenChange={setBidManagementOpen}
                className="group/collapsible w-full"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={pathname.startsWith('/dashboard/bids')}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 shrink-0" />
                        <span>Bid Management</span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {bidManagementItems.map((item) => (
                      <SidebarMenuSubItem key={item.name}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === item.href}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-2"
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>

              {/* User Management - only for Group Admin and District Admin */}
              {(userData.role === 'Group Admin' ||
                userData.role === 'District Admin' ||
                hasPermission('manage_users')) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/dashboard/users')}
                  >
                    <Link
                      href="/dashboard/users"
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-5 w-5 shrink-0" />
                      <span>User Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Reports - all users can see reports */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/dashboard/reports')}
                >
                  <Link
                    href="/dashboard/reports"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-5 w-5 shrink-0" />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Documents - All users */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/dashboard/documents')}
                >
                  <Link
                    href="/dashboard/documents"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-5 w-5 shrink-0" />
                    <span>Documents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Settings with submenu */}
              <Collapsible
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                className="group/collapsible w-full"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={pathname.startsWith('/dashboard/settings')}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 shrink-0" />
                        <span>Settings</span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {settingsSubItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.name}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.href}
                        >
                          <Link
                            href={subItem.href}
                            className="flex items-center gap-2"
                          >
                            <subItem.icon className="h-4 w-4 shrink-0" />
                            <span>{subItem.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <Button variant="outline" size="sm" className="w-full justify-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
