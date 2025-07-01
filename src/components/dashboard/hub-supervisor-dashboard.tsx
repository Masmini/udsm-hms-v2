'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  Business,
  AttachMoney,
  Assessment,
  Add,
  Download,
  Send,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Line, Bar } from 'react-chartjs-2';

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
      id={`supervisor-tabpanel-${index}`}
      aria-labelledby={`supervisor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HubSupervisorDashboard({ hubId }: { hubId: string }) {
  const [tabValue, setTabValue] = useState(0);
  const [partnershipDialogOpen, setPartnershipDialogOpen] = useState(false);
  const [fundingDialogOpen, setFundingDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const { data: supervisorData } = useQuery({
    queryKey: ['hub-supervisor-dashboard', hubId],
    queryFn: async () => {
      const response = await fetch(`/api/hubs/${hubId}/supervisor-analytics`);
      if (!response.ok) throw new Error('Failed to fetch supervisor data');
      return response.json();
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const generateExecutiveReport = async () => {
    try {
      const response = await fetch(`/api/hubs/${hubId}/executive-report`, {
        method: 'POST',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hub-executive-report-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const kpis = [
    {
      title: 'Hub Performance Score',
      value: supervisorData?.kpis?.performanceScore || 0,
      unit: '/100',
      icon: <Analytics />,
      color: '#1976d2',
      trend: '+5.2%',
    },
    {
      title: 'Member Growth Rate',
      value: supervisorData?.kpis?.memberGrowthRate || 0,
      unit: '%',
      icon: <TrendingUp />,
      color: '#388e3c',
      trend: '+12.3%',
    },
    {
      title: 'Active Partnerships',
      value: supervisorData?.kpis?.activePartnerships || 0,
      unit: '',
      icon: <Business />,
      color: '#f57c00',
      trend: '+2',
    },
    {
      title: 'Funding Secured',
      value: supervisorData?.kpis?.fundingSecured || 0,
      unit: 'K USD',
      icon: <AttachMoney />,
      color: '#7b1fa2',
      trend: '+25K',
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
            background: 'linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)',
            color: 'white',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Hub Strategic Command Center
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {supervisorData?.hubName} - Strategic Oversight & External Relations
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={generateExecutiveReport}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  mr: 2,
                }}
              >
                Executive Report
              </Button>
              <Button
                variant="contained"
                startIcon={<Send />}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                Report to Principal
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: `${kpi.color}20`,
                        color: kpi.color,
                        mr: 2,
                      }}
                    >
                      {kpi.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {kpi.title}
                      </Typography>
                      <Chip
                        label={kpi.trend}
                        size="small"
                        color="success"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" color={kpi.color}>
                    {kpi.value}{kpi.unit}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Main Dashboard Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Strategic Analytics" icon={<Assessment />} />
            <Tab label="Partnerships" icon={<Business />} />
            <Tab label="Funding" icon={<AttachMoney />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Performance Trends */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Hub Performance Trends
                  </Typography>
                  {supervisorData?.charts?.performanceTrends && (
                    <Line
                      data={supervisorData.charts.performanceTrends}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                        },
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Comparative Analysis */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    University Ranking
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h2" color="primary" fontWeight="bold">
                      #{supervisorData?.ranking || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Among {supervisorData?.totalHubs || 0} hubs
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Impact Metrics */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Impact Metrics by Category
                  </Typography>
                  {supervisorData?.charts?.impactMetrics && (
                    <Bar
                      data={supervisorData.charts.impactMetrics}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
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
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Partnership Portfolio
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setPartnershipDialogOpen(true)}
                    >
                      New Partnership
                    </Button>
                  </Box>
                  <List>
                    {supervisorData?.partnerships?.map((partnership: any, index: number) => (
                      <ListItem key={index} divider>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <Business />
                        </Avatar>
                        <ListItemText
                          primary={partnership.partnerName}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {partnership.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip
                                  label={partnership.status}
                                  size="small"
                                  color={partnership.status === 'ACTIVE' ? 'success' : 'default'}
                                />
                                <Chip
                                  label={partnership.partnerType}
                                  size="small"
                                  variant="outlined"
                                />
                                {partnership.value && (
                                  <Chip
                                    label={`$${partnership.value.toLocaleString()}`}
                                    size="small"
                                    color="primary"
                                  />
                                )}
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

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Partnership Stats
                  </Typography>
                  <Box sx={{ py: 2 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {supervisorData?.partnershipStats?.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Partnerships
                    </Typography>
                    
                    <Typography variant="h4" color="success.main" fontWeight="bold" sx={{ mt: 2 }}>
                      {supervisorData?.partnershipStats?.active || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Active Partnerships
                    </Typography>
                    
                    <Typography variant="h4" color="warning.main" fontWeight="bold" sx={{ mt: 2 }}>
                      ${(supervisorData?.partnershipStats?.totalValue || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Value
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Funding Opportunities
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setFundingDialogOpen(true)}
                    >
                      Add Opportunity
                    </Button>
                  </Box>
                  <List>
                    {supervisorData?.fundingOpportunities?.map((funding: any, index: number) => (
                      <ListItem key={index} divider>
                        <Avatar sx={{ mr: 2, bgcolor: 'success.main' }}>
                          <AttachMoney />
                        </Avatar>
                        <ListItemText
                          primary={funding.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {funding.funder} - ${funding.amount.toLocaleString()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Deadline: {new Date(funding.deadline).toLocaleDateString()}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip
                                  label={funding.status}
                                  size="small"
                                  color={funding.status === 'APPROVED' ? 'success' : 'default'}
                                />
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

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Funding Pipeline
                  </Typography>
                  <Box sx={{ py: 2 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      ${(supervisorData?.fundingStats?.totalIdentified || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Identified
                    </Typography>
                    
                    <Typography variant="h4" color="warning.main" fontWeight="bold" sx={{ mt: 2 }}>
                      ${(supervisorData?.fundingStats?.totalApplied || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Applications Submitted
                    </Typography>
                    
                    <Typography variant="h4" color="success.main" fontWeight="bold" sx={{ mt: 2 }}>
                      ${(supervisorData?.fundingStats?.totalSecured || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Funding Secured
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Partnership Dialog */}
      <Dialog
        open={partnershipDialogOpen}
        onClose={() => setPartnershipDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Partnership</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Partner Name"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Partner Type</InputLabel>
                <Select label="Partner Type">
                  <MenuItem value="INDUSTRY">Industry</MenuItem>
                  <MenuItem value="ACADEMIC">Academic</MenuItem>
                  <MenuItem value="NGO">NGO</MenuItem>
                  <MenuItem value="GOVERNMENT">Government</MenuItem>
                  <MenuItem value="INTERNATIONAL">International</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPartnershipDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Add Partnership
          </Button>
        </DialogActions>
      </Dialog>

      {/* Funding Dialog */}
      <Dialog
        open={fundingDialogOpen}
        onClose={() => setFundingDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Funding Opportunity</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Opportunity Title"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Funder"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount (USD)"
                type="number"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Application Deadline"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status">
                  <MenuItem value="IDENTIFIED">Identified</MenuItem>
                  <MenuItem value="APPLYING">Applying</MenuItem>
                  <MenuItem value="SUBMITTED">Submitted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFundingDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Add Opportunity
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}