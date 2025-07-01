//src/app/admin/hubs/admin-hubs-client.tsx
"use client";

import { useState, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  Box,
  Chip,
  Avatar,
  IconButton,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Search,
  Edit,
  Delete,
  Visibility,
  Add,
  Group,
  Assignment,
  Event,
  School,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Hub {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  cardBio?: string;
  createdAt: string;
  categories: { name: string }[];
  _count: {
    members: number;
    projects: number;
    programmes: number;
    events: number;
  };
}

interface AdminHubsClientProps {
  hubs: Hub[];
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

export default function AdminHubsClient({
  hubs,
  pagination,
  searchParams,
}: AdminHubsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.search);
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", "1");
    router.push(`/admin/hubs?${params.toString()}`);
  }, [search, router]);

  const handlePageChange = useCallback(
    (event: React.ChangeEvent<unknown>, value: number) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", value.toString());
      router.push(`/admin/hubs?${params.toString()}`);
    },
    [search, router]
  );

  const handleViewHub = useCallback((hub: Hub) => {
    setSelectedHub(hub);
    setViewDialogOpen(true);
  }, []);

  const columns: GridColDef[] = [
    {
      field: "logo",
      headerName: "",
      width: 60,
      renderCell: (params) => (
        <Avatar src={params.row.logo} sx={{ width: 32, height: 32 }}>
          {params.row.name[0]}
        </Avatar>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "name",
      headerName: "Hub Name",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.cardBio || params.row.description.substring(0, 50)}...
          </Typography>
        </Box>
      ),
    },
    {
      field: "categories",
      headerName: "Categories",
      width: 200,
      renderCell: (params) => (
        <Box>
          {params.value.slice(0, 2).map((category: any) => (
            <Chip
              key={category.name}
              label={category.name}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
          {params.value.length > 2 && (
            <Chip
              label={`+${params.value.length - 2}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      ),
    },
    {
      field: "members",
      headerName: "Members",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">{params.row._count.members}</Typography>
      ),
    },
    {
      field: "projects",
      headerName: "Projects",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">{params.row._count.projects}</Typography>
      ),
    },
    {
      field: "programmes",
      headerName: "Programmes",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">{params.row._count.programmes}</Typography>
      ),
    },
    {
      field: "events",
      headerName: "Events",
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">{params.row._count.events}</Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<Visibility />}
          label="View"
          onClick={() => handleViewHub(params.row)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Edit"
          onClick={() => router.push(`/admin/hubs/${params.row.id}/edit`)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Delete"
          onClick={() => {
            // TODO: Implement delete logic
          }}
        />,
      ],
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Hub Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Manage research hubs and communities
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
              onClick={() => router.push("/admin/hubs/create")}
            >
              Create Hub
            </Button>
          </Box>
        </Paper>
      </motion.div>

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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {pagination.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Hubs
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {hubs.reduce((sum, hub) => sum + hub._count.members, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Members
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {hubs.reduce((sum, hub) => sum + hub._count.projects, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Projects
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {hubs.reduce((sum, hub) => sum + hub._count.events, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Events
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={hubs}
            columns={columns}
            paginationModel={{
              page: pagination.page - 1,
              pageSize: pagination.limit,
            }}
            pageSizeOptions={[10, 25, 50]}
            rowCount={pagination.total}
            paginationMode="server"
            disableRowSelectionOnClick
            disableColumnMenu
            onPaginationModelChange={({ page, pageSize }) => {
              handlePageChange({} as any, page + 1);
            }}
          />
        </Paper>
      </motion.div>

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

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Hub Details</DialogTitle>
        <DialogContent>
          {selectedHub && (
            <Box sx={{ pt: 2 }}>
              <Card>
                {selectedHub.coverImage && (
                  <Box sx={{ height: 200, position: "relative" }}>
                    <Image
                      src={selectedHub.coverImage}
                      alt={selectedHub.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                    />
                  </Box>
                )}
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={selectedHub.logo}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      {selectedHub.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {selectedHub.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedHub.cardBio}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedHub.description}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Categories
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedHub.categories.map((category) => (
                      <Chip
                        key={category.name}
                        label={category.name}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Group sx={{ fontSize: 32, color: "primary.main" }} />
                        <Typography variant="h6" fontWeight="bold">
                          {selectedHub._count.members}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Members
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Assignment
                          sx={{ fontSize: 32, color: "warning.main" }}
                        />
                        <Typography variant="h6" fontWeight="bold">
                          {selectedHub._count.projects}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Projects
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <School sx={{ fontSize: 32, color: "success.main" }} />
                        <Typography variant="h6" fontWeight="bold">
                          {selectedHub._count.programmes}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Programmes
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Event sx={{ fontSize: 32, color: "error.main" }} />
                        <Typography variant="h6" fontWeight="bold">
                          {selectedHub._count.events}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Events
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedHub.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            component={Link}
            href={`/hubs/${selectedHub?.id}`}
          >
            View Public Page
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setViewDialogOpen(false);
              router.push(`/admin/hubs/${selectedHub?.id}/edit`);
            }}
          >
            Edit Hub
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
