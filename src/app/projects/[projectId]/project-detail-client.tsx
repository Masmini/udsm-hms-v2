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
  Alert,
  Snackbar,
  AvatarGroup,
} from "@mui/material";
import {
  Assignment,
  Group,
  TrendingUp,
  CalendarToday,
  Code,
  Visibility,
  Add,
  Download,
  Announcement,
  Task,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProjectDetailProps {
  project: any;
  userId?: string;
  canJoin: boolean;
  isHubMember: boolean;
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
  userId,
  canJoin,
  isHubMember,
  existingMembership,
  existingJoinRequest,
}: ProjectDetailProps) {
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

  const handleJoinProject = async () => {
    if (!userId) {
      showSnackbar("Please sign in to join this project", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/projects/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          hubId: project.hubId,
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

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC":
        return <Visibility sx={{ fontSize: 16 }} />;
      default:
        return <Assignment sx={{ fontSize: 16 }} />;
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

  const tabs = [
    { label: "Overview", icon: <Assignment /> },
    { label: "Tasks", icon: <Task /> },
    { label: "Team", icon: <Group /> },
    { label: "Files", icon: <Download /> },
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

          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Chip
              label={project.status.replace("_", " ")}
              color={getStatusColor(project.status) as any}
            />
            <Chip
              label={`${project.completionRate}% Complete`}
              variant="outlined"
            />
            <Chip
              icon={getVisibilityIcon(project.visibility)}
              label={project.visibility.replace("_", " ")}
              variant="outlined"
            />
            <Chip
              label={project.priority}
              color={
                project.priority === "HIGH" || project.priority === "URGENT"
                  ? "error"
                  : "default"
              }
              variant="outlined"
            />
          </Box>

          {/* Skills */}
          {project.skills.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Required Skills:
              </Typography>
              {project.skills.map((skill: string) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          )}

          {/* Technologies */}
          {project.technologies.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Technologies:
              </Typography>
              {project.technologies.map((tech: string) => (
                <Chip
                  key={tech}
                  label={tech}
                  size="small"
                  color="secondary"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {userId && existingMembership && (
              <Button variant="contained" color="success" disabled>
                Already a Member
              </Button>
            )}

            {userId && existingJoinRequest && (
              <Button variant="outlined" color="warning" disabled>
                Request Pending
              </Button>
            )}

            {userId && canJoin && isHubMember && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setJoinDialog(true)}
              >
                Request to Join
              </Button>
            )}

            {userId && !isHubMember && (
              <Button variant="outlined" disabled>
                Must be Hub Member to Join
              </Button>
            )}

            {!userId && (
              <Button variant="contained" component={Link} href="/auth/signin">
                Sign In to Join
              </Button>
            )}
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2">Project Progress</Typography>
              <Typography variant="body2">{project.completionRate}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.completionRate}
              sx={{ height: 8, borderRadius: 4 }}
            />
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
                <Task color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{project._count.tasks}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks
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
                  <Typography variant="h4">
                    {
                      project.tasks.filter((t: any) => t.status === "DONE")
                        .length
                    }
                  </Typography>
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
                <CalendarToday color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "TBA"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start Date
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
                    Project Details
                  </Typography>

                  {project.objectives && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Objectives:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.objectives}
                      </Typography>
                    </Box>
                  )}

                  {project.startDate && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarToday
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Started:{" "}
                        {new Date(project.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}

                  {project.endDate && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CalendarToday
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Expected End:{" "}
                        {new Date(project.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}

                  {project.budget && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Budget: ${project.budget.toLocaleString()}
                      </Typography>
                      {project.fundingSource && (
                        <Typography variant="body2" color="text.secondary">
                          Funding Source: {project.fundingSource}
                        </Typography>
                      )}
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
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Supervisors
                  </Typography>
                  {project.supervisors.map((supervisor: any) => (
                    <Box
                      key={supervisor.id}
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                    >
                      <Avatar
                        src={supervisor.profilePicture}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      >
                        {supervisor.firstName[0]}
                        {supervisor.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {supervisor.firstName} {supervisor.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Supervisor
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Team Preview
                  </Typography>
                  <AvatarGroup max={6}>
                    {project.members.map((member: any) => (
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
                    {project._count.members} team members
                  </Typography>
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

                    {task.assignee && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Avatar
                          src={task.assignee.profilePicture}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        >
                          {task.assignee.firstName[0]}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          Assigned to {task.assignee.firstName}{" "}
                          {task.assignee.lastName}
                        </Typography>
                      </Box>
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

                    {task.priority && (
                      <Chip
                        label={task.priority}
                        size="small"
                        color={
                          task.priority === "HIGH" || task.priority === "URGENT"
                            ? "error"
                            : "default"
                        }
                        sx={{ mt: 1 }}
                      />
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
                    No tasks available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tasks will be displayed here once they are created.
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

                    {member.contribution && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          gutterBottom
                        >
                          Contribution:
                        </Typography>
                        <Typography variant="body2">
                          {member.contribution}
                        </Typography>
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
                Project Files
              </Typography>
              {project.projectFiles.length > 0 ? (
                <List>
                  {project.projectFiles.map((file: any) => (
                    <ListItem key={file.id}>
                      <ListItemText
                        primary={file.fileName}
                        secondary={
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {file.type} •{" "}
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                            <br />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Uploaded:{" "}
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Button
                        size="small"
                        startIcon={<Download />}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </Button>
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
        </TabPanel>
      </Paper>

      {/* Join Dialog */}
      <Dialog
        open={joinDialog}
        onClose={() => setJoinDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request to Join Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a request to join "{project.title}". Include a message
            explaining why you'd like to join and what you can contribute.
          </Typography>
          <TextField
            label="Message (Optional)"
            multiline
            rows={4}
            fullWidth
            value={joinMessage}
            onChange={(e) => setJoinMessage(e.target.value)}
            placeholder="Tell the project team why you'd like to join and what skills you can contribute..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialog(false)}>Cancel</Button>
          <Button
            onClick={handleJoinProject}
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
