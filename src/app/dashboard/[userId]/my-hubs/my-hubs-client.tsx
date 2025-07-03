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
} from "@mui/material";
import {
  Group,
  Assignment,
  Event,
  School,
  Search,
  OpenInNew,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface HubMembership {
  id: string;
  role: string;
  joinedAt: Date;
  hub: {
    id: string;
    name: string;
    description: string;
    logo?: string | null;
    cardBio?: string | null;
    categories: { name: string }[];
    _count: {
      members: number;
      projects: number;
      events: number;
      programmes: number;
    };
  };
}

interface MyHubsClientProps {
  hubMemberships: HubMembership[];
  userId: string;
}

export default function MyHubsClient({
  hubMemberships,
  userId,
}: MyHubsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHubs = hubMemberships.filter(
    (membership) =>
      membership.hub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membership.hub.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "HUB_LEADER":
        return "error";
      case "SUPERVISOR":
        return "warning";
      case "MEMBER":
        return "primary";
      default:
        return "default";
    }
  };

  const getHubDashboardUrl = (hubId: string, role: string) => {
    const baseUrl = `/dashboard/${userId}/my-hubs/${hubId}`;
    switch (role) {
      case "HUB_LEADER":
        return `${baseUrl}/hub-leader`;
      case "SUPERVISOR":
        return `${baseUrl}/hub-supervisor`;
      case "MEMBER":
        return `${baseUrl}/hub-member`;
      default:
        return `${baseUrl}/hub-member`;
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            My Hubs
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Manage your hub memberships and access your communities
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
                label="Search your hubs..."
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
                href="/hubs"
                startIcon={<OpenInNew />}
              >
                Explore All Hubs
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
                <Group color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{hubMemberships.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hubs
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
                <Assignment color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {hubMemberships.reduce(
                      (sum, h) => sum + h.hub._count.projects,
                      0
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Projects
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
                <Event color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {hubMemberships.reduce(
                      (sum, h) => sum + h.hub._count.events,
                      0
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
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
                <School color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {hubMemberships.reduce(
                      (sum, h) => sum + h.hub._count.programmes,
                      0
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Programmes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hubs Grid */}
      <Grid container spacing={3}>
        {filteredHubs.map((membership, index) => (
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
                {membership.hub.logo ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={membership.hub.logo}
                    alt={membership.hub.name}
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
                    <Group sx={{ fontSize: 64, color: "white" }} />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {membership.hub.name}
                    </Typography>
                    <Chip
                      label={membership.role.replace("_", " ")}
                      size="small"
                      color={getRoleColor(membership.role) as any}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 60 }}
                  >
                    {membership.hub.cardBio ||
                      membership.hub.description.substring(0, 120)}
                    ...
                  </Typography>

                  {/* Categories */}
                  <Box sx={{ mb: 2 }}>
                    {membership.hub.categories.slice(0, 2).map((category) => (
                      <Chip
                        key={category.name}
                        label={category.name}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {membership.hub.categories.length > 2 && (
                      <Chip
                        label={`+${membership.hub.categories.length - 2} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Stats */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Group
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {membership.hub._count.members} members
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Assignment
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {membership.hub._count.projects} projects
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Event
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {membership.hub._count.events} events
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <School
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {membership.hub._count.programmes} programmes
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

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
                    href={getHubDashboardUrl(
                      membership.hub.id,
                      membership.role
                    )}
                  >
                    Open Dashboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredHubs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Group sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {searchTerm ? "No hubs found" : "No hubs yet"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Join hubs to connect with communities and collaborate on projects."}
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href="/hubs"
              size="large"
            >
              Explore Hubs
            </Button>
          </Paper>
        </motion.div>
      )}
    </Container>
  );
}
