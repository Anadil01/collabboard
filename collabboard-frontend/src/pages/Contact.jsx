export default function Contact() {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6">
        <h1 className="text-5xl font-bold mb-10">
          Contact Us
        </h1>
  
        <p className="text-lg">
          We'd love to hear from you.
        </p>
  
        <div className="mt-10 space-y-6">
          <div>
            <h2 className="font-bold">Support Email</h2>
            <p>support@collabboard.com</p>
          </div>
  
          <div>
            <h2 className="font-bold">Business Hours</h2>
            <p>Monday – Friday</p>
            <p>10:00 AM – 6:00 PM (IST)</p>
          </div>
  
          <div>
            <h2 className="font-bold">Response Time</h2>
            <p>Within 24–48 hours</p>
          </div>
  
          <div>
            <h2 className="font-bold">Location</h2>
            <p>India</p>
          </div>
        </div>
      </div>
    );
  }