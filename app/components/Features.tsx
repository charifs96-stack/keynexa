export function Features() {
  const features = [
    {
      icon: "⚡",
      title: "Fast Shipping",
      description: "Quick delivery to your doorstep with real-time tracking",
    },
    {
      icon: "🔒",
      title: "Secure Checkout",
      description: "Your payment information is protected with industry-leading encryption",
    },
    {
      icon: "✓",
      title: "Quality Guaranteed",
      description: "Every product meets our high standards for quality and craftsmanship",
    },
    {
      icon: "↩️",
      title: "Easy Returns",
      description: "30-day return policy, no questions asked",
    },
  ];

  return (
    <section className="bg-white dark:bg-black py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black dark:text-white">
            Why Choose KeyNexa
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Premium shopping experience with service that exceeds expectations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col gap-4 p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700 transition-colors">
              <div className="text-4xl">{feature.icon}</div>
              <h3 className="font-semibold text-lg text-black dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
