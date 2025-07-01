//src/app/programmes/programmes-client.tsx
"use client";

import { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Pagination,
  Box,
  Chip,
  Button,
  Avatar,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Search,
  School,
  People,
  CalendarToday,
  Share,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Programme {
  id: string;
  title: string;
  description: string;
  coverImage?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  hub: {
    id: string;
    name: string;
    logo?: string | null;
  };
  members: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string | null;
    };
  }[];
  supervisors: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string | null;
  }[];
  _count: {
    members: number;
  };
}

interface ProgrammesClientProps {
  programmes: Programme[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchParams: {
    search: string;
  };
}

export default function ProgrammesClient({
  programmes,
  pagination,
  searchParams,
}: ProgrammesClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.search);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", "1");
    router.push(`/programmes?${params.toString()}`);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", value.toString());
    router.push(`/programmes?${params.toString()}`);
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return "Ongoing";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            Learning Programmes
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Enhance your skills through structured learning opportunities and
            mentorship
          </Typography>
        </Paper>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={10}>
              <TextField
                fullWidth
                label="Search programmes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSearch}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Results */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="text.secondary">
          {pagination.total} programmes found
        </Typography>
      </Box>

      {/* Programmes Grid */}
      <Grid container spacing={3}>
        {programmes.map((programme, index) => (
          <Grid item xs={12} sm={6} md={4} key={programme.id}>
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
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
                component={Link}
                href={`/programmes/${programme.id}`}
              >
                {programme.coverImage ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={programme.coverImage}
                    alt={programme.title}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: "secondary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <School sx={{ fontSize: 64, color: "white" }} />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={programme.hub.logo ?? undefined}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    >
                      {programme.hub.name[0]}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {programme.hub.name}
                    </Typography>
                  </Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {programme.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 60 }}
                  >
                    {programme.description.substring(0, 120)}...
                  </Typography>

                  {/* Status */}
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={
                        isActive(programme.startDate, programme.endDate)
                          ? "Active"
                          : "Inactive"
                      }
                      size="small"
                      color={
                        isActive(programme.startDate, programme.endDate)
                          ? "success"
                          : "default"
                      }
                    />
                  </Box>

                  {/* Duration */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CalendarToday
                      sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(programme.startDate)} -{" "}
                      {formatDate(programme.endDate)}
                    </Typography>
                  </Box>

                  {/* Members */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <People
                      sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {programme._count.members} members
                    </Typography>
                  </Box>

                  {/* Supervisors */}
                  {programme.supervisors.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        gutterBottom
                      >
                        Supervisors:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {programme.supervisors.slice(0, 2).map((supervisor) => (
                          <Chip
                            key={supervisor.id}
                            label={`${supervisor.firstName} ${supervisor.lastName}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {programme.supervisors.length > 2 && (
                          <Chip
                            label={`+${programme.supervisors.length - 2} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      disabled={
                        !isActive(programme.startDate, programme.endDate)
                      }
                    >
                      {isActive(programme.startDate, programme.endDate)
                        ? "Join Programme"
                        : "View Details"}
                    </Button>
                    <IconButton size="small">
                      <Share />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {programmes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <School sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No programmes found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search criteria or check back later for new
              programmes.
            </Typography>
          </Paper>
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}
