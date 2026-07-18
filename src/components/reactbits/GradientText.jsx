import React from "react";

export default function GradientText({
  children,
  colors = ["#4A7C59", "#8BB892", "#C08552", "#7B9B7A"],
  speed = 8,
  className = "",
  as: Tag = "span",
}) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(", ")})`,
    backgroundSize: "200% 200%",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: `gradient-shift ${speed}s ease-in-out infinite alternate`,
  };

  return (
    <>
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <Tag className={`inline ${className}`} style={gradientStyle}>
        {children}
      </Tag>
    </>
  );
}
