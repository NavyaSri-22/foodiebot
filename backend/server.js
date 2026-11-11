
const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();

// CORS CONFIGURATION
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://foodiebot-75an8wxd-navyagannavarapu9-3787s-projects.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("Blocked CORS origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// HOME ROUTE
app.get("/", (req, res) => {
    res.send("Welcome to FoodieBot API!");
});

// HEALTH CHECK
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "FoodieBot Backend is running successfully!"
    });
});

// AI FOOD CHATBOT
app.post("/api/food-chat", async (req, res) => {
    try {
        const { message } = req.body || {};

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a food-related question."
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Your message must be under 1000 characters."
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "AI service is not configured yet."
            });
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: message.trim(),
            config: {
                systemInstruction: `
You are FoodieBot, a friendly AI food assistant.

Help users with:
- Food and cooking questions
- Recipes and ingredients
- Different cuisines and dishes
- Meal ideas and meal planning
- Cooking techniques and kitchen tips
- General food and nutrition information
- Restaurant and food discovery suggestions

IMPORTANT RULES:
1. Answer only questions related to food and cooking.
2. Politely redirect unrelated questions.
3. Keep answers friendly and beginner-friendly.
4. Give practical steps when explaining recipes.
5. Never invent restaurant availability, prices or opening hours.
6. Do not give medical diagnoses or personalized medical dietary advice.
7. Use simple language and organize longer answers clearly.
`,
                maxOutputTokens: 700
            }
        });

        res.status(200).json({
            success: true,
            reply: response.text || "Sorry, I couldn't generate a response."
        });

    } catch (error) {
        console.error("Food chatbot error:", error);

        res.status(500).json({
            success: false,
            message: "The Foodie Assistant is temporarily unavailable. Please try again."
        });
    }
});

// RESTAURANT DISCOVERY
app.get("/api/restaurants", async (req, res) => {
    try {
        const lat = Number(req.query.lat);
        const lon = Number(req.query.lon);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lon) ||
            lat < -90 || lat > 90 ||
            lon < -180 || lon > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid latitude and longitude are required."
            });
        }

        const apiKey = process.env.GEOAPIFY_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: "Restaurant service is not configured."
            });
        }

        const params = new URLSearchParams({
            categories: "catering.restaurant,catering.cafe,catering.fast_food",
            filter: `circle:${lon},${lat},2500`,
            bias: `proximity:${lon},${lat}`,
            limit: "40",
            apiKey
        });

        const response = await fetch(
            `https://api.geoapify.com/v2/places?${params}`,
            { signal: AbortSignal.timeout(20000) }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Geoapify error:", response.status, errorText);
            throw new Error(`Geoapify returned HTTP ${response.status}`);
        }

        const data = await response.json();

        const restaurants = (data.features || [])
            .map((feature) => {
                const properties = feature.properties || {};
                const coordinates = feature.geometry?.coordinates;

                if (
                    !properties.name ||
                    !Array.isArray(coordinates) ||
                    coordinates.length < 2
                ) {
                    return null;
                }

                return {
                    id: String(
                        properties.place_id ||
                        properties.datasource?.raw?.id ||
                        properties.name
                    ),
                    name: properties.name,
                    type: properties.categories?.includes("catering.cafe")
                        ? "cafe"
                        : properties.categories?.includes("catering.fast_food")
                            ? "fast_food"
                            : "restaurant",
                    cuisine: properties.datasource?.raw?.cuisine || "Cuisine not specified",
                    address: properties.formatted || "Address not available",
                    latitude: coordinates[1],
                    longitude: coordinates[0],
                    openingHours: properties.opening_hours || "Hours not listed",
                    website: properties.website || null
                };
            })
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            count: restaurants.length,
            radiusMeters: 2500,
            restaurants
        });

    } catch (error) {
        console.error("Restaurant search error:", error);

        return res.status(502).json({
            success: false,
            message: "Unable to find nearby restaurants right now. Please try again."
        });
    }
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`FoodieBot server running on port ${PORT}`);
});
