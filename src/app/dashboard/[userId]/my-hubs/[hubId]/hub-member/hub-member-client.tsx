//src/app/dashboard/[userId]/my-hubs/[hubId]/hub-member/hub-member-client.tsx
"use client";

import { useState } from "react";
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
  Badge,
  LinearProgress,
  Tooltip,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
} from "@mui/material";
import {
  Dashboard,
  Assignment,
  Event,
  School,
  Notifications,
  Add,
  PlayArrow,
  CheckCircle,
  Schedule,
  Person,
  Group,
  Task,
  EventNote,
  FolderOpen,
  TrendingUp,
  Send,
  Feedback,
} from "@mui/icons-material";
import { format } from "date-fns";

interface HubMemberClientProps {
  hubMember: any;
  userProjects: any[];
  notifications: any[];
  userId: string;
}

export default function HubMemberClient({
  hubMember,
  userProjects,
  notifications,
  userId,
}: HubMemberClientProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [joinRequestDialog, setJoinRequestDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [requestType, setRequestType] = useState<
    "project" | "event" | "programme"
  >("project");
  const [requestMessage, setRequestMessage] = useState("");
  const [progressReportDialog, setProgressReportDialog] = useState(false);
  const [eventFeedbackDialog, setEventFeedbackDialog] = useState(false);
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

  const handleJoinRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hub-member/${requestType}-join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [`${requestType}Id`]: selectedItem.id,
          hubId: hubMember.hub.id,
          message: requestMessage,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit request");

      showSnackbar("Join request submitted successfully");
      setJoinRequestDialog(false);
      setRequestMessage("");
    } catch (error) {
      showSnackbar("Failed to submit request", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProgressReport = async (reportData: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/hub-member/progress-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reportData,
          projectId: selectedItem.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit report");

      showSnackbar("Progress report submitted successfully");
      setProgressReportDialog(false);
    } catch (error) {
      showSnackbar("Failed to submit report", "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: "Overview", icon: <Dashboard /> },
    { label: "My Projects", icon: <Assignment /> },
    { label: "Events", icon: <Event /> },
    { label: "Programmes", icon: <School /> },
    { label: "Notifications", icon: <Notifications /> },
  ];

  const userTasks = userProjects.flatMap((p) => p.project.tasks || []);
  const completedTasks = userTasks.filter((t) => t.status === "DONE").length;
  const pendingTasks = userTasks.filter((t) =>
    ["TODO", "IN_PROGRESS"].includes(t.status)
  ).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Hub Member Dashboard
          </Typography>
          <Typography variant="h5" color="primary">
            {hubMember.hub.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hubMember.hub.description}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Badge badgeContent={notifications.length} color="error">
            <Button
              variant="contained"
              startIcon={<Notifications />}
              onClick={() => setCurrentTab(4)}
            >
              Notifications
            </Button>
          </Badge>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FolderOpen color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{userProjects.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
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
                <Task color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{userTasks.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned Tasks
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
                  <Typography variant="h4">{completedTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Tasks
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
                <TrendingUp color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {userTasks.length > 0
                      ? ((completedTasks / userTasks.length) * 100).toFixed(1)
                      : 0}
                    %
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completion Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, value) => setCurrentTab(value)}>
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
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* My Tasks */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Tasks ({pendingTasks} pending)
                </Typography>
                {userTasks.slice(0, 5).map((task) => (
                  <Box
                    key={task.id}
                    sx={{
                      mb: 2,
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body1" fontWeight="medium">
                        {task.title}
                      </Typography>
                      <Chip
                        label={task.status}
                        size="small"
                        color={
                          task.status === "DONE"
                            ? "success"
                            : task.status === "IN_PROGRESS"
                            ? "warning"
                            : "default"
                        }
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {task.description}
                    </Typography>
                    {task.dueDate && (
                      <Typography variant="caption" color="text.secondary">
                        Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                      </Typography>
                    )}
                  </Box>
                ))}
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
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                      setRequestType("project");
                      setJoinRequestDialog(true);
                    }}
                    fullWidth
                  >
                    Join Project
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EventNote />}
                    onClick={() => {
                      setRequestType("event");
                      setJoinRequestDialog(true);
                    }}
                    fullWidth
                  >
                    Register for Event
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<School />}
                    onClick={() => {
                      setRequestType("programme");
                      setJoinRequestDialog(true);
                    }}
                    fullWidth
                  >
                    Join Programme
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Send />}
                    onClick={() => setProgressReportDialog(true)}
                    fullWidth
                  >
                    Submit Report
                  </Button>
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
                My Projects ({userProjects.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setRequestType("project");
                  setJoinRequestDialog(true);
                }}
              >
                Join Project
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Tasks</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userProjects.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {membership.project.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {membership.project.description.substring(0, 100)}
                            ...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={membership.role}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {membership.project.tasks?.length || 0} tasks
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LinearProgress
                            variant="determinate"
                            value={membership.project.completionRate || 0}
                            sx={{ width: 100, mr: 1 }}
                          />
                          <Typography variant="body2">
                            {membership.project.completionRate || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Submit Progress Report">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedItem(membership.project);
                              setProgressReportDialog(true);
                            }}
                          >
                            <Send />
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
                Available Events ({hubMember.hub.events.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setRequestType("event");
                  setJoinRequestDialog(true);
                }}
              >
                Register for Event
              </Button>
            </Box>
            <Grid container spacing={2}>
              {hubMember.hub.events.map((event: any) => (
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
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Schedule sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">
                          {format(
                            new Date(event.startDate),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label={
                            event.registrations?.length > 0
                              ? "Registered"
                              : "Available"
                          }
                          size="small"
                          color={
                            event.registrations?.length > 0
                              ? "success"
                              : "default"
                          }
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PlayArrow />}
                          onClick={() => {
                            setSelectedItem(event);
                            if (event.registrations?.length > 0) {
                              setEventFeedbackDialog(true);
                            } else {
                              setRequestType("event");
                              setJoinRequestDialog(true);
                            }
                          }}
                        >
                          {event.registrations?.length > 0
                            ? "Give Feedback"
                            : "Register"}
                        </Button>
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
            <Typography variant="h6" gutterBottom>
              Notifications ({notifications.length})
            </Typography>
            <List>
              {notifications.map((notification) => (
                <ListItem key={notification.id} divider>
                  <ListItemAvatar>
                    <Avatar>
                      <Notifications />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(
                            new Date(notification.createdAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Join Request Dialog */}
      <Dialog
        open={joinRequestDialog}
        onClose={() => setJoinRequestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Join {requestType.charAt(0).toUpperCase() + requestType.slice(1)}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Message (Optional)"
            multiline
            rows={4}
            fullWidth
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinRequestDialog(false)}>Cancel</Button>
          <Button
            onClick={handleJoinRequest}
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
    </Box>
  );
}
