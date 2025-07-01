//src/app/admin/users/create/create-user-client.tsx
"use client"; // Mark as Client Component

import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/providers/notification-provider";
import { SelectChangeEvent } from "@mui/material/Select";

export default function CreateUserClient() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "STUDENT" as "STUDENT" | "ADMIN",
    password: "",
    degreeProgramme: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        showNotification("User created successfully", "success");
        router.push("/admin/users");
      } else {
        showNotification(result.error || "Failed to create user", "error");
      }
    } catch (error) {
      showNotification("An error occurred while creating the user", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper
        sx={{
          p: 4,
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          color: "white",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Create New User
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
          Add a new user to the system
        </Typography>
      </Paper>
      <Paper sx={{ p: 4, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              type="email"
            />
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role"
              >
                <MenuItem value="STUDENT">Student</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              type="password"
              helperText="Minimum 8 characters"
            />
            <TextField
              label="Degree Programme"
              name="degreeProgramme"
              value={formData.degreeProgramme}
              onChange={handleChange}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                {loading ? "Creating..." : "Create User"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/admin/users")}
                fullWidth
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
