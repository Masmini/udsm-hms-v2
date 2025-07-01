// src/app/admin/users/admin-users-client.tsx
"use client";

import { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Search,
  Edit,
  Delete,
  Visibility,
  PersonAdd,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client"; // Import Role enum

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role; // Use Prisma Role enum
  profilePicture?: string | null; // Align with Prisma schema
  degreeProgramme?: string | null; // Align with Prisma schema
  skills: string[];
  isGoogleUser: boolean;
  createdAt: Date; // Use Date instead of string
  _count: {
    hubs: number;
    programmes: number;
    eventRegistrations: number;
  };
}

interface AdminUsersClientProps {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchParams: {
    search: string;
    role: string;
  };
}

export default function AdminUsersClient({
  users,
  pagination,
  searchParams,
}: AdminUsersClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.search);
  const [selectedRole, setSelectedRole] = useState(searchParams.role);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: pagination.page - 1, // DataGrid uses 0-based indexing
    pageSize: pagination.limit,
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedRole) params.set("role", selectedRole);
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`);
  };

  const handlePaginationModelChange = (newPaginationModel: {
    page: number;
    pageSize: number;
  }) => {
    setPaginationModel(newPaginationModel);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedRole) params.set("role", selectedRole);
    params.set("page", (newPaginationModel.page + 1).toString());
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (response.ok) {
        alert("User deleted successfully");
        router.refresh();
      } else {
        alert(result.error || "Failed to delete user");
      }
    } catch (error) {
      alert("An error occurred while deleting the user");
    }
  };

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      renderCell: (params) => (
        <Avatar src={params.row.profilePicture} sx={{ width: 32, height: 32 }}>
          {params.row.firstName[0]}
          {params.row.lastName[0]}
        </Avatar>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.firstName} {params.row.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "ADMIN" ? "error" : "primary"}
        />
      ),
    },
    {
      field: "degreeProgramme",
      headerName: "Programme",
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || "Not specified"}
        </Typography>
      ),
    },
    {
      field: "skills",
      headerName: "Skills",
      width: 200,
      renderCell: (params) => (
        <Box>
          {params.value.slice(0, 2).map((skill: string) => (
            <Chip
              key={skill}
              label={skill}
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
      field: "stats",
      headerName: "Activity",
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="caption" display="block">
            {params.row._count.hubs} hubs
          </Typography>
          <Typography variant="caption" display="block">
            {params.row._count.programmes} programmes
          </Typography>
          <Typography variant="caption" display="block">
            {params.row._count.eventRegistrations} events
          </Typography>
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Joined",
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
          onClick={() => handleViewUser(params.row)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Edit"
          onClick={() => router.push(`/admin/users/${params.row.id}/edit`)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDeleteUser(params.row.id)}
        />,
      ],
    },
  ];

  function handlePageChange(
    event: React.ChangeEvent<unknown>,
    page: number
  ): void {
    setPaginationModel((prev) => ({
      ...prev,
      page: page - 1,
    }));
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedRole) params.set("role", selectedRole);
    params.set("page", page.toString());
    router.push(`/admin/users?${params.toString()}`);
  }

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
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
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
                User Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Manage system users and their permissions
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
              onClick={() => router.push("/admin/users/create")}
            >
              Add User
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search users..."
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
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {pagination.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {users.filter((u) => u.role === "STUDENT").length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {users.filter((u) => u.role === "ADMIN").length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admins
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {users.filter((u) => u.isGoogleUser).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Google Users
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
            rows={users}
            columns={columns}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            rowCount={pagination.total}
            paginationMode="server"
            disableRowSelectionOnClick
            disableColumnMenu
            hideFooter={pagination.totalPages <= 1}
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
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
                  <Avatar
                    src={selectedUser.profilePicture || undefined}
                    sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
                  >
                    {selectedUser.firstName[0]}
                    {selectedUser.lastName[0]}
                  </Avatar>
                  <Typography variant="h6">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                  <Chip
                    label={selectedUser.role}
                    color={selectedUser.role === "ADMIN" ? "error" : "primary"}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="subtitle2" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedUser.email}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Degree Programme
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedUser.degreeProgramme || "Not specified"}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Skills
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedUser.skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Activity
                  </Typography>
                  <Typography variant="body2">
                    • {selectedUser._count.hubs} hub memberships
                  </Typography>
                  <Typography variant="body2">
                    • {selectedUser._count.programmes} programme enrollments
                  </Typography>
                  <Typography variant="body2">
                    • {selectedUser._count.eventRegistrations} event
                    registrations
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Account Type
                  </Typography>
                  <Typography variant="body2">
                    {selectedUser.isGoogleUser
                      ? "Google Account"
                      : "Email/Password Account"}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Joined
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setViewDialogOpen(false);
              router.push(`/admin/users/${selectedUser?.id}/edit`);
            }}
          >
            Edit User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
