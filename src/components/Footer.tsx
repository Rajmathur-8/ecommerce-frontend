'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Shield, CreditCard, Headphones } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+91 77354 55025';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@guptadistributors.com';

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src="/Logo.jpg" 
                alt="Gupta Distributors Logo" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              India&apos;s premier electronics e-commerce platform offering the latest gadgets, smartphones, laptops, and tech accessories.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-400 text-sm">
                <Phone className="w-4 h-4 mr-2" />
                <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{contactPhone}</a>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <Mail className="w-4 h-4 mr-2" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Gupta Distributors, India</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-3">
              <a href={process.env.NEXT_PUBLIC_FACEBOOK_LINK} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                </svg>
              </a>
              <a href={process.env.NEXT_PUBLIC_INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.069 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.567 5.782 2.295 7.148 2.233 8.414 2.175 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.659.392 3.678 1.373c-.98.98-1.244 2.092-1.302 3.373C2.012 5.668 2 6.077 2 12c0 5.923.012 6.332.07 7.613.058 1.281.322 2.393 1.302 3.373.981.981 2.093 1.245 3.374 1.303C8.332 23.988 8.741 24 12 24s3.668-.012 4.948-.07c1.281-.058 2.393-.322 3.374-1.303.98-.98 1.244-2.092 1.302-3.373.058-1.281.07-1.69.07-7.613 0-5.923-.012-6.332-.07-7.613-.058-1.281-.322-2.393-1.302-3.373-.981-.981-2.093-1.245-3.374-1.303C15.668.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a href={process.env.NEXT_PUBLIC_LINKEDIN_LINK} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href={process.env.NEXT_PUBLIC_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors" aria-label="WhatsApp">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=smartphones" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Smartphones & Mobiles
                </Link>
              </li>
              <li>
                <Link href="/products?category=laptops" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Laptops & Computers
                </Link>
              </li>
              <li>
                <Link href="/products?category=tablets" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Tablets & iPads
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Accessories & Gadgets
                </Link>
              </li>
              <li>
                <Link href="/products?category=audio" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Audio & Headphones
                </Link>
              </li>
              <li>
                <Link href="/products?category=gaming" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Gaming & Consoles
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/track" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-gray-400 hover:text-white transition-colors text-sm">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white transition-colors text-sm">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/special-offers" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Special Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Support */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href={process.env.NEXT_PUBLIC_WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <button onClick={() => {
                  const mailtoLink = `mailto:${contactEmail}`;
                  window.location.href = mailtoLink;
                }} className="text-gray-400 hover:text-white transition-colors text-sm text-left">
                  Contact Support
                </button>
              </li>
              <li>
                <a href={process.env.NEXT_PUBLIC_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">
                  WhatsApp Support
                </a>
              </li>
              <li>
                <Link href="/special-offers" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Offers & Deals
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-800">
          <div className="flex items-center justify-center md:justify-start">
            <Shield className="w-6 h-6 text-indigo-400 mr-3" />
            <div>
              <h4 className="font-medium text-white text-sm">Secure Payment</h4>
              <p className="text-xs text-gray-400">100% secure checkout</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start">
            <CreditCard className="w-6 h-6 text-indigo-400 mr-3" />
            <div>
              <h4 className="font-medium text-white text-sm">Easy Returns</h4>
              <p className="text-xs text-gray-400">30-day return policy</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start">
            <Headphones className="w-6 h-6 text-indigo-400 mr-3" />
            <div>
              <h4 className="font-medium text-white text-sm">24/7 Support</h4>
              <p className="text-xs text-gray-400">Always here to help</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-xs">
              © {currentYear} Gupta Distributors. All rights reserved.
            </div>
            <div className="text-gray-400 text-xs mt-2 md:mt-0">
              Made with ❤️ in India
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 