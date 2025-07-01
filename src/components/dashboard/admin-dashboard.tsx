'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material';
import {
  People,
  Group,
  Assignment,
  Event,
  TrendingUp,
  Warning,
  Notifications,
  Analytics,
  Settings,
  Send,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalHubs: number;
    totalProjects: number;
    totalEvents: number;
    pendingRequests: number;
    engagementRate: number;
    growthRate: number;
  };
  recentUsers: any[];
  recentHubs: any[];
  recentActivity: any[];
  chartData: {
    userGrowth: any;
    hubActivity: any;
    projectCompletion: any;
  };
  aiInsights: any[];
  systemAlerts: any[];
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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [notificationTarget, setNotificationTarget] = useState('all');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const sendSystemNotification = async () => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: notificationTarget,
          title: 'System Announcement',
          message: 'Important system update notification',
        }),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: dashboardData?.stats.totalUsers || 0,
      icon: <People />,
      color: '#1976d2',
      change: `+${dashboardData?.stats.growthRate || 0}%`,
      href: '/admin/users',
    },
    {
      title: 'Active Hubs',
      value: dashboardData?.stats.totalHubs || 0,
      icon: <Group />,
      color: '#388e3c',
      change: '+12%',
      href: '/admin/hubs',
    },
    {
      title: 'Projects',
      value: dashboardData?.stats.totalProjects || 0,
      icon: <Assignment />,
      color: '#f57c00',
      change: '+8%',
      href: '/admin/projects',
    },
    {
      title: 'Events',
      value: dashboardData?.stats.totalEvents || 0,
      icon: <Event />,
      color: '#7b1fa2',
      change: '+15%',
      href: '/admin/events',
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
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                System Command Center
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                UDSM Hub Management System - Administrative Overview
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={sendSystemNotification}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                Send System Alert
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Key Metrics */}
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
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
                component={Link}
                href={stat.href}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {stat.title}
                      </Typography>
                      <Chip
                        label={stat.change}
                        size="small"
                        color="success"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" color={stat.color}>
                    {stat.value.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* System Alerts */}
      {dashboardData?.stats.pendingRequests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Alert
            severity="warning"
            sx={{ mb: 4 }}
            action={
              <Button color="inherit" size="small" component={Link} href="/admin/requests">
                Review ({dashboardData.stats.pendingRequests})
              </Button>
            }
          >
            <Typography variant="h6" fontWeight="bold">
              Pending Administrative Actions
            </Typography>
            {dashboardData.stats.pendingRequests} membership requests and system actions require your attention.
          </Alert>
        </motion.div>
      )}

      {/* AI Insights */}
      {dashboardData?.aiInsights?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Analytics sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  AI-Powered System Insights
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {dashboardData.aiInsights.slice(0, 3).map((insight: any, index: number) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {insight.type.toUpperCase()}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insight.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Chip
                          label={`${Math.round(insight.confidence * 100)}% confidence`}
                          size="small"
                          color="info"
                        />
                        <Chip
                          label={insight.priority}
                          size="small"
                          color={insight.priority === 'high' ? 'error' : 'default'}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Dashboard Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Analytics" icon={<TrendingUp />} />
            <Tab label="Recent Activity" icon={<Notifications />} />
            <Tab label="System Health" icon={<Settings />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* User Growth Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    User Growth Trend
                  </Typography>
                  {dashboardData?.chartData?.userGrowth && (
                    <Line
                      data={dashboardData.chartData.userGrowth}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                          title: { display: false },
                        },
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Hub Activity Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Hub Activity Distribution
                  </Typography>
                  {dashboardData?.chartData?.hubActivity && (
                    <Doughnut
                      data={dashboardData.chartData.hubActivity}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'bottom' },
                        },
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Project Completion Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Project Completion Rates by Hub
                  </Typography>
                  {dashboardData?.chartData?.projectCompletion && (
                    <Bar
                      data={dashboardData.chartData.projectCompletion}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                          },
                        },
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Recent Users
                  </Typography>
                  <List>
                    {dashboardData?.recentUsers?.map((user: any, index: number) => (
                      <ListItem key={user.id} divider={index < dashboardData.recentUsers.length - 1}>
                        <ListItemAvatar>
                          <Avatar src={user.profilePicture}>
                            {user.firstName[0]}{user.lastName[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${user.firstName} ${user.lastName}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Chip
                                  label={user.role}
                                  size="small"
                                  color={user.role === 'ADMIN' ? 'error' : 'primary'}
                                  sx={{ mr: 1 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Recent Activity
                  </Typography>
                  <List>
                    {dashboardData?.recentActivity?.map((activity: any, index: number) => (
                      <ListItem key={index} divider={index < dashboardData.recentActivity.length - 1}>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(activity.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    99.9%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    System Uptime
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {dashboardData?.stats.engagementRate || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    User Engagement
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    2.3s
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}