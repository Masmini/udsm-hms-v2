"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from "@mui/material";
import {
  Dashboard,
  Group,
  Event,
  School,
  Assignment,
  Notifications,
  Person,
  TrendingUp,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DashboardClient({ user }: { user: any }) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const stats = [
    {
      title: "My Hubs",
      value: user.hubs.length,
      icon: <Group />,
      color: "#1976d2",
      href: `/dashboard/${user.id}/my-hubs`,
    },
    {
      title: "My Projects",
      value: user.projectMembers.length,
      icon: <Assignment />,
      color: "#7b1fa2",
      href: `/dashboard/${user.id}/my-projects`,
    },
    {
      title: "My Events",
      value: user.eventRegistrations.length,
      icon: <Event />,
      color: "#388e3c",
      href: `/dashboard/${user.id}/my-events`,
    },
    {
      title: "My Programmes",
      value: user.programmes.length,
      icon: <School />,
      color: "#f57c00",
      href: `/dashboard/${user.id}/my-programmes`,
    },
  ];

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
            p: 3,
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar src={user.profilePicture} sx={{ width: 80, height: 80 }}>
                {user.firstName[0]}
                {user.lastName[0]}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back, {user.firstName}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {user.degreeProgramme || "Student"} • {user.email}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {user.skills.map((skill: string, index: number) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      mr: 1,
                      mb: 1,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
                component={Link}
                href={`/dashboard/${user.id}/profile`}
                startIcon={<Person />}
              >
                Edit Profile
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
                component={Link}
                href={stat.href}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: `${stat.color}20`,
                        color: stat.color,
                        mr: 2,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Paper sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" icon={<Dashboard />} />
            <Tab label="My Hubs" icon={<Group />} />
            <Tab label="My Projects" icon={<Assignment />} />
            <Tab label="My Events" icon={<Event />} />
            <Tab label="My Programmes" icon={<School />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="body1" color="text.secondary">
                    No recent activity to display.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List>
                <ListItem button component={Link} href="/hubs">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <Group />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Explore Hubs"
                    secondary="Discover new communities"
                  />
                </ListItem>
                <Divider />
                <ListItem button component={Link} href="/events">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "success.main" }}>
                      <Event />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Browse Events"
                    secondary="Find upcoming events"
                  />
                </ListItem>
                <Divider />
                <ListItem button component={Link} href="/projects">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "warning.main" }}>
                      <Assignment />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="View Projects"
                    secondary="Collaborate on projects"
                  />
                </ListItem>
                <Divider />
                <ListItem button component={Link} href="/programmes">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "secondary.main" }}>
                      <School />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Browse Programmes"
                    secondary="Enhance your skills"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">My Hubs ({user.hubs.length})</Typography>
            <Button
              variant="contained"
              component={Link}
              href={`/dashboard/${user.id}/my-hubs`}
            >
              View All Hubs
            </Button>
          </Box>
          <Grid container spacing={3}>
            {user.hubs.slice(0, 6).map((membership: any) => (
              <Grid item xs={12} sm={6} md={4} key={membership.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {membership.hub.logo && (
                        <Avatar
                          src={membership.hub.logo}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        />
                      )}
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {membership.hub.name}
                        </Typography>
                        <Chip
                          label={membership.role}
                          size="small"
                          color="primary"
                        />
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {membership.hub.cardBio || membership.hub.description}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      component={Link}
                      href={`/hubs/${membership.hub.id}`}
                    >
                      View Hub
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {user.hubs.length === 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Group
                      sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      No Hubs Yet
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Join hubs to connect with communities and collaborate on
                      projects.
                    </Typography>
                    <Button variant="contained" component={Link} href="/hubs">
                      Explore Hubs
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">
              My Projects ({user.projectMembers.length})
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href={`/dashboard/${user.id}/my-projects`}
            >
              View All Projects
            </Button>
          </Box>
          <Grid container spacing={3}>
            {user.projectMembers.slice(0, 6).map((membership: any) => (
              <Grid item xs={12} sm={6} md={4} key={membership.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {membership.project.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {membership.project.hub.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {membership.project.description.substring(0, 100)}...
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Chip
                        label={`${membership.project.completionRate}% Complete`}
                        size="small"
                        color="primary"
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        component={Link}
                        href={`/dashboard/${user.id}/my-projects/${membership.project.id}`}
                      >
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {user.projectMembers.length === 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Assignment
                      sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      No Projects Yet
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Join projects to collaborate and build your portfolio.
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      href="/projects"
                    >
                      Explore Projects
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">
              My Events ({user.eventRegistrations.length})
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href={`/dashboard/${user.id}/my-events`}
            >
              View All Events
            </Button>
          </Box>
          <Grid container spacing={3}>
            {user.eventRegistrations.slice(0, 6).map((registration: any) => (
              <Grid item xs={12} sm={6} md={4} key={registration.id}>
                <Card>
                  {registration.event.coverImage && (
                    <Box sx={{ height: 200, position: "relative" }}>
                      <Image
                        src={registration.event.coverImage}
                        alt={registration.event.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                  )}
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {registration.event.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {registration.event.hub.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {new Date(
                        registration.event.startDate
                      ).toLocaleDateString()}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      component={Link}
                      href={`/events/${registration.event.id}`}
                    >
                      View Event
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {user.eventRegistrations.length === 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Event
                      sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      No Events Yet
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Register for events to expand your knowledge and network.
                    </Typography>
                    <Button variant="contained" component={Link} href="/events">
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">
              My Programmes ({user.programmes.length})
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href={`/dashboard/${user.id}/my-programmes`}
            >
              View All Programmes
            </Button>
          </Box>
          <Grid container spacing={3}>
            {user.programmes.slice(0, 6).map((membership: any) => (
              <Grid item xs={12} sm={6} md={4} key={membership.id}>
                <Card>
                  {membership.programme.coverImage && (
                    <Box sx={{ height: 200, position: "relative" }}>
                      <Image
                        src={membership.programme.coverImage}
                        alt={membership.programme.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                  )}
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {membership.programme.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {membership.programme.hub.name}
                    </Typography>
                    <Chip
                      label={membership.role}
                      size="small"
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                    <br />
                    <Button
                      variant="contained"
                      size="small"
                      component={Link}
                      href={`/programmes/${membership.programme.id}`}
                    >
                      View Programme
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {user.programmes.length === 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <School
                      sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      No Programmes Yet
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Join programmes to enhance your skills and knowledge.
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      href="/programmes"
                    >
                      Browse Programmes
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}
