export default function ShippingPolicy() {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6">
        <h1 className="text-5xl font-bold mb-10">
          Shipping Policy
        </h1>
  
        <p>
          CollabBoard is a cloud-based Software as a Service (SaaS) platform.
        </p>
  
        <p className="mt-6">
          We do not sell or ship any physical products.
        </p>
  
        <ul className="list-disc ml-6 mt-6 space-y-2">
          <li>Subscriptions are activated automatically.</li>
          <li>No shipping charges apply.</li>
          <li>No physical delivery is involved.</li>
          <li>Premium features are available immediately after payment.</li>
        </ul>
  
        <p className="mt-8">
          For activation issues contact:
        </p>
  
        <p className="font-semibold">
          support@collabboard.com
        </p>
      </div>
    );
  }