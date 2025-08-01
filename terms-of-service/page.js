export default function TermsOfServicePage() {
  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">
        Welcome to AdFlow Dashboard. By using our service, you agree to the following terms:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>You are responsible for all activity under your account.</li>
        <li>Do not use our API to scrape or spam Facebook’s services.</li>
        <li>We may suspend or terminate access for violations of these terms.</li>
      </ul>
      <p className="mb-4">
        We reserve the right to update these terms at any time. Continued use after changes constitutes acceptance.
      </p>
      <p>
        Questions? Contact us at{" "}
        <a
          href="mailto:solo_9t9@hotmail.com"
          className="text-blue-600 underline"
        >
          solo_9t9@hotmail.com
        </a>.
      </p>
    </main>
  );
}
