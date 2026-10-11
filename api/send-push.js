import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.PUSH_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Missing title or body" });
  }

  try {
    const tokensSnapshot = await db.collection("push_tokens").get();
    const tokens = tokensSnapshot.docs.map((doc) => doc.id);

    if (tokens.length === 0) {
      return res.status(200).json({ message: "No subscribers yet." });
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokens,
      notification: { title, body },
      webpush: {
        notification: {
          icon: "https://yourdomain.com/src/knklogodark0001.png",
          badge: "https://yourdomain.com/src/knklogodark0001.png",
        },
      },
    });

    return res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (error) {
    console.error("Push error:", error);
    return res.status(500).json({ error: error.message });
  }
}