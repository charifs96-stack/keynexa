interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-black text-white hover:bg-gray-800 focus:ring-black dark:bg-white dark:text-black dark:hover:bg-gray-100",
    secondary:
      "bg-gray-100 text-black hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800",
    outline:
      "border border-gray-300 text-black hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-700 dark:text-white dark:hover:bg-gray-900",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
