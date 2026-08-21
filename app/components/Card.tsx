interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
