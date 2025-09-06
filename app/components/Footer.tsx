import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-bold text-white mb-3">
              <span className="text-2xl mr-2">🩺</span>
              MedicalSchoolQuizzes
            </div>
            <p className="text-gray-400">
              Empowering medical students with smart, effective quiz preparation tools designed by medical professionals.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="/#specialties" className="hover:text-white transition-colors">Specialties</a></li>
              <li><a href="/#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/quiz" className="hover:text-white transition-colors">Try Quiz</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="/support" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p>&copy; 2025 MedicalSchoolQuizzes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;