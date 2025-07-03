// src/components/ui/EditorDialog.tsx
"use client";

import { useState, useEffect, useRef, memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  EditorState,
  convertToRaw,
  RichUtils,
  AtomicBlockUtils,
  ContentBlock,
} from "draft-js";
import Editor from "@draft-js-plugins/editor";
import createToolbarPlugin from "@draft-js-plugins/static-toolbar";
import createEmojiPlugin from "@draft-js-plugins/emoji";
import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton,
} from "@draft-js-plugins/buttons";
import "@draft-js-plugins/emoji/lib/plugin.css";
import "@draft-js-plugins/static-toolbar/lib/plugin.css";
import draftToHtml from "draftjs-to-html";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Slide } from "@mui/material";

// Extend draftjs-to-html types to include blockRenderers
interface CustomDraftToHtmlConfig {
  blockRenderers?: {
    [key: string]: (block: any) => string;
  };
}

// Custom CSS for toolbar, dropdowns, block alignment, and editor
const customStyles = `
  .draftJsToolbar__toolbar__dNtBH {
    z-index: 1501 !important;
    position: sticky !important;
    top: 0 !important;
    background: #f5f5f5 !important;
    border-bottom: 1px solid #ccc;
    display: flex;
    flex-wrap: wrap;
    padding: 8px;
    align-items: center;
  }
  .draftJsToolbar__buttonWrapper__1Dmqh {
    cursor: pointer !important;
    padding: 6px !important;
    min-width: 30px;
  }
  .draftJsEmojiPlugin__emojiSelect__2qqfL {
    z-index: 2000 !important;
    position: absolute !important;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
  .custom-dropdown {
    min-width: 120px;
    margin: 0 8px;
  }
  .align-left {
    text-align: left;
  }
  .align-center {
    text-align: center;
  }
  .align-right {
    text-align: right;
  }
  .align-justify {
    text-align: justify;
  }
  .editor-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
`;

// Inject custom styles
const styleSheet = document.createElement("style");
styleSheet.textContent = customStyles;
document.head.appendChild(styleSheet);

// Initialize plugins
const toolbarPlugin = createToolbarPlugin();
const emojiPlugin = createEmojiPlugin({ useNativeArt: true });
const { Toolbar } = toolbarPlugin;
const { EmojiSuggestions, EmojiSelect } = emojiPlugin;

const plugins = [toolbarPlugin, emojiPlugin];

// Custom block renderer for text alignment
type BlockRenderConfig = {
  element: string;
  wrapper: JSX.Element;
};
const blockRenderMap: { [key: string]: BlockRenderConfig } = {
  "align-left": {
    element: "div",
    wrapper: <div className="align-left" />,
  },
  "align-center": {
    element: "div",
    wrapper: <div className="align-center" />,
  },
  "align-right": {
    element: "div",
    wrapper: <div className="align-right" />,
  },
  "align-justify": {
    element: "div",
    wrapper: <div className="align-justify" />,
  },
};

interface EditorDialogProps {
  open: boolean;
  onClose: () => void;
  field: "description" | "vision" | "mission" | "objectives";
  initialState: EditorState;
  setValue: (
    field: "description" | "vision" | "mission" | "objectives",
    value: EditorState
  ) => void;
  trigger: (
    field: "description" | "vision" | "mission" | "objectives"
  ) => Promise<boolean>;
  hubId?: string;
}

const EditorDialog = memo(
  ({
    open,
    onClose,
    field,
    initialState,
    setValue,
    trigger,
    hubId = "default",
  }: EditorDialogProps) => {
    const [localEditorState, setLocalEditorState] = useState(initialState);
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const isMounted = useRef(true);
    const editorRef = useRef<any>(null);

    // Sync initialState
    useEffect(() => {
      setLocalEditorState(initialState);
      const content = initialState.getCurrentContent();
      setWordCount(content.getPlainText().split(/\s+/).filter(Boolean).length);
    }, [initialState]);

    // Cleanup on unmount
    useEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
        setLocalEditorState(EditorState.createEmpty());
      };
    }, []);

    // Focus editor when opened
    useEffect(() => {
      if (open && editorRef.current) {
        setTimeout(() => {
          if (isMounted.current && editorRef.current) {
            try {
              editorRef.current.focus();
              console.log(`Editor focused for ${field}`);
            } catch (err) {
              console.error(`Failed to focus editor for ${field}:`, err);
            }
          }
        }, 200);
      }
    }, [open, field]);

    // Update word count and editor state
    const handleEditorStateChange = (state: EditorState) => {
      if (isMounted.current) {
        // Remove conflicting styles
        let newState = state;
        const currentStyles = state.getCurrentInlineStyle().toArray();
        const fontSizeStyles = currentStyles.filter((style) =>
          style.startsWith("FONTSIZE-")
        );
        const fontFamilyStyles = currentStyles.filter((style) =>
          style.startsWith("FONTFAMILY-")
        );
        const colorStyles = currentStyles.filter((style) =>
          style.startsWith("COLOR-")
        );
        if (fontSizeStyles.length > 1) {
          fontSizeStyles.forEach((style) => {
            newState = RichUtils.toggleInlineStyle(newState, style);
          });
        }
        if (fontFamilyStyles.length > 1) {
          fontFamilyStyles.forEach((style) => {
            newState = RichUtils.toggleInlineStyle(newState, style);
          });
        }
        if (colorStyles.length > 1) {
          colorStyles.forEach((style) => {
            newState = RichUtils.toggleInlineStyle(newState, style);
          });
        }
        // Remove conflicting block types
        const currentBlockType = state
          .getCurrentContent()
          .getBlockForKey(state.getSelection().getStartKey())
          .getType();
        const alignBlockTypes = [
          "align-left",
          "align-center",
          "align-right",
          "align-justify",
        ];
        if (
          alignBlockTypes.includes(currentBlockType) &&
          alignBlockTypes.some(
            (type) =>
              type !== currentBlockType &&
              newState
                .getCurrentContent()
                .getBlocksAsArray()
                .some((block) => block.getType() === type)
          )
        ) {
          alignBlockTypes.forEach((type) => {
            if (type !== currentBlockType) {
              newState = RichUtils.toggleBlockType(newState, type);
            }
          });
        }
        setLocalEditorState(newState);
        const content = newState.getCurrentContent();
        const words = content
          .getPlainText()
          .split(/\s+/)
          .filter(Boolean).length;
        setWordCount(words);
        localStorage.setItem(
          `editor_${field}_${hubId}`,
          JSON.stringify(convertToRaw(content))
        );
        console.log(`Editor state changed for ${field}, word count: ${words}`);
      }
    };

    // Handle save
    const handleSave = async () => {
      if (!isMounted.current) return;
      setIsSaving(true);
      try {
        setValue(field, localEditorState);
        await trigger(field);
        localStorage.setItem(
          `editor_${field}_${hubId}`,
          JSON.stringify(convertToRaw(localEditorState.getCurrentContent()))
        );
        toast.success(
          `${field.charAt(0).toUpperCase() + field.slice(1)} saved!`,
          {
            position: "top-center",
          }
        );
        onClose();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        toast.error(`Error saving ${field}: ${errorMessage}`, {
          position: "top-center",
        });
      } finally {
        if (isMounted.current) {
          setIsSaving(false);
        }
      }
    };

    // Get preview HTML
    const getPreviewHtml = () => {
      const rawContent = convertToRaw(localEditorState.getCurrentContent());
      return draftToHtml(rawContent, {
        blockRenderers: {
          "align-left": (block: any) =>
            `<div style="text-align: left;">${block.getText()}</div>`,
          "align-center": (block: any) =>
            `<div style="text-align: center;">${block.getText()}</div>`,
          "align-right": (block: any) =>
            `<div style="text-align: right;">${block.getText()}</div>`,
          "align-justify": (block: any) =>
            `<div style="text-align: justify;">${block.getText()}</div>`,
        },
      } as any);
    };

    // Custom block renderer function
    const blockRendererFn = (contentBlock: ContentBlock) => {
      const type = contentBlock.getType();
      if (blockRenderMap[type]) {
        return blockRenderMap[type];
      }
      return undefined;
    };

    // Custom link handler
    const handleAddLink = () => {
      const selection = localEditorState.getSelection();
      if (!selection.isCollapsed()) {
        const url = prompt("Enter URL:");
        if (url) {
          const contentState = localEditorState.getCurrentContent();
          const contentStateWithEntity = contentState.createEntity(
            "LINK",
            "MUTABLE",
            { url }
          );
          const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
          const newState = EditorState.set(localEditorState, {
            currentContent: contentStateWithEntity,
          });
          handleEditorStateChange(
            RichUtils.toggleLink(newState, selection, entityKey)
          );
        }
      } else {
        toast.error("Please select text to link.", { position: "top-center" });
      }
    };

    // Custom color picker
    const handleColorChange = (event: any) => {
      const color = event.target.value.replace("#", "");
      const selection = localEditorState.getSelection();
      if (!selection.isCollapsed()) {
        const newState = RichUtils.toggleInlineStyle(
          localEditorState,
          `COLOR-${color}`
        );
        handleEditorStateChange(newState);
      } else {
        toast.error("Please select text to apply color.", {
          position: "top-center",
        });
      }
    };

    // Custom font size
    const handleFontSizeChange = (event: any) => {
      const size = event.target.value;
      const selection = localEditorState.getSelection();
      if (!selection.isCollapsed()) {
        const newState = RichUtils.toggleInlineStyle(
          localEditorState,
          `FONTSIZE-${size}`
        );
        handleEditorStateChange(newState);
      } else {
        toast.error("Please select text to apply font size.", {
          position: "top-center",
        });
      }
    };

    // Custom font family
    const handleFontFamilyChange = (event: any) => {
      const font = event.target.value;
      const selection = localEditorState.getSelection();
      if (!selection.isCollapsed()) {
        const newState = RichUtils.toggleInlineStyle(
          localEditorState,
          `FONTFAMILY-${font}`
        );
        handleEditorStateChange(newState);
      } else {
        toast.error("Please select text to apply font family.", {
          position: "top-center",
        });
      }
    };

    // Custom text align
    const handleTextAlignChange = (event: any) => {
      const align = event.target.value;
      const newState = RichUtils.toggleBlockType(
        localEditorState,
        `align-${align}`
      );
      handleEditorStateChange(newState);
    };

    // /src/components/ui/EditorDialog.tsx (relevant section only)
    const handleImageUpload = async (file: File) => {
      console.log("Image upload triggered:", file.name);
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, JPG, or PNG).", {
          position: "top-center",
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "editor"); // Subfolder under udsm-hms

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload image");
        }

        const { url, publicId } = await response.json();
        const contentState = localEditorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
          "IMAGE",
          "IMMUTABLE",
          {
            src: url,
            alt: file.name,
          }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newState = EditorState.set(localEditorState, {
          currentContent: contentStateWithEntity,
        });
        handleEditorStateChange(
          AtomicBlockUtils.insertAtomicBlock(newState, entityKey, " ")
        );
        toast.success(`Image "${file.name}" uploaded successfully!`, {
          position: "top-center",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        toast.error(`Error uploading image: ${errorMessage}`, {
          position: "top-center",
        });
      }
    };
    return (
      <>
        <ToastContainer position="top-center" autoClose={3000} />
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="lg"
          fullWidth
          TransitionComponent={Slide}
          transitionDuration={300}
          disableAutoFocus
          disableEnforceFocus
          disablePortal
          PaperProps={{
            sx: {
              minHeight: "500px",
              maxHeight: "80vh",
              width: "90%",
              maxWidth: "1200px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 1400, // Higher than default Dialog z-index (1300)
            },
          }}
          sx={{
            zIndex: 1400, // Ensure the dialog's backdrop is also above
          }}
          aria-labelledby={`edit-${field}-dialog`}
        >
          <DialogTitle id={`edit-${field}-dialog`}>
            Edit {field.charAt(0).toUpperCase() + field.slice(1)}
          </DialogTitle>
          <DialogContent
            sx={{
              overflow: "hidden",
              p: 2,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                flex: 1,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Word Count: {wordCount}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPreviewMode}
                      onChange={(e) => setIsPreviewMode(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Preview Mode"
                  sx={{ textTransform: "none" }}
                />
              </Box>
              {isPreviewMode ? (
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    p: 2,
                    flex: 1,
                    overflowY: "auto",
                    bgcolor: "#fafafa",
                  }}
                  dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                  aria-label={`${field} preview`}
                />
              ) : (
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <Toolbar>
                    {(externalProps) => (
                      <>
                        <BoldButton {...externalProps} />
                        <ItalicButton {...externalProps} />
                        <UnderlineButton {...externalProps} />
                        <CodeButton {...externalProps} />
                        <HeadlineOneButton {...externalProps} />
                        <HeadlineTwoButton {...externalProps} />
                        <HeadlineThreeButton {...externalProps} />
                        <UnorderedListButton {...externalProps} />
                        <OrderedListButton {...externalProps} />
                        <BlockquoteButton {...externalProps} />
                        <CodeBlockButton {...externalProps} />
                        <FormControl className="custom-dropdown" size="small">
                          <InputLabel>Font Size</InputLabel>
                          <Select
                            value=""
                            label="Font Size"
                            onChange={handleFontSizeChange}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="" disabled>
                              Select Size
                            </MenuItem>
                            {[
                              "8",
                              "10",
                              "12",
                              "14",
                              "16",
                              "18",
                              "24",
                              "30",
                              "36",
                            ].map((size) => (
                              <MenuItem key={size} value={size}>
                                {size}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl className="custom-dropdown" size="small">
                          <InputLabel>Font Family</InputLabel>
                          <Select
                            value=""
                            label="Font Family"
                            onChange={handleFontFamilyChange}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="" disabled>
                              Select Font
                            </MenuItem>
                            {[
                              "Arial",
                              "Georgia",
                              "Times New Roman",
                              "Verdana",
                            ].map((font) => (
                              <MenuItem key={font} value={font}>
                                {font}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl className="custom-dropdown" size="small">
                          <InputLabel>Text Align</InputLabel>
                          <Select
                            value=""
                            label="Text Align"
                            onChange={handleTextAlignChange}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="" disabled>
                              Select Alignment
                            </MenuItem>
                            {["left", "center", "right", "justify"].map(
                              (align) => (
                                <MenuItem key={align} value={align}>
                                  {align.charAt(0).toUpperCase() +
                                    align.slice(1)}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                        <FormControl className="custom-dropdown" size="small">
                          <InputLabel>Color</InputLabel>
                          <Select
                            value=""
                            label="Color"
                            onChange={handleColorChange}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="" disabled>
                              Select Color
                            </MenuItem>
                            {[
                              { value: "#000000", label: "Black" },
                              { value: "#e60000", label: "Red" },
                              { value: "#ff9900", label: "Orange" },
                              { value: "#ffff00", label: "Yellow" },
                              { value: "#008a00", label: "Green" },
                              { value: "#0066cc", label: "Blue" },
                              { value: "#9933ff", label: "Purple" },
                            ].map((color) => (
                              <MenuItem key={color.value} value={color.value}>
                                {color.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleAddLink}
                          sx={{ mx: 1 }}
                        >
                          Link
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/jpeg,image/jpg,image/png";
                            input.onchange = (e: any) => {
                              const file = e.target.files[0];
                              if (file) handleImageUpload(file);
                            };
                            input.click();
                          }}
                          sx={{ mx: 1 }}
                        >
                          Image
                        </Button>
                        <EmojiSelect />
                      </>
                    )}
                  </Toolbar>
                  <Box className="editor-container">
                    <Editor
                      editorState={localEditorState}
                      onChange={handleEditorStateChange}
                      plugins={plugins}
                      ref={editorRef}
                      blockRendererFn={blockRendererFn}
                      customStyleMap={{
                        "COLOR-000000": { color: "#000000" },
                        "COLOR-e60000": { color: "#e60000" },
                        "COLOR-ff9900": { color: "#ff9900" },
                        "COLOR-ffff00": { color: "#ffff00" },
                        "COLOR-008a00": { color: "#008a00" },
                        "COLOR-0066cc": { color: "#0066cc" },
                        "COLOR-9933ff": { color: "#9933ff" },
                        "FONTSIZE-8": { fontSize: "8px" },
                        "FONTSIZE-10": { fontSize: "10px" },
                        "FONTSIZE-12": { fontSize: "12px" },
                        "FONTSIZE-14": { fontSize: "14px" },
                        "FONTSIZE-16": { fontSize: "16px" },
                        "FONTSIZE-18": { fontSize: "18px" },
                        "FONTSIZE-24": { fontSize: "24px" },
                        "FONTSIZE-30": { fontSize: "30px" },
                        "FONTSIZE-36": { fontSize: "36px" },
                        "FONTFAMILY-Arial": { fontFamily: "Arial, sans-serif" },
                        "FONTFAMILY-Georgia": { fontFamily: "Georgia, serif" },
                        "FONTFAMILY-Times New Roman": {
                          fontFamily: "'Times New Roman', Times, serif",
                        },
                        "FONTFAMILY-Verdana": {
                          fontFamily: "Verdana, sans-serif",
                        },
                      }}
                      aria-label={`${field} editor`}
                    />
                    <EmojiSuggestions />
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={onClose}
              color="secondary"
              disabled={isSaving}
              sx={{ textTransform: "none" }}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Cancel editing ${field}`}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : null}
              sx={{ textTransform: "none" }}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Save ${field} content`}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
);

EditorDialog.displayName = "EditorDialog";

export default EditorDialog;
