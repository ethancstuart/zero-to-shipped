import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const template = searchParams.get("template") ?? "profile";

  if (template === "module-complete") {
    return renderModuleComplete(searchParams);
  }

  return renderProfile(searchParams);
}

function renderProfile(searchParams: URLSearchParams) {
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

function renderModuleComplete(searchParams: URLSearchParams) {
  const moduleTitle = searchParams.get("title") ?? "Module";
  const moduleNumber = searchParams.get("number") ?? "1";
  const completed = searchParams.get("completed") ?? "1";

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
              marginBottom: 24,
            }}
          >
            ZERO TO SHIPPED
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#22c55e",
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Module Completed!
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: "bold",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Module {moduleNumber}: {moduleTitle}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#a3a3a3",
              marginTop: 24,
            }}
          >
            {completed}/16 modules completed
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 32,
              width: 400,
              height: 8,
              backgroundColor: "#262626",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(Number(completed) / 16) * 100}%`,
                height: "100%",
                backgroundColor: "#3b82f6",
                borderRadius: 4,
              }}
            />
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
