'use client';

import {
  hasRole,
  getUserEntities,
  canAccessUserManagement,
  hasBidPermission,
  hasBidRole,
} from '@/types/user';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  Eye,
  FileText,
  Home,
  PanelLeft,
  PanelRight,
  Settings,
  UserCog,
  Users,
  Wrench,
  UserPlus,
  Tags,
  Building,
  School,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';
import { LoginResponseUser } from '@/types/auth';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  submenu?: boolean;
  submenuItems?: NavigationItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  userData: LoginResponseUser;
  organizationLogo?: string | null;
  primaryColor?: string;
}

export function DashboardSidebar({
  collapsed,
  onToggle,
  userData,
  organizationLogo,
  primaryColor = '#1e40af',
}: SidebarProps) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bidManagementOpen, setBidManagementOpen] = useState(false);
  const [organizationsOpen, setOrganizationsOpen] = useState(false);

  // Check if user is only a Bid Viewer (no Bid Administrator roles and not a bid manager)
  const isOnlyBidViewer = () => {
    // Check if user has any Bid Administrator roles
    const hasBidAdminRole = hasBidRole(userData, 'Bid Administrator');

    // Check if user is a bid manager for any bids
    const isBidManagerForAny =
      userData.manageBids && userData.manageBids.length > 0;

    // Check if user has any Bid Viewer roles
    const hasBidViewerRole = hasBidRole(userData, 'Bid Viewer');

    // Return true if user is only a Bid Viewer (has Bid Viewer role but no admin roles or bid manager assignments)
    return hasBidViewerRole && !hasBidAdminRole && !isBidManagerForAny;
  };

  // Determine which navigation items to show based on user roles and permissions
  const getNavigationItems = (): NavigationItem[] => {
    // All users can see the dashboard
    const items: NavigationItem[] = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
    ];

    // Check if user has access to any co-op (either directly or through district/school)
    const hasCoopAccess = userData.roles.some(
      (role) =>
        role.scope.type === 'coop' ||
        (role.scope.type === 'district' &&
          String(role.scope.id).startsWith('district-')) ||
        (role.scope.type === 'school' &&
          String(role.scope.id).startsWith('school-'))
    );

    // if (hasCoopAccess) {
    //   items.push({
    //     name: 'Group',
    //     href: '/dashboard/districts',
    //     icon: Users,
    //   });
    // }

    // Get all districts the user has access to (either directly or through school)
    // const hasDistrictAccess = userData.roles.some(
    //   (role) => role.scope.type === 'district' || role.scope.type === 'school'
    // );

    // If user has access to any district, show "District" option
    if (userData.districtId) {
      // Get the first district ID the user has direct access to
      //   const userDistricts = getUserEntities(userData, 'district');
      //   const districtId =
      //     userDistricts.length > 0 ? userDistricts[0].id : 'district-1'; // Fallback to district-1

      items.push({
        name: 'My District',
        href: `/dashboard/districts/${userData.districtId}`,
        icon: Building,
      });
    }

    if (userData.cooperativeId) {
      items.push({
        name: 'My Cooperative',
        href: '/dashboard/districts',
        icon: Users,
      });
    }

    // If user can access user management, show the User Management link
    if (canAccessUserManagement(userData)) {
      items.push({
        name: 'User Management',
        href: '/dashboard/users',
        icon: UserPlus,
      });
    }

    // Bid Management/Information - show for all users
    // Change name to "Bid Information" for users who are only Bid Viewers
    items.push({
      name: isOnlyBidViewer() ? 'Bid Information' : 'Bid Management',
      href: '/dashboard/bids',
      icon: ClipboardList,
      submenu: true,
      submenuItems: getBidManagementItems(),
    });

    // Reports - all users can see reports
    items.push({
      name: 'Reports',
      href: '/dashboard/reports',
      icon: BarChart3,
    });

    // Documents - All users
    items.push({
      name: 'Documents',
      href: '/dashboard/documents',
      icon: FileText,
    });

    return items;
  };

  // Determine which bid management submenu items to show based on user role
  const getBidManagementItems = (): NavigationItem[] => {
    const items: NavigationItem[] = [];

    // Single "Bids" item for all users
    items.push({
      name: 'Bids',
      href: '/dashboard/bids/all',
      icon: Eye,
    });

    // Bid Items - for users with bid manager or bid admin permissions
    if (
      hasBidPermission(userData, 'edit_bids') ||
      userData.manageBids?.length > 0
    ) {
      items.push({
        name: 'All Bid Items',
        href: '/dashboard/bids/items',
        icon: ClipboardList,
      });
    }

    // Bid Categories - for users with bid edit permissions
    if (
      hasBidPermission(userData, 'create_bids') ||
      hasBidPermission(userData, 'edit_bids')
    ) {
      items.push({
        name: 'Bid Categories',
        href: '/dashboard/bid-categories',
        icon: Tags,
      });
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  // Settings submenu items - all users can see account settings
  const settingsSubItems = [
    { name: 'Account Settings', href: '/dashboard/settings', icon: UserCog },
  ];

  // Only Group Admin and District Admin can see Organization Settings
  if (hasRole(userData, 'Group Admin') || hasRole(userData, 'District Admin')) {
    settingsSubItems.push({
      name: 'Organization Settings',
      href: '/dashboard/settings/organization',
      icon: Wrench,
    });
  }

  // Helper function to determine if a nav item is active
  const isNavItemActive = (href: string): boolean => {
    // Special case for User Management - don't highlight Bid Management
    if (href === '/dashboard/bids' && pathname === '/dashboard/bids/team') {
      return false;
    }

    // Special case for User Management - highlight it correctly
    if (
      href === '/dashboard/bids/team' &&
      pathname === '/dashboard/bids/team'
    ) {
      return true;
    }

    // Exact match for dashboard home
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }

    // Special case for My Organizations - highlight when on any organization page
    if (
      href === '/dashboard/organizations' &&
      (pathname === '/dashboard/districts' ||
        pathname.startsWith('/dashboard/districts/') ||
        pathname.startsWith('/dashboard/schools/'))
    ) {
      return true;
    }

    // Special case for Group - only highlight when on the districts page
    if (
      href === '/dashboard/districts' &&
      pathname === '/dashboard/districts'
    ) {
      return true;
    }

    // Special case for District - highlight when on any district detail page
    if (
      href.startsWith('/dashboard/districts/') &&
      pathname.startsWith('/dashboard/districts/') &&
      pathname !== '/dashboard/districts'
    ) {
      // If this is the District link
      if (
        href.includes(
          getUserEntities(userData, 'district')[0]?.id.toString() || ''
        )
      ) {
        return true;
      }
    }

    // Special case for School - highlight when on any school detail page
    if (
      href.startsWith('/dashboard/schools/') &&
      pathname.startsWith('/dashboard/schools/')
    ) {
      // If this is the School link
      if (
        href.includes(
          getUserEntities(userData, 'school')[0]?.id.toString() || ''
        )
      ) {
        return true;
      }
    }

    // Special case for Bid Categories - highlight when on the bid categories page
    if (
      href === '/dashboard/bid-categories' &&
      (pathname === '/dashboard/bid-categories' ||
        pathname.startsWith('/dashboard/bid-categories/'))
    ) {
      return true;
    }

    // For other sections, check if the current path is in that section
    // but not if it's just the dashboard root
    if (
      href !== '/dashboard' &&
      href !== '/dashboard/districts' &&
      !href.startsWith('/dashboard/districts/') &&
      !href.startsWith('/dashboard/schools/') &&
      pathname.startsWith(href)
    ) {
      return true;
    }

    return false;
  };

  // Helper function to determine if a submenu should be open
  const isSubmenuActive = (href: string): boolean => {
    if (href === '/dashboard/organizations') {
      return (
        pathname === '/dashboard/districts' ||
        pathname.startsWith('/dashboard/districts/') ||
        pathname.startsWith('/dashboard/schools/')
      );
    }

    if (href === '/dashboard/bids') {
      return (
        pathname.startsWith('/dashboard/bids') ||
        pathname.startsWith('/dashboard/bid-categories') ||
        pathname === '/dashboard/bid-categories'
      );
    }

    return false;
  };

  // Custom active styles based on theme color
  const getActiveStyles = (isActive: boolean) => {
    if (isActive) {
      return {
        backgroundColor: `${primaryColor}10`,
        color: primaryColor,
        borderColor: primaryColor,
      };
    }
    return {};
  };

  // Auto-expand submenus if we're on a relevant page
  useEffect(() => {
    // Auto-expand bid management
    if (
      pathname.includes('/dashboard/bids') &&
      pathname !== '/dashboard/bids/team' &&
      !bidManagementOpen
    ) {
      setBidManagementOpen(true);
    }

    // Auto-expand organizations
    if (
      (pathname === '/dashboard/districts' ||
        pathname.startsWith('/dashboard/districts/') ||
        pathname.startsWith('/dashboard/schools/')) &&
      !organizationsOpen
    ) {
      setOrganizationsOpen(true);
    }
  }, [pathname]);

  return (
    <div
      className={`h-screen bg-white border-r flex flex-col transition-all duration-300 overflow-y-auto ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Only show logo section when not collapsed */}
      {!collapsed && (
        <>
          <div className="p-5 flex justify-center bg-white">
            {organizationLogo ? (
              <img
                src={organizationLogo || '/placeholder.svg'}
                alt="Organization logo"
                className="h-auto max-h-[80px] max-w-[220px]"
                onError={(e) => {
                  console.warn('Organization logo failed to load in sidebar');
                  e.currentTarget.src = '/bid_pro_logo.png'; // Fallback to default logo
                  e.currentTarget.onerror = null; // Prevent infinite error loop
                }}
              />
            ) : (
              <div className="flex justify-center items-center">
                <img
                  src="/images/bid_pro_logo.png"
                  alt="BidPro by Food For Schools Logo"
                  width="220"
                  height="80"
                  style={{ width: '220px', height: 'auto' }}
                  className="h-auto"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/bidpro-logo.png';
                  }}
                />
              </div>
            )}
          </div>
          <div className="border-b"></div>
        </>
      )}

      <div className="flex-1 overflow-y-auto py-4">
        {!collapsed ? (
          <div className="px-3 mb-2 flex items-center justify-between">
            <h2
              className="px-4 text-xs font-semibold uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              Menu
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-500 hover:bg-blue-50 cursor-pointer"
              onClick={onToggle}
              title="Collapse sidebar"
              style={{ color: primaryColor }}
            >
              <PanelLeft size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center mb-4 mt-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:bg-blue-50 cursor-pointer"
              onClick={onToggle}
              title="Expand sidebar"
              style={{ color: primaryColor }}
            >
              <PanelRight size={18} />
            </Button>
          </div>
        )}
        <nav className="space-y-1 px-3">
          <TooltipProvider>
            {/* Main navigation items */}
            {navigationItems.map((item) => {
              if (item.submenu) {
                // Items with submenu (Organizations, Bid Management)
                const isActive = isSubmenuActive(item.href);
                const isOpen =
                  item.href === '/dashboard/organizations'
                    ? organizationsOpen
                    : item.href === '/dashboard/bids'
                    ? bidManagementOpen
                    : false;

                const toggleSubmenu = () => {
                  if (item.href === '/dashboard/organizations') {
                    setOrganizationsOpen(!organizationsOpen);
                  } else if (item.href === '/dashboard/bids') {
                    setBidManagementOpen(!bidManagementOpen);
                  }
                };

                return (
                  <div key={item.name} className="mt-1">
                    {collapsed ? (
                      <>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => !collapsed && toggleSubmenu()}
                              className={`flex items-center justify-center h-10 w-10 rounded-md transition-colors mx-auto cursor-pointer ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                              }`}
                              style={getActiveStyles(isActive)}
                            >
                              <item.icon
                                className={`h-5 w-5 ${
                                  isActive ? 'text-blue-500' : 'text-gray-500'
                                }`}
                                style={{
                                  color: isActive ? primaryColor : undefined,
                                }}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.name}</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Submenu items as separate tooltips when collapsed */}
                        {item.submenuItems &&
                          item.submenuItems.map((subItem) => (
                            <Tooltip key={subItem.name} delayDuration={300}>
                              <TooltipTrigger asChild>
                                <Link
                                  href={subItem.href}
                                  className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors mx-auto mt-1 cursor-pointer ${
                                    isNavItemActive(subItem.href)
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                  }`}
                                  style={getActiveStyles(
                                    isNavItemActive(subItem.href)
                                  )}
                                >
                                  <subItem.icon
                                    className={`h-4 w-4 ${
                                      isNavItemActive(subItem.href)
                                        ? 'text-blue-500'
                                        : 'text-gray-500'
                                    }`}
                                    style={{
                                      color: isNavItemActive(subItem.href)
                                        ? primaryColor
                                        : undefined,
                                    }}
                                  />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>{subItem.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                      </>
                    ) : (
                      <div className="mt-1">
                        <button
                          onClick={() => toggleSubmenu()}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 pl-3'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                          style={
                            isActive
                              ? {
                                  backgroundColor: `${primaryColor}10`,
                                  color: primaryColor,
                                  borderLeftColor: primaryColor,
                                }
                              : {}
                          }
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              className={`h-5 w-5 flex-shrink-0 ${
                                isActive ? 'text-blue-500' : 'text-gray-500'
                              }`}
                              style={{
                                color: isActive ? primaryColor : undefined,
                              }}
                            />
                            <span>{item.name}</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {/* Submenu */}
                        {isOpen && item.submenuItems && (
                          <div className="ml-6 mt-1 border-l border-gray-200 pl-3 space-y-1">
                            {item.submenuItems.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                  isNavItemActive(subItem.href)
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                                style={getActiveStyles(
                                  isNavItemActive(subItem.href)
                                )}
                              >
                                <subItem.icon
                                  className={`h-4 w-4 flex-shrink-0 ${
                                    isNavItemActive(subItem.href)
                                      ? 'text-blue-500'
                                      : 'text-gray-500'
                                  }`}
                                  style={{
                                    color: isNavItemActive(subItem.href)
                                      ? primaryColor
                                      : undefined,
                                  }}
                                />
                                <span>{subItem.name}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Regular navigation items
                return collapsed ? (
                  <Tooltip key={item.name} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-center h-10 w-10 rounded-md transition-colors mx-auto cursor-pointer ${
                          isNavItemActive(item.href)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                        style={getActiveStyles(isNavItemActive(item.href))}
                      >
                        <item.icon
                          className={`h-5 w-5 ${
                            isNavItemActive(item.href)
                              ? 'text-blue-500'
                              : 'text-gray-500'
                          }`}
                          style={{
                            color: isNavItemActive(item.href)
                              ? primaryColor
                              : undefined,
                          }}
                        />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      isNavItemActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 pl-3'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                    style={
                      isNavItemActive(item.href)
                        ? {
                            backgroundColor: `${primaryColor}10`,
                            color: primaryColor,
                            borderLeftColor: primaryColor,
                          }
                        : {}
                    }
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        isNavItemActive(item.href)
                          ? 'text-blue-500'
                          : 'text-gray-500'
                      }`}
                      style={{
                        color: isNavItemActive(item.href)
                          ? primaryColor
                          : undefined,
                      }}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              }
            })}

            {/* Settings with submenu */}
            <div className="mt-1">
              {collapsed ? (
                <>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          !collapsed && setSettingsOpen(!settingsOpen)
                        }
                        className={`flex items-center justify-center h-10 w-10 rounded-md transition-colors mx-auto cursor-pointer ${
                          pathname.startsWith('/dashboard/settings')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                        style={getActiveStyles(
                          pathname.startsWith('/dashboard/settings')
                        )}
                      >
                        <Settings
                          className={`h-5 w-5 ${
                            pathname.startsWith('/dashboard/settings')
                              ? 'text-blue-500'
                              : 'text-gray-500'
                          }`}
                          style={{
                            color: pathname.startsWith('/dashboard/settings')
                              ? primaryColor
                              : undefined,
                          }}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Settings sub-items as separate tooltips when collapsed */}
                  {settingsSubItems.map((subItem) => (
                    <Tooltip key={subItem.name} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Link
                          href={subItem.href}
                          className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors mx-auto mt-1 cursor-pointer ${
                            pathname === subItem.href
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                          style={getActiveStyles(pathname === subItem.href)}
                        >
                          <subItem.icon
                            className={`h-4 w-4 ${
                              pathname === subItem.href
                                ? 'text-blue-500'
                                : 'text-gray-500'
                            }`}
                            style={{
                              color:
                                pathname === subItem.href
                                  ? primaryColor
                                  : undefined,
                            }}
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{subItem.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </>
              ) : (
                <div className="mt-1">
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      pathname.startsWith('/dashboard/settings')
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 pl-3'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                    style={
                      pathname.startsWith('/dashboard/settings')
                        ? {
                            backgroundColor: `${primaryColor}10`,
                            color: primaryColor,
                            borderLeftColor: primaryColor,
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Settings
                        className={`h-5 w-5 flex-shrink-0 ${
                          pathname.startsWith('/dashboard/settings')
                            ? 'text-blue-500'
                            : 'text-gray-500'
                        }`}
                        style={{
                          color: pathname.startsWith('/dashboard/settings')
                            ? primaryColor
                            : undefined,
                        }}
                      />
                      <span>Settings</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        settingsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Settings submenu */}
                  {settingsOpen && (
                    <div className="ml-6 mt-1 border-l border-gray-200 pl-3 space-y-1">
                      {settingsSubItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                            pathname === subItem.href
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                          style={getActiveStyles(pathname === subItem.href)}
                        >
                          <subItem.icon
                            className={`h-4 w-4 flex-shrink-0 ${
                              pathname === subItem.href
                                ? 'text-blue-500'
                                : 'text-gray-500'
                            }`}
                            style={{
                              color:
                                pathname === subItem.href
                                  ? primaryColor
                                  : undefined,
                            }}
                          />
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TooltipProvider>
        </nav>
      </div>

      <div className="border-t"></div>
    </div>
  );
}
