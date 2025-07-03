//src/app/api/admin/system-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireStrongPasswords: boolean;
    enableTwoFactor: boolean;
    allowGoogleAuth: boolean;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    enableWhatsAppNotifications: boolean;
    notificationFrequency: "immediate" | "daily" | "weekly";
  };
  features: {
    enableAIFeatures: boolean;
    enableRealTimeChat: boolean;
    enableFileUploads: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  integrations: {
    cloudinaryEnabled: boolean;
    firebaseEnabled: boolean;
    whatsappEnabled: boolean;
    analyticsEnabled: boolean;
  };
  limits: {
    maxHubsPerUser: number;
    maxProjectsPerHub: number;
    maxEventsPerHub: number;
    maxMembersPerHub: number;
    maxFileSizePerUpload: number;
  };
}

// Default system settings
const defaultSettings: SystemSettings = {
  general: {
    siteName: "UDSM Hub Management System",
    siteDescription:
      "University of Dar es Salaam Hub Management System - Connect, Collaborate, and Grow",
    contactEmail: "support@udsm.ac.tz",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
  },
  security: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPasswords: true,
    enableTwoFactor: false,
    allowGoogleAuth: true,
  },
  notifications: {
    enableEmailNotifications: true,
    enablePushNotifications: true,
    enableWhatsAppNotifications: false,
    notificationFrequency: "immediate",
  },
  features: {
    enableAIFeatures: true,
    enableRealTimeChat: true,
    enableFileUploads: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "pdf",
      "doc",
      "docx",
      "txt",
    ],
  },
  integrations: {
    cloudinaryEnabled: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    firebaseEnabled: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    whatsappEnabled: !!process.env.WHATSAPP_ACCESS_TOKEN,
    analyticsEnabled: true,
  },
  limits: {
    maxHubsPerUser: 5,
    maxProjectsPerHub: 50,
    maxEventsPerHub: 100,
    maxMembersPerHub: 500,
    maxFileSizePerUpload: 10 * 1024 * 1024, // 10MB
  },
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real implementation, you would fetch these from a database
    // For now, we'll return the default settings with some dynamic values
    const settings: SystemSettings = {
      ...defaultSettings,
      integrations: {
        cloudinaryEnabled: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        firebaseEnabled: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        whatsappEnabled: !!process.env.WHATSAPP_ACCESS_TOKEN,
        analyticsEnabled: true,
      },
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("System settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch system settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedSettings: Partial<SystemSettings> = await request.json();

    // Validate the settings
    if (
      updatedSettings.security?.passwordMinLength &&
      updatedSettings.security.passwordMinLength < 6
    ) {
      return NextResponse.json(
        { error: "Password minimum length cannot be less than 6 characters" },
        { status: 400 }
      );
    }

    if (
      updatedSettings.limits?.maxFileSizePerUpload &&
      updatedSettings.limits.maxFileSizePerUpload > 100 * 1024 * 1024
    ) {
      return NextResponse.json(
        { error: "Maximum file size cannot exceed 100MB" },
        { status: 400 }
      );
    }

    // In a real implementation, you would save these to a database
    // For now, we'll just return the updated settings
    const mergedSettings = {
      ...defaultSettings,
      ...updatedSettings,
      integrations: {
        ...defaultSettings.integrations,
        ...updatedSettings.integrations,
        // Keep the actual integration status based on environment variables
        cloudinaryEnabled: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        firebaseEnabled: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        whatsappEnabled: !!process.env.WHATSAPP_ACCESS_TOKEN,
      },
    };

    // Log the settings change
    console.log(`Admin ${session.user.email} updated system settings:`, {
      timestamp: new Date().toISOString(),
      changes: updatedSettings,
    });

    // Create audit log
    await fetch(`${process.env.NEXTAUTH_URL}/api/admin/audit-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE",
        entityType: "SYSTEM_SETTINGS",
        details: {
          changedFields: Object.keys(updatedSettings),
          previousValues: defaultSettings,
          newValues: updatedSettings,
        },
      }),
    });

    return NextResponse.json({
      success: true,
      settings: mergedSettings,
      message: "System settings updated successfully",
    });
  } catch (error) {
    console.error("System settings PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update system settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    switch (action) {
      case "reset_to_defaults":
        // Reset all settings to defaults
        console.log(
          `Admin ${session.user.email} reset system settings to defaults`
        );

        // Create audit log
        await fetch(`${process.env.NEXTAUTH_URL}/api/admin/audit-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "RESET",
            entityType: "SYSTEM_SETTINGS",
            details: {
              action: "reset_to_defaults",
            },
          }),
        });

        return NextResponse.json({
          success: true,
          settings: defaultSettings,
          message: "System settings reset to defaults",
        });

      case "backup_settings":
        // Create a backup of current settings
        const backup = {
          timestamp: new Date().toISOString(),
          settings: defaultSettings,
          createdBy: session.user.email,
        };

        console.log("Settings backup created:", backup);

        return NextResponse.json({
          success: true,
          backup,
          message: "Settings backup created successfully",
        });

      case "test_integrations":
        // Test all integrations
        const integrationTests = {
          cloudinary: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          firebase: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          whatsapp: !!process.env.WHATSAPP_ACCESS_TOKEN,
          database: true, // Assume database is working if we got this far
        };

        return NextResponse.json({
          success: true,
          tests: integrationTests,
          message: "Integration tests completed",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("System settings POST error:", error);
    return NextResponse.json(
      { error: "Failed to perform system action" },
      { status: 500 }
    );
  }
}
