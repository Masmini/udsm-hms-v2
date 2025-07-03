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
  TextField,
  Rating,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Event,
  Group,
  CalendarToday,
  LocationOn,
  ArrowBack,
  Schedule,
  People,
  Star,
  Feedback,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";

interface EventDetailProps {
  event: any;
  userRegistration: any;
  userId: string;
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
  userRegistration,
  userId,
}: EventDetailProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [rating, setRating] = useState<number | null>(5);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(true);
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

  const isUpcoming = (date: Date) => {
    return new Date(date) > new Date();
  };

  const isPast = (date: Date) => {
    return new Date(date) < new Date();
  };

  const handleSubmitFeedback = async () => {
    if (!rating) {
      showSnackbar("Please provide a rating", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/events/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          rating,
          content: feedbackContent,
          suggestions,
          wouldRecommend,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      showSnackbar("Feedback submitted successfully");
      setFeedbackDialog(false);
      window.location.reload();
    } catch (error) {
      showSnackbar("Failed to submit feedback", "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: "Overview", icon: <Event /> },
    { label: "Agenda", icon: <Schedule /> },
    { label: "Attendees", icon: <Group /> },
    { label: "My Status", icon: <People /> },
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
            <Button
              component={Link}
              href={`/dashboard/${userId}/my-events`}
              startIcon={<ArrowBack />}
              sx={{ mr: 2 }}
            >
              Back to Events
            </Button>
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

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Chip
              label={userRegistration.status}
              color={getStatusColor(userRegistration.status) as any}
            />
            <Chip label={event.eventType} variant="outlined" />
            {isUpcoming(event.startDate) && (
              <Chip label="Upcoming" color="info" variant="outlined" />
            )}
            {isPast(event.startDate) && (
              <Chip label="Past Event" color="default" variant="outlined" />
            )}
            {userRegistration.attended && (
              <Chip label="Attended" color="success" variant="outlined" />
            )}
          </Box>

          {isPast(event.startDate) &&
            userRegistration.attended &&
            event.eventFeedbacks.length === 0 && (
              <Button
                variant="contained"
                startIcon={<Feedback />}
                onClick={() => setFeedbackDialog(true)}
                sx={{ mb: 2 }}
              >
                Submit Feedback
              </Button>
            )}
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
                    Event Details
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CalendarToday
                      sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                    />
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
                  </Box>

                  {event.endDate && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Schedule
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
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
                    </Box>
                  )}

                  {event.venue && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <LocationOn
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {event.venue}
                        {event.venueAddress && ` - ${event.venueAddress}`}
                      </Typography>
                    </Box>
                  )}

                  {event.isOnline && event.meetingLink && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Meeting Link:
                      </Typography>
                      <Button
                        variant="outlined"
                        href={event.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Join Online Meeting
                      </Button>
                    </Box>
                  )}

                  {event.requirements.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Requirements:
                      </Typography>
                      <List dense>
                        {event.requirements.map(
                          (requirement: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemText primary={requirement} />
                            </ListItem>
                          )
                        )}
                      </List>
                    </Box>
                  )}

                  {event.tags.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Tags:
                      </Typography>
                      {event.tags.map((tag: string, index: number) => (
                        <Chip
                          key={index}
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
              <Card>
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

                  {event.capacity && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Capacity: {event._count.registrations}/{event.capacity}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {event.attendanceBadges.length > 0 && (
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Your Badges
                    </Typography>
                    {event.attendanceBadges.map((badge: any) => (
                      <Box key={badge.id} sx={{ mb: 1 }}>
                        <Chip
                          icon={<Star />}
                          label={`${badge.badge} (${badge.score})`}
                          color="primary"
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}
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
                Registration Status
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Status:{" "}
                  <Chip
                    label={userRegistration.status}
                    color={getStatusColor(userRegistration.status) as any}
                    size="small"
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registered:{" "}
                  {new Date(userRegistration.registeredAt).toLocaleDateString()}
                </Typography>
                {userRegistration.attended && (
                  <Typography variant="body2" color="success.main">
                    ✓ Attended this event
                  </Typography>
                )}
              </Box>

              {event.eventFeedbacks.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Your Feedback
                  </Typography>
                  {event.eventFeedbacks.map((feedback: any) => (
                    <Box key={feedback.id} sx={{ mb: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Rating value={feedback.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({feedback.rating}/5)
                        </Typography>
                      </Box>
                      {feedback.content && (
                        <Typography variant="body2" paragraph>
                          {feedback.content}
                        </Typography>
                      )}
                      {feedback.suggestions && (
                        <Typography variant="body2" color="text.secondary">
                          Suggestions: {feedback.suggestions}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialog}
        onClose={() => setFeedbackDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Submit Event Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Overall Rating *
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
            />
          </Box>

          <TextField
            label="Your Feedback"
            multiline
            rows={4}
            fullWidth
            value={feedbackContent}
            onChange={(e) => setFeedbackContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Suggestions for Improvement"
            multiline
            rows={3}
            fullWidth
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box>
            <Typography variant="body2" gutterBottom>
              Would you recommend this event to others?
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant={wouldRecommend === true ? "contained" : "outlined"}
                onClick={() => setWouldRecommend(true)}
                color="success"
              >
                Yes
              </Button>
              <Button
                variant={wouldRecommend === false ? "contained" : "outlined"}
                onClick={() => setWouldRecommend(false)}
                color="error"
              >
                No
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            disabled={loading || !rating}
          >
            Submit Feedback
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
