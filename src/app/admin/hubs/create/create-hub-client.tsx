// src/app/admin/hubs/create/create-hub-client.tsx
"use client";

import { useState, useEffect, useRef, forwardRef, ReactElement } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  TextField,
  FormControl,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import {
  CloudUpload,
  ArrowBack,
  ArrowForward,
  Save,
  Edit,
  Business,
  Category,
  ContactPhone,
  Check,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Image from "next/image";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditorDialog from "@/components/ui/EditorDialog";
import { TransitionProps } from "@mui/material/transitions";

interface CreateHubClientProps {
  categories: Category[];
  users: User[];
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Hub creation schema
const hubCreationSchema = z.object({
  name: z.string().min(2, "Hub name must be at least 2 characters"),
  description: z
    .any()
    .refine(
      (val) => val && val.getCurrentContent().hasText(),
      "Description is required"
    ),
  cardBio: z.string().min(5, "Card bio must be at least 5 characters"),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  vision: z
    .any()
    .refine(
      (val) => val && val.getCurrentContent().hasText(),
      "Vision is required"
    ),
  mission: z
    .any()
    .refine(
      (val) => val && val.getCurrentContent().hasText(),
      "Mission is required"
    ),
  objectives: z
    .any()
    .refine(
      (val) => val && val.getCurrentContent().hasText(),
      "Objectives are required"
    ),
  establishedDate: z.date().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().optional(),
  socialLinks: z
    .object({
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
  hubLeaderId: z.string().uuid("Invalid Hub Leader ID"),
  hubSupervisorId: z.string().uuid("Invalid Hub Supervisor ID"),
});

type HubFormData = z.infer<typeof hubCreationSchema>;

// Define valid field names for EditorDialog
type EditorField = "description" | "vision" | "mission" | "objectives";

// Define valid field names for form (including nested socialLinks)
type FieldName =
  | keyof HubFormData
  | `socialLinks.${keyof NonNullable<HubFormData["socialLinks"]>}`;

// Define social links field names explicitly
const socialLinkFields: FieldName[] = [
  "socialLinks.twitter",
  "socialLinks.linkedin",
  "socialLinks.facebook",
  "socialLinks.instagram",
];

const steps = [
  {
    label: "Basic Information",
    description: "Hub name, description, and bio",
    icon: <Business />,
  },
  {
    label: "Visual Elements",
    description: "Logo and cover image",
    icon: <Business />,
  },
  {
    label: "Categories & Details",
    description: "Categories, vision, mission, and objectives",
    icon: <Category />,
  },
  {
    label: "Leadership & Contact",
    description: "Hub leader, supervisor, and contact information",
    icon: <ContactPhone />,
  },
  {
    label: "Review & Submit",
    description: "Review all information and create hub",
    icon: <Check />,
  },
];

// Custom transition component for Material-UI Dialog
const MotionTransition = forwardRef(function MotionTransition(
  props: TransitionProps & { children: ReactElement<any, any> },
  ref: React.Ref<HTMLDivElement>
) {
  const { in: inProp, children } = props;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: inProp ? 1 : 0, scale: inProp ? 1 : 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
});
MotionTransition.displayName = "MotionTransition";

export default function CreateHubClient({
  categories,
  users,
}: CreateHubClientProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<"logo" | "cover" | null>(
    null
  );
  const [openEditorDialog, setOpenEditorDialog] = useState(false);
  const [editingField, setEditingField] = useState<EditorField | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    trigger,
    setValue,
    watch,
    reset,
  } = useForm<HubFormData>({
    resolver: zodResolver(hubCreationSchema),
    defaultValues: {
      name: "",
      description: EditorState.createEmpty(),
      cardBio: "",
      logo: "",
      coverImage: "",
      categories: [],
      vision: EditorState.createEmpty(),
      mission: EditorState.createEmpty(),
      objectives: EditorState.createEmpty(),
      contactEmail: "",
      website: "",
      location: "",
      socialLinks: {
        twitter: "",
        linkedin: "",
        facebook: "",
        instagram: "",
      },
      hubLeaderId: "",
      hubSupervisorId: "",
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  // Persist form state to localStorage
  useEffect(() => {
    const editorFields: EditorField[] = [
      "description",
      "vision",
      "mission",
      "objectives",
    ];
    editorFields.forEach((field) => {
      const content = watchedValues[field];
      if (
        content &&
        content.getCurrentContent &&
        content.getCurrentContent().hasText()
      ) {
        localStorage.setItem(
          `editor_${field}_hub`,
          JSON.stringify(convertToRaw(content.getCurrentContent()))
        );
      } else {
        localStorage.removeItem(`editor_${field}_hub`);
      }
    });

    const otherFields: FieldName[] = [
      "name",
      "cardBio",
      "logo",
      "coverImage",
      "categories",
      "contactEmail",
      "website",
      "location",
      "socialLinks",
      "hubLeaderId",
      "hubSupervisorId",
    ];
    otherFields.forEach((field) => {
      const value = watchedValues[field as keyof HubFormData];
      if (value && (Array.isArray(value) ? value.length > 0 : value)) {
        localStorage.setItem(`form_${field}_hub`, JSON.stringify(value));
      } else {
        localStorage.removeItem(`form_${field}_hub`);
      }
    });
  }, [watchedValues]);

  // Load form state from localStorage on mount
  useEffect(() => {
    const editorFields: EditorField[] = [
      "description",
      "vision",
      "mission",
      "objectives",
    ];
    editorFields.forEach((field) => {
      const savedState = localStorage.getItem(`editor_${field}_hub`);
      if (savedState) {
        try {
          const contentState = convertFromRaw(JSON.parse(savedState));
          setValue(field, EditorState.createWithContent(contentState));
        } catch (err) {
          console.error(`Failed to load ${field} from localStorage:`, err);
        }
      }
    });

    const otherFields: FieldName[] = [
      "name",
      "cardBio",
      "logo",
      "coverImage",
      "categories",
      "contactEmail",
      "website",
      "location",
      "socialLinks",
      "hubLeaderId",
      "hubSupervisorId",
    ];
    otherFields.forEach((field) => {
      const savedValue = localStorage.getItem(`form_${field}_hub`);
      if (savedValue) {
        try {
          const value = JSON.parse(savedValue);
          setValue(field as FieldPath<HubFormData>, value);
        } catch (err) {
          console.error(`Failed to load ${field} from localStorage:`, err);
        }
      }
    });
  }, [setValue]);

  const handleImageUpload = async (file: File, type: "logo" | "cover") => {
    setUploadingImage(type);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
      );
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (data.secure_url) {
        setValue(type as FieldPath<HubFormData>, data.secure_url);
        toast.success(
          `${type === "logo" ? "Logo" : "Cover image"} uploaded successfully!`,
          {
            position: "top-center",
          }
        );
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${type}. Please try again.`, {
        position: "top-center",
      });
    } finally {
      setUploadingImage(null);
    }
  };

  const getMissingFields = () => {
    const missing: string[] = [];
    if (activeStep === 0) {
      if (errors.name) missing.push("Hub Name");
      if (
        errors.description ||
        !watchedValues.description.getCurrentContent().hasText()
      ) {
        missing.push("Description");
      }
      if (errors.cardBio) missing.push("Card Bio");
    } else if (activeStep === 2) {
      if (errors.categories) missing.push("Categories");
      if (
        errors.vision ||
        !watchedValues.vision.getCurrentContent().hasText()
      ) {
        missing.push("Vision");
      }
      if (
        errors.mission ||
        !watchedValues.mission.getCurrentContent().hasText()
      ) {
        missing.push("Mission");
      }
      if (
        errors.objectives ||
        !watchedValues.objectives.getCurrentContent().hasText()
      ) {
        missing.push("Objectives");
      }
    } else if (activeStep === 3) {
      if (errors.hubLeaderId) missing.push("Hub Leader");
      if (errors.hubSupervisorId) missing.push("Hub Supervisor");
    }
    return missing.length > 0 ? `Missing: ${missing.join(", ")}` : "";
  };

  const handleNext = async () => {
    setIsValidating(true);
    let isValid = true;

    if (activeStep === 0) {
      const editorFields: EditorField[] = ["description"];
      const textFields: FieldName[] = ["name", "cardBio"];
      isValid = await Promise.all([
        trigger(editorFields),
        trigger(textFields),
      ]).then((results) => results.every(Boolean));
    } else if (activeStep === 2) {
      const editorFields: EditorField[] = ["vision", "mission", "objectives"];
      const otherFields: FieldName[] = ["categories"];
      isValid = await Promise.all([
        trigger(editorFields),
        trigger(otherFields),
      ]).then((results) => results.every(Boolean));
    } else if (activeStep === 3) {
      const fields: FieldName[] = ["hubLeaderId", "hubSupervisorId"];
      isValid = await trigger(fields);
      if (watchedValues.hubLeaderId === watchedValues.hubSupervisorId) {
        toast.error("Hub Leader and Supervisor cannot be the same user.", {
          position: "top-center",
        });
        isValid = false;
      }
    }

    if (!isValid || getMissingFields()) {
      toast.error("Please fill all required fields before proceeding.", {
        position: "top-center",
      });
      setIsValidating(false);
      return;
    }

    setActiveStep((prev) => prev + 1);
    setError("");
    setIsValidating(false);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
  };

  const clearLocalStorage = () => {
    const fields: FieldName[] = [
      "description",
      "vision",
      "mission",
      "objectives",
      "name",
      "cardBio",
      "logo",
      "coverImage",
      "categories",
      "contactEmail",
      "website",
      "location",
      "socialLinks",
      "hubLeaderId",
      "hubSupervisorId",
    ];
    fields.forEach((field) => {
      localStorage.removeItem(`editor_${field}_hub`);
      localStorage.removeItem(`form_${field}_hub`);
    });
  };

  const onSubmit = async (data: HubFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Helper function to strip HTML tags and get text content
      const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      };

      const descriptionHtml = draftToHtml(
        convertToRaw(data.description.getCurrentContent())
      );
      const visionHtml = draftToHtml(
        convertToRaw(data.vision.getCurrentContent())
      );
      const missionHtml = draftToHtml(
        convertToRaw(data.mission.getCurrentContent())
      );
      const objectivesHtml = draftToHtml(
        convertToRaw(data.objectives.getCurrentContent())
      );

      // Validate text content length
      if (stripHtml(descriptionHtml).length < 10) {
        throw new Error("Description must be at least 10 characters long");
      }
      if (stripHtml(visionHtml).length < 10) {
        throw new Error("Vision must be at least 10 characters long");
      }
      if (stripHtml(missionHtml).length < 10) {
        throw new Error("Mission must be at least 10 characters long");
      }
      if (stripHtml(objectivesHtml).length < 10) {
        throw new Error("Objectives must be at least 10 characters long");
      }

      const hubData = {
        ...data,
        description: descriptionHtml,
        vision: visionHtml,
        mission: missionHtml,
        objectives: [objectivesHtml],
        establishedDate: data.establishedDate?.toISOString(),
        socialLinks: data.socialLinks || {},
      };

      console.log(
        "[Frontend] Sending hubData:",
        JSON.stringify(hubData, null, 2)
      );

      const response = await fetch("/api/admin/hubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hubData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("[Frontend] Error response:", errorData);
        throw new Error(errorData.error || "Failed to create hub");
      }

      clearLocalStorage();
      setSuccess("Hub created successfully!");
      toast.success("Hub created successfully!", { position: "top-center" });

      setTimeout(() => {
        router.push("/admin/hubs");
      }, 2000);
    } catch (error: any) {
      console.error("[Frontend] Submission error:", error.message);
      setError(error.message || "Failed to create hub");
      toast.error(error.message || "Failed to create hub", {
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditor = (field: EditorField) => {
    setEditingField(field);
    setOpenEditorDialog(true);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Basic Information
            </Typography>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Hub Name *"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={
                    errors.name?.message || "Enter a unique name for your hub"
                  }
                  onBlur={() => {
                    field.onBlur();
                    localStorage.setItem(
                      `form_name_hub`,
                      JSON.stringify(field.value)
                    );
                  }}
                />
              )}
            />
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mt: 3, fontWeight: "bold" }}
            >
              Description
            </Typography>
            <Box margin="normal">
              <Tooltip
                title={
                  watchedValues.description.getCurrentContent().hasText()
                    ? "Edit the hub description"
                    : "Add a detailed hub description"
                }
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => openEditor("description")}
                    sx={{
                      ml: 2,
                      borderColor: errors.description
                        ? "error.main"
                        : undefined,
                      color: errors.description ? "error.main" : undefined,
                    }}
                  >
                    {watchedValues.description.getCurrentContent().hasText()
                      ? "Edit Description"
                      : "Add Description *"}
                  </Button>
                </motion.div>
              </Tooltip>
              {errors.description && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {typeof errors.description.message === "string"
                    ? errors.description.message
                    : "Description is required"}
                </Typography>
              )}
            </Box>
            <Controller
              name="cardBio"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Card Bio *"
                  fullWidth
                  margin="normal"
                  error={!!errors.cardBio}
                  helperText={
                    errors.cardBio?.message ||
                    "Short description shown on hub cards"
                  }
                  onBlur={() => {
                    field.onBlur();
                    localStorage.setItem(
                      `form_cardBio_hub`,
                      JSON.stringify(field.value)
                    );
                  }}
                />
              )}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      Hub Logo
                    </Typography>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      {watchedValues.logo ? (
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            position: "relative",
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <Image
                            src={watchedValues.logo}
                            alt="Logo"
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            bgcolor: "grey.200",
                            mx: "auto",
                            mb: 2,
                          }}
                        />
                      )}
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="logo-upload"
                        type="file"
                        ref={logoInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "logo");
                        }}
                      />
                      <label htmlFor="logo-upload">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={
                              uploadingImage === "logo" ? (
                                <CircularProgress size={20} />
                              ) : (
                                <CloudUpload />
                              )
                            }
                            disabled={uploadingImage === "logo"}
                          >
                            {watchedValues.logo ? "Change Logo" : "Upload Logo"}
                          </Button>
                        </motion.div>
                      </label>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      Cover Image
                    </Typography>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      {watchedValues.coverImage ? (
                        <Box
                          sx={{
                            width: "100%",
                            height: 120,
                            position: "relative",
                            mb: 2,
                          }}
                        >
                          <Image
                            src={watchedValues.coverImage}
                            alt="Cover"
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: 120,
                            bgcolor: "grey.200",
                            mb: 2,
                          }}
                        />
                      )}
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="cover-upload"
                        type="file"
                        ref={coverInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "cover");
                        }}
                      />
                      <label htmlFor="cover-upload">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={
                              uploadingImage === "cover" ? (
                                <CircularProgress size={20} />
                              ) : (
                                <CloudUpload />
                              )
                            }
                            disabled={uploadingImage === "cover"}
                          >
                            {watchedValues.coverImage
                              ? "Change Cover"
                              : "Upload Cover"}
                          </Button>
                        </motion.div>
                      </label>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Categories & Details
            </Typography>
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  freeSolo
                  options={categories.map((category) => ({
                    id: category.id,
                    name: category.name,
                    color: category.color,
                  }))}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.name
                  }
                  value={
                    field.value.map((val) => {
                      const category = categories.find((c) => c.id === val);
                      return category
                        ? {
                            id: category.id,
                            name: category.name,
                            color: category.color,
                          }
                        : { id: val, name: val, color: null };
                    }) || []
                  }
                  onChange={(event, newValue) => {
                    const newCategories = newValue.map((val) =>
                      typeof val === "string" ? val : val.id
                    );
                    field.onChange(newCategories);
                    localStorage.setItem(
                      `form_categories_hub`,
                      JSON.stringify(newCategories)
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Categories *"
                      margin="normal"
                      error={!!errors.categories}
                      helperText={
                        errors.categories?.message ||
                        "Select existing categories or type new ones (press Enter to add)"
                      }
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={
                          typeof option === "string" ? option : option.name
                        }
                        size="small"
                        style={{
                          backgroundColor:
                            typeof option === "string"
                              ? "#1976d2"
                              : option.color || "#1976d2",
                          color: "white",
                        }}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor:
                              typeof option === "string"
                                ? "#1976d2"
                                : option.color || "#1976d2",
                          }}
                        />
                        {typeof option === "string" ? option : option.name}
                      </Box>
                    </li>
                  )}
                  sx={{ mt: 2 }}
                  ListboxProps={{
                    style: {
                      maxHeight: 300,
                      zIndex: 1300,
                    },
                  }}
                />
              )}
            />
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mt: 3, fontWeight: "bold" }}
            >
              Vision
            </Typography>
            <Box margin="normal">
              <Tooltip
                title={
                  watchedValues.vision.getCurrentContent().hasText()
                    ? "Edit the hub vision"
                    : "Add the hub's vision"
                }
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => openEditor("vision")}
                    sx={{
                      ml: 2,
                      borderColor: errors.vision ? "error.main" : undefined,
                      color: errors.vision ? "error.main" : undefined,
                    }}
                  >
                    {watchedValues.vision.getCurrentContent().hasText()
                      ? "Edit Vision"
                      : "Add Vision *"}
                  </Button>
                </motion.div>
              </Tooltip>
              {errors.vision && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {typeof errors.vision.message === "string"
                    ? errors.vision.message
                    : "Vision is required"}
                </Typography>
              )}
            </Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mt: 3, fontWeight: "bold" }}
            >
              Mission
            </Typography>
            <Box margin="normal">
              <Tooltip
                title={
                  watchedValues.mission.getCurrentContent().hasText()
                    ? "Edit the hub mission"
                    : "Add the hub's mission"
                }
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => openEditor("mission")}
                    sx={{
                      ml: 2,
                      borderColor: errors.mission ? "error.main" : undefined,
                      color: errors.mission ? "error.main" : undefined,
                    }}
                  >
                    {watchedValues.mission.getCurrentContent().hasText()
                      ? "Edit Mission"
                      : "Add Mission *"}
                  </Button>
                </motion.div>
              </Tooltip>
              {errors.mission && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {typeof errors.mission.message === "string"
                    ? errors.mission.message
                    : "Mission is required"}
                </Typography>
              )}
            </Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mt: 3, fontWeight: "bold" }}
            >
              Objectives
            </Typography>
            <Box margin="normal">
              <Tooltip
                title={
                  watchedValues.objectives.getCurrentContent().hasText()
                    ? "Edit the hub objectives"
                    : "Add the hub's objectives"
                }
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => openEditor("objectives")}
                    sx={{
                      ml: 2,
                      borderColor: errors.objectives ? "error.main" : undefined,
                      color: errors.objectives ? "error.main" : undefined,
                    }}
                  >
                    {watchedValues.objectives.getCurrentContent().hasText()
                      ? "Edit Objectives"
                      : "Add Objectives *"}
                  </Button>
                </motion.div>
              </Tooltip>
              {errors.objectives && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {typeof errors.objectives.message === "string"
                    ? errors.objectives.message
                    : "Objectives are required"}
                </Typography>
              )}
            </Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="establishedDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Established Date (Optional)"
                    value={field.value || null}
                    onChange={(date) => {
                      field.onChange(date);
                      localStorage.setItem(
                        `form_establishedDate_hub`,
                        JSON.stringify(date)
                      );
                    }}
                    slotProps={{
                      textField: { fullWidth: true, margin: "normal" },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Leadership Selection
            </Typography>
            <Controller
              name="hubLeaderId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={users}
                  getOptionLabel={(user) =>
                    `${user.firstName} ${user.lastName} (${user.email})`
                  }
                  value={users.find((user) => user.id === field.value) || null}
                  onChange={(event, newValue) => {
                    field.onChange(newValue?.id || "");
                    localStorage.setItem(
                      `form_hubLeaderId_hub`,
                      JSON.stringify(newValue?.id || "")
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Hub Leader *"
                      margin="normal"
                      error={!!errors.hubLeaderId}
                      helperText={
                        errors.hubLeaderId?.message ||
                        "Select a user to be the Hub Leader"
                      }
                    />
                  )}
                  sx={{ mt: 2 }}
                />
              )}
            />
            <Controller
              name="hubSupervisorId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={users}
                  getOptionLabel={(user) =>
                    `${user.firstName} ${user.lastName} (${user.email})`
                  }
                  value={users.find((user) => user.id === field.value) || null}
                  onChange={(event, newValue) => {
                    field.onChange(newValue?.id || "");
                    localStorage.setItem(
                      `form_hubSupervisorId_hub`,
                      JSON.stringify(newValue?.id || "")
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Hub Supervisor *"
                      margin="normal"
                      error={!!errors.hubSupervisorId}
                      helperText={
                        errors.hubSupervisorId?.message ||
                        "Select a user to be the Hub Supervisor"
                      }
                    />
                  )}
                  sx={{ mt: 2 }}
                />
              )}
            />
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mt: 3, fontWeight: "bold" }}
            >
              Contact Information
            </Typography>
            <Controller
              name="contactEmail"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contact Email (Optional)"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!errors.contactEmail}
                  helperText={errors.contactEmail?.message}
                  onBlur={() => {
                    field.onBlur();
                    localStorage.setItem(
                      `form_contactEmail_hub`,
                      JSON.stringify(field.value)
                    );
                  }}
                />
              )}
            />
            <Controller
              name="website"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Website (Optional)"
                  fullWidth
                  margin="normal"
                  error={!!errors.website}
                  helperText={errors.website?.message || "https://example.com"}
                  onBlur={() => {
                    field.onBlur();
                    localStorage.setItem(
                      `form_website_hub`,
                      JSON.stringify(field.value)
                    );
                  }}
                />
              )}
            />
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Location (Optional)"
                  fullWidth
                  margin="normal"
                  helperText="e.g., UDSM Main Campus, Building A"
                  onBlur={() => {
                    field.onBlur();
                    localStorage.setItem(
                      `form_location_hub`,
                      JSON.stringify(field.value)
                    );
                  }}
                />
              )}
            />
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mt: 3, fontWeight: "bold" }}
            >
              Social Media Links (Optional)
            </Typography>
            <Grid container spacing={2}>
              {socialLinkFields.map((platform) => (
                <Grid item xs={12} sm={6} key={platform}>
                  <Controller
                    name={platform as FieldPath<HubFormData>}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={
                          platform.split(".")[1].charAt(0).toUpperCase() +
                          platform.split(".")[1].slice(1)
                        }
                        fullWidth
                        margin="normal"
                        placeholder={`https://${
                          platform.split(".")[1]
                        }.com/username`}
                        onBlur={() => {
                          field.onBlur();
                          localStorage.setItem(
                            `form_socialLinks_hub`,
                            JSON.stringify(watchedValues.socialLinks)
                          );
                        }}
                      />
                    )}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  Review Hub Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Hub Name
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {watchedValues.name}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Hub Leader
                      </Typography>
                      <Typography variant="body1">
                        {users.find((u) => u.id === watchedValues.hubLeaderId)
                          ? `${
                              users.find(
                                (u) => u.id === watchedValues.hubLeaderId
                              )!.firstName
                            } ${
                              users.find(
                                (u) => u.id === watchedValues.hubLeaderId
                              )!.lastName
                            } (${
                              users.find(
                                (u) => u.id === watchedValues.hubLeaderId
                              )!.email
                            })`
                          : "Not selected"}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Hub Supervisor
                      </Typography>
                      <Typography variant="body1">
                        {users.find(
                          (u) => u.id === watchedValues.hubSupervisorId
                        )
                          ? `${
                              users.find(
                                (u) => u.id === watchedValues.hubSupervisorId
                              )!.firstName
                            } ${
                              users.find(
                                (u) => u.id === watchedValues.hubSupervisorId
                              )!.lastName
                            } (${
                              users.find(
                                (u) => u.id === watchedValues.hubSupervisorId
                              )!.email
                            })`
                          : "Not selected"}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: draftToHtml(
                            convertToRaw(
                              watchedValues.description.getCurrentContent()
                            )
                          ),
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Card Bio
                      </Typography>
                      <Typography variant="body2">
                        {watchedValues.cardBio}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Categories
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mt: 1,
                        }}
                      >
                        {watchedValues.categories?.map((categoryId) => {
                          const category = categories.find(
                            (c) => c.id === categoryId
                          );
                          return (
                            <Chip
                              key={categoryId}
                              label={category?.name || categoryId}
                              size="small"
                              style={{
                                backgroundColor: category?.color || "#1976d2",
                                color: "white",
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Vision
                      </Typography>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: draftToHtml(
                            convertToRaw(
                              watchedValues.vision.getCurrentContent()
                            )
                          ),
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Mission
                      </Typography>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: draftToHtml(
                            convertToRaw(
                              watchedValues.mission.getCurrentContent()
                            )
                          ),
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Objectives
                      </Typography>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: draftToHtml(
                            convertToRaw(
                              watchedValues.objectives.getCurrentContent()
                            )
                          ),
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    {watchedValues.logo && (
                      <Box sx={{ textAlign: "center", mb: 2 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            position: "relative",
                            mx: "auto",
                          }}
                        >
                          <Image
                            src={watchedValues.logo}
                            alt="Logo"
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </Box>
                      </Box>
                    )}
                    {watchedValues.coverImage && (
                      <Box
                        sx={{
                          width: "100%",
                          height: 100,
                          position: "relative",
                          mb: 2,
                        }}
                      >
                        <Image
                          src={watchedValues.coverImage}
                          alt="Cover"
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </Box>
                    )}
                    {(watchedValues.contactEmail ||
                      watchedValues.website ||
                      watchedValues.location) && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Contact Information
                        </Typography>
                        {watchedValues.contactEmail && (
                          <Typography variant="body2">
                            Email: {watchedValues.contactEmail}
                          </Typography>
                        )}
                        {watchedValues.website && (
                          <Typography variant="body2">
                            Website: {watchedValues.website}
                          </Typography>
                        )}
                        {watchedValues.location && (
                          <Typography variant="body2">
                            Location: {watchedValues.location}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  function handleCloseDialog(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    // Navigate back to the hubs list page
    router.push("/admin/hubs");
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ToastContainer position="top-center" autoClose={3000} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 3,
              mb: 4,
              background: "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleCloseDialog}
                  sx={{ color: "white" }}
                  startIcon={<ArrowBack />}
                >
                  Cancel
                </Button>
              </motion.div>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Create New Hub
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Build a new research and innovation hub
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        <Paper sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel
                  icon={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor:
                          activeStep >= steps.indexOf(step)
                            ? "primary.main"
                            : "grey.300",
                        color:
                          activeStep >= steps.indexOf(step)
                            ? "white"
                            : "grey.600",
                      }}
                    >
                      {activeStep > steps.indexOf(step) ? <Check /> : step.icon}
                    </Box>
                  }
                >
                  <Typography variant="h6" fontWeight="bold">
                    {step.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent(activeStep)}
            </motion.div>
          </AnimatePresence>
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            {activeStep > 0 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                  disabled={isLoading || isValidating}
                >
                  Back
                </Button>
              </motion.div>
            )}
            {activeStep === steps.length - 1 ? (
              <Tooltip
                title={
                  getMissingFields() ||
                  "Create the hub with the provided details"
                }
              >
                <span>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleSubmit(onSubmit)}
                      disabled={
                        isLoading || isValidating || !!getMissingFields()
                      }
                      startIcon={
                        isLoading ? <CircularProgress size={20} /> : <Save />
                      }
                      sx={{ ml: "auto" }}
                    >
                      {isLoading ? "Creating..." : "Create Hub"}
                    </Button>
                  </motion.div>
                </span>
              </Tooltip>
            ) : (
              <Tooltip title={getMissingFields() || "Proceed to the next step"}>
                <span>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={
                        isValidating ? (
                          <CircularProgress size={20} />
                        ) : (
                          <ArrowForward />
                        )
                      }
                      disabled={
                        isLoading || isValidating || !!getMissingFields()
                      }
                      sx={{ ml: "auto" }}
                    >
                      {isValidating ? "Validating..." : "Next"}
                    </Button>
                  </motion.div>
                </span>
              </Tooltip>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                onClick={() => setPreviewOpen(true)}
                startIcon={<Check />}
                disabled={isLoading || isValidating}
              >
                Preview
              </Button>
            </motion.div>
          </Box>
        </Paper>

        {/* Preview Dialog */}
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          maxWidth="md"
          fullWidth
          disableAutoFocus
          disableEnforceFocus
        >
          <DialogTitle>Hub Preview</DialogTitle>
          <DialogContent>
            <Card>
              {watchedValues.coverImage && (
                <Box
                  sx={{ height: 200, position: "relative", overflow: "hidden" }}
                >
                  <Image
                    src={watchedValues.coverImage}
                    alt="Cover"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </Box>
              )}
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {watchedValues.logo && (
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        position: "relative",
                        mr: 2,
                      }}
                    >
                      <Image
                        src={watchedValues.logo}
                        alt="Logo"
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </Box>
                  )}
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {watchedValues.name || "Hub Name"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {watchedValues.cardBio || "Hub bio"}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Hub Leader
                </Typography>
                <Typography variant="body1">
                  {users.find((u) => u.id === watchedValues.hubLeaderId)
                    ? `${
                        users.find((u) => u.id === watchedValues.hubLeaderId)!
                          .firstName
                      } ${
                        users.find((u) => u.id === watchedValues.hubLeaderId)!
                          .lastName
                      } (${
                        users.find((u) => u.id === watchedValues.hubLeaderId)!
                          .email
                      })`
                    : "Not selected"}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Hub Supervisor
                </Typography>
                <Typography variant="body1">
                  {users.find((u) => u.id === watchedValues.hubSupervisorId)
                    ? `${
                        users.find(
                          (u) => u.id === watchedValues.hubSupervisorId
                        )!.firstName
                      } ${
                        users.find(
                          (u) => u.id === watchedValues.hubSupervisorId
                        )!.lastName
                      } (${
                        users.find(
                          (u) => u.id === watchedValues.hubSupervisorId
                        )!.email
                      })`
                    : "Not selected"}
                </Typography>
                <div
                  dangerouslySetInnerHTML={{
                    __html: draftToHtml(
                      convertToRaw(
                        watchedValues.description.getCurrentContent()
                      )
                    ),
                  }}
                />
                {watchedValues.categories?.length > 0 && (
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 2 }}
                  >
                    {watchedValues.categories.map((categoryId) => {
                      const category = categories.find(
                        (c) => c.id === categoryId
                      );
                      return (
                        <Chip
                          key={categoryId}
                          label={category?.name || categoryId}
                          size="small"
                          style={{
                            backgroundColor: category?.color || "#1976d2",
                            color: "white",
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vision
                  </Typography>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: draftToHtml(
                        convertToRaw(watchedValues.vision.getCurrentContent())
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mission
                  </Typography>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: draftToHtml(
                        convertToRaw(watchedValues.mission.getCurrentContent())
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Objectives
                  </Typography>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: draftToHtml(
                        convertToRaw(
                          watchedValues.objectives.getCurrentContent()
                        )
                      ),
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </DialogContent>
          <DialogActions>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setPreviewOpen(false)}>Close</Button>
            </motion.div>
          </DialogActions>
        </Dialog>

        {openEditorDialog && editingField && (
          <EditorDialog
            open={openEditorDialog}
            onClose={() => setOpenEditorDialog(false)}
            field={editingField}
            initialState={watchedValues[editingField] as EditorState}
            setValue={setValue}
            trigger={trigger}
            hubId="hub"
          />
        )}
      </Container>
    </LocalizationProvider>
  );
}
