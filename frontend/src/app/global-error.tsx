"use client";

/**
 * global-error.tsx — Root-level error boundary.
 *
 * Required in Next.js 16 to prevent the Turbopack client manifest error:
 *   "Could not find module [...]/builtin/global-error.js#default"
 *
 * Must render its own <html>/<body> because it replaces the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f0f6ff",
          margin: 0,
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            maxWidth: 400,
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌱</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#57606a", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            {error.digest
              ? `Server error · ${error.digest}`
              : "An unexpected error occurred. Please try again."}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.6rem 1.4rem",
              borderRadius: "9999px",
              background: "#3b82d4",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
