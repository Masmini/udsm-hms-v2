"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Visibility,
  Edit,
  CheckCircle,
  Cancel,
  Send,
} from "@mui/icons-material";
import { format } from "date-fns";
import { EnhancedButton } from "../ui/enhanced-button";
import { useNotification } from "../providers/notification-provider";

interface ProjectSuggestionsManagerProps {
  hubId: string;
}

export default function ProjectSuggestionsManager({
  hubId,
}: ProjectSuggestionsManagerProps) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [responseDialog, setResponseDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseAction, setResponseAction] = useState<
    "approve" | "edit" | "deny"
  >("approve");
  const [editedSuggestion, setEditedSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchSuggestions();
  }, [hubId]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(
        `/api/hub-leader/project-suggestions?hubId=${hubId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      showError("Failed to fetch project suggestions");
    }
  };

  const handleResponse = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/hub-leader/project-suggestions/${selectedSuggestion.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: responseAction,
            message: responseMessage,
            editedData: editedSuggestion,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to respond to suggestion");

      showSuccess(`Project suggestion ${responseAction}d successfully`);
      setResponseDialog(false);
      setResponseMessage("");
      fetchSuggestions();
    } catch (error) {
      showError("Failed to respond to suggestion");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Project Creation Suggestions
        </Typography>

        {suggestions.length === 0 ? (
          <Alert severity="info">No project suggestions at the moment</Alert>
        ) : (
          <List>
            {suggestions.map((suggestion: any, index) => (
              <div key={suggestion.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={suggestion.user.profilePicture}>
                      {suggestion.user.firstName[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={suggestion.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          By {suggestion.user.firstName}{" "}
                          {suggestion.user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(
                            new Date(suggestion.createdAt),
                            "MMM dd, yyyy"
                          )}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={suggestion.status}
                            size="small"
                            color={getStatusColor(suggestion.status) as any}
                          />
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => {
                        setSelectedSuggestion(suggestion);
                        setViewDialog(true);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                    {suggestion.status === "PENDING" && (
                      <>
                        <IconButton
                          onClick={() => {
                            setSelectedSuggestion(suggestion);
                            setResponseAction("approve");
                            setResponseDialog(true);
                          }}
                          color="success"
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setSelectedSuggestion(suggestion);
                            setResponseAction("edit");
                            setEditedSuggestion(suggestion);
                            setResponseDialog(true);
                          }}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setSelectedSuggestion(suggestion);
                            setResponseAction("deny");
                            setResponseDialog(true);
                          }}
                          color="error"
                        >
                          <Cancel />
                        </IconButton>
                      </>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                {index < suggestions.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        )}
      </CardContent>

      {/* View Suggestion Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Project Suggestion Details</DialogTitle>
        <DialogContent>
          {selectedSuggestion && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedSuggestion.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedSuggestion.content}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Suggested by: {selectedSuggestion.user.firstName}{" "}
                  {selectedSuggestion.user.lastName}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Date:{" "}
                  {format(
                    new Date(selectedSuggestion.createdAt),
                    "MMM dd, yyyy"
                  )}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Status: {selectedSuggestion.status}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Response Dialog */}
      <Dialog
        open={responseDialog}
        onClose={() => setResponseDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {responseAction === "approve" && "Approve Project Suggestion"}
          {responseAction === "edit" && "Edit Project Suggestion"}
          {responseAction === "deny" && "Deny Project Suggestion"}
        </DialogTitle>
        <DialogContent>
          {responseAction === "edit" && editedSuggestion && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Project Title"
                value={editedSuggestion.title}
                onChange={(e) =>
                  setEditedSuggestion({
                    ...editedSuggestion,
                    title: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Project Description"
                multiline
                rows={4}
                value={editedSuggestion.content}
                onChange={(e) =>
                  setEditedSuggestion({
                    ...editedSuggestion,
                    content: e.target.value,
                  })
                }
              />
            </Box>
          )}

          <TextField
            fullWidth
            label="Response Message"
            multiline
            rows={3}
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder={
              responseAction === "approve"
                ? "Your project suggestion has been approved..."
                : responseAction === "edit"
                ? "Your project suggestion has been edited..."
                : "Your project suggestion has been denied..."
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>Cancel</Button>
          <EnhancedButton
            onClick={handleResponse}
            variant="contained"
            loading={loading}
            color={
              responseAction === "approve"
                ? "success"
                : responseAction === "deny"
                ? "error"
                : "primary"
            }
          >
            {responseAction === "approve" && "Approve"}
            {responseAction === "edit" && "Save Changes"}
            {responseAction === "deny" && "Deny"}
          </EnhancedButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
