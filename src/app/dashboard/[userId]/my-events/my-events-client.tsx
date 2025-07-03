"use client";

import { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Avatar,
  Paper,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Event,
  Search,
  OpenInNew,
  CalendarToday,
  People,
  LocationOn,
  CheckCircle,
  Schedule,
  Cancel,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";

interface EventRegistration {
  id: string;
  status: string;
  registeredAt: Date;
  attended: boolean;
  event: {
    id: string;
    title: string;
    description: string;
    coverImage?: string | null;
    startDate: Date;
    endDate?: Date | null;
    eventType: string;
    venue?: string | null;
    isOnline: boolean;
    capacity?: number | null;
    hub: {
      id: string;
      name: string;
      logo?: string | null;
    };
    _count: {
      registrations: number;
    };
  };
}

interface MyEventsClientProps {
  eventRegistrations: EventRegistration[];
  userId: string;
}

export default function MyEventsClient({
  eventRegistrations,
  userId,
}: MyEventsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = eventRegistrations.filter(
    (registration) =>
      registration.event.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      registration.event.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      registration.event.hub.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle />;
      case "PENDING":
        return <Schedule />;
      case "REJECTED":
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  const isUpcoming = (date: Date) => {
    return new Date(date) > new Date();
  };

  const isPast = (date: Date) => {
    return new Date(date) < new Date();
  };

  const upcomingEvents = filteredEvents.filter((reg) =>
    isUpcoming(reg.event.startDate)
  );
  const pastEvents = filteredEvents.filter((reg) =>
    isPast(reg.event.startDate)
  );
  const approvedEvents = filteredEvents.filter(
    (reg) => reg.status === "APPROVED"
  );

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
            My Events
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Track your event registrations and attendance
          </Typography>
        </Paper>
      </motion.div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search your events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                component={Link}
                href="/events"
                startIcon={<OpenInNew />}
              >
                Explore All Events
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Event color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {eventRegistrations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{approvedEvents.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Schedule color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{upcomingEvents.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Event color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{pastEvents.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attended
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Events Grid */}
      <Grid container spacing={3}>
        {filteredEvents.map((registration, index) => (
          <Grid item xs={12} sm={6} md={4} key={registration.id}>
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
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                {registration.event.coverImage ? (
                  <CardMedia
                    component="img"
                    height="160"
                    image={registration.event.coverImage}
                    alt={registration.event.title}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 160,
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Event sx={{ fontSize: 48, color: "white" }} />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={registration.event.hub.logo ?? undefined}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    >
                      {registration.event.hub.name[0]}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {registration.event.hub.name}
                    </Typography>
                  </Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {registration.event.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 40 }}
                  >
                    {registration.event.description.substring(0, 100)}...
                  </Typography>

                  {/* Status and Type */}
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Chip
                      icon={getStatusIcon(registration.status)}
                      label={registration.status}
                      size="small"
                      color={getStatusColor(registration.status) as any}
                    />
                    <Chip
                      label={registration.event.eventType}
                      size="small"
                      variant="outlined"
                    />
                    {isUpcoming(registration.event.startDate) && (
                      <Chip
                        label="Upcoming"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Event Details */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CalendarToday
                      sx={{ fontSize: 14, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(
                        registration.event.startDate
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>

                  {registration.event.venue && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <LocationOn
                        sx={{ fontSize: 14, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {registration.event.venue}
                      </Typography>
                    </Box>
                  )}

                  {registration.event.capacity && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <People
                        sx={{ fontSize: 14, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {registration.event._count.registrations}/
                        {registration.event.capacity} registered
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 2, display: "block" }}
                  >
                    Registered:{" "}
                    {new Date(registration.registeredAt).toLocaleDateString()}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    component={Link}
                    href={`/events/${registration.event.id}`}
                    sx={{ mt: "auto" }}
                  >
                    View Event
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Event sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {searchTerm ? "No events found" : "No events yet"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Register for events to expand your knowledge and network."}
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href="/events"
              size="large"
            >
              Explore Events
            </Button>
          </Paper>
        </motion.div>
      )}
    </Container>
  );
}
