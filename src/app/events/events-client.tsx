//src/app/events/events-client.tsx
// src/app/events/events-client.tsx
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
  IconButton,
} from "@mui/material";
import {
  Search,
  Event,
  CalendarToday,
  People,
  LocationOn,
  Share,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Event {
  id: string;
  title: string;
  description: string;
  coverImage?: string | null;
  startDate: Date;
  endDate?: Date | null;
  eventType: string;
  capacity?: number | null;
  visibility: string;
  hub: {
    id: string;
    name: string;
    logo?: string | null;
  };
  registrations: { status: string }[];
  _count: {
    registrations: number;
  };
}

interface EventsClientProps {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchParams: {
    search: string;
    eventType: string;
    upcoming: string;
  };
}

const eventTypes = [
  "Workshop",
  "Seminar",
  "Conference",
  "Networking",
  "Competition",
  "Training",
  "Webinar",
  "Other",
];

export default function EventsClient({
  events,
  pagination,
  searchParams,
}: EventsClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState(searchParams.search);
  const [selectedEventType, setSelectedEventType] = useState(
    searchParams.eventType
  );
  const [upcomingOnly, setUpcomingOnly] = useState(
    searchParams.upcoming === "true"
  );
  const [hubLeaderMap, setHubLeaderMap] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Fetch hub leader status for the user
  useEffect(() => {
    const fetchHubLeaderStatus = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(
            `/api/users/${session.user.id}/hub-members`
          );
          if (response.ok) {
            const hubMembers = await response.json();
            const leaderMap: { [key: string]: boolean } = {};
            hubMembers.forEach((member: { hubId: string; role: string }) => {
              if (member.role === "HUB_LEADER") {
                leaderMap[member.hubId] = true;
              }
            });
            setHubLeaderMap(leaderMap);
          }
        } catch (error) {
          console.error("Error fetching hub leader status:", error);
        }
      }
    };
    fetchHubLeaderStatus();
  }, [session?.user?.id]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedEventType) params.set("eventType", selectedEventType);
    if (upcomingOnly) params.set("upcoming", "true");
    params.set("page", "1");
    router.push(`/events?${params.toString()}`);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedEventType) params.set("eventType", selectedEventType);
    if (upcomingOnly) params.set("upcoming", "true");
    params.set("page", value.toString());
    router.push(`/events?${params.toString()}`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = (date: Date) => {
    return date > new Date();
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
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Discover Events
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Join workshops, seminars, and networking events to expand your
            knowledge and connections
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search events..."
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  label="Event Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={upcomingOnly ? "upcoming" : "all"}
                  onChange={(e) =>
                    setUpcomingOnly(e.target.value === "upcoming")
                  }
                  label="Filter"
                >
                  <MenuItem value="all">All Events</MenuItem>
                  <MenuItem value="upcoming">Upcoming Only</MenuItem>
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
          {pagination.total} events found
        </Typography>
      </Box>

      {/* Events Grid */}
      <Grid container spacing={3}>
        {events.map((event, index) => {
          const isHubLeader = hubLeaderMap[event.hub.id];
          const isAdmin = session?.user?.role === "ADMIN";
          const showRegisterButton =
            !isHubLeader && !isAdmin && isUpcoming(event.startDate);

          return (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
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
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                  component={Link}
                  href={`/events/${event.id}`}
                >
                  {event.coverImage ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={event.coverImage}
                      alt={event.title}
                      sx={{ objectFit: "cover" }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Event sx={{ fontSize: 64, color: "white" }} />
                    </Box>
                  )}

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={event.hub.logo ?? undefined}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      >
                        {event.hub.name[0]}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {event.hub.name}
                      </Typography>
                    </Box>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {event.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 40 }}
                    >
                      {event.description.substring(0, 100)}...
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={event.eventType}
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      {isUpcoming(event.startDate) && (
                        <Chip
                          label="Upcoming"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarToday
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(event.startDate)}
                      </Typography>
                    </Box>

                    {event.capacity && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <People
                          sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {event._count.registrations}/{event.capacity}{" "}
                          registered
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                      }}
                    >
                      {isAdmin ? (
                        <Button
                          variant="contained"
                          size="small"
                          component={Link}
                          href={`/events/${event.id}`}
                        >
                          View
                        </Button>
                      ) : isHubLeader ? (
                        <Button
                          variant="contained"
                          size="small"
                          component={Link}
                          href={`/dashboard/${session?.user?.id}/my-hubs/${event.hub.id}/hub-leader?section=events&eventId=${event.id}`}
                        >
                          Manage
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!showRegisterButton}
                        >
                          {isUpcoming(event.startDate)
                            ? "Register"
                            : "Past Event"}
                        </Button>
                      )}
                      <IconButton size="small">
                        <Share />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {events.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Event sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No events found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search criteria or check back later for new
              events.
            </Typography>
          </Paper>
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ mt: 4 }}>
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
