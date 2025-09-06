export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Last updated: January 2025
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              take a quiz, or contact us for support. This may include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Name and email address</li>
              <li>Educational institution and year of study</li>
              <li>Quiz performance and study progress</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Track your learning progress and provide personalized recommendations</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. All data 
              is encrypted in transit and at rest.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Data Sharing</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:privacy@medicalschoolquizzes.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                privacy@medicalschoolquizzes.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}