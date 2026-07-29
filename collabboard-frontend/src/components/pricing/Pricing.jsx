import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Perfect for individuals and students getting started.",
    button: "Start Free",
    features: [
      "1 Workspace",
      "Up to 3 Team Members",
      "3 Kanban Boards",
      "Task Management",
      "Due Dates",
      "Activity History",
      "Community Support",
    ],
  },
  {
    name: "Pro",
    price: "₹299",
    popular: true,
    description: "Ideal for startups and growing teams.",
    button: "Upgrade to Pro",
    features: [
      "Unlimited Boards",
      "Unlimited Team Members",
      "Real-Time Collaboration",
      "Shared Documents",
      "Comments & Mentions",
      "Calendar View",
      "Priority Support",
      "Roles & Permissions",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Built for organizations with advanced requirements.",
    button: "Contact Sales",
    features: [
      "Everything in Pro",
      "SSO Login",
      "Advanced Security",
      "Audit Logs",
      "API Access",
      "Dedicated Support",
    ],
  },
];

export default function Pricing() {
  return (
    <div className="max-w-7xl mx-auto py-20 px-6">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold">
          Simple, Transparent Pricing
        </h1>

        <p className="text-gray-500 mt-4 text-lg">
          Choose the perfect plan for your team.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-8 shadow-sm ${
              plan.popular
                ? "border-blue-500 shadow-lg"
                : ""
            }`}
          >
            {plan.popular && (
              <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}

            <h2 className="text-3xl font-bold mt-4">
              {plan.name}
            </h2>

            <p className="text-4xl font-bold mt-3">
              {plan.price}
            </p>

            <p className="text-gray-500 mt-3">
              {plan.description}
            </p>

            <button className="w-full bg-blue-600 text-white py-3 rounded-xl mt-6">
              {plan.button}
            </button>

            <div className="mt-8 space-y-4">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex gap-3"
                >
                  <Check size={18} />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24">
        <h2 className="text-3xl font-bold mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">
              Can I cancel anytime?
            </h3>
            <p className="text-gray-500">
              Yes. You can cancel your subscription at any time from your
              account settings.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">
              Do you offer refunds?
            </h3>
            <p className="text-gray-500">
              Refunds are reviewed on a case-by-case basis according to our
              Refund Policy.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">
              Can I upgrade later?
            </h3>
            <p className="text-gray-500">
              Absolutely. Upgrade or downgrade your plan anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}