//src/app/dashboard/[userId]/my-programmes/[programmeId]/programme-detail-client.tsx
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
  LinearProgress,
  Divider,
  AvatarGroup,
} from "@mui/material";
import {
  School,
  Group,
  TrendingUp,
  CalendarToday,
  ArrowBack,
  EmojiEvents,
  Schedule,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProgrammeDetailProps {
  programme: any;
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
  userMembership,
  userId,
}: ProgrammeDetailProps) {
  const [currentTab, setCurrentTab] = useState(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "COMPLETED":
        return "primary";
      case "SUSPENDED":
        return "warning";
      case "INACTIVE":
        return "default";
      default:
        return "default";
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
    { label: "Progress", icon: <TrendingUp /> },
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
              href={`/dashboard/${userId}/my-programmes`}
              startIcon={<ArrowBack />}
              sx={{ mr: 2 }}
            >
              Back to Programmes
            </Button>
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

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Chip
              label={userMembership.status}
              color={getStatusColor(userMembership.status) as any}
            />
            <Chip
              label={`${userMembership.progress}% Complete`}
              variant="outlined"
            />
            <Chip
              label={userMembership.role}
              color="primary"
              variant="outlined"
            />
            {isActive(programme.startDate, programme.endDate) && (
              <Chip label="Active" color="success" variant="outlined" />
            )}
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2">Your Progress</Typography>
              <Typography variant="body2">
                {userMembership.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={userMembership.progress}
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
                  <Typography variant="h4">
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
                <EmojiEvents color="secondary" sx={{ mr: 2 }} />
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
                <TrendingUp color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {userMembership.progress}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your Progress
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

                  {programme.prerequisites.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Prerequisites:
                      </Typography>
                      {programme.prerequisites.map(
                        (prereq: string, index: number) => (
                          <Chip
                            key={index}
                            label={prereq}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )
                      )}
                    </Box>
                  )}

                  {programme.learningOutcomes.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Learning Outcomes:
                      </Typography>
                      <List dense>
                        {programme.learningOutcomes.map(
                          (outcome: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemText primary={outcome} />
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
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Supervisors
                  </Typography>
                  {programme.supervisors.map((supervisor: any) => (
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
                        {supervisor.bio && (
                          <Typography variant="caption" color="text.secondary">
                            {supervisor.bio.substring(0, 50)}...
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
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

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progress: {member.progress}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={member.progress}
                        sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                      />
                    </Box>
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
                Your Progress Tracking
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Overall Progress: {userMembership.progress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={userMembership.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Joined: {new Date(userMembership.joinedAt).toLocaleDateString()}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Status: {userMembership.status}
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Container>
  );
}
