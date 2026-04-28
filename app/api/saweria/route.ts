import { NextRequest, NextResponse } from "next/server";
import games from "@/games.json";

const SAWERIA_TOKEN = process.env.SAWERIA_TOKEN;

type GameConfig = {
    universeId: string;
    topic: string;
};

export async function POST(req: NextRequest) {
    try {
        const gameId = req.nextUrl.searchParams.get("gameId");
        if (!gameId) {
            return NextResponse.json({ error: "Missing gameId" }, { status: 400 });
        }

        const gameConfig = (games.games as Record<string, GameConfig>)[gameId];
        if (!gameConfig) {
            return NextResponse.json({ error: "Unknown gameId" }, { status: 404 });
        }

        const apiKey = process.env[`ROBLOX_API_KEY_${gameId.toUpperCase()}`];
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured for this game" }, { status: 500 });
        }

        if (SAWERIA_TOKEN) {
            const token = req.headers.get("x-saweria-token");
            if (token !== SAWERIA_TOKEN) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const body = await req.json();

        const payload = {
            donorName : body.donator_name                || "Anonymous",
            amount    : body.amount_raw                  || body.etc?.amount_to_display || 0,
            message   : body.message                     || "",
            currency  : "IDR",
        };

        const robloxRes = await fetch(
            `https://apis.roblox.com/messaging-service/v1/universes/${gameConfig.universeId}/topics/${gameConfig.topic}`,
            {
                method : "POST",
                headers: {
                    "x-api-key"   : apiKey,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: JSON.stringify(payload),
                }),
            }
        );

        const robloxBody = await robloxRes.text();

        if (!robloxRes.ok) {
            return NextResponse.json(
                { error: "Roblox API failed", status: robloxRes.status, detail: robloxBody },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal error", detail: String(e) }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: "ok" });
}
