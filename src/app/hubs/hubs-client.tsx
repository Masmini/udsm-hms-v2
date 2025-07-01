//src/app/hubs/hubs-client.tsx
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
} from "@mui/material";
import { Search, Group, Assignment, Event, School } from "@mui/icons-material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Hub {
  id: string;
  name: string;
  description: string;
  logo?: string | null | undefined;
  cardBio?: string | null;
  categories: { name: string }[];
  _count: {
    members: number;
    projects: number;
    programmes: number;
    events: number;
  };
}

interface Category {
  id: string;
  name: string;
}

interface HubsClientProps {
  hubs: Hub[];
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchParams: {
    search: string;
    category: string;
  };
}

export default function HubsClient({
  hubs,
  categories,
  pagination,
  searchParams,
}: HubsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.search);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.category
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    params.set("page", "1");
    router.push(`/hubs?${params.toString()}`);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    params.set("page", value.toString());
    router.push(`/hubs?${params.toString()}`);
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
            Explore Hubs
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Discover communities, connect with peers, and collaborate on amazing
            projects
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
                label="Search hubs..."
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
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
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
          {pagination.total} hubs found
        </Typography>
      </Box>

      {/* Hubs Grid */}
      <Grid container spacing={3}>
        {hubs.map((hub, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={hub.id}>
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
                href={`/hubs/${hub.id}`}
              >
                {hub.logo && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={hub.logo}
                    alt={hub.name}
                    sx={{ objectFit: "cover" }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    {!hub.logo && (
                      <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                        {hub.name[0]}
                      </Avatar>
                    )}
                    <Typography variant="h6" fontWeight="bold">
                      {hub.name}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 40 }}
                  >
                    {(hub.cardBio || hub.description).substring(0, 100)}...
                  </Typography>

                  {/* Categories */}
                  <Box sx={{ mb: 2 }}>
                    {hub.categories.slice(0, 2).map((category) => (
                      <Chip
                        key={category.name}
                        label={category.name}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {hub.categories.length > 2 && (
                      <Chip
                        label={`+${hub.categories.length - 2} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Stats */}
                  <Grid container spacing={1}>
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
                          {hub._count.members} members
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
                          {hub._count.projects} projects
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
                          {hub._count.events} events
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
                          {hub._count.programmes} programmes
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {hubs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Group sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No hubs found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search criteria or browse all hubs.
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
