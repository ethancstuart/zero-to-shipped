import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name") ?? "Learner";
  const level = searchParams.get("level") ?? "Novice";
  const modules = searchParams.get("modules") ?? "0";
  const badges = searchParams.get("badges") ?? "0";
  const xp = searchParams.get("xp") ?? "0";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 60px",
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: "#3b82f6",
              letterSpacing: "0.1em",
              marginBottom: 16,
            }}
          >
            ZERO TO SHIPPED
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#a3a3a3",
              marginBottom: 40,
            }}
          >
            Level: {level} &middot; {xp} XP
          </div>
          <div
            style={{
              display: "flex",
              gap: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 36, fontWeight: "bold" }}>{modules}</div>
              <div style={{ fontSize: 14, color: "#a3a3a3" }}>Modules</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 36, fontWeight: "bold" }}>{badges}</div>
              <div style={{ fontSize: 14, color: "#a3a3a3" }}>Badges</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
