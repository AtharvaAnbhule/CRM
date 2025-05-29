"use client";

import { useState } from "react";

export function LegalFooter() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalType: string) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer className="border-t mt-8 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-white">
                © {new Date().getFullYear()} Workeloo. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <button
                onClick={() => openModal('terms')}
                className="text-sm text-white hover:text-gray-900"
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => openModal('privacy')}
                className="text-sm text-white hover:text-gray-900"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => openModal('refund')}
                className="text-sm text-white hover:text-gray-900"
              >
                Refund Policy
              </button>
              <button
                onClick={() => openModal('shipping')}
                className="text-sm text-white hover:text-gray-900"
              >
                Shipping Policy
              </button>
              <button
                onClick={() => openModal('contact')}
                className="text-sm text-white hover:text-gray-900"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Overlay */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white text-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          > 
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="prose max-w-none">
              {activeModal === 'terms' && (
                <>
                  <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
                  <p className="text-gray-600 mb-6">Last updated on May 25th 2025</p>
                  
                  <p>For the purpose of these Terms and Conditions, The term we, us, our used anywhere on this page shall mean Workeloo, whose registered/operational office is F-201,Shanti Residency,Siddhatek Society, Near sutarwadi bus stop,Pashan,Pune Pune MAHARASHTRA 411021. you, your, user, visitor shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.</p>
                  
                  <h2 className="mt-6">Your Agreement</h2>
                  <p>Your use of the website and/or purchase from us are governed by following Terms and Conditions:</p>
                  
                  <h2 className="mt-6">Content Changes</h2>
                  <p>The content of the pages of this website is subject to change without notice.</p>
                  
                  <h2 className="mt-6">Accuracy of Information</h2>
                  <p>Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.</p>
                  
                  <h2 className="mt-6">Your Responsibility</h2>
                  <p>Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.</p>
                  
                  <h2 className="mt-6">Intellectual Property</h2>
                  <p>Our website contains material which is owned by or licensed to us. This material includes, but are not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.</p>
                  
                  <p>All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.</p>
                  
                  <h2 className="mt-6">Unauthorized Use</h2>
                  <p>Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.</p>
                  
                  <h2 className="mt-6">External Links</h2>
                  <p>From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.</p>
                  
                  <h2 className="mt-6">Linking to Our Site</h2>
                  <p>You may not create a link to our website from another website or document without Workeloos prior written consent.</p>
                  
                  <h2 className="mt-6">Governing Law</h2>
                  <p>Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India.</p>
                  
                  <h2 className="mt-6">Transaction Limitations</h2>
                  <p>We, shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.</p>
                  
                  
                </>
              )}

              {activeModal === 'privacy' && (
                <>
                  <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                  <p className="text-gray-600 mb-6">Last updated on May 25th 2025</p>
                  
                  <p>This privacy policy sets out how Workeloo uses and protects any information that you give Workeloo when you visit their website and/or agree to purchase from them.</p>
                  
                  <p>Workeloo is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, and then you can be assured that it will only be used in accordance with this privacy statement.</p>
                  
                  <p>Workeloo may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you adhere to these changes.</p>
                  
                  <h2 className="mt-6">Information We Collect</h2>
                  <p>We may collect the following information:</p>
                  <ul className="list-disc pl-6">
                    <li>Name</li>
                    <li>Contact information including email address</li>
                    <li>Demographic information such as postcode, preferences and interests, if required</li>
                    <li>Other information relevant to customer surveys and/or offers</li>
                  </ul>
                  
                  <h2 className="mt-6">How We Use Your Information</h2>
                  <p>We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:</p>
                  <ul className="list-disc pl-6">
                    <li>Internal record keeping</li>
                    <li>We may use the information to improve our products and services</li>
                    <li>We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided</li>
                    <li>From time to time, we may also use your information to contact you for market research purposes</li>
                    <li>We may use the information to customise the website according to your interests</li>
                  </ul>
                  
                  <h2 className="mt-6">Security</h2>
                  <p>We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure we have put in suitable measures.</p>
                  
                  <h2 className="mt-6">How We Use Cookies</h2>
                  <p>A cookie is a small file which asks permission to be placed on your computers hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.</p>
                  
                  <p>We use traffic log cookies to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.</p>
                  
                  <p>Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.</p>
                  
                  <p>You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.</p>
                  
                  <h2 className="mt-6">Controlling Your Personal Information</h2>
                  <p>You may choose to restrict the collection or use of your personal information in the following ways:</p>
                  <ul className="list-disc pl-6">
                    <li>whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for direct marketing purposes</li>
                    <li>if you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at</li>
                  </ul>
                  
                  <p>We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.</p>
                  
                  <p>If you believe that any information we are holding on you is incorrect or incomplete, please write to F-201,Shanti Residency,Siddhatek Society, Near sutarwadi bus stop,Pashan,Pune Pune MAHARASHTRA 411021. or contact us at or as soon as possible. We will promptly correct any information found to be incorrect.</p>
                </>
              )}

              {activeModal === 'refund' && (
                <>
                  <h1 className="text-3xl font-bold mb-6">Cancellation & Refund Policy</h1>
                  <p className="text-gray-600 mb-6">Last updated on May 25th 2025</p>
                  
                  <p>Workeloo believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:</p>
                  
                  <h2 className="mt-6">Cancellation Policy</h2>
                  <p>Cancellations will be considered only if the request is made within 1-2 days of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.</p>
                  
                  <h2 className="mt-6">Non-Cancellable Items</h2>
                  <p>Workeloo does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.</p>
                  
                  <h2 className="mt-6">Damaged or Defective Items</h2>
                  <p>In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 1-2 days of receipt of the products.</p>
                  
                  <h2 className="mt-6">Product Quality Concerns</h2>
                  <p>In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 1-2 days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.</p>
                  
                  <h2 className="mt-6">Manufacturer Warranties</h2>
                  <p>In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.</p>
                  
                  <h2 className="mt-6">Refund Processing</h2>
                  <p>In case of any Refunds approved by the Workeloo, itll take 1-2 days for the refund to be processed to the end customer.</p>
                </>
              )}

              {activeModal === 'shipping' && (
                <>
                  <h1 className="text-3xl font-bold mb-6">Shipping & Delivery Policy</h1>
                  <p className="text-gray-600 mb-6">Last updated on May 25th 2025</p>
                  
                  <p>For International buyers, orders are shipped and delivered through registered international courier companies and/or International speed post only. For domestic buyers, orders are shipped through registered domestic courier companies and /or speed post only.</p>
                  
                  <p>Orders are shipped within 1-2 days or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms.</p>
                  
                  <p>Workeloo is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within 1-2 days from the date of the order and payment or as per the delivery date agreed at the time of order confirmation.</p>
                  
                  <p>Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed on your mail ID as specified during registration.</p>
                  
                  <p>For any issues in utilizing our services you may contact our helpdesk on <a href="tel:8830573487" className="text-blue-600 hover:underline">8830573487</a> or <a href="mailto:workeloopvt@gmail.com" className="text-blue-600 hover:underline">workeloopvt@gmail.com</a></p>
                </>
              )}

              {activeModal === 'contact' && (
                <>
                  <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
                  
                  <h2 className="mt-6">Registered Office Address</h2>
                  <address className="not-italic">
                    <p>Workeloo</p>
                    <p>F-201, Shanti Residency, Siddhatek Society</p>
                    <p>Near sutarwadi bus stop, Pashan</p>
                    <p>Pune, MAHARASHTRA 411021</p>
                    <p>India</p>
                  </address>
                  
                  <h2 className="mt-6">Contact Details</h2>
                  <p>Phone: <a href="tel:8830573487" className="text-blue-600 hover:underline">8830573487</a></p>
                  <p>Email: <a href="mailto:workeloopvt@gmail.com" className="text-blue-600 hover:underline">workeloopvt@gmail.com</a></p>
                  
                  <h2 className="mt-6">Business Hours</h2>
                  <p>Monday to Friday: 9:00 AM to 6:00 PM IST</p>
                  <p>Saturday: 10:00 AM to 4:00 PM IST</p>
                  <p>Sunday: Closed</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}