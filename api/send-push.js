import admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error) {
        console.error("Firebase Admin init error:", error);
    }
}

const db = admin.firestore();

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

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
            return res.status(200).json({ 
                success: true,
                sent: 0,
                message: "No subscribers yet." 
            });
        }

        const response = await admin.messaging().sendEachForMulticast({
            tokens: tokens,
            notification: {
                title: title,
                body: body,
            },
            webpush: {
                notification: {
                    icon: "https://kenjutsu-no-kadai.vercel.app/src/knklogodark0001.png",
                    badge: "https://kenjutsu-no-kadai.vercel.app/src/knklogodark0001.png",
                    requireInteraction: false,
                },
                fcm_options: {
                    link: "https://kenjutsu-no-kadai.vercel.app/#latest"
                }
            }
        });

        const tokensToRemove = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                const errorCode = resp.error?.code;
                if (
                    errorCode === 'messaging/invalid-registration-token' ||
                    errorCode === 'messaging/registration-token-not-registered'
                ) {
                    tokensToRemove.push(tokens[idx]);
                }
            }
        });

        if (tokensToRemove.length > 0) {
            const batch = db.batch();
            tokensToRemove.forEach(token => {
                batch.delete(db.collection("push_tokens").doc(token));
            });
            await batch.commit();
        }

        return res.status(200).json({
            success: true,
            sent: response.successCount,
            failed: response.failureCount,
            cleanedUp: tokensToRemove.length
        });

    } catch (error) {
        console.error("Push send error:", error);
        return res.status(500).json({ error: error.message });
    }
}