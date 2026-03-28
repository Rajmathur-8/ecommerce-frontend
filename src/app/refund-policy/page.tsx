'use client';

import Link from 'next/link';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-indigo-600 transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">Refund Policy</span>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund Policy</h1>
          
          <div className="prose prose-lg max-w-none">

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
              <p className="text-gray-700 mb-4">
                At Gupta Distributors, we are committed to ensuring your complete satisfaction with every purchase. This Refund Policy outlines the terms and conditions for refunds, cancellations, and returns of products purchased through our platform.
              </p>
              <p className="text-gray-700">
                We understand that sometimes products may not meet your expectations, and we want to make the refund process as smooth and transparent as possible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility for Refunds</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 General Eligibility</h3>
              <p className="text-gray-700 mb-4">
                Refunds are available for most products purchased through our platform, subject to the following conditions:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Product is in original condition and packaging</li>
                <li>Return request is made within the specified time period</li>
                <li>Product is not in the excluded categories listed below</li>
                <li>All original accessories and documentation are included</li>
                <li>Product has not been used beyond reasonable testing</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Non-Refundable Items</h3>
              <p className="text-gray-700 mb-4">The following items are generally not eligible for refunds:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Software licenses and digital downloads</li>
                <li>Personalized or custom-made products</li>
                <li>Gift cards and vouchers</li>
                <li>Products marked as &ldquo;Final Sale&rdquo; or &ldquo;No Returns&rdquo;</li>
                <li>Damaged or modified products</li>
                <li>Products missing original packaging or accessories</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Refund Timeframes</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Standard Refund Period</h3>
              <p className="text-gray-700 mb-4">
                Most products are eligible for refunds within <strong>30 days</strong> from the date of delivery. This period allows you to thoroughly test and evaluate your purchase.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Extended Refund Period</h3>
              <p className="text-gray-700 mb-4">
                Certain premium electronics and high-value items may have extended refund periods of up to <strong>45 days</strong>. This will be clearly indicated on the product page.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Warranty Claims</h3>
              <p className="text-gray-700 mb-4">
                Products with manufacturer warranties may be eligible for replacement or repair beyond the standard refund period, subject to warranty terms and conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Process</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Initiating a Refund</h3>
              <p className="text-gray-700 mb-4">To request a refund, please follow these steps:</p>
              <ol className="list-decimal pl-6 text-gray-700 mb-4">
                <li>Log into your account and go to &ldquo;Order History&rdquo;</li>
                <li>Select the order containing the item you wish to return</li>
                <li>Click on &ldquo;Request Return&rdquo; for the specific item</li>
                <li>Select the reason for return from the provided options</li>
                <li>Provide any additional details or comments</li>
                <li>Submit your return request</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Return Authorization</h3>
              <p className="text-gray-700 mb-4">
                Once your return request is approved, you will receive a Return Authorization Number (RAN) and return shipping label. Please include the RAN on the outside of your return package.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Return Shipping</h3>
              <p className="text-gray-700 mb-4">
                For eligible returns, we provide a prepaid return shipping label. Please use the provided label to ensure proper tracking and processing of your return.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Refund Processing</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Inspection Period</h3>
              <p className="text-gray-700 mb-4">
                Upon receipt of your returned item, our team will inspect it to ensure it meets our return criteria. This inspection typically takes <strong>2-3 business days</strong>.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Refund Timeline</h3>
              <p className="text-gray-700 mb-4">
                Once the return is approved, refunds are processed as follows:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                <li><strong>Digital Wallets:</strong> 2-5 business days</li>
                <li><strong>Bank Transfers:</strong> 3-7 business days</li>
                <li><strong>Store Credit:</strong> Immediate upon approval</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Refund Amount</h3>
              <p className="text-gray-700 mb-4">
                The refund amount will include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Full purchase price of the returned item</li>
                <li>Original shipping charges (if applicable)</li>
                <li>Return shipping charges (for eligible returns)</li>
              </ul>
              <p className="text-gray-700">
                <strong>Note:</strong> Restocking fees may apply to certain items or categories.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cancellation Policy</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Order Cancellation</h3>
              <p className="text-gray-700 mb-4">
                You may cancel your order at any time before it ships. Once an order has been shipped, it cannot be cancelled and must be returned through our standard return process.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Cancellation Timeline</h3>
              <p className="text-gray-700 mb-4">
                Cancellation requests are processed as follows:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Before Processing:</strong> Immediate cancellation and full refund</li>
                <li><strong>During Processing:</strong> Attempted cancellation, refund if successful</li>
                <li><strong>After Shipping:</strong> Return process must be followed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Special Circumstances</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Defective Products</h3>
              <p className="text-gray-700 mb-4">
                Products that arrive damaged or defective are eligible for immediate replacement or refund. Please contact our customer support team immediately upon discovery of any defects.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Wrong Items Received</h3>
              <p className="text-gray-700 mb-4">
                If you receive the wrong item, we will arrange for the correct item to be shipped at no additional cost, or provide a full refund if the correct item is not available.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 Price Adjustments</h3>
              <p className="text-gray-700 mb-4">
                If a product&apos;s price drops within 7 days of your purchase, we may offer a price adjustment or partial refund upon request.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Restocking Fees</h2>
              <p className="text-gray-700 mb-4">
                A restocking fee may be applied to certain returns to cover the costs of processing, inspecting, and restocking returned items. Restocking fees typically range from 5% to 15% of the product price and will be clearly communicated during the return process.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Returns</h2>
              <p className="text-gray-700 mb-4">
                International returns are subject to additional considerations:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Return shipping costs are the responsibility of the customer</li>
                <li>Customs duties and taxes are non-refundable</li>
                <li>Return processing may take longer due to international shipping</li>
                <li>Certain products may not be eligible for international returns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our refund policy or need assistance with a return, please contact our customer support team:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> refunds@guptadistributors.com</p>
                <p className="text-gray-700 mb-2"><strong>Phone:</strong> +91 1800-123-4567</p>
                <p className="text-gray-700 mb-2"><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
                <p className="text-gray-700"><strong>Address:</strong> Mumbai, Maharashtra, India</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Policy Updates</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify this refund policy at any time. Any changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. We encourage you to review this policy periodically.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
