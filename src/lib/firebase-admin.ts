//src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
export const adminMessaging = getMessaging(adminApp);

// Real-time data management functions
export const createDiscussion = async (
  entityType: string,
  entityId: string
) => {
  const discussionRef = adminDb.collection("discussions").doc();
  await discussionRef.set({
    entityType,
    entityId,
    createdAt: new Date(),
    messages: [],
    participants: [],
  });
  return discussionRef.id;
};

export const addComment = async (discussionId: string, comment: any) => {
  const discussionRef = adminDb.collection("discussions").doc(discussionId);
  await discussionRef.update({
    messages: FieldValue.arrayUnion({
      ...comment,
      timestamp: new Date(),
    }),
  });
};

export const addLike = async (
  entityType: string,
  entityId: string,
  userId: string
) => {
  const likesRef = adminDb.collection("likes").doc(`${entityType}_${entityId}`);
  await likesRef.update({
    users: FieldValue.arrayUnion(userId),
    count: FieldValue.increment(1),
  });
};

export const removeLike = async (
  entityType: string,
  entityId: string,
  userId: string
) => {
  const likesRef = adminDb.collection("likes").doc(`${entityType}_${entityId}`);
  await likesRef.update({
    users: FieldValue.arrayRemove(userId),
    count: FieldValue.increment(-1),
  });
};

export const sendNotification = async (
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  const message = {
    notification: {
      title,
      body,
    },
    data: data || {},
    tokens: userIds, // FCM tokens
  };

  try {
    const response = await adminMessaging.sendMulticast(message);
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.log("Error sending message:", error);
    throw error;
  }
};

export default adminApp;
