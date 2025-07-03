//src/app/hubs/[hubId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Tabs,
  Tab,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Share2,
  MoreVertical,
  Calendar,
  Users,
  FolderOpen,
  BookOpen,
  MapPin,
  Globe,
  Mail,
  UserPlus,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageLoader } from "@/components/ui/page-loader";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useNotification } from "@/components/providers/notification-provider";
import EventsSection from "@/components/hub/EventsSection";
import ProjectsSection from "@/components/hub/ProjectsSection";
import ProgrammesSection from "@/components/hub/ProgrammesSection";
import MembersSection from "@/components/hub/MembersSection";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hub-tabpanel-${index}`}
      aria-labelledby={`hub-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HubPage() {
  const { hubId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { showNotification } = useNotification();

  const [hub, setHub] = useState<any>(null);
  const [userMembership, setUserMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!hubId || typeof hubId !== "string") {
      console.error("Invalid hubId:", hubId);
      showNotification("Invalid hub ID", "error");
      setLoading(false);
      return;
    }

    fetchHubData();
  }, [hubId, session]);

  const fetchHubData = async () => {
    try {
      setLoading(true);
      const hubIdStr = Array.isArray(hubId) ? hubId[0] : hubId;
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const hubUrl = `${baseUrl}/api/hubs/${encodeURIComponent(hubIdStr)}`;
      const membershipUrl = session?.user?.id
        ? `${baseUrl}/api/hubs/${encodeURIComponent(
            hubIdStr
          )}/membership?userId=${session.user.id}`
        : null;

      console.log("Fetching hub data from:", hubUrl);
      const hubResponse = await fetch(hubUrl, {
        cache: "no-store",
        credentials: "include",
        headers: { Accept: "application/json" }, // Ensure JSON response
      });

      if (!hubResponse.ok) {
        const text = await hubResponse.text();
        console.error(
          `Hub API error: ${hubResponse.status} ${hubResponse.statusText}`,
          text.slice(0, 500) // Log more chars for debugging
        );
        throw new Error(
          `Failed to fetch hub data: ${hubResponse.status} ${hubResponse.statusText}`
        );
      }

      const hubData = await hubResponse.json();
      if (!hubData || hubData.error) {
        throw new Error(hubData?.error || "Invalid hub data");
      }
      setHub(hubData.data);

      if (membershipUrl) {
        console.log("Fetching membership data from:", membershipUrl);
        const membershipResponse = await fetch(membershipUrl, {
          cache: "no-store",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (membershipResponse.ok) {
          const membershipData = await membershipResponse.json();
          setUserMembership(membershipData.data);
        } else {
          console.warn(
            `Membership API warning: ${membershipResponse.status} ${membershipResponse.statusText}`
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching hub data:", error.message);
      showNotification(error.message || "Failed to load hub data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!session?.user?.id) {
      showNotification("Please sign in to join this hub", "warning");
      router.push("/auth/signin");
      return;
    }

    try {
      setRequesting(true);
      const hubIdStr = Array.isArray(hubId) ? hubId[0] : hubId;
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/hubs/${encodeURIComponent(hubIdStr)}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            message: "I would like to join this hub",
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        showNotification("Join request sent successfully!", "success");
        fetchHubData();
      } else {
        const error = await response.json();
        showNotification(
          error.message || "Failed to send join request",
          "error"
        );
      }
    } catch (error) {
      showNotification("Failed to send join request", "error");
    } finally {
      setRequesting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hub?.name,
          text: hub?.cardBio || hub?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showNotification("Link copied to clipboard!", "success");
    }
  };

  const getDashboardUrl = () => {
    if (!session?.user?.id || !userMembership) return "";

    const role = userMembership.role;
    const hubIdStr = Array.isArray(hubId) ? hubId[0] : hubId;
    if (role === "HUB_LEADER") {
      return `/dashboard/${session.user.id}/my-hubs/${encodeURIComponent(
        hubIdStr
      )}/hub-leader`;
    } else if (role === "SUPERVISOR") {
      return `/dashboard/${session.user.id}/my-hubs/${encodeURIComponent(
        hubIdStr
      )}/hub-supervisor`;
    } else {
      return `/dashboard/${session.user.id}/my-hubs/${encodeURIComponent(
        hubIdStr
      )}/hub-member`;
    }
  };

  if (loading) {
    return <PageLoader message="Loading hub details..." />;
  }

  if (!hub) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" textAlign="center">
          Hub not found
        </Typography>
        <Box textAlign="center" mt={2}>
          <EnhancedButton
            variant="contained"
            onClick={fetchHubData}
            disabled={loading}
          >
            Retry
          </EnhancedButton>
        </Box>
      </Container>
    );
  }

  const isHubMember = userMembership && userMembership.isActive;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hero Section */}
        <Card sx={{ mb: 4, overflow: "hidden", borderRadius: "12px" }}>
          {hub.coverImage && (
            <CardMedia
              component="img"
              height="300"
              image={hub.coverImage}
              alt={hub.name}
              sx={{
                objectFit: "cover",
                background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
              }}
            />
          )}
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
              <Avatar
                src={hub.logo}
                sx={{
                  width: 80,
                  height: 80,
                  border: "4px solid",
                  borderColor: "background.paper",
                  bgcolor: "primary.main",
                }}
              >
                {hub.name?.charAt(0)}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <div>
                    <Typography variant="h3" component="h1" gutterBottom>
                      {hub.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      {hub.cardBio || hub.description}
                    </Typography>
                  </div>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton onClick={handleShare} color="primary">
                      <Share2 size={20} />
                    </IconButton>
                    <IconButton
                      onClick={(e) => setMenuAnchor(e.currentTarget)}
                      color="primary"
                    >
                      <MoreVertical size={20} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Categories */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                  {hub.categories?.map((category: any) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      size="small"
                      sx={{
                        bgcolor: category.color || "primary.light",
                        color: "white",
                      }}
                    />
                  ))}
                </Box>

                {/* Hub Stats */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h5" color="primary.main">
                        {hub._count?.members || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Members
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h5" color="primary.main">
                        {hub._count?.projects || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Projects
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h5" color="primary.main">
                        {hub._count?.events || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Events
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h5" color="primary.main">
                        {hub._count?.programmes || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Programmes
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {isHubMember ? (
                    <EnhancedButton
                      variant="contained"
                      startIcon={<Settings size={20} />}
                      onClick={() => router.push(getDashboardUrl())}
                      size="large"
                    >
                      Open Dashboard
                    </EnhancedButton>
                  ) : (
                    <EnhancedButton
                      variant="contained"
                      startIcon={<UserPlus size={20} />}
                      onClick={handleJoinRequest}
                      loading={requesting}
                      loadingText="Sending Request..."
                      size="large"
                    >
                      Request to Join
                    </EnhancedButton>
                  )}

                  {hub.website && (
                    <EnhancedButton
                      variant="outlined"
                      startIcon={<Globe size={20} />}
                      onClick={() => window.open(hub.website, "_blank")}
                    >
                      Website
                    </EnhancedButton>
                  )}

                  {hub.contactEmail && (
                    <EnhancedButton
                      variant="outlined"
                      startIcon={<Mail size={20} />}
                      onClick={() => window.open(`mailto:${hub.contactEmail}`)}
                    >
                      Contact
                    </EnhancedButton>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Hub Details */}
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={3}>
              {hub.vision && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Vision
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hub.vision}
                  </Typography>
                </Grid>
              )}

              {hub.mission && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Mission
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hub.mission}
                  </Typography>
                </Grid>
              )}

              {hub.location && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <MapPin size={16} />
                    <Typography variant="body2">{hub.location}</Typography>
                  </Box>
                </Grid>
              )}

              {hub.establishedDate && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Established:</strong>{" "}
                    {new Date(hub.establishedDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Card sx={{ borderRadius: "12px" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ px: 2 }}
            >
              <Tab
                label="Events"
                icon={<Calendar size={20} />}
                iconPosition="start"
              />
              <Tab
                label="Projects"
                icon={<FolderOpen size={20} />}
                iconPosition="start"
              />
              <Tab
                label="Programmes"
                icon={<BookOpen size={20} />}
                iconPosition="start"
              />
              <Tab
                label="Members"
                icon={<Users size={20} />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <EventsSection hubId={hubId as string} isHubMember={isHubMember} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ProjectsSection
              hubId={hubId as string}
              isHubMember={isHubMember}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ProgrammesSection
              hubId={hubId as string}
              isHubMember={isHubMember}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <MembersSection hubId={hubId as string} />
          </TabPanel>
        </Card>

        {/* Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              const hubIdStr = Array.isArray(hubId) ? hubId[0] : hubId;
              router.push(`/hubs/${encodeURIComponent(hubIdStr)}/members`);
            }}
          >
            <Users size={16} style={{ marginRight: 8 }} />
            View All Members
          </MenuItem>
          <MenuItem onClick={handleShare}>
            <Share2 size={16} style={{ marginRight: 8 }} />
            Share Hub
          </MenuItem>
        </Menu>
      </motion.div>
    </Container>
  );
}
