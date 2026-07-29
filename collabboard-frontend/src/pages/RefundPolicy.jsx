export default function RefundPolicy() {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6">
        <h1 className="text-5xl font-bold mb-10">
          Cancellation & Refund Policy
        </h1>
  
        <h2 className="text-2xl font-bold">
          Cancellation
        </h2>
  
        <p className="mt-4">
          You may cancel your subscription at any time. Cancellation prevents
          future billing but does not affect your current billing period.
        </p>
  
        <h2 className="text-2xl font-bold mt-10">
          Refunds
        </h2>
  
        <p className="mt-4">
          Payments are generally non-refundable. Refund requests are reviewed for:
        </p>
  
        <ul className="list-disc ml-6 mt-4 space-y-2">
          <li>Duplicate payments</li>
          <li>Failed subscription activation</li>
          <li>Technical issues preventing access</li>
        </ul>
  
        <p className="mt-8">
          Approved refunds are processed within 5–7 business days.
        </p>
  
        <p className="mt-4 font-semibold">
          support@collabboard.com
        </p>
      </div>
    );
  }