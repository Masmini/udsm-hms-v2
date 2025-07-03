//src/components/hub-leader/programme-creation-wizard.tsx
// src/components/hub-leader/programme-creation-wizard.tsx
"use client";

import { useState } from "react";
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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  IconButton,
  Divider,
  CardMedia,
  Tooltip,
} from "@mui/material";
import { Add, Delete, CloudUpload, School, Person } from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import EditorDialog from "../ui/EditorDialog";
import { EnhancedButton } from "../ui/enhanced-button";
import { useNotification } from "../providers/notification-provider";

interface ProgrammeCreationWizardProps {
  open: boolean;
  onClose: () => void;
  hubMembers: any[];
  hubId: string;
  onProgrammeCreated: () => void;
}

const steps = [
  "Basic Information",
  "Curriculum & Requirements",
  "Supervisors & Settings",
];

const certificateTypes = [
  "Certificate of Completion",
  "Certificate of Achievement",
  "Diploma",
  "Professional Certificate",
  "Micro-credential",
  "Badge",
];

export default function ProgrammeCreationWizard({
  open,
  onClose,
  hubMembers,
  hubId,
  onProgrammeCreated,
}: ProgrammeCreationWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editorDialog, setEditorDialog] = useState(false);
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    title: "",
    description: EditorState.createEmpty(),
    coverImage: "",
    duration: "",
    certificationType: "",
    maxParticipants: "",
    applicationDeadline: null as Date | null,
    startDate: null as Date | null,
    endDate: null as Date | null,
    prerequisites: [] as string[],
    learningOutcomes: [] as string[],
    curriculum: [] as Array<{
      module: string;
      description: string;
      duration: string;
      topics: string[];
    }>,
    supervisors: [] as string[],
    media: [] as Array<{ name: string; url: string; type: string }>,
  });

  const handleNext = () => {
    if (
      activeStep === 0 &&
      (!formData.title || !formData.description.getCurrentContent().hasText())
    ) {
      showError("Please fill in the required fields");
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAddCurriculumModule = () => {
    setFormData({
      ...formData,
      curriculum: [
        ...formData.curriculum,
        { module: "", description: "", duration: "", topics: [] },
      ],
    });
  };

  const handleRemoveCurriculumModule = (index: number) => {
    setFormData({
      ...formData,
      curriculum: formData.curriculum.filter((_, i) => i !== index),
    });
  };

  const handleCurriculumChange = (index: number, field: string, value: any) => {
    const updatedCurriculum = [...formData.curriculum];
    updatedCurriculum[index] = { ...updatedCurriculum[index], [field]: value };
    setFormData({ ...formData, curriculum: updatedCurriculum });
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
      formDataUpload.append("folder", "programmes/cover-images");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

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
        formDataUpload.append("folder", "programmes");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

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

      const programmeData = {
        title: formData.title,
        description: descriptionHtml,
        coverImage: formData.coverImage,
        duration: formData.duration,
        certificationType: formData.certificationType,
        maxParticipants: formData.maxParticipants
          ? parseInt(formData.maxParticipants)
          : undefined,
        applicationDeadline: formData.applicationDeadline?.toISOString(),
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
        prerequisites: formData.prerequisites,
        learningOutcomes: formData.learningOutcomes,
        curriculum: formData.curriculum,
        supervisors: formData.supervisors,
        hubId,
      };

      const response = await fetch("/api/hub-leader/programmes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(programmeData),
      });

      if (!response.ok) throw new Error("Failed to create programme");

      showSuccess("Programme created successfully!");
      onProgrammeCreated();
      onClose();
    } catch (error) {
      showError("Failed to create programme");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Tooltip title="Enter a clear, concise title for the programme (required).">
              <TextField
                fullWidth
                label="Programme Title"
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
                Programme Description *
              </Typography>
              <Tooltip title="Provide a detailed description of the programme, including its goals and structure (required).">
                <Button
                  variant="outlined"
                  onClick={() => setEditorDialog(true)}
                  fullWidth
                  sx={{ minHeight: 100, justifyContent: "flex-start" }}
                >
                  {formData.description.getCurrentContent().hasText()
                    ? "Edit Description"
                    : "Add Programme Description"}
                </Button>
              </Tooltip>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Cover Image
              </Typography>
              <Tooltip title="Upload an image (JPEG, JPG, PNG) to visually represent the programme. Optional, but recommended for promotion.">
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

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Tooltip title="Specify the duration of the programme (e.g., '6 months', '1 year').">
                  <TextField
                    fullWidth
                    label="Duration"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., 6 months, 1 year"
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={6}>
                <Tooltip title="Select the type of certificate awarded upon completion.">
                  <FormControl fullWidth>
                    <InputLabel>Certificate Type</InputLabel>
                    <Select
                      value={formData.certificationType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          certificationType: e.target.value,
                        })
                      }
                    >
                      {certificateTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Tooltip>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Tooltip title="Set the maximum number of participants (optional).">
                  <TextField
                    fullWidth
                    label="Max Participants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxParticipants: e.target.value,
                      })
                    }
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={4}>
                <Tooltip title="Set the deadline for programme applications.">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Application Deadline"
                      value={formData.applicationDeadline}
                      onChange={(date) =>
                        setFormData({ ...formData, applicationDeadline: date })
                      }
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={4}>
                <Tooltip title="Set the start date of the programme.">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Start Date"
                      value={formData.startDate}
                      onChange={(date) =>
                        setFormData({ ...formData, startDate: date })
                      }
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Prerequisites
            </Typography>
            <Tooltip title="List skills or qualifications required to join the programme (e.g., 'Python', 'Prior Experience').">
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.prerequisites}
                onChange={(_, newValue) =>
                  setFormData({ ...formData, prerequisites: newValue })
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
                    label="Prerequisites"
                    placeholder="Add prerequisites"
                  />
                )}
                sx={{ mb: 3 }}
              />
            </Tooltip>

            <Typography variant="h6" gutterBottom>
              Learning Outcomes
            </Typography>
            <Tooltip title="Specify what participants will learn or achieve (e.g., 'Master React', 'Project Management Skills').">
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.learningOutcomes}
                onChange={(_, newValue) =>
                  setFormData({ ...formData, learningOutcomes: newValue })
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
                    label="Learning Outcomes"
                    placeholder="Add learning outcomes"
                  />
                )}
                sx={{ mb: 3 }}
              />
            </Tooltip>

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Curriculum Modules</Typography>
              <Tooltip title="Add modules to structure the programme's content.">
                <Button startIcon={<Add />} onClick={handleAddCurriculumModule}>
                  Add Module
                </Button>
              </Tooltip>
            </Box>

            {formData.curriculum.map((module, index) => (
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
                      Module {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveCurriculumModule(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Tooltip title="Enter the title of the module.">
                        <TextField
                          fullWidth
                          label="Module Title"
                          value={module.module}
                          onChange={(e) =>
                            handleCurriculumChange(
                              index,
                              "module",
                              e.target.value
                            )
                          }
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Tooltip title="Specify the duration of the module (e.g., '2 weeks').">
                        <TextField
                          fullWidth
                          label="Duration"
                          value={module.duration}
                          onChange={(e) =>
                            handleCurriculumChange(
                              index,
                              "duration",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 2 weeks"
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                      <Tooltip title="Describe the module's content in detail.">
                        <TextField
                          fullWidth
                          label="Module Description"
                          multiline
                          rows={2}
                          value={module.description}
                          onChange={(e) =>
                            handleCurriculumChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                      <Tooltip title="List topics covered in this module.">
                        <Autocomplete
                          multiple
                          freeSolo
                          options={[]}
                          value={module.topics}
                          onChange={(_, newValue) =>
                            handleCurriculumChange(index, "topics", newValue)
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
                              label="Topics"
                              placeholder="Add topics"
                            />
                          )}
                        />
                      </Tooltip>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Programme Supervisors
            </Typography>
            <Tooltip title="Select hub members to supervise the programme.">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select hub members to supervise this programme
              </Typography>
            </Tooltip>

            <List sx={{ maxHeight: 300, overflow: "auto", mb: 3 }}>
              {hubMembers.map((member) => (
                <ListItem key={member.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.supervisors.includes(member.userId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              supervisors: [
                                ...formData.supervisors,
                                member.userId,
                              ],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              supervisors: formData.supervisors.filter(
                                (id) => id !== member.userId
                              ),
                            });
                          }
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={member.user.profilePicture}
                          sx={{ mr: 2, width: 32, height: 32 }}
                        >
                          {member.user.firstName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {member.user.firstName} {member.user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Tooltip title="Set the end date of the programme.">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="End Date"
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

            <Typography variant="h6" gutterBottom>
              Programme Materials
            </Typography>
            <Tooltip title="Upload images, videos, PDFs, or documents (e.g., syllabi, slides) to support the programme.">
              <Box>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx"
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
                    Upload Materials
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
        <DialogTitle>Create New Programme</DialogTitle>
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
              loadingText="Creating Programme..."
            >
              Create Programme
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
