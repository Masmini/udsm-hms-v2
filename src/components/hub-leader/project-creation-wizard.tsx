//src/components/hub-leader/project-creation-wizard.tsx
// src/components/hub-leader/project-creation-wizard.tsx
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
  Alert,
  Autocomplete,
  IconButton,
  Divider,
  CardMedia,
} from "@mui/material";
import {
  Add,
  Delete,
  CloudUpload,
  Assignment,
  Group,
  Schedule,
  Settings,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import EditorDialog from "../ui/EditorDialog";
import { EnhancedButton } from "../ui/enhanced-button";
import { useNotification } from "../providers/notification-provider";

interface ProjectCreationWizardProps {
  open: boolean;
  onClose: () => void;
  hubMembers: any[];
  hubId: string;
  onProjectCreated: () => void;
}

const steps = [
  "Basic Information",
  "Objectives & Details",
  "Team & Tasks",
  "Settings & Files",
];

const skillOptions = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "Machine Learning",
  "Data Science",
  "UI/UX Design",
  "Project Management",
  "Marketing",
  "Research",
  "Writing",
  "Photography",
];

export default function ProjectCreationWizard({
  open,
  onClose,
  hubMembers,
  hubId,
  onProjectCreated,
}: ProjectCreationWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editorDialog, setEditorDialog] = useState(false);
  const [currentField, setCurrentField] = useState<
    "description" | "objectives"
  >("description");
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    title: "",
    description: EditorState.createEmpty(),
    objectives: EditorState.createEmpty(),
    coverImage: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    visibility: "HUB_MEMBERS" as "PUBLIC" | "AUTHENTICATED" | "HUB_MEMBERS",
    skills: [] as string[],
    technologies: [] as string[],
    budget: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    initialMembers: [] as string[],
    initialTasks: [] as Array<{
      title: string;
      description: string;
      dueDate: Date | null;
      assigneeId: string;
      priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    }>,
    externalLinks: [] as Array<{ title: string; url: string }>,
    files: [] as Array<{ name: string; url: string; type: string }>,
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

  const handleAddTask = () => {
    setFormData({
      ...formData,
      initialTasks: [
        ...formData.initialTasks,
        {
          title: "",
          description: "",
          dueDate: null,
          assigneeId: "",
          priority: "MEDIUM",
        },
      ],
    });
  };

  const handleRemoveTask = (index: number) => {
    setFormData({
      ...formData,
      initialTasks: formData.initialTasks.filter((_, i) => i !== index),
    });
  };

  const handleTaskChange = (index: number, field: string, value: any) => {
    const updatedTasks = [...formData.initialTasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setFormData({ ...formData, initialTasks: updatedTasks });
  };

  const handleAddLink = () => {
    setFormData({
      ...formData,
      externalLinks: [...formData.externalLinks, { title: "", url: "" }],
    });
  };

  const handleRemoveLink = (index: number) => {
    setFormData({
      ...formData,
      externalLinks: formData.externalLinks.filter((_, i) => i !== index),
    });
  };

  const handleLinkChange = (index: number, field: string, value: string) => {
    const updatedLinks = [...formData.externalLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setFormData({ ...formData, externalLinks: updatedLinks });
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
      formDataUpload.append("folder", "projects/cover-images");

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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("folder", "projects");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (response.ok) {
          const { url, type, name } = await response.json();
          setFormData((prev) => ({
            ...prev,
            files: [...prev.files, { name, url, type }],
          }));
        } else {
          throw new Error("Upload failed");
        }
      }
      showSuccess("Files uploaded successfully");
    } catch (error) {
      showError(
        `Failed to upload files: ${
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
      const objectivesHtml = draftToHtml(
        convertToRaw(formData.objectives.getCurrentContent())
      );

      const projectData = {
        title: formData.title,
        description: descriptionHtml,
        objectives: objectivesHtml,
        coverImage: formData.coverImage,
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
        visibility: formData.visibility,
        skills: formData.skills,
        technologies: formData.technologies,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        priority: formData.priority,
        hubId,
        initialMembers: formData.initialMembers,
        initialTasks: formData.initialTasks,
        externalLinks: formData.externalLinks,
        files: formData.files,
      };

      const response = await fetch("/api/hub-leader/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error("Failed to create project");

      showSuccess("Project created successfully!");
      onProjectCreated();
      onClose();
    } catch (error) {
      showError("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Project Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Project Description *
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentField("description");
                  setEditorDialog(true);
                }}
                fullWidth
                sx={{ minHeight: 100, justifyContent: "flex-start" }}
              >
                {formData.description.getCurrentContent().hasText()
                  ? "Edit Description"
                  : "Add Project Description"}
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Cover Image
              </Typography>
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

            <FormControl fullWidth sx={{ mb: 3 }}>
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
                <MenuItem value="AUTHENTICATED">Authenticated Users</MenuItem>
                <MenuItem value="HUB_MEMBERS">Hub Members Only</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Project Objectives
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentField("objectives");
                  setEditorDialog(true);
                }}
                fullWidth
                sx={{ minHeight: 100, justifyContent: "flex-start" }}
              >
                {formData.objectives.getCurrentContent().hasText()
                  ? "Edit Objectives"
                  : "Add Project Objectives"}
              </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
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
              </Grid>
              <Grid item xs={12} md={6}>
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
              </Grid>
            </Grid>

            <Autocomplete
              multiple
              options={skillOptions}
              value={formData.skills}
              onChange={(_, newValue) =>
                setFormData({ ...formData, skills: newValue })
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
                  label="Required Skills"
                  placeholder="Select skills"
                />
              )}
              sx={{ mb: 3 }}
            />

            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.technologies}
              onChange={(_, newValue) =>
                setFormData({ ...formData, technologies: newValue })
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
                  label="Technologies"
                  placeholder="Add technologies"
                />
              )}
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Budget (Optional)"
                  type="number"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  InputProps={{ startAdornment: "$" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as any,
                      })
                    }
                  >
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="URGENT">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Initial Team Members
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select hub members to add to this project initially
            </Typography>

            <List sx={{ maxHeight: 300, overflow: "auto", mb: 3 }}>
              {hubMembers.map((member) => (
                <ListItem key={member.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.initialMembers.includes(
                          member.userId
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              initialMembers: [
                                ...formData.initialMembers,
                                member.userId,
                              ],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              initialMembers: formData.initialMembers.filter(
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

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Initial Tasks</Typography>
              <Button startIcon={<Add />} onClick={handleAddTask}>
                Add Task
              </Button>
            </Box>

            {formData.initialTasks.map((task, index) => (
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
                      Task {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveTask(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Task Title"
                        value={task.title}
                        onChange={(e) =>
                          handleTaskChange(index, "title", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Assignee</InputLabel>
                        <Select
                          value={task.assigneeId}
                          onChange={(e) =>
                            handleTaskChange(
                              index,
                              "assigneeId",
                              e.target.value
                            )
                          }
                        >
                          {hubMembers
                            .filter((member) =>
                              formData.initialMembers.includes(member.userId)
                            )
                            .map((member) => (
                              <MenuItem
                                key={member.userId}
                                value={member.userId}
                              >
                                {member.user.firstName} {member.user.lastName}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Task Description"
                        multiline
                        rows={2}
                        value={task.description}
                        onChange={(e) =>
                          handleTaskChange(index, "description", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                          label="Due Date"
                          value={task.dueDate}
                          onChange={(date) =>
                            handleTaskChange(index, "dueDate", date)
                          }
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={task.priority}
                          onChange={(e) =>
                            handleTaskChange(index, "priority", e.target.value)
                          }
                        >
                          <MenuItem value="LOW">Low</MenuItem>
                          <MenuItem value="MEDIUM">Medium</MenuItem>
                          <MenuItem value="HIGH">High</MenuItem>
                          <MenuItem value="URGENT">Urgent</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              External Links
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add relevant external links for the project
            </Typography>

            <Button startIcon={<Add />} onClick={handleAddLink} sx={{ mb: 2 }}>
              Add Link
            </Button>

            {formData.externalLinks.map((link, index) => (
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
                      Link {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveLink(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Link Title"
                        value={link.title}
                        onChange={(e) =>
                          handleLinkChange(index, "title", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="URL"
                        value={link.url}
                        onChange={(e) =>
                          handleLinkChange(index, "url", e.target.value)
                        }
                        placeholder="https://example.com"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Project Files
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload relevant files for the project
            </Typography>

            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ display: "none" }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                component="span"
                variant="outlined"
                startIcon={<CloudUpload />}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Upload Files
              </Button>
            </label>

            {formData.files.length > 0 && (
              <List>
                {formData.files.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={file.name} secondary={file.type} />
                    <IconButton
                      onClick={() => {
                        setFormData({
                          ...formData,
                          files: formData.files.filter((_, i) => i !== index),
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
        <DialogTitle>Create New Project</DialogTitle>
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
              loadingText="Creating Project..."
            >
              Create Project
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
        field={currentField}
        initialState={formData[currentField]}
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
