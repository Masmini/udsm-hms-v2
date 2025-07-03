//src/app/programmes/[programmeId]/programme-detail-client.tsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  AvatarGroup,
} from "@mui/material";
import {
  School,
  Group,
  CalendarToday,
  WorkspacePremium,
  Add,
  Schedule,
  People,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProgrammeDetailProps {
  programme: any;
  userId?: string;
  canJoin: boolean;
  isHubLeaderOrSupervisor: boolean;
  isProgrammeSupervisor: boolean;
  existingMembership: any;
  existingJoinRequest: any;
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
      id={`programme-tabpanel-${index}`}
      aria-labelledby={`programme-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProgrammeDetailClient({
  programme,
  userId,
  canJoin,
  isHubLeaderOrSupervisor,
  isProgrammeSupervisor,
  existingMembership,
  existingJoinRequest,
}: ProgrammeDetailProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [joinDialog, setJoinDialog] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
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

  const handleJoinProgramme = async () => {
    if (!userId) {
      showSnackbar("Please sign in to join this programme", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/programmes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programmeId: programme.id,
          hubId: programme.hubId,
          message: joinMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit join request");
      }

      showSnackbar("Join request submitted successfully");
      setJoinDialog(false);
      setJoinMessage("");
      window.location.reload();
    } catch (error: any) {
      showSnackbar(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const isActive = (startDate?: Date | null, endDate?: Date | null) => {
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (!start && !end) return true; // Ongoing programme
    if (start && !end) return now >= start; // Started but no end date
    if (!start && end) return now <= end; // No start date but has end date
    return start !== null && end !== null && start <= now && now <= end; // Has both dates
  };

  const tabs = [
    { label: "Overview", icon: <School /> },
    { label: "Curriculum", icon: <Schedule /> },
    { label: "Participants", icon: <Group /> },
    { label: "Supervisors", icon: <People /> },
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
              src={programme.hub.logo ?? undefined}
              sx={{ width: 32, height: 32, mr: 2 }}
            >
              {programme.hub.name[0]}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {programme.hub.name}
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {programme.title}
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            {programme.description}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Chip
              label={
                isActive(programme.startDate, programme.endDate)
                  ? "Active"
                  : "Inactive"
              }
              color={
                isActive(programme.startDate, programme.endDate)
                  ? "success"
                  : "default"
              }
            />
            {programme.duration && (
              <Chip label={programme.duration} variant="outlined" />
            )}
            {programme.certificationType && (
              <Chip
                icon={<WorkspacePremium />}
                label={programme.certificationType}
                color="secondary"
                variant="outlined"
              />
            )}
            {programme.maxParticipants && (
              <Chip
                label={`${programme._count.members}/${programme.maxParticipants} participants`}
                variant="outlined"
              />
            )}
          </Box>

          {/* Prerequisites */}
          {programme.prerequisites.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Prerequisites:
              </Typography>
              {programme.prerequisites.map((prereq: string) => (
                <Chip
                  key={prereq}
                  label={prereq}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {userId && existingMembership && (
              <Button variant="contained" color="success" disabled>
                Already Enrolled
              </Button>
            )}

            {userId && existingJoinRequest && (
              <Button variant="outlined" color="warning" disabled>
                Request Pending
              </Button>
            )}

            {userId &&
              canJoin &&
              !isHubLeaderOrSupervisor &&
              !isProgrammeSupervisor && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setJoinDialog(true)}
                  disabled={!isActive(programme.startDate, programme.endDate)}
                >
                  {isActive(programme.startDate, programme.endDate)
                    ? "Request to Join"
                    : "Programme Inactive"}
                </Button>
              )}

            {userId && (isHubLeaderOrSupervisor || isProgrammeSupervisor) && (
              <Button variant="outlined" disabled>
                You manage this programme
              </Button>
            )}

            {!userId && (
              <Button variant="contained" component={Link} href="/auth/signin">
                Sign In to Join
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
                <Group color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {programme._count.members}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Participants
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
                    {programme.duration || "Ongoing"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration
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
                <WorkspacePremium color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {programme.certificationType || "None"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Certificate
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
                <People color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {programme.supervisors.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supervisors
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
                    Programme Information
                  </Typography>

                  {programme.startDate && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CalendarToday
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Started:{" "}
                        {new Date(programme.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}

                  {programme.endDate && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CalendarToday
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Ends: {new Date(programme.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}

                  {programme.applicationDeadline && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Schedule
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Application Deadline:{" "}
                        {new Date(
                          programme.applicationDeadline
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}

                  {programme.learningOutcomes.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Learning Outcomes:
                      </Typography>
                      <List dense>
                        {programme.learningOutcomes.map(
                          (outcome: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemText primary={`• ${outcome}`} />
                            </ListItem>
                          )
                        )}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Participants Preview
                  </Typography>
                  <AvatarGroup max={8}>
                    {programme.members.map((member: any) => (
                      <Avatar
                        key={member.id}
                        src={member.user.profilePicture}
                        alt={`${member.user.firstName} ${member.user.lastName}`}
                      >
                        {member.user.firstName[0]}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {programme._count.members} participants enrolled
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Programme Status
                  </Typography>
                  <Chip
                    label={
                      isActive(programme.startDate, programme.endDate)
                        ? "Active"
                        : "Inactive"
                    }
                    color={
                      isActive(programme.startDate, programme.endDate)
                        ? "success"
                        : "default"
                    }
                    sx={{ mb: 2 }}
                  />
                  {programme.maxParticipants && (
                    <Typography variant="body2" color="text.secondary">
                      Capacity: {programme._count.members}/
                      {programme.maxParticipants}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Curriculum
              </Typography>
              {programme.curriculum ? (
                <Box>
                  {/* Render curriculum content based on structure */}
                  <Typography variant="body1">
                    Curriculum content will be displayed here based on the
                    structured data.
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No curriculum information available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            {programme.members.map((member: any) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={member.user.profilePicture}
                        sx={{ width: 48, height: 48, mr: 2 }}
                      >
                        {member.user.firstName[0]}
                        {member.user.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {member.user.firstName} {member.user.lastName}
                        </Typography>
                        <Chip
                          label={member.role}
                          size="small"
                          color="primary"
                        />
                      </Box>
                    </Box>

                    {member.user.bio && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {member.user.bio}
                      </Typography>
                    )}

                    {member.user.skills.length > 0 && (
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
                          {member.user.skills
                            .slice(0, 3)
                            .map((skill: string) => (
                              <Chip
                                key={skill}
                                label={skill}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          {member.user.skills.length > 3 && (
                            <Chip
                              label={`+${member.user.skills.length - 3} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 2, display: "block" }}
                    >
                      Joined: {new Date(member.joinedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            {programme.supervisors.map((supervisor: any) => (
              <Grid item xs={12} sm={6} md={4} key={supervisor.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={supervisor.profilePicture}
                        sx={{ width: 48, height: 48, mr: 2 }}
                      >
                        {supervisor.firstName[0]}
                        {supervisor.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {supervisor.firstName} {supervisor.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Programme Supervisor
                        </Typography>
                      </Box>
                    </Box>

                    {supervisor.bio && (
                      <Typography variant="body2" color="text.secondary">
                        {supervisor.bio}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Join Dialog */}
      <Dialog
        open={joinDialog}
        onClose={() => setJoinDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request to Join Programme</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a request to join "{programme.title}". Include a message
            explaining your interest and background.
          </Typography>
          <TextField
            label="Message (Optional)"
            multiline
            rows={4}
            fullWidth
            value={joinMessage}
            onChange={(e) => setJoinMessage(e.target.value)}
            placeholder="Tell the supervisors why you're interested in this programme and what you hope to achieve..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialog(false)}>Cancel</Button>
          <Button
            onClick={handleJoinProgramme}
            variant="contained"
            disabled={loading}
          >
            Submit Request
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
