"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Breadcrumbs,
  Link,
  Pagination,
} from "@mui/material";
import {
  Users,
  Search,
  Calendar,
  Github,
  Linkedin,
  Mail,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageLoader } from "@/components/ui/page-loader";
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
    phoneNumber?: string;
  };
}

interface Hub {
  id: string;
  name: string;
  description: string;
  logo?: string;
}

export default function HubMembersPage() {
  const { hubId } = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();

  const [hub, setHub] = useState<Hub | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const membersPerPage = 24;

  useEffect(() => {
    fetchData();
  }, [hubId, page, searchTerm, roleFilter, skillFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hubResponse, membersResponse] = await Promise.all([
        fetch(`/api/hubs/${hubId}`),
        fetch(
          `/api/hubs/${hubId}/members?` +
            new URLSearchParams({
              page: page.toString(),
              limit: membersPerPage.toString(),
              search: searchTerm,
              role: roleFilter,
              skill: skillFilter,
            })
        ),
      ]);

      if (hubResponse.ok) {
        const hubData = await hubResponse.json();
        setHub(hubData.data);
      }

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.data || []);
        setTotalPages(Math.ceil((membersData.total || 0) / membersPerPage));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const uniqueSkills = Array.from(
    new Set(members.flatMap((member) => member.user.skills))
  ).sort();

  if (loading && !hub) {
    return <PageLoader message="Loading hub members..." />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          onClick={() => router.push("/hubs")}
          sx={{ textDecoration: "none" }}
        >
          Hubs
        </Link>
        <Link
          component="button"
          onClick={() => router.push(`/hubs/${hubId}`)}
          sx={{ textDecoration: "none" }}
        >
          {hub?.name}
        </Link>
        <Typography color="text.primary">Members</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <EnhancedButton
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => router.push(`/hubs/${hubId}`)}
        >
          Back to Hub
        </EnhancedButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {hub?.logo && (
            <Avatar src={hub.logo} sx={{ width: 40, height: 40 }}>
              {hub.name?.charAt(0)}
            </Avatar>
          )}
          <Box>
            <Typography variant="h4" component="h1">
              {hub?.name} Members
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Explore the talented members of this hub
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="HUB_LEADER">Hub Leader</MenuItem>
                  <MenuItem value="SUPERVISOR">Supervisor</MenuItem>
                  <MenuItem value="MEMBER">Member</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Skill</InputLabel>
                <Select
                  value={skillFilter}
                  label="Skill"
                  onChange={(e) => {
                    setSkillFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">All Skills</MenuItem>
                  {uniqueSkills.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("");
                  setSkillFilter("");
                  setPage(1);
                }}
                startIcon={<Filter size={20} />}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Members Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, i) => (
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
      ) : members.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Users size={64} color="#ccc" />
          <Typography variant="h5" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
            No members found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm || roleFilter || skillFilter
              ? "Try adjusting your search criteria."
              : "This hub doesn't have any members yet."}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {members.map((member, index) => (
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

                      {/* Contact Options */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                          mb: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          size="small"
                          startIcon={<Mail size={16} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`mailto:${member.user.email}`);
                          }}
                        >
                          Email
                        </Button>
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
                              window.open(
                                member.user.linkedinProfile,
                                "_blank"
                              );
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

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
