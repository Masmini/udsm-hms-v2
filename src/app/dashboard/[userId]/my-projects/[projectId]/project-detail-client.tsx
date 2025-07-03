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
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Assignment,
  Task,
  Group,
  TrendingUp,
  CalendarToday,
  Add,
  Send,
  Download,
  Announcement,
  ArrowBack,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProjectDetailProps {
  project: any;
  userMembership: any;
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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProjectDetailClient({
  project,
  userMembership,
  userId,
}: ProjectDetailProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [progressReportDialog, setProgressReportDialog] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
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

  const handleSubmitProgressReport = async () => {
    if (!reportTitle.trim() || !reportContent.trim()) {
      showSnackbar("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/hub-member/progress-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          title: reportTitle,
          content: reportContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit progress report");

      showSnackbar("Progress report submitted successfully");
      setProgressReportDialog(false);
      setReportTitle("");
      setReportContent("");
      window.location.reload();
    } catch (error) {
      showSnackbar("Failed to submit progress report", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "primary";
      case "ON_HOLD":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "success";
      case "IN_PROGRESS":
        return "warning";
      case "REVIEW":
        return "info";
      default:
        return "default";
    }
  };

  const completedTasks = project.tasks.filter(
    (task: any) => task.status === "DONE"
  ).length;

  const tabs = [
    { label: "Overview", icon: <Assignment /> },
    { label: "My Tasks", icon: <Task /> },
    { label: "Team", icon: <Group /> },
    { label: "Progress Reports", icon: <TrendingUp /> },
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
              href={`/dashboard/${userId}/my-projects`}
              startIcon={<ArrowBack />}
              sx={{ mr: 2 }}
            >
              Back to Projects
            </Button>
            <Avatar
              src={project.hub.logo ?? undefined}
              sx={{ width: 32, height: 32, mr: 2 }}
            >
              {project.hub.name[0]}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {project.hub.name}
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {project.title}
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            {project.description}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Chip
              label={project.status.replace("_", " ")}
              color={getStatusColor(project.status) as any}
            />
            <Chip
              label={`${project.completionRate}% Complete`}
              variant="outlined"
            />
            <Chip
              label={userMembership.role}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setProgressReportDialog(true)}
          >
            Submit Progress Report
          </Button>
        </Paper>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Task color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{project.tasks.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    My Tasks
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
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{completedTasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
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
                <Group color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{project._count.members}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Team Members
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
                    {project.progressReports.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    My Reports
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
                    Project Progress
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">
                        Overall Completion
                      </Typography>
                      <Typography variant="body2">
                        {project.completionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={project.completionRate}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  {project.startDate && (
                    <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                      <CalendarToday
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Started:{" "}
                        {new Date(project.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Announcements
                  </Typography>
                  {project.announcements.length > 0 ? (
                    <List>
                      {project.announcements.map((announcement: any) => (
                        <ListItem key={announcement.id} divider>
                          <ListItemAvatar>
                            <Avatar src={announcement.creator.profilePicture}>
                              {announcement.creator.firstName[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={announcement.title}
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  {announcement.content}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {new Date(
                                    announcement.createdAt
                                  ).toLocaleDateString()}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No announcements yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Files
                  </Typography>
                  {project.projectFiles.length > 0 ? (
                    <List dense>
                      {project.projectFiles.slice(0, 5).map((file: any) => (
                        <ListItem key={file.id}>
                          <ListItemText
                            primary={file.fileName}
                            secondary={new Date(
                              file.uploadedAt
                            ).toLocaleDateString()}
                          />
                          <IconButton size="small">
                            <Download />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No files uploaded yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            {project.tasks.map((task: any) => (
              <Grid item xs={12} md={6} key={task.id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {task.title}
                      </Typography>
                      <Chip
                        label={task.status.replace("_", " ")}
                        size="small"
                        color={getTaskStatusColor(task.status) as any}
                      />
                    </Box>

                    {task.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {task.description}
                      </Typography>
                    )}

                    {task.dueDate && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 2 }}
                      >
                        <CalendarToday
                          sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {project.tasks.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <Task sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No tasks assigned
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You don't have any tasks assigned in this project yet.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            {project.members.map((member: any) => (
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
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            {project.progressReports.map((report: any) => (
              <Grid item xs={12} key={report.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {report.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {report.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Submitted:{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {project.progressReports.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <TrendingUp
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    No progress reports yet
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Submit your first progress report to track your
                    contributions.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setProgressReportDialog(true)}
                  >
                    Submit Progress Report
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Progress Report Dialog */}
      <Dialog
        open={progressReportDialog}
        onClose={() => setProgressReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Submit Progress Report</DialogTitle>
        <DialogContent>
          <TextField
            label="Report Title"
            fullWidth
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Report Content"
            multiline
            rows={6}
            fullWidth
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressReportDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitProgressReport}
            variant="contained"
            disabled={loading}
            startIcon={<Send />}
          >
            Submit Report
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
