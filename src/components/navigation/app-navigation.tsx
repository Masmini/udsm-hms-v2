//src/components/navigation/app-navigation.tsx
"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  Tooltip,
  Breadcrumbs,
  Chip,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Group,
  Event,
  School,
  Assignment,
  Person,
  ExitToApp,
  Home,
  AdminPanelSettings,
  LightMode,
  DarkMode,
  SettingsBrightness,
  NavigateNext,
  ArrowBack,
  Notifications,
  Settings,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../ui/theme-provider";
import { useTheme as useMUITheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavigationItem[];
}

interface BreadcrumbItem {
  label: string;
  href: string;
  isValid: boolean;
}

// Define a type for valid routes with an index signature
interface ValidRoutes {
  [key: string]: string;
}

export function AppNavigation({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const muiTheme = useMUITheme();
  const { mode, setMode, resolvedMode } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log(
        "[AppNavigation]: Session authenticated, user:",
        session.user.id
      );
      const expectedPath =
        session.user.role === "ADMIN"
          ? "/admin/dashboard"
          : `/dashboard/${session.user.id}`;
      if (
        pathname.startsWith("/auth/signin") ||
        pathname === "/dashboard" ||
        pathname === "/"
      ) {
        console.log("[AppNavigation]: Redirecting to:", expectedPath);
        router.push(expectedPath);
      }
    }
  }, [status, session, pathname, router]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } finally {
      setIsLoading(false);
      handleMenuClose();
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (href: string) => {
    setIsLoading(true);
    // Loading will be cleared by the route change
    setTimeout(() => setIsLoading(false), 2000);
  };

  const navigationItems: NavigationItem[] = [
    { label: "Home", href: "/", icon: <Home /> },
    { label: "Hubs", href: "/hubs", icon: <Group /> },
    { label: "Events", href: "/events", icon: <Event /> },
    { label: "Projects", href: "/projects", icon: <Assignment /> },
    { label: "Programmes", href: "/programmes", icon: <School /> },
  ];

  const userMenuItems = session?.user
    ? [
        {
          label: "Dashboard",
          href:
            session.user.role === "ADMIN"
              ? "/admin/dashboard"
              : `/dashboard/${session.user.id}`,
          icon: <Dashboard />,
        },
        {
          label: "Profile",
          href:
            session.user.role === "ADMIN"
              ? "/admin/profile"
              : `/dashboard/${session.user.id}/profile`,
          icon: <Person />,
        },
        ...(session.user.role === "ADMIN"
          ? [
              {
                label: "User Management",
                href: "/admin/users",
                icon: <Person />,
              },
              {
                label: "Hub Management",
                href: "/admin/hubs",
                icon: <Group />,
              },
            ]
          : []),
      ]
    : [];

  const getThemeIcon = () => {
    switch (mode) {
      case "light":
        return <LightMode />;
      case "dark":
        return <DarkMode />;
      case "system":
        return <SettingsBrightness />;
      default:
        return <SettingsBrightness />;
    }
  };

  // Define valid routes and their mappings
  const getValidRoutes = (): ValidRoutes => {
    const baseRoutes: ValidRoutes = {
      "": "Home",
      hubs: "Hubs",
      events: "Events",
      projects: "Projects",
      programmes: "Programmes",
      news: "News",
    };

    const adminRoutes: ValidRoutes = {
      "admin/dashboard": "Admin Dashboard",
      "admin/users": "User Management",
      "admin/hubs": "Hub Management",
      "admin/events": "Event Management",
      "admin/projects": "Project Management",
      "admin/programmes": "Programme Management",
      "admin/news": "News Management",
      "admin/analytics": "Analytics",
      "admin/settings": "Settings",
    };

    const userRoutes: ValidRoutes = session?.user
      ? {
          [`dashboard/${session.user.id}`]: "Dashboard",
          [`dashboard/${session.user.id}/profile`]: "Profile",
          [`dashboard/${session.user.id}/hubs`]: "My Hubs",
          [`dashboard/${session.user.id}/events`]: "My Events",
          [`dashboard/${session.user.id}/projects`]: "My Projects",
          [`dashboard/${session.user.id}/programmes`]: "My Programmes",
        }
      : {};

    return { ...baseRoutes, ...adminRoutes, ...userRoutes };
  };

  const findValidParentRoute = (segments: string[]): string => {
    const validRoutes = getValidRoutes();

    // Try to find the longest valid parent route
    for (let i = segments.length - 1; i >= 0; i--) {
      const testPath = segments.slice(0, i).join("/");
      if (testPath in validRoutes) {
        return `/${testPath}`;
      }
    }

    // Special handling for admin routes
    if (segments[0] === "admin") {
      return "/admin/dashboard";
    }

    // Fallback to appropriate dashboard based on user role
    if (session?.user) {
      if (session.user.role === "ADMIN") {
        return "/admin/dashboard";
      } else {
        return `/dashboard/${session.user.id}`;
      }
    }

    // Final fallback to home
    return "/";
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", href: "/", isValid: true },
    ];
    const validRoutes = getValidRoutes();

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += currentPath ? `/${segment}` : segment;

      // Check if this route is valid
      const isValid = currentPath in validRoutes;
      let label =
        validRoutes[currentPath] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
      let href = `/${currentPath}`;

      // Handle special cases for dynamic routes
      if (!isValid) {
        // For invalid routes, find the nearest valid parent
        const parentPath = findValidParentRoute(
          pathSegments.slice(0, index + 1)
        );
        href = parentPath;

        // Format the label nicely
        if (segment.includes("-")) {
          label = segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        } else {
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
        }
      }

      breadcrumbs.push({
        label,
        href,
        isValid,
      });
    });

    return breadcrumbs;
  };

  const canGoBack = () => {
    return navigationHistory.length > 1;
  };

  const goBack = () => {
    if (canGoBack()) {
      window.history.back();
    }
  };

  const handleBreadcrumbClick = (breadcrumb: BreadcrumbItem) => {
    if (breadcrumb.isValid) {
      router.push(breadcrumb.href);
    } else {
      // Navigate to the valid parent route
      const segments = pathname.split("/").filter(Boolean);
      const validParent = findValidParentRoute(segments);
      router.push(validParent);
    }
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Image src="/logo.png" alt="UDSM Logo" width={40} height={40} />
          <Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
            UDSM HUBS
          </Typography>
        </Box>
        {session?.user && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Avatar
                src={session.user.profilePicture || undefined}
                sx={{ width: 32, height: 32, mr: 1 }}
              >
                {session.user.firstName[0]}
                {session.user.lastName[0]}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {session.user.firstName} {session.user.lastName}
                </Typography>
                <Chip
                  label={session.user.role}
                  size="small"
                  color={session.user.role === "ADMIN" ? "error" : "primary"}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.label}
            component={Link}
            href={item.href}
            onClick={() => {
              setMobileOpen(false);
              handleNavigation(item.href);
            }}
            sx={{
              color: pathname === item.href ? "primary.main" : "text.primary",
              bgcolor:
                pathname === item.href ? "action.selected" : "transparent",
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              "&:hover": {
                bgcolor: "action.hover",
                transform: "translateX(4px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: pathname === item.href ? "bold" : "normal",
              }}
            />
            {pathname === item.href && (
              <Box
                sx={{
                  width: 4,
                  height: 20,
                  bgcolor: "primary.main",
                  borderRadius: 2,
                }}
              />
            )}
          </ListItem>
        ))}

        {session?.user && (
          <>
            <Box sx={{ borderTop: 1, borderColor: "divider", mt: 2, pt: 2 }} />
            {userMenuItems.map((item) => (
              <ListItem
                key={item.label}
                component={Link}
                href={item.href}
                onClick={() => {
                  setMobileOpen(false);
                  handleNavigation(item.href);
                }}
                sx={{
                  color:
                    pathname === item.href ? "primary.main" : "text.primary",
                  bgcolor:
                    pathname === item.href ? "action.selected" : "transparent",
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  "&:hover": {
                    bgcolor: "action.hover",
                    transform: "translateX(4px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: pathname === item.href ? "bold" : "normal",
                  }}
                />
                {pathname === item.href && (
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      bgcolor: "primary.main",
                      borderRadius: 2,
                    }}
                  />
                )}
              </ListItem>
            ))}

            <ListItem
              onClick={handleSignOut}
              disabled={isLoading}
              sx={{
                cursor: "pointer",
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                "&:hover": {
                  bgcolor: "action.hover",
                  transform: "translateX(4px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ListItemIcon>
                {isLoading ? <CircularProgress size={20} /> : <ExitToApp />}
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItem>
          </>
        )}

        {/* Theme Selector in Mobile Drawer */}
        <Box sx={{ borderTop: 1, borderColor: "divider", mt: 2, pt: 2, px: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            Theme
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              size="small"
              variant={mode === "light" ? "contained" : "outlined"}
              startIcon={<LightMode />}
              onClick={() => setMode("light")}
              fullWidth
              sx={{ justifyContent: "flex-start" }}
            >
              Light
            </Button>
            <Button
              size="small"
              variant={mode === "dark" ? "contained" : "outlined"}
              startIcon={<DarkMode />}
              onClick={() => setMode("dark")}
              fullWidth
              sx={{ justifyContent: "flex-start" }}
            >
              Dark
            </Button>
            <Button
              size="small"
              variant={mode === "system" ? "contained" : "outlined"}
              startIcon={<SettingsBrightness />}
              onClick={() => setMode("system")}
              fullWidth
              sx={{ justifyContent: "flex-start" }}
            >
              System
            </Button>
          </Box>
        </Box>
      </List>
    </Box>
  );

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Main Navigation Bar */}
      <AppBar position="sticky" elevation={1} sx={{ zIndex: 1201 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Image src="/logo.png" alt="UDSM Logo" width={40} height={40} />
            <Typography
              variant="h6"
              component={Link}
              href="/"
              onClick={() => handleNavigation("/")}
              sx={{
                ml: 1,
                textDecoration: "none",
                color: "inherit",
                fontWeight: "bold",
              }}
            >
              UDSM HUBS
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  color="inherit"
                  component={Link}
                  href={item.href}
                  onClick={() => handleNavigation(item.href)}
                  startIcon={item.icon}
                  sx={{
                    color:
                      pathname === item.href ? "secondary.main" : "inherit",
                    fontWeight: pathname === item.href ? "bold" : "normal",
                    bgcolor:
                      pathname === item.href
                        ? "action.selected"
                        : "transparent",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    "&:hover": {
                      bgcolor: "action.hover",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
            {/* Back Button */}
            {canGoBack() && !isMobile && (
              <Tooltip title="Go back">
                <IconButton
                  color="inherit"
                  onClick={goBack}
                  sx={{
                    "&:hover": {
                      bgcolor: "action.hover",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ArrowBack />
                </IconButton>
              </Tooltip>
            )}

            {/* Notifications */}
            {session?.user && (
              <Tooltip title="Notifications">
                <IconButton
                  color="inherit"
                  onClick={handleNotificationMenuOpen}
                  sx={{
                    "&:hover": {
                      bgcolor: "action.hover",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Notifications />
                </IconButton>
              </Tooltip>
            )}

            {/* Theme Toggle Button */}
            {!isMobile && (
              <Tooltip title={`Current theme: ${mode}`}>
                <IconButton
                  color="inherit"
                  onClick={handleThemeMenuOpen}
                  sx={{
                    "&:hover": {
                      bgcolor: "action.hover",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {getThemeIcon()}
                </IconButton>
              </Tooltip>
            )}

            {status === "loading" ? (
              <Skeleton variant="circular" width={40} height={40} />
            ) : session?.user ? (
              <>
                <Tooltip
                  title={`${session.user.firstName} ${session.user.lastName}`}
                >
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{
                      p: 0,
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Avatar
                      src={session.user.profilePicture || undefined}
                      alt={session.user.firstName}
                      sx={{
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        border: "2px solid",
                        borderColor: "background.paper",
                      }}
                    >
                      {session.user.firstName[0]}
                      {session.user.lastName[0]}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                {/* Profile Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{
                    sx: {
                      bgcolor: "background.paper",
                      color: "text.primary",
                      minWidth: 200,
                      mt: 1,
                    },
                  }}
                >
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {session.user.firstName} {session.user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {session.user.email}
                    </Typography>
                    <Chip
                      label={session.user.role}
                      size="small"
                      color={
                        session.user.role === "ADMIN" ? "error" : "primary"
                      }
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  {userMenuItems.map((item) => (
                    <MenuItem
                      key={item.label}
                      component={Link}
                      href={item.href}
                      onClick={() => handleNavigation(item.href)}
                      sx={{
                        color: "text.primary",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      {item.icon}
                      <Typography sx={{ ml: 1 }}>{item.label}</Typography>
                    </MenuItem>
                  ))}

                  <MenuItem
                    onClick={handleSignOut}
                    disabled={isLoading}
                    sx={{
                      color: "error.main",
                      "&:hover": {
                        bgcolor: "error.light",
                        color: "error.contrastText",
                      },
                    }}
                  >
                    {isLoading ? <CircularProgress size={20} /> : <ExitToApp />}
                    <Typography sx={{ ml: 1 }}>Sign Out</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  color="inherit"
                  component={Link}
                  href="/auth/signin"
                  onClick={() => handleNavigation("/auth/signin")}
                  sx={{
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  component={Link}
                  href="/auth/signup"
                  onClick={() => handleNavigation("/auth/signup")}
                  sx={{
                    "&:hover": {
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Fixed Breadcrumbs Navigation Bar */}
      {!isAuthPage && pathname !== "/" && (
        <Box
          sx={{
            position: "sticky",
            top: 64, // Height of the main AppBar
            zIndex: 1200,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <Box sx={{ px: { xs: 2, md: 3 }, py: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Back Button for Mobile */}
              {canGoBack() && isMobile && (
                <Tooltip title="Go back">
                  <IconButton
                    size="small"
                    onClick={goBack}
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        bgcolor: "action.hover",
                        color: "primary.main",
                      },
                    }}
                  >
                    <ArrowBack fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* Breadcrumbs */}
              <Breadcrumbs
                separator={<NavigateNext fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ flexGrow: 1 }}
              >
                {generateBreadcrumbs().map((crumb, index, array) => (
                  <Box key={`${crumb.href}-${index}`}>
                    {index === array.length - 1 ? (
                      <Typography
                        color="text.primary"
                        fontWeight="bold"
                        sx={{
                          fontSize: { xs: "0.875rem", md: "1rem" },
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {crumb.label}
                        {!crumb.isValid && (
                          <Chip
                            label="Invalid"
                            size="small"
                            color="warning"
                            sx={{ ml: 1, fontSize: "0.7rem" }}
                          />
                        )}
                      </Typography>
                    ) : (
                      <Box
                        onClick={() => handleBreadcrumbClick(crumb)}
                        sx={{
                          cursor: "pointer",
                          color: crumb.isValid
                            ? "text.secondary"
                            : "warning.main",
                          textDecoration: "none",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.875rem", md: "1rem" },
                            display: "flex",
                            alignItems: "center",
                            "&:hover": {
                              color: "primary.main",
                              textDecoration: "underline",
                            },
                            transition: "color 0.2s ease",
                          }}
                        >
                          {crumb.label}
                          {!crumb.isValid && (
                            <Chip
                              label="→"
                              size="small"
                              color="warning"
                              sx={{ ml: 1, fontSize: "0.7rem" }}
                            />
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Breadcrumbs>

              {/* Current Page Indicator */}
              <Chip
                label="Current"
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  display: { xs: "none", md: "flex" },
                  fontSize: "0.75rem",
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Theme Menu */}
      <Menu
        anchorEl={themeMenuAnchor}
        open={Boolean(themeMenuAnchor)}
        onClose={handleThemeMenuClose}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            minWidth: 150,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setMode("light");
            handleThemeMenuClose();
          }}
          sx={{
            color: mode === "light" ? "primary.main" : "text.primary",
            fontWeight: mode === "light" ? "bold" : "normal",
          }}
        >
          <LightMode sx={{ mr: 1 }} />
          Light
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMode("dark");
            handleThemeMenuClose();
          }}
          sx={{
            color: mode === "dark" ? "primary.main" : "text.primary",
            fontWeight: mode === "dark" ? "bold" : "normal",
          }}
        >
          <DarkMode sx={{ mr: 1 }} />
          Dark
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMode("system");
            handleThemeMenuClose();
          }}
          sx={{
            color: mode === "system" ? "primary.main" : "text.primary",
            fontWeight: mode === "system" ? "bold" : "normal",
          }}
        >
          <SettingsBrightness sx={{ mr: 1 }} />
          System
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            minWidth: 300,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No new notifications
          </Typography>
        </Box>
      </Menu>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 250,
            bgcolor: "background.paper",
            color: "text.primary",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <Box
              sx={{
                bgcolor: "background.paper",
                p: 3,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                boxShadow: 4,
              }}
            >
              <CircularProgress size={24} />
              <Typography>Loading...</Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          // Add top margin to account for fixed breadcrumbs when they're visible
          mt: !isAuthPage && pathname !== "/" ? 0 : 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
