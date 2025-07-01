//src/app/admin/audit-logs/audit-logs-client.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Security,
  Search,
  FilterList,
  Download,
  Refresh,
  ExpandMore,
  CheckCircle,
  Error,
  Warning,
  Info,
  Person,
  AdminPanelSettings,
  Event,
  Assignment,
  Group,
  School,
  Article,
  Settings,
  Login,
  Logout,
  Edit,
  Delete,
  Add,
  Close,
  GetApp,
  Computer,
  Smartphone,
  Tablet,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

interface AuditFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
}

const actionTypes = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "ROLE_CHANGE",
  "APPROVE",
  "REJECT",
];
const entityTypes = [
  "USER",
  "HUB",
  "EVENT",
  "PROJECT",
  "PROGRAMME",
  "NEWS",
  "SESSION",
  "SYSTEM_SETTINGS",
];

export default function AuditLogsClient() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAuditLogs();
  }, [page, rowsPerPage, filters]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.startDate && {
          startDate: filters.startDate.toISOString(),
        }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
        ...(filters.success !== undefined && {
          success: filters.success.toString(),
        }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(
          data.logs.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          }))
        );
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AuditFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setPage(0);
  };

  const exportLogs = async (format: "csv" | "json") => {
    try {
      const params = new URLSearchParams({
        format,
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.startDate && {
          startDate: filters.startDate.toISOString(),
        }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
        ...(filters.success !== undefined && {
          success: filters.success.toString(),
        }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/audit-logs/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-logs-${
          new Date().toISOString().split("T")[0]
        }.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export logs:", error);
    }
    setExportDialogOpen(false);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return <Add color="success" />;
      case "update":
      case "edit":
        return <Edit color="primary" />;
      case "delete":
        return <Delete color="error" />;
      case "login":
        return <Login color="info" />;
      case "logout":
        return <Logout color="warning" />;
      case "role_change":
        return <AdminPanelSettings color="secondary" />;
      case "approve":
        return <CheckCircle color="success" />;
      case "reject":
        return <Error color="error" />;
      default:
        return <Settings color="action" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "user":
        return <Person />;
      case "hub":
        return <Group />;
      case "event":
        return <Event />;
      case "project":
        return <Assignment />;
      case "programme":
        return <School />;
      case "news":
        return <Article />;
      case "session":
        return <Login />;
      case "system_settings":
        return <Settings />;
      default:
        return <Settings />;
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle color="success" /> : <Error color="error" />;
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return <Smartphone fontSize="small" />;
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return <Tablet fontSize="small" />;
    }
    return <Computer fontSize="small" />;
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(timestamp);
  };

  const formatUserAgent = (userAgent: string) => {
    // Extract browser and OS info
    const browserMatch = userAgent.match(
      /(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/
    );
    const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/);

    const browser = browserMatch ? browserMatch[1] : "Unknown";
    const os = osMatch ? osMatch[1] : "Unknown";

    return `${browser} on ${os}`;
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "success";
      case "update":
      case "edit":
        return "info";
      case "delete":
        return "error";
      case "login":
        return "primary";
      case "logout":
        return "warning";
      case "approve":
        return "success";
      case "reject":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 3,
              mb: 4,
              background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
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
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Security sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Security Audit Logs
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Monitor all system activities and security events
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => setExportDialogOpen(true)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  }}
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={fetchAuditLogs}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FilterList sx={{ mr: 1 }} />
              Filters
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by user, action, or entity..."
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={filters.action || ""}
                    onChange={(e) =>
                      handleFilterChange("action", e.target.value || undefined)
                    }
                    label="Action"
                  >
                    <MenuItem value="">All Actions</MenuItem>
                    {actionTypes.map((action) => (
                      <MenuItem key={action} value={action}>
                        {action}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Entity Type</InputLabel>
                  <Select
                    value={filters.entityType || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "entityType",
                        e.target.value || undefined
                      )
                    }
                    label="Entity Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {entityTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={
                      filters.success !== undefined
                        ? filters.success.toString()
                        : ""
                    }
                    onChange={(e) =>
                      handleFilterChange(
                        "success",
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true"
                      )
                    }
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Success</MenuItem>
                    <MenuItem value="false">Failed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{ height: "56px" }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate || null}
                  onChange={(date) => handleFilterChange("startDate", date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate || null}
                  onChange={(date) => handleFilterChange("endDate", date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {totalCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Logs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {logs.filter((log) => log.success).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Successful Actions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {logs.filter((log) => !log.success).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed Actions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {new Set(logs.map((log) => log.userId)).size}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unique Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Audit Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{ textAlign: "center", py: 4 }}
                      >
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{ textAlign: "center", py: 4 }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          No audit logs found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {formatTimestamp(log.timestamp)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                mr: 1,
                                bgcolor: "primary.main",
                              }}
                            >
                              {log.userEmail[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {log.userEmail}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ID: {log.userId.substring(0, 8)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {getActionIcon(log.action)}
                            <Chip
                              label={log.action}
                              size="small"
                              color={getActionColor(log.action) as any}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {getEntityIcon(log.entityType)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {log.entityType}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {getStatusIcon(log.success)}
                            <Typography
                              variant="body2"
                              color={
                                log.success ? "success.main" : "error.main"
                              }
                              sx={{ ml: 1 }}
                            >
                              {log.success ? "Success" : "Failed"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {log.ipAddress}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {getDeviceIcon(log.userAgent)}
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              {formatUserAgent(log.userAgent)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(log)}
                            >
                              <Info />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </Paper>
        </motion.div>

        {/* Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Audit Log Details
              <IconButton onClick={() => setDetailsOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedLog && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Timestamp
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {formatTimestamp(selectedLog.timestamp)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      User
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedLog.userEmail}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Action
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {getActionIcon(selectedLog.action)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {selectedLog.action}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Entity Type
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {getEntityIcon(selectedLog.entityType)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {selectedLog.entityType}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Status
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {getStatusIcon(selectedLog.success)}
                      <Typography
                        variant="body2"
                        color={
                          selectedLog.success ? "success.main" : "error.main"
                        }
                        sx={{ ml: 1 }}
                      >
                        {selectedLog.success ? "Success" : "Failed"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      IP Address
                    </Typography>
                    <Typography
                      variant="body2"
                      fontFamily="monospace"
                      sx={{ mb: 2 }}
                    >
                      {selectedLog.ipAddress}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      User Agent
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, wordBreak: "break-all" }}
                    >
                      {selectedLog.userAgent}
                    </Typography>
                  </Grid>
                  {selectedLog.entityId && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Entity ID
                      </Typography>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        sx={{ mb: 2 }}
                      >
                        {selectedLog.entityId}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Details
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                      <pre
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Export Audit Logs</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Choose the format for exporting the audit logs. The export will
              include all logs matching your current filters.
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<GetApp />}
                onClick={() => exportLogs("csv")}
                fullWidth
              >
                Export as CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<GetApp />}
                onClick={() => exportLogs("json")}
                fullWidth
              >
                Export as JSON
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}
