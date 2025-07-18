//src/app/dashboard/[userId]/my-hubs/[hubId]/hub-leader/hub-leader-client.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  LinearProgress,
  Tooltip,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from "@mui/material";
import {
  Dashboard,
  Group,
  Assignment,
  Event,
  School,
  Analytics,
  Notifications,
  Edit,
  Add,
  CheckCircle,
  Cancel,
  Visibility,
  Settings,
  TrendingUp,
  People,
  EventNote,
  FolderOpen,
  Send,
  Feedback,
} from "@mui/icons-material";
import { format } from "date-fns";
import { motion } from "framer-motion";
import ProjectCreationWizard from "@/components/hub-leader/project-creation-wizard";
import EventCreationWizard from "@/components/hub-leader/event-creation-wizard";
import ProgrammeCreationWizard from "@/components/hub-leader/programme-creation-wizard";
import ProjectSuggestionsManager from "@/components/hub-leader/project-suggestions-manager";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useNotification } from "@/components/providers/notification-provider";

interface HubLeaderClientProps {
  hubMember: any;
  analytics: any;
  userId: string;
}

export default function HubLeaderClient({
  hubMember,
  analytics,
  userId,
}: HubLeaderClientProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [editHubDialog, setEditHubDialog] = useState(false);
  const [createProjectDialog, setCreateProjectDialog] = useState(false);
  const [createEventDialog, setCreateEventDialog] = useState(false);
  const [createProgrammeDialog, setCreateProgrammeDialog] = useState(false);
  const [hubData, setHubData] = useState(hubMember.hub);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { showSuccess, showError } = useNotification();

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Refresh the page data
      window.location.reload();
    } catch (error) {
      showError("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleApproveRequest = async (
    type: string,
    requestId: string,
    action: "approve" | "reject"
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/hub-leader/${type}-requests/${requestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      if (!response.ok) throw new Error("Failed to update request");

      showSuccess(`Request ${action}d successfully`);
      refreshData();
    } catch (error) {
      showError("Failed to update request");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: "Overview", icon: <Dashboard /> },
    { label: "Members", icon: <Group /> },
    { label: "Projects", icon: <Assignment /> },
    { label: "Events", icon: <Event /> },
    { label: "Programmes", icon: <School /> },
    { label: "Analytics", icon: <Analytics /> },
    { label: "Requests", icon: <Notifications /> },
    { label: "Suggestions", icon: <Feedback /> },
  ];

  const pendingRequests = [
    ...hubData.membershipRequests,
    ...hubData.projects.flatMap((p: any) => p.projectJoinRequests),
    ...hubData.events.flatMap((e: any) => e.registrations),
    ...hubData.programmes.flatMap((p: any) => p.programmeJoinRequests),
  ];

  const completedProjects = hubData.projects.filter(
    (p: any) => p.status === "COMPLETED"
  ).length;
  const activeProjects = hubData.projects.filter(
    (p: any) => p.status === "IN_PROGRESS"
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Hub Leader Dashboard
            </Typography>
            <Typography variant="h5" color="primary">
              {hubData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hubData.description}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <EnhancedButton
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditHubDialog(true)}
              tooltip="Edit hub information"
            >
              Edit Hub
            </EnhancedButton>
            <Badge badgeContent={pendingRequests.length} color="error">
              <EnhancedButton
                variant="contained"
                startIcon={<Notifications />}
                onClick={() => setCurrentTab(6)}
                tooltip="View pending requests"
              >
                Requests
              </EnhancedButton>
            </Badge>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <People color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">
                      {hubData.members.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Members
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FolderOpen color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">
                      {hubData.projects.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Projects
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      {activeProjects} active, {completedProjects} completed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <EventNote color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">
                      {hubData.events.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Events
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TrendingUp color="warning" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">
                      {analytics?.engagementRate?.toFixed(1) || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Engagement Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, value) => setCurrentTab(value)}
          variant="scrollable"
          scrollButtons="auto"
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
      </Paper>

      {/* Tab Content */}
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentTab === 0 && (
          <Grid container spacing={3}>
            {/* Recent Activities */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activities
                  </Typography>
                  <List>
                    {hubData.projects.slice(0, 3).map((project: any) => (
                      <ListItem key={project.id}>
                        <ListItemAvatar>
                          <Avatar>
                            <Assignment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Project: ${project.title}`}
                          secondary={`Created ${format(
                            new Date(project.createdAt),
                            "MMM dd, yyyy"
                          )}`}
                        />
                      </ListItem>
                    ))}
                    {hubData.events.slice(0, 2).map((event: any) => (
                      <ListItem key={event.id}>
                        <ListItemAvatar>
                          <Avatar>
                            <Event />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Event: ${event.title}`}
                          secondary={`Scheduled for ${format(
                            new Date(event.startDate),
                            "MMM dd, yyyy"
                          )}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            {/* Quick Actions */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <EnhancedButton
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => setCreateProjectDialog(true)}
                      fullWidth
                      tooltip="Create a new project"
                    >
                      Create Project
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => setCreateEventDialog(true)}
                      fullWidth
                      tooltip="Create a new event"
                    >
                      Create Event
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => setCreateProgrammeDialog(true)}
                      fullWidth
                      tooltip="Create a new programme"
                    >
                      Create Programme
                    </EnhancedButton>
                    <EnhancedButton
                      variant="outlined"
                      startIcon={<Settings />}
                      onClick={() => setEditHubDialog(true)}
                      fullWidth
                      tooltip="Manage hub settings"
                    >
                      Manage Hub
                    </EnhancedButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {currentTab === 1 && (
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  Hub Members ({hubData.members.length})
                </Typography>
                <EnhancedButton
                  variant="contained"
                  startIcon={<Add />}
                  tooltip="Invite new members"
                >
                  Invite Members
                </EnhancedButton>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Member</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hubData.members.map((member: any) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              src={member.user.profilePicture}
                              sx={{ mr: 2 }}
                            >
                              {member.user.firstName[0]}
                              {member.user.lastName[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {member.user.firstName} {member.user.lastName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {member.user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={member.role}
                            size="small"
                            color={
                              member.role === "HUB_LEADER"
                                ? "primary"
                                : "default"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {format(new Date(member.joinedAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={member.isActive ? "Active" : "Inactive"}
                            size="small"
                            color={member.isActive ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Profile">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {currentTab === 2 && (
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  Projects ({hubData.projects.length})
                </Typography>
                <EnhancedButton
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateProjectDialog(true)}
                >
                  Create Project
                </EnhancedButton>
              </Box>
              <Grid container spacing={2}>
                {hubData.projects.map((project: any) => (
                  <Grid item xs={12} md={6} lg={4} key={project.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {project.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          {project.description.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={project.status}
                            size="small"
                            color={
                              project.status === "COMPLETED"
                                ? "success"
                                : project.status === "IN_PROGRESS"
                                ? "warning"
                                : "default"
                            }
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={project.completionRate || 0}
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {project.completionRate || 0}% Complete
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {project.members?.length || 0} members
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {currentTab === 3 && (
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  Events ({hubData.events.length})
                </Typography>
                <EnhancedButton
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateEventDialog(true)}
                >
                  Create Event
                </EnhancedButton>
              </Box>
              <Grid container spacing={2}>
                {hubData.events.map((event: any) => (
                  <Grid item xs={12} md={6} key={event.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {event.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          {event.description.substring(0, 150)}...
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            📅{" "}
                            {format(
                              new Date(event.startDate),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </Typography>
                          {event.venue && (
                            <Typography variant="body2">
                              📍 {event.venue}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Chip label={event.eventType} size="small" />
                          <Chip
                            label={`${
                              event.registrations?.length || 0
                            } registered`}
                            size="small"
                            color="primary"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {currentTab === 4 && (
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  Programmes ({hubData.programmes.length})
                </Typography>
                <EnhancedButton
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateProgrammeDialog(true)}
                >
                  Create Programme
                </EnhancedButton>
              </Box>
              <Grid container spacing={2}>
                {hubData.programmes.map((programme: any) => (
                  <Grid item xs={12} md={6} key={programme.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {programme.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          {programme.description.substring(0, 150)}...
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          {programme.duration && (
                            <Typography variant="body2">
                              ⏱️ Duration: {programme.duration}
                            </Typography>
                          )}
                          {programme.certificationType && (
                            <Typography variant="body2">
                              🏆 {programme.certificationType}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Chip
                            label={`${programme.members?.length || 0} enrolled`}
                            size="small"
                            color="primary"
                          />
                          {programme.maxParticipants && (
                            <Chip
                              label={`Max: ${programme.maxParticipants}`}
                              size="small"
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {currentTab === 6 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Requests ({pendingRequests.length})
              </Typography>
              {pendingRequests.length === 0 ? (
                <Alert severity="info">No pending requests</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingRequests.map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <Chip
                              label={
                                "hubId" in request
                                  ? "Hub Membership"
                                  : "projectId" in request
                                  ? "Project Join"
                                  : "eventId" in request
                                  ? "Event Registration"
                                  : "Programme Join"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar
                                src={request.user.profilePicture}
                                sx={{ mr: 2, width: 32, height: 32 }}
                              >
                                {request.user.firstName[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">
                                  {request.user.firstName}{" "}
                                  {request.user.lastName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {request.user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {request.message || "No message"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(
                                request.requestedAt || request.registeredAt
                              ),
                              "MMM dd, yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() =>
                                    handleApproveRequest(
                                      "hubId" in request
                                        ? "membership"
                                        : "projectId" in request
                                        ? "project"
                                        : "eventId" in request
                                        ? "event"
                                        : "programme",
                                      request.id,
                                      "approve"
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleApproveRequest(
                                      "hubId" in request
                                        ? "membership"
                                        : "projectId" in request
                                        ? "project"
                                        : "eventId" in request
                                        ? "event"
                                        : "programme",
                                      request.id,
                                      "reject"
                                    )
                                  }
                                  disabled={loading}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}

        {currentTab === 7 && <ProjectSuggestionsManager hubId={hubData.id} />}
      </motion.div>

      {/* Creation Wizards */}
      <ProjectCreationWizard
        open={createProjectDialog}
        onClose={() => setCreateProjectDialog(false)}
        hubMembers={hubData.members}
        hubId={hubData.id}
        onProjectCreated={refreshData}
      />

      <EventCreationWizard
        open={createEventDialog}
        onClose={() => setCreateEventDialog(false)}
        hubId={hubData.id}
        onEventCreated={refreshData}
      />

      <ProgrammeCreationWizard
        open={createProgrammeDialog}
        onClose={() => setCreateProgrammeDialog(false)}
        hubMembers={hubData.members}
        hubId={hubData.id}
        onProgrammeCreated={refreshData}
      />
    </Box>
  );
}
