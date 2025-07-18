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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  LinearProgress,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  School,
  People,
  Analytics,
  Notifications,
  Edit,
  Add,
  CheckCircle,
  Cancel,
  Visibility,
  TrendingUp,
  Assignment,
} from "@mui/icons-material";
import { format } from "date-fns";

interface HubSupervisorClientProps {
  hubMember: any;
  supervisedProgrammes: any[];
  userId: string;
}

export default function HubSupervisorClient({
  hubMember,
  supervisedProgrammes,
  userId,
}: HubSupervisorClientProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [editProgrammeDialog, setEditProgrammeDialog] = useState(false);
  const [selectedProgramme, setSelectedProgramme] = useState<any>(null);
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

  const handleApproveRequest = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/hub-supervisor/programme-requests/${requestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      if (!response.ok) throw new Error("Failed to update request");

      showSnackbar(`Request ${action}d successfully`);
      window.location.reload();
    } catch (error) {
      showSnackbar("Failed to update request", "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: "Overview", icon: <School /> },
    { label: "Programmes", icon: <Assignment /> },
    { label: "Members", icon: <People /> },
    { label: "Analytics", icon: <Analytics /> },
    { label: "Requests", icon: <Notifications /> },
  ];

  const allRequests = supervisedProgrammes.flatMap(
    (p) => p.programmeJoinRequests
  );
  const totalMembers = supervisedProgrammes.reduce(
    (sum, p) => sum + p.members.length,
    0
  );
  const completedProgrammes = supervisedProgrammes.filter(
    (p) => p.endDate && new Date(p.endDate) < new Date()
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
            Hub Supervisor Dashboard
          </Typography>
          <Typography variant="h5" color="primary">
            {hubMember.hub.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Managing {supervisedProgrammes.length} programmes
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Badge badgeContent={allRequests.length} color="error">
            <Button
              variant="contained"
              startIcon={<Notifications />}
              onClick={() => setCurrentTab(4)}
            >
              Requests
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
                <Assignment color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {supervisedProgrammes.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supervised Programmes
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
                <People color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{totalMembers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Participants
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
                  <Typography variant="h4">{completedProgrammes}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Programmes
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
                    {supervisedProgrammes.length > 0
                      ? (
                          (completedProgrammes / supervisedProgrammes.length) *
                          100
                        ).toFixed(1)
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
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Programme Progress Overview
                </Typography>
                {supervisedProgrammes.map((programme) => (
                  <Box key={programme.id} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" fontWeight="medium">
                        {programme.title}
                      </Typography>
                      <Chip
                        label={`${programme.members.length} participants`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        programme.endDate
                          ? Math.min(
                              100,
                              ((new Date().getTime() -
                                new Date(
                                  programme.startDate || Date.now()
                                ).getTime()) /
                                (new Date(programme.endDate).getTime() -
                                  new Date(
                                    programme.startDate || Date.now()
                                  ).getTime())) *
                                100
                            )
                          : 0
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Analytics />}
                    onClick={() => setCurrentTab(3)}
                    fullWidth
                  >
                    View Analytics
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<People />}
                    onClick={() => setCurrentTab(2)}
                    fullWidth
                  >
                    Manage Members
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Notifications />}
                    onClick={() => setCurrentTab(4)}
                    fullWidth
                  >
                    Review Requests
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
            <Typography variant="h6" gutterBottom>
              Supervised Programmes ({supervisedProgrammes.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Programme</TableCell>
                    <TableCell>Participants</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {supervisedProgrammes.map((programme) => (
                    <TableRow key={programme.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {programme.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {programme.description.substring(0, 100)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${programme.members.length} members`}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        {programme.startDate
                          ? format(
                              new Date(programme.startDate),
                              "MMM dd, yyyy"
                            )
                          : "Not scheduled"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={programme.publishStatus}
                          size="small"
                          color={
                            programme.publishStatus === "PUBLISHED"
                              ? "success"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Programme">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedProgramme(programme);
                              setEditProgrammeDialog(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
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

      {currentTab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Programme Join Requests ({allRequests.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Programme</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allRequests.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {
                            supervisedProgrammes.find(
                              (p) => p.id === request.programmeId
                            )?.title
                          }
                        </Typography>
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
                              {request.user.firstName} {request.user.lastName}
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
                        {format(new Date(request.requestedAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() =>
                                handleApproveRequest(request.id, "approve")
                              }
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleApproveRequest(request.id, "reject")
                              }
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
          </CardContent>
        </Card>
      )}

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
