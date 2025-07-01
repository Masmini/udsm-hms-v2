//src/app/projects/projects-client.tsx
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Box,
  Chip,
  Button,
  Avatar,
  Paper,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  Search,
  Assignment,
  People,
  Visibility,
  Share,
  Code,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  description: string;
  coverImage?: string | null;
  visibility: string;
  skills: string[];
  startDate?: Date | null;
  endDate?: Date | null;
  completionRate: number;
  hub: {
    id: string;
    name: string;
    logo?: string | null;
  };
  members: {
    hubMember: {
      role: string;
      hubId: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string | null;
      };
    } | null;
  }[];
  _count: {
    members: number;
    tasks: number;
  };
}

interface ProjectsClientProps {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchParams: {
    search: string;
    visibility: string;
  };
}

const visibilityOptions = [
  { value: "PUBLIC", label: "Public" },
  { value: "AUTHENTICATED", label: "Authenticated Users" },
  { value: "HUB_MEMBERS", label: "Hub Members" },
  { value: "PROGRAMME_MEMBERS", label: "Programme Members" },
];

export default function ProjectsClient({
  projects,
  pagination,
  searchParams,
}: ProjectsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.search);
  const [selectedVisibility, setSelectedVisibility] = useState(
    searchParams.visibility
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedVisibility) params.set("visibility", selectedVisibility);
    params.set("page", "1");
    router.push(`/projects?${params.toString()}`);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedVisibility) params.set("visibility", selectedVisibility);
    params.set("page", value.toString());
    router.push(`/projects?${params.toString()}`);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC":
        return <Visibility sx={{ fontSize: 16 }} />;
      case "AUTHENTICATED":
        return <People sx={{ fontSize: 16 }} />;
      default:
        return <Assignment sx={{ fontSize: 16 }} />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "PUBLIC":
        return "success";
      case "AUTHENTICATED":
        return "info";
      case "HUB_MEMBERS":
        return "warning";
      case "PROGRAMME_MEMBERS":
        return "error";
      default:
        return "default";
    }
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
            background: "linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Explore Projects
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Collaborate on innovative projects and build your portfolio
          </Typography>
        </Paper>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search projects..."
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Visibility</InputLabel>
                <Select
                  value={selectedVisibility}
                  onChange={(e) => setSelectedVisibility(e.target.value)}
                  label="Visibility"
                >
                  <MenuItem value="">All Projects</MenuItem>
                  {visibilityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          {pagination.total} projects found
        </Typography>
      </Box>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {projects.map((project, index) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
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
                href={`/projects/${project.id}`}
              >
                {project.coverImage ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={project.coverImage}
                    alt={project.title}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Code sx={{ fontSize: 64, color: "white" }} />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={project.hub.logo ?? undefined}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    >
                      {project.hub.name[0]}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {project.hub.name}
                    </Typography>
                  </Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {project.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 40 }}
                  >
                    {project.description.substring(0, 100)}...
                  </Typography>

                  {/* Members and Roles */}
                  <Box sx={{ mb: 2 }}>
                    {project.members
                      .filter((member) => member.hubMember !== null)
                      .map((member) => (
                        <Typography
                          key={member.hubMember!.user.id}
                          variant="caption"
                          display="block"
                        >
                          {member.hubMember!.user.firstName}{" "}
                          {member.hubMember!.user.lastName} -{" "}
                          {member.hubMember!.role}
                        </Typography>
                      ))}
                  </Box>

                  {/* Skills */}
                  <Box sx={{ mb: 2 }}>
                    {project.skills.slice(0, 3).map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {project.skills.length > 3 && (
                      <Chip
                        label={`+${project.skills.length - 3} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Visibility */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Chip
                      icon={getVisibilityIcon(project.visibility)}
                      label={project.visibility.replace("_", " ")}
                      size="small"
                      color={getVisibilityColor(project.visibility) as any}
                      variant="outlined"
                    />
                  </Box>

                  {/* Stats */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <People
                      sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {project._count.members} members
                    </Typography>
                    <Assignment
                      sx={{
                        fontSize: 16,
                        ml: 2,
                        mr: 1,
                        color: "text.secondary",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {project._count.tasks} tasks
                    </Typography>
                  </Box>

                  {/* Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                    >
                      Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={project.completionRate}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Button variant="contained" size="small">
                      View Project
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
      {projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Assignment sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No projects found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search criteria or explore different hubs.
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
