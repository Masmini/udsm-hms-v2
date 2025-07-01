//src/app/admin/users/[id]/edit/edit-user-client.tsx
"use client";

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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | "ADMIN";
  degreeProgramme?: string | null; // Updated to allow null
  skills: string[];
  profilePicture?: string | null; // Align with Prisma's nullability
  isGoogleUser: boolean;
}

export default function EditUserClient({ user }: { user: User }) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    degreeProgramme: user.degreeProgramme ?? "", // Convert null to empty string
    skills: user.skills.join(", "),
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
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          degreeProgramme: formData.degreeProgramme || null, // Convert empty string to null
        }),
      });

      const result = await response.json();
      if (response.ok) {
        showNotification("User updated successfully", "success");
        router.push("/admin/users");
      } else {
        showNotification(result.error || "Failed to update user", "error");
      }
    } catch (error) {
      showNotification("An error occurred while updating the user", "error");
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
          Edit User
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
          Update user details
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
              disabled={user.isGoogleUser}
              helperText={
                user.isGoogleUser ? "Cannot edit email for Google accounts" : ""
              }
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
              label="Degree Programme"
              name="degreeProgramme"
              value={formData.degreeProgramme}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              fullWidth
              helperText="Enter skills separated by commas"
            />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                {loading ? "Updating..." : "Update User"}
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
