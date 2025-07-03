"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Skeleton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Users,
  Search,
  Mail,
  MapPin,
  Calendar,
  Award,
  Github,
  Linkedin,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useNotification } from "@/components/providers/notification-provider";

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    degreeProgramme?: string;
    skills: string[];
    bio?: string;
    githubProfile?: string;
    linkedinProfile?: string;
    createdAt: string;
  };
}

interface MembersSectionProps {
  hubId: string;
}

export default function MembersSection({ hubId }: MembersSectionProps) {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [hubId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hubs/${hubId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      showNotification("Failed to load members", "error");
    } finally {
      setLoading(false);
    }
  };

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "HUB_LEADER":
        return "Hub Leader";
      case "SUPERVISOR":
        return "Supervisor";
      case "MEMBER":
        return "Member";
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesRole = !roleFilter || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Skeleton
                    variant="circular"
                    width={80}
                    height={80}
                    sx={{ mx: "auto", mb: 2 }}
                  />
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton
                    variant="text"
                    height={20}
                    width="60%"
                    sx={{ mx: "auto" }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Search and Filter */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 250 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="HUB_LEADER">Hub Leader</MenuItem>
            <MenuItem value="SUPERVISOR">Supervisor</MenuItem>
            <MenuItem value="MEMBER">Member</MenuItem>
          </Select>
        </FormControl>

        <EnhancedButton
          variant="outlined"
          onClick={() => router.push(`/hubs/${hubId}/members`)}
          startIcon={<Users size={20} />}
        >
          View All Members
        </EnhancedButton>
      </Box>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Users size={48} color="#ccc" />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            {searchTerm || roleFilter
              ? "No matching members found"
              : "No members found"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || roleFilter
              ? "Try adjusting your search criteria."
              : "This hub doesn't have any members yet."}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredMembers.slice(0, 12).map((member, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => router.push(`/profile/${member.user.id}`)}
                >
                  <CardContent sx={{ textAlign: "center", flex: 1 }}>
                    <Avatar
                      src={member.user.profilePicture}
                      sx={{
                        width: 80,
                        height: 80,
                        mx: "auto",
                        mb: 2,
                        border: "3px solid",
                        borderColor: "primary.light",
                      }}
                    >
                      {member.user.firstName.charAt(0)}
                    </Avatar>

                    <Typography variant="h6" component="h3" gutterBottom>
                      {member.user.firstName} {member.user.lastName}
                    </Typography>

                    <Chip
                      label={getRoleLabel(member.role)}
                      color={getRoleColor(member.role) as any}
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    {member.user.degreeProgramme && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {member.user.degreeProgramme}
                      </Typography>
                    )}

                    {member.user.bio && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {member.user.bio}
                      </Typography>
                    )}

                    {/* Skills */}
                    {member.user.skills.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Skills:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            justifyContent: "center",
                          }}
                        >
                          {member.user.skills.slice(0, 3).map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {member.user.skills.length > 3 && (
                            <Chip
                              label={`+${member.user.skills.length - 3}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Social Links */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      {member.user.githubProfile && (
                        <Button
                          size="small"
                          startIcon={<Github size={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(member.user.githubProfile, "_blank");
                          }}
                        >
                          GitHub
                        </Button>
                      )}
                      {member.user.linkedinProfile && (
                        <Button
                          size="small"
                          startIcon={<Linkedin size={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(member.user.linkedinProfile, "_blank");
                          }}
                        >
                          LinkedIn
                        </Button>
                      )}
                    </Box>

                    {/* Member Since */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        mt: "auto",
                      }}
                    >
                      <Calendar size={14} />
                      <Typography variant="body2" color="text.secondary">
                        Joined {formatDate(member.joinedAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {filteredMembers.length > 12 && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <EnhancedButton
            variant="outlined"
            onClick={() => router.push(`/hubs/${hubId}/members`)}
          >
            View All {filteredMembers.length} Members
          </EnhancedButton>
        </Box>
      )}
    </Box>
  );
}
