import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Load Space Grotesk 600 for titles
const spaceGroteskPromise = fetch(
  "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqUtEw.woff2"
).then((res) => res.arrayBuffer());

// Load DM Sans 400 for subtitles
const dmSansPromise = fetch(
  "https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZOIHTWEBlw.woff2"
).then((res) => res.arrayBuffer());

// Pillar colors for the left accent band
const PILLAR_COLORS: Record<string, string> = {
  pulse: "#3b82f6",
  build: "#d97706",
  learn: "#059669",
  system: "#7c3aed",
};
const DEFAULT_COLOR = "#3b82f6";

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
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkOgRate(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const [spaceGrotesk, dmSans] = await Promise.all([
    spaceGroteskPromise,
    dmSansPromise,
  ]);

  const fonts = [
    { name: "Space Grotesk", data: spaceGrotesk, weight: 600 as const },
    { name: "DM Sans", data: dmSans, weight: 400 as const },
  ];

  const { searchParams } = request.nextUrl;

  // Determine which template to use
  const tool = searchParams.get("tool");
  const title =
    searchParams.get("title") ??
    searchParams.get("headline") ??
    searchParams.get("name");

  if (tool) {
    return renderTool(searchParams, fonts);
  }

  if (title) {
    return renderContent(searchParams, title, fonts);
  }

  // Default: homepage template
  return renderHomepage(fonts);
}

type FontConfig = {
  name: string;
  data: ArrayBuffer;
  weight: 600 | 400;
}[];

// Shared watermark for bottom-right corner
function Watermark() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        right: 40,
        fontSize: 14,
        fontFamily: "monospace",
        color: "#cccccc",
      }}
    >
      {"// prototype.studio"}
    </div>
  );
}

/**
 * Template 1: Content/Default
 * White bg, pillar color band on left, title + subtitle + pillar pill
 */
function renderContent(
  searchParams: URLSearchParams,
  title: string,
  fonts: FontConfig
) {
  const type = searchParams.get("type");
  const subtitle = searchParams.get("subtitle");
  const pillar = searchParams.get("pillar");
  const displaySubtitle = type
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : subtitle;
  const bandColor = (pillar && PILLAR_COLORS[pillar]) ?? DEFAULT_COLOR;
  const pillarLabel = pillar
    ? pillar.charAt(0).toUpperCase() + pillar.slice(1)
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#ffffff",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        {/* Left accent band */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            backgroundColor: bandColor,
          }}
        />

        {/* Main content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px 60px 56px",
            width: "100%",
          }}
        >
          {/* Pillar pill */}
          {pillarLabel && (
            <div
              style={{
                display: "flex",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 13,
                  fontFamily: "DM Sans, sans-serif",
                  color: bandColor,
                  backgroundColor: `${bandColor}14`,
                  padding: "5px 14px",
                  borderRadius: 4,
                  fontWeight: 400,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase" as const,
                }}
              >
                {pillarLabel}
              </div>
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              fontFamily: "Space Grotesk, sans-serif",
              color: "#0a0a0a",
              lineHeight: 1.15,
              maxWidth: 960,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {title}
          </div>

          {/* Subtitle / content type */}
          {displaySubtitle && (
            <div
              style={{
                fontSize: 20,
                fontFamily: "DM Sans, sans-serif",
                color: "#737373",
                marginTop: 16,
              }}
            >
              {displaySubtitle}
            </div>
          )}
        </div>

        <Watermark />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}

/**
 * Template 2: Tool
 * White bg, pillar color band, tool name + version badge + tagline + company
 */
function renderTool(searchParams: URLSearchParams, fonts: FontConfig) {
  const tool = searchParams.get("tool") ?? "Tool";
  const version = searchParams.get("version");
  const category = searchParams.get("type");
  const company = searchParams.get("company");
  const tagline = searchParams.get("tagline");
  const pillar = searchParams.get("pillar");
  const bandColor = (pillar && PILLAR_COLORS[pillar]) ?? PILLAR_COLORS.pulse;

  // Truncate tagline to a single readable line
  const trimmedTagline = tagline
    ? tagline.length > 140
      ? `${tagline.slice(0, 137).trimEnd()}…`
      : tagline
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#ffffff",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        {/* Left accent band — pillar color */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            backgroundColor: bandColor,
          }}
        />

        {/* Company label top-left */}
        {company && (
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 56,
              display: "flex",
              fontSize: 13,
              fontFamily: "DM Sans, sans-serif",
              color: "#737373",
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
            }}
          >
            {company}
          </div>
        )}

        {/* Main content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px 60px 56px",
            width: "100%",
          }}
        >
          {/* Tool name + version row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 600,
                fontFamily: "Space Grotesk, sans-serif",
                color: "#0a0a0a",
                lineHeight: 1.1,
              }}
            >
              {tool}
            </div>

            {version && (
              <div
                style={{
                  display: "flex",
                  fontSize: 16,
                  fontFamily: "monospace",
                  color: bandColor,
                  backgroundColor: `${bandColor}14`,
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: `1px solid ${bandColor}33`,
                }}
              >
                v{version}
              </div>
            )}
          </div>

          {/* Tagline (one-line description) */}
          {trimmedTagline && (
            <div
              style={{
                fontSize: 24,
                fontFamily: "DM Sans, sans-serif",
                color: "#525252",
                marginTop: 20,
                maxWidth: 980,
                lineHeight: 1.35,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {trimmedTagline}
            </div>
          )}

          {/* Category fallback */}
          {!trimmedTagline && category && (
            <div
              style={{
                fontSize: 20,
                fontFamily: "DM Sans, sans-serif",
                color: "#737373",
                marginTop: 16,
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
          )}
        </div>

        <Watermark />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}

/**
 * Template 3: Homepage/Default
 * White bg, gradient accent band (blue to purple), tagline
 */
function renderHomepage(fonts: FontConfig) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#ffffff",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        {/* Left gradient accent band — blue to purple */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            backgroundImage: "linear-gradient(to bottom, #3b82f6, #7c3aed)",
          }}
        />

        {/* Main content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px 60px 56px",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              fontFamily: "Space Grotesk, sans-serif",
              color: "#0a0a0a",
              lineHeight: 1.15,
            }}
          >
            Build Real Products.
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              fontFamily: "Space Grotesk, sans-serif",
              color: "#a3a3a3",
              lineHeight: 1.15,
              marginTop: 4,
            }}
          >
            With AI.
          </div>
        </div>

        <Watermark />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}
