//src/components/ai/ai-chatbot.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  Fab,
  Collapse,
  Chip,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Chat,
  Send,
  Close,
  SmartToy,
  Person,
  HelpOutline,
  School,
  Event,
  Assignment,
  Group,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery"; // Import useMediaQuery

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  type?: "text" | "quick_reply" | "escalation";
  suggestions?: string[];
}

interface QuickAction {
  label: string;
  icon: React.ReactElement;
  action: string;
}

export default function AIChatbot() {
  const { data: session } = useSession();
  const theme = useTheme();
  // `isSmallScreen` can still be useful for other conditional rendering if needed,
  // but for responsive styles, `sx` prop is generally preferred.
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      label: "How to register for events?",
      icon: <Event />,
      action: "event_registration",
    },
    {
      label: "How to join a project?",
      icon: <Assignment />,
      action: "project_joining",
    },
    {
      label: "How to enroll in programmes?",
      icon: <School />,
      action: "programme_enrollment",
    },
    { label: "How to join a hub?", icon: <Group />, action: "hub_joining" },
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        content: `Hello${
          session?.user?.firstName ? ` ${session.user.firstName}` : ""
        }! 👋 I'm your UDSM Hub Management System assistant. I can help you with:

• Navigating the platform
• Understanding how to join hubs and projects
• Event registration and programme enrollment
• System features and policies
• Technical support

How can I assist you today?`,
        sender: "ai",
        timestamp: new Date(),
        type: "text",
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          context: {
            userId: session?.user?.id,
            userRole: session?.user?.role,
            conversationHistory: messages.slice(-5), // Last 5 messages for context
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "ai",
        timestamp: new Date(),
        type: data.type || "text",
        suggestions: data.suggestions,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again or contact support at support@udsm.ac.tz for immediate assistance.",
        sender: "ai",
        timestamp: new Date(),
        type: "escalation",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      event_registration: "How do I register for events?",
      project_joining: "How can I join a project?",
      programme_enrollment: "How do I enroll in programmes?",
      hub_joining: "How do I join a hub?",
    };

    const message = actionMessages[action];
    if (message) {
      handleSendMessage(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)"
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          "&:hover": {
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                : "linear-gradient(135deg, #5a67d8 0%, #667eea 100%)",
          },
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <Close /> : <Chat />}
      </Fab>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              bottom: isSmallScreen ? 70 : 85,
              right: isSmallScreen ? 8 : 7,
              zIndex: 999,
              width: isSmallScreen ? "calc(100% - 16px)" : 400,
              height: isSmallScreen ? "60vh" : 510,
              borderRadius: isSmallScreen ? 3 : 3,
              ...(typeof window !== "undefined" && window.innerWidth <= 450
                ? {
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    borderRadius: 0,
                  }
                : {}),
            }}
          >
            <Paper
              elevation={8}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "background.paper",
                border:
                  theme.palette.mode === "dark" ? "1px solid #334155" : "none",
                // Remove border radius on very small screens if it's fullscreen
                "@media (max-width: 450px)": {
                  borderRadius: 0,
                },
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background:
                    theme.palette.mode === "dark"
                      ? "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mr: 2 }}>
                    <SmartToy />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      UDSM Assistant
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      AI-Powered Support
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setIsOpen(false)}
                  sx={{ color: "white" }}
                >
                  <Close />
                </IconButton>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: "auto",
                  p: 1,
                  bgcolor:
                    theme.palette.mode === "dark" ? "#0f172a" : "#f8fafc",
                }}
              >
                <List sx={{ p: 0 }}>
                  {messages.map((message) => (
                    <ListItem
                      key={message.id}
                      sx={{
                        display: "flex",
                        justifyContent:
                          message.sender === "user" ? "flex-end" : "flex-start",
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: { xs: "95%", sm: "80%" }, // Adjust max width for smaller screens
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                          flexDirection:
                            message.sender === "user" ? "row-reverse" : "row",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor:
                              message.sender === "user"
                                ? "primary.main"
                                : "secondary.main",
                          }}
                        >
                          {message.sender === "user" ? (
                            <Person />
                          ) : (
                            <SmartToy />
                          )}
                        </Avatar>
                        <Box>
                          <Paper
                            sx={{
                              p: 1.5,
                              bgcolor:
                                message.sender === "user"
                                  ? "primary.main"
                                  : theme.palette.mode === "dark"
                                  ? "#1e293b"
                                  : "white",
                              color:
                                message.sender === "user"
                                  ? "primary.contrastText"
                                  : "text.primary",
                              borderRadius: 2,
                              mb: 0.5,
                              border:
                                theme.palette.mode === "dark" &&
                                message.sender === "ai"
                                  ? "1px solid #334155"
                                  : "none",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace: "pre-wrap",
                                lineHeight: 1.4,
                                color: "inherit",
                              }}
                            >
                              {message.content}
                            </Typography>
                          </Paper>

                          {message.suggestions && (
                            <Box sx={{ mt: 1 }}>
                              {message.suggestions.map((suggestion, index) => (
                                <Chip
                                  key={index}
                                  label={suggestion}
                                  size="small"
                                  onClick={() => handleSendMessage(suggestion)}
                                  sx={{
                                    mr: 0.5,
                                    mb: 0.5,
                                    cursor: "pointer",
                                    bgcolor:
                                      theme.palette.mode === "dark"
                                        ? "#334155"
                                        : "#e2e8f0",
                                    color:
                                      theme.palette.mode === "dark"
                                        ? "#e2e8f0"
                                        : "#475569",
                                    "&:hover": {
                                      bgcolor:
                                        theme.palette.mode === "dark"
                                          ? "#475569"
                                          : "#cbd5e1",
                                    },
                                  }}
                                />
                              ))}
                            </Box>
                          )}

                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mt: 0.5,
                              color:
                                theme.palette.mode === "dark"
                                  ? "#94a3b8"
                                  : "#64748b",
                            }}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}

                  {isTyping && (
                    <ListItem sx={{ px: 1, py: 0.5 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "secondary.main",
                          }}
                        >
                          <SmartToy />
                        </Avatar>
                        <Paper
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "#1e293b"
                                : "white",
                            border:
                              theme.palette.mode === "dark"
                                ? "1px solid #334155"
                                : "none",
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {[0, 1, 2].map((i) => (
                              <Box
                                key={i}
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor:
                                    theme.palette.mode === "dark"
                                      ? "#64748b"
                                      : "#94a3b8",
                                  animation: "pulse 1.4s ease-in-out infinite",
                                  animationDelay: `${i * 0.2}s`,
                                }}
                              />
                            ))}
                          </Box>
                        </Paper>
                      </Box>
                    </ListItem>
                  )}
                </List>
                <div ref={messagesEndRef} />
              </Box>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <Box sx={{ p: 2, bgcolor: "background.paper" }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ color: "text.primary" }}
                  >
                    Quick Help:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {quickActions.map((action, index) => (
                      <Chip
                        key={index}
                        icon={action.icon}
                        label={action.label}
                        size="small"
                        onClick={() => handleQuickAction(action.action)}
                        sx={{
                          cursor: "pointer",
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#334155"
                              : "#f1f5f9",
                          color:
                            theme.palette.mode === "dark"
                              ? "#e2e8f0"
                              : "#475569",
                          "&:hover": {
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "#475569"
                                : "#e2e8f0",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Divider
                sx={{
                  borderColor:
                    theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                }}
              />

              {/* Input */}
              <Box sx={{ p: 2, bgcolor: "background.paper" }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor:
                          theme.palette.mode === "dark" ? "#334155" : "#ffffff",
                        "& fieldset": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? "#475569"
                              : "#d1d5db",
                        },
                        "&:hover fieldset": {
                          borderColor:
                            theme.palette.mode === "dark"
                              ? "#64748b"
                              : "#9ca3af",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        color: "text.primary",
                      },
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                      "&:disabled": {
                        bgcolor:
                          theme.palette.mode === "dark" ? "#475569" : "#e5e7eb",
                        color:
                          theme.palette.mode === "dark" ? "#94a3b8" : "#9ca3af",
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Send />
                    )}
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for typing animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%,
          60%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          30% {
            transform: scale(1.1);
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}
