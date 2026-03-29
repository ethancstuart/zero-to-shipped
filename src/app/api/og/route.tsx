import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Simple edge-compatible rate limiter (in-memory per isolate)
const ogStore = new Map<string, { count: number; resetAt: number }>();
function checkOgRate(ip: string): boolean {
  const now = Date.now();
  const entry = ogStore.get(ip);
  if (!entry || now > entry.resetAt) {
    ogStore.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkOgRate(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": "60" } });
  }

  const { searchParams } = request.nextUrl;
  const template = searchParams.get("template") ?? "profile";

  if (template === "site") {
    return renderSite();
  }

  if (template === "guide") {
    return renderGuide(searchParams);
  }

  if (template === "achievement") {
    return renderAchievement(searchParams);
  }

  if (template === "module") {
    return renderModule(searchParams);
  }

  if (template === "module-complete") {
    return renderModuleComplete(searchParams);
  }

  return renderProfile(searchParams);
}

function renderModule(searchParams: URLSearchParams) {
  const number = searchParams.get("number") ?? "1";
  const title = searchParams.get("title") ?? "Module";
  const tier = searchParams.get("tier") ?? "foundations";

  const tierColors: Record<string, string> = {
    foundations: "#3b82f6",
    intermediate: "#8b5cf6",
    advanced: "#f59e0b",
    capstone: "#22c55e",
  };
  const tierColor = tierColors[tier] ?? "#3b82f6";

  const tierLabels: Record<string, string> = {
    foundations: "Foundations",
    intermediate: "Intermediate",
    advanced: "Advanced",
    capstone: "Capstone",
  };
  const tierLabel = tierLabels[tier] ?? tier;

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
              marginBottom: 32,
            }}
          >
            ZERO TO SHIPPED
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: `3px solid ${tierColor}`,
              fontSize: 40,
              fontWeight: "bold",
              marginBottom: 24,
            }}
          >
            {number}
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: "bold",
              marginBottom: 16,
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: tierColor,
              backgroundColor: `${tierColor}20`,
              padding: "8px 20px",
              borderRadius: 20,
              fontWeight: 600,
            }}
          >
            {tierLabel}
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

function renderSite() {
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
              fontSize: 24,
              color: "#3b82f6",
              letterSpacing: "0.1em",
              marginBottom: 24,
            }}
          >
            ZERO TO SHIP
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: "bold",
              marginBottom: 16,
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            Build with AI — no engineering degree required
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#a3a3a3",
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            16 modules. Ship a capstone. Earn a certificate.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              color: "#22c55e",
              backgroundColor: "#22c55e20",
              padding: "10px 24px",
              borderRadius: 24,
              fontWeight: 600,
            }}
          >
            Founding member pricing: $49 (first 100 students)
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function renderGuide(searchParams: URLSearchParams) {
  const title = searchParams.get("title") ?? "Guide";
  const subtitle = searchParams.get("subtitle") ?? "Zero to Ship";

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
            ZERO TO SHIP — GUIDE
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: "bold",
              marginBottom: 16,
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#a3a3a3",
              textAlign: "center",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function renderAchievement(searchParams: URLSearchParams) {
  const icon = searchParams.get("icon") ?? "🏆";
  const title = searchParams.get("title") ?? "Achievement Unlocked";
  const name = searchParams.get("name") ?? "";

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
              marginBottom: 32,
            }}
          >
            ZERO TO SHIP
          </div>
          <div style={{ fontSize: 72, marginBottom: 16 }}>{icon}</div>
          <div
            style={{
              fontSize: 44,
              fontWeight: "bold",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {title}
          </div>
          {name && (
            <div
              style={{
                fontSize: 24,
                color: "#a3a3a3",
              }}
            >
              {name}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
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
