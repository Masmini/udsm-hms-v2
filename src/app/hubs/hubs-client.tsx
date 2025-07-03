//src/app/hubs/hubs-client.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Box,
  Chip,
  Button,
  Avatar,
  Paper,
  CardActions,
  Skeleton,
} from "@mui/material";
import {
  Search,
  Group,
  Assignment,
  Event,
  School,
  PersonAdd,
  Settings,
  MoreHoriz,
  Dashboard,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useNotification } from "@/components/providers/notification-provider";
import { UserPlus } from "lucide-react";

interface Hub {
  id: string;
  name: string;
  description: string;
  logo?: string | null | undefined;
  coverImage?: string | null | undefined;
  cardBio?: string | null;
  categories: { name: string; color?: string }[];
  _count: {
    members: number;
    projects: number;
    programmes: number;
    events: number;
  };
}

interface Category {
  id: string;
  name: string;
}

interface HubsClientProps {
  hubs: Hub[];
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchParams: {
    search: string;
    category: string;
  };
}

export default function HubsClient({
  hubs,
  categories,
  pagination,
  searchParams,
}: HubsClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [search, setSearch] = useState(searchParams.search);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.category
  );
  const [hubMemberships, setHubMemberships] = useState<{ [key: string]: any }>(
    {}
  );
  const [loadingMemberships, setLoadingMemberships] = useState(true);
  const [requestingJoin, setRequestingJoin] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch user's hub memberships
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserMemberships();
    } else {
      setLoadingMemberships(false);
    }
  }, [session]);

  const fetchUserMemberships = async () => {
    try {
      setLoadingMemberships(true);
      const membershipPromises = hubs.map((hub) =>
        fetch(`/api/hubs/${hub.id}/membership?userId=${session?.user?.id}`)
          .then((res) => res.json())
          .then((data) => ({ hubId: hub.id, membership: data.data }))
      );

      const memberships = await Promise.all(membershipPromises);
      const membershipMap = memberships.reduce((acc, { hubId, membership }) => {
        acc[hubId] = membership;
        return acc;
      }, {} as { [key: string]: any });

      setHubMemberships(membershipMap);
    } catch (error) {
      console.error("Error fetching memberships:", error);
    } finally {
      setLoadingMemberships(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    params.set("page", "1");
    router.push(`/hubs?${params.toString()}`);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    params.set("page", value.toString());
    router.push(`/hubs?${params.toString()}`);
  };

  const handleJoinRequest = async (hubId: string) => {
    if (!session?.user?.id) {
      showNotification("Please sign in to join hubs", "warning");
      return;
    }

    try {
      setRequestingJoin((prev) => ({ ...prev, [hubId]: true }));

      const response = await fetch(`/api/hubs/${hubId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          message: "I would like to join this hub",
        }),
      });

      if (response.ok) {
        showNotification("Join request sent successfully!", "success");
        // Refresh memberships
        fetchUserMemberships();
      } else {
        const error = await response.json();
        showNotification(error.error || "Failed to send join request", "error");
      }
    } catch (error) {
      showNotification("Failed to send join request", "error");
    } finally {
      setRequestingJoin((prev) => ({ ...prev, [hubId]: false }));
    }
  };

  const getDashboardUrl = (hubId: string, membership: any) => {
    if (!session?.user?.id || !membership) return "";

    const role = membership.role;
    if (role === "HUB_LEADER") {
      return `/dashboard/${session.user.id}/my-hubs/${hubId}/hub-leader`;
    } else if (role === "SUPERVISOR") {
      return `/dashboard/${session.user.id}/my-hubs/${hubId}/hub-supervisor`;
    } else {
      return `/dashboard/${session.user.id}/my-hubs/${hubId}/hub-member`;
    }
  };

  const renderActionButton = (hub: Hub) => {
    if (!session?.user?.id) {
      return (
        <EnhancedButton
          variant="outlined"
          startIcon={<PersonAdd />}
          onClick={() =>
            showNotification("Please sign in to join hubs", "warning")
          }
          size="small"
          fullWidth
        >
          Request to Join
        </EnhancedButton>
      );
    }

    if (loadingMemberships) {
      return <Skeleton variant="rectangular" height={36} />;
    }

    const membership = hubMemberships[hub.id];

    if (membership && membership.isActive) {
      return (
        <EnhancedButton
          variant="contained"
          startIcon={<Dashboard />}
          onClick={() => router.push(getDashboardUrl(hub.id, membership))}
          size="small"
          fullWidth
        >
          Open Dashboard
        </EnhancedButton>
      );
    }

    return (
      <EnhancedButton
        variant="outlined"
        startIcon={<UserPlus />}
        onClick={() => handleJoinRequest(hub.id)}
        loading={requestingJoin[hub.id]}
        loadingText="Requesting..."
        size="small"
        fullWidth
      >
        Request to Join
      </EnhancedButton>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Explore Hubs
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Discover communities, connect with peers, and collaborate on amazing
            projects
          </Typography>
        </Paper>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search hubs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSearch}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Results */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="text.secondary">
          {pagination.total} hubs found
        </Typography>
      </Box>

      {/* Hubs Grid */}
      <Grid container spacing={3}>
        {hubs.map((hub, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={hub.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                {/* Cover Image or Logo */}
                {hub.coverImage ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={hub.coverImage}
                    alt={hub.name}
                    sx={{ objectFit: "cover" }}
                  />
                ) : hub.logo ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={hub.logo}
                    alt={hub.name}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "primary.main",
                      color: "white",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        fontSize: "2rem",
                        bgcolor: "primary.dark",
                      }}
                    >
                      {hub.name[0]}
                    </Avatar>
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Hub Name */}
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {hub.name}
                  </Typography>

                  {/* Hub Bio/Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      minHeight: 60,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {hub.cardBio || hub.description}
                  </Typography>

                  {/* Categories */}
                  <Box sx={{ mb: 2, minHeight: 32 }}>
                    {hub.categories.slice(0, 2).map((category) => (
                      <Chip
                        key={category.name}
                        label={category.name}
                        size="small"
                        sx={{
                          mr: 0.5,
                          mb: 0.5,
                          bgcolor: category.color || "primary.light",
                          color: "white",
                        }}
                      />
                    ))}
                    {hub.categories.length > 2 && (
                      <Chip
                        label={`+${hub.categories.length - 2}`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    )}
                  </Box>

                  {/* Stats */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Group
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {hub._count.members} members
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Assignment
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {hub._count.projects} projects
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Event
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {hub._count.events} events
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <School
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {hub._count.programmes} programmes
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>

                {/* Action Buttons */}
                <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
                  {renderActionButton(hub)}

                  <EnhancedButton
                    variant="outlined"
                    startIcon={<MoreHoriz />}
                    onClick={() => router.push(`/hubs/${hub.id}`)}
                    size="small"
                    sx={{ minWidth: "auto", px: 2 }}
                  >
                    More
                  </EnhancedButton>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {hubs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Group sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No hubs found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search criteria or browse all hubs.
            </Typography>
          </Paper>
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}
