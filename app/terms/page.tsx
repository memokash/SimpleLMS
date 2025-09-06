export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Last updated: January 2025
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-300">
              By accessing and using MedicalSchoolQuizzes, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with any of these terms, you are 
              prohibited from using this site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Use License</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Permission is granted to access and use MedicalSchoolQuizzes for personal, educational purposes. 
              This license shall automatically terminate if you violate any of these restrictions.
            </p>
            <p className="text-gray-600 dark:text-gray-300">You may not:</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mt-2">
              <li>Share your account credentials with others</li>
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any portion of the service</li>
              <li>Copy, distribute, or disclose any part of the service without authorization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Account Terms</h2>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>You must be 13 years or older to use this service</li>
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>Maximum 2 devices can be signed in simultaneously per account</li>
              <li>You are responsible for all activities that occur under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Payment Terms</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Paid subscriptions are billed monthly or annually. All payments are processed securely through 
              Stripe. Refunds are provided according to our refund policy. Subscription cancellations take 
              effect at the end of the current billing period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Content and Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-300">
              All quiz content, questions, explanations, and study materials are proprietary to 
              MedicalSchoolQuizzes. Users retain rights to content they create in the Community Question Bank, 
              but grant us a license to use, modify, and distribute such content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Medical Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-300">
              MedicalSchoolQuizzes is an educational tool only. Content is not intended as medical advice, 
              diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300">
              MedicalSchoolQuizzes shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We reserve the right to modify these terms at any time. We will notify users of any material 
              changes via email or through the service. Your continued use constitutes acceptance of the 
              modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300">
              For questions about these Terms of Service, please contact us at:
              <br />
              <a href="mailto:legal@medicalschoolquizzes.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                legal@medicalschoolquizzes.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}