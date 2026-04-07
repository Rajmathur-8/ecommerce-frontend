'use client';

import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">Terms of Service</span>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Ecommerce (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-700">
                These Terms of Service (&ldquo;Terms&rdquo;) govern your use of our website, mobile application, and services. By using our services, you agree to these Terms in full.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Gupta Distributors is an online electronics marketplace that provides:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Online shopping platform for electronics and gadgets</li>
                <li>Product listings and descriptions</li>
                <li>Secure payment processing</li>
                <li>Order management and tracking</li>
                <li>Customer support services</li>
                <li>User account management</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 mb-4">
                To access certain features of our service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Security</h3>
              <p className="text-gray-700 mb-4">
                You are responsible for safeguarding the password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Account Termination</h3>
              <p className="text-gray-700 mb-4">
                We reserve the right to terminate or suspend your account at any time for violations of these Terms or for any other reason at our sole discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Product Information and Pricing</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Product Descriptions</h3>
              <p className="text-gray-700 mb-4">
                We strive to provide accurate product descriptions, specifications, and images. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Pricing</h3>
              <p className="text-gray-700 mb-4">
                All prices are subject to change without notice. Prices do not include applicable taxes, shipping, or handling charges. We reserve the right to modify or discontinue products at any time.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Availability</h3>
              <p className="text-gray-700 mb-4">
                Product availability is subject to change. We do not guarantee that products will be available at the time of order placement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Orders and Payment</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Order Acceptance</h3>
              <p className="text-gray-700 mb-4">
                All orders are subject to acceptance by us. We reserve the right to refuse any order for any reason, including but not limited to product availability, pricing errors, or suspected fraud.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Payment Terms</h3>
              <p className="text-gray-700 mb-4">
                Payment is due at the time of order placement. We accept various payment methods as indicated on our website. All payments are processed securely through our payment partners.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Order Confirmation</h3>
              <p className="text-gray-700 mb-4">
                Upon successful order placement, you will receive an order confirmation email. This confirmation does not guarantee product availability or delivery.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Shipping and Delivery</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Shipping Methods</h3>
              <p className="text-gray-700 mb-4">
                We offer various shipping options with different delivery times and costs. Shipping times are estimates and may vary based on location and product availability.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Delivery</h3>
              <p className="text-gray-700 mb-4">
                Delivery is made to the address provided during checkout. You are responsible for ensuring the delivery address is correct and accessible. Risk of loss and title for items pass to you upon delivery.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 International Shipping</h3>
              <p className="text-gray-700 mb-4">
                International orders may be subject to customs duties, taxes, and import fees. These charges are the responsibility of the customer and are not included in our pricing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Returns and Refunds</h2>
              <p className="text-gray-700 mb-4">
                Our return and refund policies are detailed in our separate Return Policy and Refund Policy documents. Please refer to those documents for specific terms and conditions regarding returns and refunds.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content on our website, including but not limited to text, graphics, logos, images, and software, is the property of Gupta Distributors or its content suppliers and is protected by copyright and other intellectual property laws.
              </p>
              <p className="text-gray-700">
                You may not reproduce, distribute, modify, or create derivative works from any content without our express written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You agree not to use our services to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of our services</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Resell or redistribute our products without authorization</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, Gupta Distributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or relating to your use of our services.
              </p>
              <p className="text-gray-700">
                Our total liability to you for any claims arising from these Terms or your use of our services shall not exceed the amount you paid to us in the twelve months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Disclaimers</h2>
              <p className="text-gray-700 mb-4">
                Our services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied. We disclaim all warranties, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Warranties of merchantability and fitness for a particular purpose</li>
                <li>Warranties that our services will be uninterrupted or error-free</li>
                <li>Warranties regarding the accuracy or reliability of information</li>
                <li>Warranties that defects will be corrected</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to indemnify and hold harmless Gupta Distributors, its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of our services or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the &ldquo;Last updated&rdquo; date. Your continued use of our services after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@guptadistributors.com</p>
                <p className="text-gray-700 mb-2"><strong>Phone:</strong> +91 1800-123-4567</p>
                <p className="text-gray-700"><strong>Address:</strong> Mumbai, Maharashtra, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


