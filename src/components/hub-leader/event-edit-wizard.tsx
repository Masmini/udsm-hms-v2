// src/components/hub-leader/event-edit-wizard.tsx
// src/components/hub-leader/event-edit-wizard.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Add this import
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Autocomplete,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  CardMedia,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Delete,
  CloudUpload,
  Event,
  LocationOn,
  VideoCall,
  People,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import EditorDialog from "../ui/EditorDialog";
import { EnhancedButton } from "../ui/enhanced-button";
import { useNotification } from "../providers/notification-provider";

interface EventEditWizardProps {
  open: boolean;
  onClose: () => void;
  hubId: string;
  eventId: string;
  onEventUpdated: () => void;
}

const steps = ["Basic Information", "Schedule & Venue", "Settings & Media"];

const eventTypes = [
  "Workshop",
  "Seminar",
  "Conference",
  "Networking",
  "Training",
  "Competition",
  "Social",
  "Other",
];

export default function EventEditWizard({
  open,
  onClose,
  hubId,
  eventId,
  onEventUpdated,
}: EventEditWizardProps) {
  const router = useRouter(); // Add router
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editorDialog, setEditorDialog] = useState(false);
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    title: "",
    description: EditorState.createEmpty(),
    coverImage: "",
    eventType: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    isOnline: false,
    venue: "",
    venueAddress: "",
    meetingLink: "",
    capacity: "",
    visibility: "HUB_MEMBERS" as "PUBLIC" | "AUTHENTICATED" | "HUB_MEMBERS",
    requirements: [] as string[],
    tags: [] as string[],
    speakers: [] as Array<{
      name: string;
      title: string;
      bio: string;
      image: string;
    }>,
    agenda: [] as Array<{
      time: string;
      title: string;
      description: string;
      speaker: string;
    }>,
    media: [] as Array<{ name: string; url: string; type: string }>,
  });

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/hub-leader/events/${eventId}`);
        if (response.status === 401 && (await response.json()).redirect) {
          router.push("/auth/signin"); // Redirect to sign-in page
          return;
        }
        if (response.ok) {
          const event = await response.json();
          const { contentBlocks, entityMap } = htmlToDraft(event.description);
          const contentState = ContentState.createFromBlockArray(
            contentBlocks,
            entityMap
          );
          setFormData({
            title: event.title,
            description: EditorState.createWithContent(contentState),
            coverImage: event.coverImage || "",
            eventType: event.eventType,
            startDate: event.startDate ? new Date(event.startDate) : null,
            endDate: event.endDate ? new Date(event.endDate) : null,
            isOnline: event.isOnline,
            venue: event.venue || "",
            venueAddress: event.venueAddress || "",
            meetingLink: event.meetingLink || "",
            capacity: event.capacity ? event.capacity.toString() : "",
            visibility: event.visibility,
            requirements: event.requirements || [],
            tags: event.tags || [],
            speakers: event.speakers || [],
            agenda: event.agenda || [],
            media: event.media || [],
          });
        } else {
          showError("Failed to load event data");
        }
      } catch (error) {
        showError("Error fetching event data");
      } finally {
        setLoading(false);
      }
    };
    if (open) {
      fetchEvent();
    }
  }, [open, eventId, showError, router]);

  const handleNext = () => {
    if (
      activeStep === 0 &&
      (!formData.title || !formData.description.getCurrentContent().hasText())
    ) {
      showError("Please fill in the required fields");
      return;
    }
    if (activeStep === 1 && !formData.startDate) {
      showError("Please set the event start date");
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAddSpeaker = () => {
    setFormData({
      ...formData,
      speakers: [
        ...formData.speakers,
        { name: "", title: "", bio: "", image: "" },
      ],
    });
  };

  const handleRemoveSpeaker = (index: number) => {
    setFormData({
      ...formData,
      speakers: formData.speakers.filter((_, i) => i !== index),
    });
  };

  const handleSpeakerChange = (index: number, field: string, value: string) => {
    const updatedSpeakers = [...formData.speakers];
    updatedSpeakers[index] = { ...updatedSpeakers[index], [field]: value };
    setFormData({ ...formData, speakers: updatedSpeakers });
  };

  const handleAddAgendaItem = () => {
    setFormData({
      ...formData,
      agenda: [
        ...formData.agenda,
        { time: "", title: "", description: "", speaker: "" },
      ],
    });
  };

  const handleRemoveAgendaItem = (index: number) => {
    setFormData({
      ...formData,
      agenda: formData.agenda.filter((_, i) => i !== index),
    });
  };

  const handleAgendaChange = (index: number, field: string, value: string) => {
    const updatedAgenda = [...formData.agenda];
    updatedAgenda[index] = { ...updatedAgenda[index], [field]: value };
    setFormData({ ...formData, agenda: updatedAgenda });
  };

  const handleCoverImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      showError("Please select a valid image file (JPEG, JPG, or PNG)");
      return;
    }

    setLoading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "events/cover-images");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.status === 401 && (await response.json()).redirect) {
        router.push("/auth/signin"); // Redirect to sign-in page
        return;
      }

      if (response.ok) {
        const { url } = await response.json();
        setFormData((prev) => ({
          ...prev,
          coverImage: url,
        }));
        showSuccess("Cover image uploaded successfully");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      showError(
        `Failed to upload cover image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoverImage = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: "",
    }));
  };

  const handleMediaUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("folder", "events");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (response.status === 401 && (await response.json()).redirect) {
          router.push("/auth/signin"); // Redirect to sign-in page
          return;
        }

        if (response.ok) {
          const { url, type, name } = await response.json();
          setFormData((prev) => ({
            ...prev,
            media: [...prev.media, { name, url, type }],
          }));
        } else {
          throw new Error("Upload failed");
        }
      }
      showSuccess("Media uploaded successfully");
    } catch (error) {
      showError(
        `Failed to upload media: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const descriptionHtml = draftToHtml(
        convertToRaw(formData.description.getCurrentContent())
      );

      const eventData = {
        title: formData.title,
        description: descriptionHtml,
        coverImage: formData.coverImage,
        eventType: formData.eventType,
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
        isOnline: formData.isOnline,
        venue: formData.venue,
        venueAddress: formData.venueAddress,
        meetingLink: formData.meetingLink,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        visibility: formData.visibility,
        requirements: formData.requirements,
        tags: formData.tags,
        speakers: formData.speakers,
        agenda: formData.agenda,
        hubId,
      };

      const response = await fetch(`/api/hub-leader/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (response.status === 401 && (await response.json()).redirect) {
        router.push("/auth/signin"); // Redirect to sign-in page
        return;
      }

      if (!response.ok) throw new Error("Failed to update event");

      showSuccess("Event updated successfully!");
      onEventUpdated();
      onClose();
    } catch (error) {
      showError("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Tooltip title="Enter a clear, concise title for the event (required).">
              <TextField
                fullWidth
                label="Event Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                sx={{ mb: 3 }}
              />
            </Tooltip>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Event Description *
              </Typography>
              <Tooltip title="Provide a detailed description of the event, including its purpose and key details (required).">
                <Button
                  variant="outlined"
                  onClick={() => setEditorDialog(true)}
                  fullWidth
                  sx={{ minHeight: 100, justifyContent: "flex-start" }}
                >
                  {formData.description.getCurrentContent().hasText()
                    ? "Edit Description"
                    : "Add Event Description"}
                </Button>
              </Tooltip>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Cover Image
              </Typography>
              <Tooltip title="Upload an image (JPEG, JPG, PNG) to visually represent the event. Optional, but recommended for promotion.">
                <Box>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleCoverImageUpload}
                    style={{ display: "none" }}
                    id="cover-image-upload"
                  />
                  <label htmlFor="cover-image-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      disabled={loading}
                      sx={{ mb: 2 }}
                    >
                      Upload Cover Image
                    </Button>
                  </label>
                  {formData.coverImage && (
                    <Box sx={{ mt: 2 }}>
                      <Card sx={{ maxWidth: 300 }}>
                        <CardMedia
                          component="img"
                          height="150"
                          image={formData.coverImage}
                          alt="Cover Image Preview"
                          sx={{ objectFit: "cover" }}
                        />
                        <CardContent>
                          <Button
                            variant="text"
                            color="error"
                            startIcon={<Delete />}
                            onClick={handleRemoveCoverImage}
                          >
                            Remove Image
                          </Button>
                        </CardContent>
                      </Card>
                    </Box>
                  )}
                </Box>
              </Tooltip>
            </Box>

            <Tooltip title="Select the type of event (e.g., Workshop, Seminar). Helps categorize the event for users.">
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.eventType}
                  onChange={(e) =>
                    setFormData({ ...formData, eventType: e.target.value })
                  }
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>

            <Tooltip title="Add tags to describe the event (e.g., 'AI', 'Tech'). Helps with discoverability.">
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.tags}
                onChange={(_, newValue) =>
                  setFormData({ ...formData, tags: newValue })
                }
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Add tags" />
                )}
              />
            </Tooltip>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Tooltip title="Set the start date and time of the event (required).">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Start Date & Time *"
                      value={formData.startDate}
                      onChange={(date) =>
                        setFormData({ ...formData, startDate: date })
                      }
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={6}>
                <Tooltip title="Set the end date and time of the event (optional).">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="End Date & Time"
                      value={formData.endDate}
                      onChange={(date) =>
                        setFormData({ ...formData, endDate: date })
                      }
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Tooltip>
              </Grid>
            </Grid>

            <Tooltip title="Toggle to indicate if the event is online. Affects venue fields.">
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isOnline}
                    onChange={(e) =>
                      setFormData({ ...formData, isOnline: e.target.checked })
                    }
                  />
                }
                label="Online Event"
                sx={{ mb: 3 }}
              />
            </Tooltip>

            {formData.isOnline ? (
              <Tooltip title="Provide the meeting link for online events (e.g., Zoom, Teams).">
                <TextField
                  fullWidth
                  label="Meeting Link"
                  value={formData.meetingLink}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingLink: e.target.value })
                  }
                  placeholder="https://zoom.us/j/..."
                  sx={{ mb: 3 }}
                />
              </Tooltip>
            ) : (
              <>
                <Tooltip title="Enter the name of the physical venue (e.g., 'Conference Hall').">
                  <TextField
                    fullWidth
                    label="Venue"
                    value={formData.venue}
                    onChange={(e) =>
                      setFormData({ ...formData, venue: e.target.value })
                    }
                    sx={{ mb: 3 }}
                  />
                </Tooltip>
                <Tooltip title="Provide the full address of the venue for in-person events.">
                  <TextField
                    fullWidth
                    label="Venue Address"
                    value={formData.venueAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, venueAddress: e.target.value })
                    }
                    multiline
                    rows={2}
                    sx={{ mb: 3 }}
                  />
                </Tooltip>
              </>
            )}

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Tooltip title="Specify the maximum number of attendees (optional).">
                  <TextField
                    fullWidth
                    label="Capacity (Optional)"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={6}>
                <Tooltip title="Choose who can view the event (Public, Authenticated Users, or Hub Members Only).">
                  <FormControl fullWidth>
                    <InputLabel>Visibility</InputLabel>
                    <Select
                      value={formData.visibility}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visibility: e.target.value as any,
                        })
                      }
                    >
                      <MenuItem value="PUBLIC">Public</MenuItem>
                      <MenuItem value="AUTHENTICATED">
                        Authenticated Users
                      </MenuItem>
                      <MenuItem value="HUB_MEMBERS">Hub Members Only</MenuItem>
                    </Select>
                  </FormControl>
                </Tooltip>
              </Grid>
            </Grid>

            <Tooltip title="List requirements for attendees (e.g., 'Laptop', 'Prior Registration').">
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.requirements}
                onChange={(_, newValue) =>
                  setFormData({ ...formData, requirements: newValue })
                }
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Requirements"
                    placeholder="Add requirements"
                  />
                )}
              />
            </Tooltip>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Speakers
            </Typography>
            <Tooltip title="Add speakers or presenters for the event, including their name, title, bio, and optional image URL.">
              <Button
                startIcon={<Add />}
                onClick={handleAddSpeaker}
                sx={{ mb: 2 }}
              >
                Add Speaker
              </Button>
            </Tooltip>

            {formData.speakers.map((speaker, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2">
                      Speaker {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveSpeaker(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Tooltip title="Enter the speaker's full name.">
                        <TextField
                          fullWidth
                          label="Name"
                          value={speaker.name}
                          onChange={(e) =>
                            handleSpeakerChange(index, "name", e.target.value)
                          }
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Tooltip title="Enter the speaker's professional title or role.">
                        <TextField
                          fullWidth
                          label="Title"
                          value={speaker.title}
                          onChange={(e) =>
                            handleSpeakerChange(index, "title", e.target.value)
                          }
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                      <Tooltip title="Provide a brief bio of the speaker.">
                        <TextField
                          fullWidth
                          label="Bio"
                          multiline
                          rows={2}
                          value={speaker.bio}
                          onChange={(e) =>
                            handleSpeakerChange(index, "bio", e.target.value)
                          }
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                      <Tooltip title="Enter a URL for the speaker's image (optional).">
                        <TextField
                          fullWidth
                          label="Image URL"
                          value={speaker.image}
                          onChange={(e) =>
                            handleSpeakerChange(index, "image", e.target.value)
                          }
                        />
                      </Tooltip>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Agenda
            </Typography>
            <Tooltip title="Add agenda items with time, title, description, and speaker details.">
              <Button
                startIcon={<Add />}
                onClick={handleAddAgendaItem}
                sx={{ mb: 2 }}
              >
                Add Agenda Item
              </Button>
            </Tooltip>

            {formData.agenda.map((item, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2">
                      Agenda Item {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveAgendaItem(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Tooltip title="Specify the time for this agenda item (e.g., '10:00 AM').">
                        <TextField
                          fullWidth
                          label="Time"
                          value={item.time}
                          onChange={(e) =>
                            handleAgendaChange(index, "time", e.target.value)
                          }
                          placeholder="10:00 AM"
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Tooltip title="Enter the title of the agenda item.">
                        <TextField
                          fullWidth
                          label="Title"
                          value={item.title}
                          onChange={(e) =>
                            handleAgendaChange(index, "title", e.target.value)
                          }
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                      <Tooltip title="Describe the agenda item in detail.">
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={2}
                          value={item.description}
                          onChange={(e) =>
                            handleAgendaChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                      <Tooltip title="Name the speaker for this agenda item.">
                        <TextField
                          fullWidth
                          label="Speaker"
                          value={item.speaker}
                          onChange={(e) =>
                            handleAgendaChange(index, "speaker", e.target.value)
                          }
                        />
                      </Tooltip>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Media Files
            </Typography>
            <Tooltip title="Upload images, videos, or PDFs to support the event (e.g., posters, presentations).">
              <Box>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,application/pdf"
                  onChange={handleMediaUpload}
                  style={{ display: "none" }}
                  id="media-upload"
                />
                <label htmlFor="media-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    disabled={loading}
                    sx={{ mb: 2 }}
                  >
                    Upload Media
                  </Button>
                </label>
              </Box>
            </Tooltip>

            {formData.media.length > 0 && (
              <List>
                {formData.media.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={file.name} secondary={file.type} />
                    <IconButton
                      onClick={() => {
                        setFormData({
                          ...formData,
                          media: formData.media.filter((_, i) => i !== index),
                        });
                      }}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <EnhancedButton
              onClick={handleSubmit}
              variant="contained"
              loading={loading}
              loadingText="Updating Event..."
            >
              Update Event
            </EnhancedButton>
          ) : (
            <Button onClick={handleNext} variant="contained">
              Next
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <EditorDialog
        open={editorDialog}
        onClose={() => setEditorDialog(false)}
        field="description"
        initialState={formData.description}
        setValue={(field, value) =>
          setFormData({ ...formData, [field]: value })
        }
        trigger={async () => {
          setEditorDialog(false);
          return true;
        }}
        hubId={hubId}
      />
    </>
  );
}
