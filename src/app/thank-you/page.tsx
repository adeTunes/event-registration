import Image from "next/image";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-white p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-yellow-700 mb-4">Thank You for Coming!</h1>
        <Image
          src="/event-poster.jpeg"
          alt="Event Poster"
          width={400}
          height={200}
          className="mx-auto rounded mb-4"
        />
        <h2 className="text-xl font-semibold mb-2">MENDO AYO Live In Concert</h2>
        <p className="mb-4 text-gray-700">We appreciate your registration. Check your email for event details and updates. We look forward to seeing you at the concert!</p>
        <div className="bg-yellow-100 rounded p-4 mb-4">
          <p className="font-semibold">Next Event Announcement</p>
          <p className="text-gray-700">Stay tuned for our next event on <span className="font-bold">December 20, 2025</span>! More details coming soon.</p>
        </div>
        <Link href="/" className="text-yellow-700 underline">Back to Home</Link>
      </div>
    </main>
  );
}
