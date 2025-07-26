'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building, LayoutDashboard, Users, FolderKanban, Settings, FileText, LogOut, ChevronDown, Home, Network } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useMode } from '@/components/mode-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const crewzenNavItems = [
  { href: '/crewzen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/crewzen/employees', label: 'Employees', icon: Users },
  { href: '/crewzen/reporting', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const prozenNavItems = [
    { href: '/prozen', label: 'Projects', icon: FolderKanban },
];

const accesszenNavItems = [
    { href: '/accesszen', label: 'Estates', icon: Home },
];

const connectzenNavItems = [
    { href: '/connectzen/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/connectzen/businessMarketplacePage', label: 'Business Marketplace', icon: Network },
];

const connectzenCompanyNavItems = [
    { href: '/connectzen/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/connectzen/businessMarketplacePage', label: 'Business Marketplace', icon: Network },
];

const UserNav = () => {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [companyProfile, setCompanyProfile] = useState<any>(null);
    
    useEffect(() => {
        async function fetchLogo() {
            if (user && (user.role === 'admin' || user.role === 'supervisor')) {
                const docSnap = await getDoc(doc(db, 'settings', 'companyInfo'));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.logoUrl) setCompanyLogo(data.logoUrl);
                }
            }
        }
        fetchLogo();
    }, [user]);

    useEffect(() => {
        if (user?.uid) {
            const fetchCompanyProfile = async () => {
                // For ConnectZen companies, fetch from connectZenCompanies collection
                if (user.role === 'company') {
                    const docRef = doc(db, 'connectZenCompanies', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setCompanyProfile(data);
                        // Set the company logo for ConnectZen companies
                        if (data.logoUrl) {
                            setCompanyLogo(data.logoUrl);
                        }
                    }
                } else {
                    // For CrewZen companies, fetch from companies collection
                    const docRef = doc(db, 'companies', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setCompanyProfile(docSnap.data());
                    }
                }
            };
            fetchCompanyProfile();
        }
    }, [user]);

    if (!user) return null;
    
    const handleSignOut = async () => {
        try {
            await signOut();
            // Always redirect to main login page for consistency
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
            // Still redirect even if there's an error
            router.push('/login');
        }
    };
    
    const fallback = (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '');
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage 
                            src={companyLogo || user.photoUrl || ''} 
                            alt={companyLogo ? 'Company Logo' : `${user.firstName} ${user.lastName}`} 
                        />
                        <AvatarFallback>
                            {user.role === 'company' ? 
                                (companyProfile?.companyName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()) :
                                (fallback || user.email?.charAt(0)?.toUpperCase())
                            }
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.role === 'company' ? 
                                (companyProfile?.companyName || user.firstName + ' ' + user.lastName) :
                                (user.firstName + ' ' + user.lastName)
                            }
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  if (user.role === 'company') {
                    router.push('/connectzen/company/profile-edit');
                  } else if (user.role === 'worker' || user.role === 'employee') {
                    router.push(`/connectzen/worker/${user.uid}/viewProfile`);
                  } else {
                    router.push('/settings');
                  }
                }}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [userChangedMode, setUserChangedMode] = useState(false);
  const [hasCrewZenModules, setHasCrewZenModules] = useState<boolean | null>(null); // null means loading
  const { user, signOut } = useAuth();
  const { mode, setMode } = useMode();

  // Check if user has CrewZen modules
  useEffect(() => {
    const checkCrewZenModules = async () => {
      if (!user?.uid) {
        setHasCrewZenModules(false);
        return;
      }

      try {
        // Check if user is a ConnectZen company
        if ((user.role as import('@/lib/types').UserRole) === 'company') {
          const crewZenDocRef = doc(db, 'crewZenModules', user.uid);
          const crewZenDoc = await getDoc(crewZenDocRef);
          setHasCrewZenModules(crewZenDoc.exists());
        } else {
          // For employees, supervisors, admins - they have access to CrewZen
          setHasCrewZenModules(true);
        }
      } catch (error) {
        console.error('Error checking CrewZen modules:', error);
        setHasCrewZenModules(false);
      }
    };

    checkCrewZenModules();
  }, [user?.uid, user?.role]);

  // Simple mode setting based on pathname (no redirects)
  useEffect(() => {
    // Skip auto-mode logic on public routes where no user is logged in
    const publicRoutes = ['/company-signup', '/worker-register', '/marketplace'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    
    // Wait until we know if the user has CrewZen modules to prevent race conditions
    if (hasCrewZenModules === null && !isPublicRoute) return;

    if (!userChangedMode && !isPublicRoute) {
      // ONLY set mode, NO navigation for company users to prevent redirect loops
      if (pathname.startsWith('/prozen') && hasCrewZenModules) {
        setMode('prozen');
      } else if (pathname.startsWith('/accesszen') && hasCrewZenModules) {
        setMode('accesszen');
      } else if (pathname.startsWith('/connectzen')) {
        setMode('connectzen');
      } else if (hasCrewZenModules) {
        setMode('crewzen');
      } else if ((user?.role as import('@/lib/types').UserRole) === 'company') {
        setMode('connectzen');
      }
    }
  }, [pathname, hasCrewZenModules, userChangedMode, user?.role]);

  // Handle mode changes from dropdown
  const handleModeChange = (newMode: 'crewzen' | 'prozen' | 'accesszen' | 'connectzen') => {
    setUserChangedMode(true);
    setMode(newMode); // Set the mode, navigation is handled below

    switch (newMode) {
      case 'crewzen':
        if (hasCrewZenModules) {
          router.push('/crewzen/dashboard');
        } else {
          // Redirect to ConnectZen if no CrewZen access
          router.push('/connectzen');
        }
        break;
      case 'prozen':
        if (hasCrewZenModules) {
          router.push('/prozen');
        } else {
          router.push('/connectzen');
        }
        break;
      case 'accesszen':
        if (hasCrewZenModules) {
          router.push('/accesszen');
        } else {
          router.push('/connectzen');
        }
        break;
      case 'connectzen':
        // For companies, always go to company dashboard
        if ((user?.role as import('@/lib/types').UserRole) === 'company') {
          router.push('/connectzen/company/dashboard');
        } else {
          router.push('/connectzen');
        }
        break;
    }
  };

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
        pathname === href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );

  const getCurrentNavItems = () => {
    // For companies with CrewZen modules, show appropriate navigation based on mode
    if ((user?.role as import('@/lib/types').UserRole) === 'company') {
      if (hasCrewZenModules) {
        switch (mode) {
          case 'crewzen':
            return crewzenNavItems;
          case 'prozen':
            return prozenNavItems;
          case 'accesszen':
            return accesszenNavItems;
          case 'connectzen':
            return connectzenCompanyNavItems; // Always use business marketplace for company
          default:
            return crewzenNavItems;
        }
      } else {
        // For companies without CrewZen modules, show ConnectZen navigation
        return connectzenCompanyNavItems;
      }
    }
    // For other roles (admin, supervisor, employee)
    switch (mode) {
      case 'crewzen':
        return crewzenNavItems;
      case 'prozen':
        return prozenNavItems;
      case 'accesszen':
        return accesszenNavItems;
      case 'connectzen':
        return connectzenNavItems; // Only non-company users see public marketplace
      default:
        return hasCrewZenModules ? crewzenNavItems : connectzenNavItems;
    }
  };

  const getDashboardNavItem = () => {
    if (!user) return null;
    // This special dashboard link should only appear in 'connectzen' mode.
    // Otherwise, the module's own nav items will provide the correct dashboard link.
    if (mode === 'connectzen') {
      if (user.role === 'company') {
        return { href: '/connectzen/company/dashboard', label: 'Dashboard', icon: LayoutDashboard };
      } else if (user.role === 'worker' || user.role === 'employee') {
        return { href: `/connectzen/worker/${user.uid}/viewProfile`, label: 'Dashboard', icon: LayoutDashboard };
      } else if (user.role === 'supplier') {
        return { href: '/connectzen/supplier/dashboard', label: 'Dashboard', icon: LayoutDashboard };
      }
    }
    return null;
  };

  const navItemsToRender = getCurrentNavItems();
  const connectZenDashboardItem = getDashboardNavItem();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Building className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">CrewZen</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            {user && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8 px-3">
                      <span className="hidden md:inline-block">
                        {mode === 'crewzen' && 'CrewZen'}
                        {mode === 'prozen' && 'ProZen'}
                        {mode === 'accesszen' && 'AccessZen'}
                        {mode === 'connectzen' && 'ConnectZen'}
                      </span>
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {/* Always show ConnectZen link */}
                    <DropdownMenuItem onClick={() => handleModeChange('connectzen')}>
                      <Network className="mr-2 h-4 w-4" />
                      ConnectZen
                    </DropdownMenuItem>
                    {/* Show CrewZen/ProZen links if company has access */}
                    {hasCrewZenModules && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleModeChange('crewzen')}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          CrewZen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleModeChange('prozen')}>
                          <FolderKanban className="mr-2 h-4 w-4" />
                          ProZen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleModeChange('accesszen')}>
                          <Home className="mr-2 h-4 w-4" />
                          AccessZen
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <nav className="hidden md:flex items-center space-x-2">
                  {/* Only render the special ConnectZen dashboard if in connectzen mode */}
                  {mode === 'connectzen' && connectZenDashboardItem && <NavLink key={connectZenDashboardItem.href} {...connectZenDashboardItem} />}
                  {/* Render the rest of the nav items, filtering out the default dashboard if the special one is shown */}
                  {navItemsToRender
                    .filter(item => (mode === 'connectzen' && connectZenDashboardItem) ? item.label !== 'Dashboard' : true)
                    .map((item) => (
                      <NavLink key={item.href} {...item} />
                    ))}
                </nav>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            {user && <UserNav />}
          </div>
        </div>
      </div>
    </header>
  );
}
