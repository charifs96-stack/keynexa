/**
 * Form container component
 */

"use client";

interface FormContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onSubmit: (formData: FormData) => Promise<void>;
  submitButtonText?: string;
  isLoading?: boolean;
}

export function FormContainer({
  children,
  title,
  subtitle,
  onSubmit,
  submitButtonText = "Submit",
  isLoading = false,
}: FormContainerProps) {
  async function handleSubmit(formData: FormData) {
    await onSubmit(formData);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mb-8">{subtitle}</p>
          )}

          <form action={handleSubmit} className="space-y-6">
            {children}

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3 rounded-lg font-semibold transition-colors
                bg-black dark:bg-white
                text-white dark:text-black
                hover:bg-gray-800 dark:hover:bg-gray-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isLoading ? "Loading..." : submitButtonText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
