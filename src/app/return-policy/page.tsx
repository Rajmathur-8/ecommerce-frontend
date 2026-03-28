'use client';

import Link from 'next/link';

export default function ReturnPolicy() {
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
              <span className="text-gray-900">Return Policy</span>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Return Policy</h1>
          
          <div className="prose prose-lg max-w-none">

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
              <p className="text-gray-700 mb-4">
                At Gupta Distributors, we stand behind the quality of our products and want you to be completely satisfied with your purchase. Our return policy is designed to provide you with peace of mind and ensure a hassle-free shopping experience.
              </p>
              <p className="text-gray-700">
                This policy outlines the terms and conditions for returning products purchased through our platform, including eligibility criteria, return procedures, and processing timelines.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Return Eligibility</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Eligible Products</h3>
              <p className="text-gray-700 mb-4">
                Most products purchased through our platform are eligible for returns, provided they meet the following criteria:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Product is in original, unused condition</li>
                <li>All original packaging and accessories are included</li>
                <li>Return request is initiated within the specified timeframe</li>
                <li>Product is not in the excluded categories listed below</li>
                <li>No signs of damage, wear, or modification</li>
                <li>All seals, tags, and protective coverings are intact</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Non-Returnable Items</h3>
              <p className="text-gray-700 mb-4">The following items cannot be returned:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Software licenses, digital downloads, and online services</li>
                <li>Personalized, engraved, or custom-made products</li>
                <li>Gift cards, vouchers, and promotional codes</li>
                <li>Products marked as &ldquo;Final Sale&rdquo; or &ldquo;No Returns&rdquo;</li>
                <li>Items that have been used beyond reasonable testing</li>
                <li>Products missing original packaging or accessories</li>
                <li>Items that have been damaged due to misuse or accidents</li>
                <li>Products that have been modified or altered</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Return Timeframes</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Standard Return Period</h3>
              <p className="text-gray-700 mb-4">
                Most products must be returned within <strong>30 days</strong> from the date of delivery. This period allows you to thoroughly evaluate your purchase and ensure it meets your expectations.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Extended Return Period</h3>
              <p className="text-gray-700 mb-4">
                Premium electronics and high-value items may have extended return periods of up to <strong>45 days</strong>. Extended return periods will be clearly indicated on the product page and in your order confirmation.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Holiday Returns</h3>
              <p className="text-gray-700 mb-4">
                During holiday seasons, we may extend return periods for purchases made during specific promotional periods. These extended periods will be communicated at the time of purchase.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Return Process</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Initiating a Return</h3>
              <p className="text-gray-700 mb-4">To start the return process, follow these steps:</p>
              <ol className="list-decimal pl-6 text-gray-700 mb-4">
                <li>Sign in to your account and navigate to &ldquo;Order History&rdquo;</li>
                <li>Locate the order containing the item you wish to return</li>
                <li>Click on &ldquo;Return Item&rdquo; for the specific product</li>
                <li>Select the reason for return from the dropdown menu</li>
                <li>Add any additional comments or details about the return</li>
                <li>Review your return request and submit</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Return Authorization</h3>
              <p className="text-gray-700 mb-4">
                Once your return request is approved, you will receive:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>A Return Authorization Number (RAN)</li>
                <li>A prepaid return shipping label (for eligible returns)</li>
                <li>Return instructions and packaging guidelines</li>
                <li>Estimated processing timeline</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Packaging Requirements</h3>
              <p className="text-gray-700 mb-4">
                To ensure your return is processed quickly and efficiently:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Use the original packaging whenever possible</li>
                <li>Include all original accessories, manuals, and documentation</li>
                <li>Securely package the item to prevent damage during transit</li>
                <li>Attach the return shipping label clearly on the outside</li>
                <li>Include the Return Authorization Number (RAN) on the package</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Return Shipping</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Free Return Shipping</h3>
              <p className="text-gray-700 mb-4">
                We provide free return shipping for most eligible returns. The prepaid shipping label will be included with your return authorization.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Customer-Paid Returns</h3>
              <p className="text-gray-700 mb-4">
                In some cases, return shipping costs may be the responsibility of the customer:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Returns initiated after the standard return period</li>
                <li>Returns of items that were purchased with free shipping</li>
                <li>Returns due to customer preference (not product defects)</li>
                <li>International returns (subject to additional fees)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Return Shipping Timeline</h3>
              <p className="text-gray-700 mb-4">
                Once you ship your return:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You will receive a confirmation email with tracking information</li>
                <li>Returns typically arrive at our facility within 3-7 business days</li>
                <li>You can track your return using the provided tracking number</li>
                <li>Processing begins once the return is received and inspected</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Return Processing</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Inspection Process</h3>
              <p className="text-gray-700 mb-4">
                Upon receipt of your return, our quality control team will:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Inspect the product for damage, wear, or modifications</li>
                <li>Verify that all original accessories are included</li>
                <li>Check that the product matches the return authorization</li>
                <li>Assess whether the return meets our eligibility criteria</li>
                <li>Process the return within 2-3 business days</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Return Outcomes</h3>
              <p className="text-gray-700 mb-4">
                After inspection, your return will be processed as follows:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Approved:</strong> Refund or replacement processed</li>
                <li><strong>Conditional:</strong> Partial refund or restocking fee applied</li>
                <li><strong>Rejected:</strong> Return shipped back to customer with explanation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Refunds and Replacements</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Refund Options</h3>
              <p className="text-gray-700 mb-4">
                For approved returns, you can choose from the following refund options:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Original Payment Method:</strong> Refund to the card or account used for purchase</li>
                <li><strong>Store Credit:</strong> Credit applied to your account for future purchases</li>
                <li><strong>Exchange:</strong> Replacement with the same or similar product</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Refund Timeline</h3>
              <p className="text-gray-700 mb-4">
                Refund processing times vary by payment method:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                <li><strong>Digital Wallets:</strong> 2-5 business days</li>
                <li><strong>Bank Transfers:</strong> 3-7 business days</li>
                <li><strong>Store Credit:</strong> Immediate upon approval</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Special Circumstances</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Defective Products</h3>
              <p className="text-gray-700 mb-4">
                Products that arrive damaged or defective are eligible for immediate replacement or refund. Please contact our customer support team immediately and provide photos of the damage if possible.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Wrong Items Received</h3>
              <p className="text-gray-700 mb-4">
                If you receive the wrong item, we will arrange for the correct item to be shipped at no additional cost, or provide a full refund if the correct item is not available.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 Missing Items</h3>
              <p className="text-gray-700 mb-4">
                If your order is missing items, please contact us immediately. We will investigate and either ship the missing items or provide a refund for the missing products.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Restocking Fees</h2>
              <p className="text-gray-700 mb-4">
                A restocking fee may be applied to certain returns to cover the costs of processing, inspecting, and restocking returned items. Restocking fees typically range from 5% to 15% of the product price and will be clearly communicated during the return process.
              </p>
              <p className="text-gray-700">
                Restocking fees are generally not applied to returns due to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Product defects or damage</li>
                <li>Wrong items received</li>
                <li>Missing items from orders</li>
                <li>Returns within the first 7 days of delivery</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Returns</h2>
              <p className="text-gray-700 mb-4">
                International returns are subject to additional considerations:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Return shipping costs are typically the responsibility of the customer</li>
                <li>Customs duties and taxes are non-refundable</li>
                <li>Return processing may take longer due to international shipping</li>
                <li>Certain products may not be eligible for international returns</li>
                <li>Additional documentation may be required for customs clearance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our return policy or need assistance with a return, please contact our customer support team:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> returns@guptadistributors.com</p>
                <p className="text-gray-700 mb-2"><strong>Phone:</strong> +91 1800-123-4567</p>
                <p className="text-gray-700 mb-2"><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
                <p className="text-gray-700"><strong>Address:</strong> Mumbai, Maharashtra, India</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Policy Updates</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify this return policy at any time. Any changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. We encourage you to review this policy periodically to stay informed about our current return procedures.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
