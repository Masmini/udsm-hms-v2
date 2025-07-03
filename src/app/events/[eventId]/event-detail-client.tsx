"use client";

import { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Paper,
  Box,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  AvatarGroup,
} from "@mui/material";
import {
  Event,
  Group,
  CalendarToday,
  LocationOn,
  Schedule,
  People,
  Add,
  PersonAdd,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";

interface EventDetailProps {
  event: any;
  userId?: string;
  canRegister: boolean;
  isHubLeaderOrSupervisor: boolean;
  existingRegistration: any;
}

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
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EventDetailClient({
  event,
  userId,
  canRegister,
  isHubLeaderOrSupervisor,
  existingRegistration,
}: EventDetailProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [registerDialog, setRegisterDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as any,
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRegisterForEvent = async () => {
    if (!userId) {
      showSnackbar("Please sign in to register for this event", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          hubId: event.hubId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to register for event");
      }

      showSnackbar("Registration submitted successfully");
      setRegisterDialog(false);
      window.location.reload();
    } catch (error: any) {
      showSnackbar(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (date: Date) => {
    return new Date(date) > new Date();
  };

  const getRegistrationStatusColor = (status: string) => {
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

  const tabs = [
    { label: "Overview", icon: <Event /> },
    { label: "Agenda", icon: <Schedule /> },
    { label: "Attendees", icon: <Group /> },
    { label: "Details", icon: <LocationOn /> },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              src={event.hub.logo ?? undefined}
              sx={{ width: 32, height: 32, mr: 2 }}
            >
              {event.hub.name[0]}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {event.hub.name}
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {event.title}
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            {event.description}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Chip label={event.eventType} color="primary" />
            {isUpcoming(event.startDate) ? (
              <Chip label="Upcoming" color="success" variant="outlined" />
            ) : (
              <Chip label="Past Event" color="default" variant="outlined" />
            )}
            {event.isOnline && (
              <Chip label="Online Event" color="info" variant="outlined" />
            )}
            {event.capacity && (
              <Chip
                label={`${event._count.registrations}/${event.capacity} registered`}
                variant="outlined"
              />
            )}
          </Box>

          {/* Registration Status */}
          {existingRegistration && (
            <Alert
              severity={
                getRegistrationStatusColor(existingRegistration.status) as any
              }
              sx={{ mb: 2 }}
            >
              Registration Status: {existingRegistration.status}
              {existingRegistration.status === "PENDING" &&
                " - Awaiting approval"}
              {existingRegistration.status === "APPROVED" &&
                " - You are registered for this event"}
              {existingRegistration.status === "REJECTED" &&
                " - Registration was not approved"}
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {userId && existingRegistration && (
              <Button
                variant="contained"
                color={
                  getRegistrationStatusColor(existingRegistration.status) as any
                }
                disabled
              >
                {existingRegistration.status === "APPROVED"
                  ? "Registered"
                  : existingRegistration.status === "PENDING"
                  ? "Pending Approval"
                  : "Registration Rejected"}
              </Button>
            )}

            {userId && canRegister && (
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setRegisterDialog(true)}
                disabled={
                  event.capacity && event._count.registrations >= event.capacity
                }
              >
                {event.capacity && event._count.registrations >= event.capacity
                  ? "Event Full"
                  : "Register for Event"}
              </Button>
            )}

            {userId && isHubLeaderOrSupervisor && (
              <Button variant="outlined" disabled>
                You manage this event
              </Button>
            )}

            {userId &&
              !canRegister &&
              !existingRegistration &&
              !isHubLeaderOrSupervisor &&
              !isUpcoming(event.startDate) && (
                <Button variant="outlined" disabled>
                  Registration Closed
                </Button>
              )}

            {!userId && (
              <Button variant="contained" component={Link} href="/auth/signin">
                Sign In to Register
              </Button>
            )}
          </Box>
        </Paper>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarToday color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {new Date(event.startDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Event Date
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
                <Schedule color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {new Date(event.startDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start Time
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
                <People color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {event._count.registrations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registered
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
                <LocationOn color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {event.isOnline ? "Online" : event.venue || "TBA"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Venue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={(_, value) => setCurrentTab(value)}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Event Overview
                  </Typography>

                  <Typography variant="body1" paragraph>
                    {event.description}
                  </Typography>

                  {event.requirements.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Requirements:
                      </Typography>
                      <List dense>
                        {event.requirements.map(
                          (requirement: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemText primary={`• ${requirement}`} />
                            </ListItem>
                          )
                        )}
                      </List>
                    </Box>
                  )}

                  {event.tags.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tags:
                      </Typography>
                      {event.tags.map((tag: string) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Event Organizer
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={event.creator.profilePicture}
                      sx={{ width: 48, height: 48, mr: 2 }}
                    >
                      {event.creator.firstName[0]}
                      {event.creator.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {event.creator.firstName} {event.creator.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Event Creator
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attendees Preview
                  </Typography>
                  <AvatarGroup max={8}>
                    {event.registrations.map((registration: any) => (
                      <Avatar
                        key={registration.id}
                        src={registration.user.profilePicture}
                        alt={`${registration.user.firstName} ${registration.user.lastName}`}
                      >
                        {registration.user.firstName[0]}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {event._count.registrations} people registered
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Agenda
              </Typography>
              {event.agenda ? (
                <Box>
                  {/* Render agenda content based on structure */}
                  <Typography variant="body1">
                    Agenda content will be displayed here based on the
                    structured data.
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No agenda information available.
                </Typography>
              )}

              {event.speakers.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Speakers
                  </Typography>
                  {/* Render speakers information */}
                  <Typography variant="body1">
                    Speaker information will be displayed here.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            {event.registrations.map((registration: any) => (
              <Grid item xs={12} sm={6} md={4} key={registration.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={registration.user.profilePicture}
                        sx={{ width: 48, height: 48, mr: 2 }}
                      >
                        {registration.user.firstName[0]}
                        {registration.user.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {registration.user.firstName}{" "}
                          {registration.user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Registered:{" "}
                          {new Date(
                            registration.registeredAt
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    {registration.user.skills.length > 0 && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          gutterBottom
                        >
                          Skills:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mt: 1,
                          }}
                        >
                          {registration.user.skills
                            .slice(0, 3)
                            .map((skill: string) => (
                              <Chip
                                key={skill}
                                label={skill}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          {registration.user.skills.length > 3 && (
                            <Chip
                              label={`+${
                                registration.user.skills.length - 3
                              } more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Date & Time
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.startDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                    {event.endDate && (
                      <Typography variant="body2" color="text.secondary">
                        Ends:{" "}
                        {new Date(event.endDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Location
                    </Typography>
                    {event.isOnline ? (
                      <Typography variant="body2" color="text.secondary">
                        Online Event
                        {event.meetingLink && (
                          <Button
                            variant="outlined"
                            size="small"
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ ml: 2 }}
                          >
                            Join Meeting
                          </Button>
                        )}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {event.venue}
                        {event.venueAddress && (
                          <>
                            <br />
                            {event.venueAddress}
                          </>
                        )}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Capacity
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.capacity
                        ? `${event._count.registrations}/${event.capacity} registered`
                        : "Unlimited"}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Visibility
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.visibility.replace("_", " ")}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Registration Dialog */}
      <Dialog
        open={registerDialog}
        onClose={() => setRegisterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Register for Event</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to register for "{event.title}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date:{" "}
            {new Date(event.startDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
          {event.venue && (
            <Typography variant="body2" color="text.secondary">
              Location: {event.isOnline ? "Online" : event.venue}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRegisterForEvent}
            variant="contained"
            disabled={loading}
          >
            Confirm Registration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
