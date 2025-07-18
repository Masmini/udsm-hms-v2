"use client";

import { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Avatar,
  Paper,
  Box,
  TextField,
  InputAdornment,
  LinearProgress,
  AvatarGroup,
} from "@mui/material";
import {
  School,
  Search,
  OpenInNew,
  CalendarToday,
  People,
  TrendingUp,
  CheckCircle,
  Schedule,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProgrammeMembership {
  id: string;
  role: string;
  status: string;
  joinedAt: Date;
  progress: number;
  programme: {
    id: string;
    title: string;
    description: string;
    coverImage?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    duration?: string | null;
    certificationType?: string | null;
    hub: {
      id: string;
      name: string;
      logo?: string | null;
    };
    supervisors: {
      id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string | null;
    }[];
    _count: {
      members: number;
    };
  };
}

interface MyProgrammesClientProps {
  programmeMemberships: ProgrammeMembership[];
  userId: string;
}

export default function MyProgrammesClient({
  programmeMemberships,
  userId,
}: MyProgrammesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProgrammes = programmeMemberships.filter(
    (membership) =>
      membership.programme.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      membership.programme.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      membership.programme.hub.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Schedule />;
      case "COMPLETED":
        return <CheckCircle />;
      default:
        return <Schedule />;
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

  const activeProgrammes = filteredProgrammes.filter(
    (m) => m.status === "ACTIVE"
  );
  const completedProgrammes = filteredProgrammes.filter(
    (m) => m.status === "COMPLETED"
  );
  const averageProgress =
    programmeMemberships.length > 0
      ? programmeMemberships.reduce((sum, p) => sum + p.progress, 0) /
        programmeMemberships.length
      : 0;

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
            p: 4,
            mb: 4,
            background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            My Programmes
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Track your learning journey and skill development
          </Typography>
        </Paper>
      </motion.div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search your programmes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                component={Link}
                href="/programmes"
                startIcon={<OpenInNew />}
              >
                Explore All Programmes
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <School color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {programmeMemberships.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Programmes
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
                    {activeProgrammes.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
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
                <CheckCircle color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {completedProgrammes.length}
                  </Typography>
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
                <TrendingUp color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {Math.round(averageProgress)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Programmes Grid */}
      <Grid container spacing={3}>
        {filteredProgrammes.map((membership, index) => (
          <Grid item xs={12} sm={6} md={4} key={membership.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                {membership.programme.coverImage ? (
                  <CardMedia
                    component="img"
                    height="160"
                    image={membership.programme.coverImage}
                    alt={membership.programme.title}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 160,
                      bgcolor: "secondary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <School sx={{ fontSize: 48, color: "white" }} />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={membership.programme.hub.logo ?? undefined}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    >
                      {membership.programme.hub.name[0]}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {membership.programme.hub.name}
                    </Typography>
                  </Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {membership.programme.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 40 }}
                  >
                    {membership.programme.description.substring(0, 100)}...
                  </Typography>

                  {/* Status and Role */}
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <Chip
                      icon={getStatusIcon(membership.status)}
                      label={membership.status}
                      size="small"
                      color={getStatusColor(membership.status) as any}
                    />
                    <Chip
                      label={membership.role}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {/* Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {membership.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={membership.progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  {/* Duration and Certificate */}
                  {membership.programme.duration && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarToday
                        sx={{ fontSize: 14, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Duration: {membership.programme.duration}
                      </Typography>
                    </Box>
                  )}

                  {membership.programme.certificationType && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <School
                        sx={{ fontSize: 14, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {membership.programme.certificationType}
                      </Typography>
                    </Box>
                  )}

                  {/* Participants */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <People
                      sx={{ fontSize: 14, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {membership.programme._count.members} participants
                    </Typography>
                  </Box>

                  {/* Supervisors */}
                  {membership.programme.supervisors.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        gutterBottom
                      >
                        Supervisors:
                      </Typography>
                      <AvatarGroup
                        max={3}
                        sx={{
                          "& .MuiAvatar-root": {
                            width: 24,
                            height: 24,
                            fontSize: "0.75rem",
                          },
                        }}
                      >
                        {membership.programme.supervisors.map((supervisor) => (
                          <Avatar
                            key={supervisor.id}
                            src={supervisor.profilePicture ?? undefined}
                            alt={`${supervisor.firstName} ${supervisor.lastName}`}
                          >
                            {supervisor.firstName[0]}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    </Box>
                  )}

                  {/* Dates */}
                  {membership.programme.startDate && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 2, display: "block" }}
                    >
                      Started:{" "}
                      {new Date(
                        membership.programme.startDate
                      ).toLocaleDateString()}
                    </Typography>
                  )}

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 2, display: "block" }}
                  >
                    Joined: {new Date(membership.joinedAt).toLocaleDateString()}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    component={Link}
                    href={`/programmes/${membership.programme.id}`}
                    sx={{ mt: "auto" }}
                  >
                    View Programme
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredProgrammes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <School sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {searchTerm ? "No programmes found" : "No programmes yet"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Join programmes to enhance your skills and knowledge."}
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href="/programmes"
              size="large"
            >
              Explore Programmes
            </Button>
          </Paper>
        </motion.div>
      )}
    </Container>
  );
}
