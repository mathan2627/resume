import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
  highlight?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = false,
  glass = false,
  highlight = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${
        glass
          ? "bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] light:bg-white/80 light:border-slate-200"
          : "bg-slate-900/90 border border-slate-800/90 light:bg-white light:border-slate-200 shadow-sm"
      } ${
        hover
          ? "hover:border-slate-700 hover:shadow-xl hover:shadow-blue-950/20 hover:-translate-y-0.5 light:hover:border-slate-300 light:hover:shadow-slate-200"
          : ""
      } ${
        highlight
          ? "ring-1 ring-blue-500/50 border-blue-500/40 bg-gradient-to-b from-blue-950/20 to-slate-900/90"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`p-5 sm:p-6 pb-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <h3
    className={`text-lg sm:text-xl font-semibold tracking-tight text-white light:text-slate-900 ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <p className={`text-sm text-slate-400 light:text-slate-500 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`p-5 sm:p-6 pt-2 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={`p-5 sm:p-6 pt-3 border-t border-slate-800/60 light:border-slate-100 flex items-center justify-between ${className}`}
    {...props}
  >
    {children}
  </div>
);
