'use client';

import { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import AdminDashboard from './admin-dashboard';
import IntelligentAnalytics from '../ai/intelligent-analytics';
import AIRecommendationEngine from '../ai/ai-recommendation-engine';

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
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function EnhancedAdminDashboard({ userId }: { userId: string }) {
  const [tabValue, setTabValue] = useState(0);

  // Mock analytics data - in production, this would come from your analytics API
  const mockAnalyticsData = {
    userEngagement: {
      totalUsers: 2500,
      activeUsers: 1800,
      engagementRate: 72,
      trend: 15.3,
    },
    hubPerformance: {
      totalHubs: 12,
      activeHubs: 10,
      averageMembers: 18.5,
      topPerformingHubs: [
        { name: 'Tech Innovation Hub', score: 95 },
        { name: 'Business Hub', score: 88 },
        { name: 'Creative Arts Hub', score: 82 },
      ],
    },
    projectMetrics: {
      totalProjects: 156,
      completedProjects: 98,
      completionRate: 62.8,
      averageCompletionTime: 145,
    },
    eventMetrics: {
      totalEvents: 89,
      upcomingEvents: 12,
      averageAttendance: 68.5,
      popularEventTypes: ['Workshop', 'Seminar', 'Networking'],
    },
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            AI-Enhanced Admin Dashboard
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Intelligent insights, predictive analytics, and AI-powered recommendations
          </Typography>
        </Paper>
      </motion.div>

      {/* Main Dashboard Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="System Overview" />
            <Tab label="AI Analytics" />
            <Tab label="Recommendations" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <AdminDashboard />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <IntelligentAnalytics
              data={mockAnalyticsData}
              userRole="ADMIN"
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <AIRecommendationEngine
                  userId={userId}
                  context="dashboard"
                  limit={8}
                />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
}