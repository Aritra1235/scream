"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  Lock,
  UserX,
  Cookie,
  Globe,
  Database,
  AlertCircle,
  FileText,
} from "lucide-react";
import { NeoButton, InfoCard, LandingNav, LandingFooter } from "@/components/landing";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFE66D] text-black font-sans">
      <LandingNav showBackLink />

      {/* Header */}
      <section className="py-24 px-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] border-b-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tight">
              Privacy{" "}
              <span className="text-[#FF6B6B] bg-black px-4 transform -skew-x-6 inline-block">
                Policy
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-bold mb-6 max-w-2xl mx-auto bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              How we collect, use, and protect your personal data on SCREAM.
            </p>
            <p className="text-base font-bold bg-black text-white inline-block px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Last Updated: November 23, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <InfoCard
            title="1. Introduction"
            description="Overview of our privacy practices"
            icon={<Shield className="w-8 h-8 text-black" />}
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                SCREAM ("we", "us", "our") is committed to protecting your privacy
                and personal data. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our social
                media platform and services (the "Service").
              </p>
              <p className="text-lg leading-relaxed">
                This Privacy Policy applies to all users of the Service and should
                be read in conjunction with our Terms of Service. By using SCREAM,
                you consent to the data practices described in this policy.
              </p>
              <p className="text-lg leading-relaxed">
                If you do not agree with the terms of this Privacy Policy, please do
                not access or use the Service.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="2. Information We Collect"
            description="Types of data we gather"
            icon={<Database className="w-8 h-8 text-black" />}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Personal Information
                </h3>
                <p className="text-lg leading-relaxed">
                  When you create an account, we collect information such as your
                  username, email address, password (encrypted), display name,
                  profile picture, bio, and any other information you choose to
                  provide. We may also collect your date of birth to verify age
                  requirements.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">User Content</h3>
                <p className="text-lg leading-relaxed">
                  We collect and store the content you create, post, or share on
                  SCREAM, including posts, replies, comments, images, videos, direct
                  messages, and any interactions (likes, reposts, bookmarks) with
                  other users' content.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Usage Information
                </h3>
                <p className="text-lg leading-relaxed">
                  We automatically collect information about your interactions with
                  the Service, including pages or content viewed, search queries,
                  clicks, features used, time and date of access, session duration,
                  and clickstream data.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Device & Technical Data
                </h3>
                <p className="text-lg leading-relaxed">
                  We collect information about the device and software you use to
                  access the Service, including IP address, browser type and version,
                  device type, operating system, device identifiers, mobile network
                  information, and general location data derived from IP address.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Communications
                </h3>
                <p className="text-lg leading-relaxed">
                  When you contact us or communicate through the Service, we collect
                  the content of those communications, including customer support
                  inquiries and feedback.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="3. How We Use Your Information"
            description="Purpose and processing of your data"
            icon={<Eye className="w-8 h-8 text-black" />}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Service Provision
                </h3>
                <p className="text-lg leading-relaxed">
                  To create and maintain your account, authenticate your identity,
                  provide and deliver the Service features, process your requests,
                  and enable social features such as following other users and
                  interacting with content.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Personalization & Improvement
                </h3>
                <p className="text-lg leading-relaxed">
                  To personalize your experience, provide content recommendations,
                  understand usage patterns, analyze trends, measure effectiveness of
                  features, develop new features and services, and improve the
                  overall quality of SCREAM.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">Communication</h3>
                <p className="text-lg leading-relaxed">
                  To send you service-related notifications, account updates, security
                  alerts, respond to your inquiries, and communicate about new features
                  or changes to our policies. We may also send promotional
                  communications if you've opted in (you can opt out at any time).
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Security & Safety
                </h3>
                <p className="text-lg leading-relaxed">
                  To detect, prevent, and address fraud, abuse, security risks, and
                  technical issues; enforce our Terms of Service; protect the rights,
                  property, or safety of SCREAM, our users, or others; and comply
                  with legal obligations.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Legal Compliance
                </h3>
                <p className="text-lg leading-relaxed">
                  To comply with applicable laws, regulations, legal processes, or
                  governmental requests; respond to legal claims; and exercise or
                  defend legal rights.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="4. Cookies & Tracking"
            description="How we use cookies and similar technologies"
            icon={<Cookie className="w-8 h-8 text-black" />}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  What Are Cookies?
                </h3>
                <p className="text-lg leading-relaxed">
                  Cookies are small text files stored on your device that help us
                  recognize you, remember your preferences, and analyze how you use
                  the Service. We use both session cookies (deleted when you close
                  your browser) and persistent cookies (remain until deleted or
                  expired).
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Types of Cookies We Use
                </h3>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed ml-4">
                  <li>
                    <strong>Essential Cookies:</strong> Required for the Service to
                    function, including authentication and security
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> Remember your settings and
                    preferences
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how you
                    use the Service and improve performance
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> Used to deliver relevant
                    advertisements (if applicable)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Managing Cookies
                </h3>
                <p className="text-lg leading-relaxed">
                  Most browsers allow you to control cookies through settings.
                  However, disabling cookies may affect the functionality of the
                  Service. You can learn more about cookies at
                  www.allaboutcookies.org.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="5. Data Sharing & Disclosure"
            description="When and how we share your information"
            icon={<Globe className="w-8 h-8 text-black" />}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Public Information
                </h3>
                <p className="text-lg leading-relaxed">
                  Your profile information and posts are public by default and can be
                  viewed by anyone, including non-users. Search engines may index
                  this public content. Be mindful of what you choose to share
                  publicly.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  We Do NOT Sell Your Data
                </h3>
                <p className="text-lg leading-relaxed">
                  SCREAM does not sell, rent, or trade your personal information to
                  third parties for marketing purposes. Your trust is important to
                  us.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Service Providers
                </h3>
                <p className="text-lg leading-relaxed">
                  We may share information with trusted third-party service providers
                  who assist us in operating the Service, such as hosting providers,
                  analytics services, email services, and customer support tools.
                  These providers are contractually obligated to protect your
                  information and use it only for the purposes we specify.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Legal Requirements
                </h3>
                <p className="text-lg leading-relaxed">
                  We may disclose your information if required by law, court order,
                  or legal process; to enforce our Terms of Service; to protect the
                  rights, property, or safety of SCREAM, our users, or the public; or
                  in connection with legal claims or disputes.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Business Transfers
                </h3>
                <p className="text-lg leading-relaxed">
                  In the event of a merger, acquisition, reorganization, or sale of
                  assets, your information may be transferred to the successor
                  entity. We will notify you before your information becomes subject
                  to a different privacy policy.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  With Your Consent
                </h3>
                <p className="text-lg leading-relaxed">
                  We may share your information for other purposes with your explicit
                  consent.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="6. Data Security"
            description="How we protect your information"
            icon={<Lock className="w-8 h-8 text-black" />}
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                We implement appropriate technical and organizational security
                measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. These measures
                include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed ml-4">
                <li>Encryption of data in transit using SSL/TLS protocols</li>
                <li>Encryption of passwords and sensitive data at rest</li>
                <li>Regular security assessments and vulnerability testing</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection and security</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <p className="text-lg leading-relaxed font-bold">
                However, no method of transmission over the internet or electronic
                storage is 100% secure. While we strive to protect your information,
                we cannot guarantee absolute security. You are responsible for
                maintaining the confidentiality of your account credentials.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="7. Your Rights & Choices"
            description="Control over your personal data"
            icon={<UserX className="w-8 h-8 text-black" />}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Access & Portability
                </h3>
                <p className="text-lg leading-relaxed">
                  You have the right to access your personal information and request
                  a copy of your data in a portable format. You can download your
                  data through your account settings.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Correction & Update
                </h3>
                <p className="text-lg leading-relaxed">
                  You can update, correct, or modify your profile information and
                  account settings at any time through your account dashboard.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Deletion & Erasure
                </h3>
                <p className="text-lg leading-relaxed">
                  You have the right to request deletion of your personal
                  information. You can delete your account through account settings,
                  or contact us to request deletion. Note that some information may
                  be retained for legal or legitimate business purposes.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Object & Restrict Processing
                </h3>
                <p className="text-lg leading-relaxed">
                  You have the right to object to certain processing of your personal
                  information and request restriction of processing under certain
                  circumstances.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Withdraw Consent
                </h3>
                <p className="text-lg leading-relaxed">
                  Where we rely on your consent to process your information, you have
                  the right to withdraw that consent at any time. This will not
                  affect the lawfulness of processing based on consent before
                  withdrawal.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Marketing Communications
                </h3>
                <p className="text-lg leading-relaxed">
                  You can opt out of marketing emails by clicking the unsubscribe
                  link in any promotional email or by adjusting your notification
                  settings.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="8. Data Retention"
            description="How long we keep your information"
            icon={<Database className="w-8 h-8 text-black" />}
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                We retain your personal information for as long as necessary to
                provide the Service, fulfill the purposes described in this Privacy
                Policy, and comply with legal obligations.
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed ml-4">
                <li>
                  <strong>Account Information:</strong> Retained while your account
                  is active and for a reasonable period afterward
                </li>
                <li>
                  <strong>User Content:</strong> Public posts may be retained even
                  after account deletion to maintain platform integrity
                </li>
                <li>
                  <strong>Usage Data:</strong> Typically retained for up to 2 years
                  for analytics purposes
                </li>
                <li>
                  <strong>Legal Compliance:</strong> Some data may be retained longer
                  if required by law or for legal defense
                </li>
              </ul>
              <p className="text-lg leading-relaxed">
                After the retention period, we will delete or anonymize your personal
                information. You can request earlier deletion by contacting us,
                subject to legal and operational constraints.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="9. International Data Transfers"
            description="Processing data across borders"
            icon={<Globe className="w-8 h-8 text-black" />}
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                SCREAM operates globally, and your information may be transferred to,
                stored, and processed in countries other than your country of
                residence. These countries may have different data protection laws.
              </p>
              <p className="text-lg leading-relaxed">
                When we transfer your personal information internationally, we ensure
                appropriate safeguards are in place, such as:
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed ml-4">
                <li>Standard contractual clauses approved by relevant authorities</li>
                <li>Adequacy decisions recognizing equivalent data protection</li>
                <li>Other legally approved transfer mechanisms</li>
              </ul>
              <p className="text-lg leading-relaxed">
                By using SCREAM, you consent to the transfer of your information to
                countries outside your residence.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="10. Children's Privacy"
            description="Protection of minors"
            icon={<Shield className="w-8 h-8 text-black" />}
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                SCREAM is not intended for children under the age of 13. We do not
                knowingly collect personal information from children under 13. If we
                become aware that we have collected personal information from a child
                under 13 without parental consent, we will take steps to delete that
                information.
              </p>
              <p className="text-lg leading-relaxed">
                If you are a parent or guardian and believe your child has provided
                us with personal information, please contact us immediately at
                privacy@scream.com.
              </p>
              <p className="text-lg leading-relaxed">
                Users between 13 and 18 should obtain parental consent before using
                the Service.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="11. Third-Party Links & Services"
            description="External websites and integrations"
            icon={<AlertCircle className="w-8 h-8 text-black" />}
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                The Service may contain links to third-party websites, services, or
                resources that are not owned or controlled by SCREAM. This Privacy
                Policy does not apply to those third-party services.
              </p>
              <p className="text-lg leading-relaxed">
                We are not responsible for the privacy practices of third parties. We
                encourage you to review the privacy policies of any third-party
                services before providing them with your information.
              </p>
              <p className="text-lg leading-relaxed">
                If you connect your SCREAM account with third-party services (such as
                social media platforms), those services may share information with us
                in accordance with your settings on those platforms.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="12. California Privacy Rights"
            description="CCPA compliance for California residents"
            icon={<FileText className="w-8 h-8 text-black" />}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Your CCPA Rights
                </h3>
                <p className="text-lg leading-relaxed">
                  If you are a California resident, you have specific rights under
                  the California Consumer Privacy Act (CCPA):
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed ml-4">
                  <li>
                    Right to know what personal information is collected, used,
                    shared, or sold
                  </li>
                  <li>Right to delete personal information held by us</li>
                  <li>
                    Right to opt-out of the sale of personal information (we do not
                    sell personal information)
                  </li>
                  <li>
                    Right to non-discrimination for exercising your CCPA rights
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  How to Exercise Rights
                </h3>
                <p className="text-lg leading-relaxed">
                  To exercise these rights, contact us at privacy@scream.com or
                  through our contact page. We will verify your identity before
                  processing your request and respond within 45 days.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="13. European Privacy Rights"
            description="GDPR compliance for EU/EEA residents"
            icon={<Shield className="w-8 h-8 text-black" />}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Legal Basis for Processing
                </h3>
                <p className="text-lg leading-relaxed">
                  Under the General Data Protection Regulation (GDPR), we process
                  your personal information based on:
                </p>
                <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed ml-4">
                  <li>
                    <strong>Contract:</strong> Processing necessary to perform our
                    contract with you (Terms of Service)
                  </li>
                  <li>
                    <strong>Legitimate Interests:</strong> Our legitimate business
                    interests (e.g., security, service improvement)
                  </li>
                  <li>
                    <strong>Consent:</strong> Your explicit consent for specific
                    processing activities
                  </li>
                  <li>
                    <strong>Legal Obligation:</strong> Compliance with legal
                    requirements
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Your GDPR Rights
                </h3>
                <p className="text-lg leading-relaxed">
                  EU/EEA residents have additional rights including the right to
                  lodge a complaint with a supervisory authority in your country of
                  residence.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="14. Changes to This Policy"
            description="Updates and modifications"
            icon={<FileText className="w-8 h-8 text-black" />}
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices, technology, legal requirements, or other
                factors. We will notify you of material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed ml-4">
                <li>
                  Posting the updated policy on this page with a new "Last Updated"
                  date
                </li>
                <li>
                  Sending you an email notification (for significant changes)
                </li>
                <li>Displaying a prominent notice on the Service</li>
              </ul>
              <p className="text-lg leading-relaxed">
                Your continued use of the Service after changes become effective
                constitutes acceptance of the updated Privacy Policy. We encourage
                you to review this policy periodically.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="15. Contact Us"
            description="Questions about privacy"
            icon={<Shield className="w-8 h-8 text-black" />}
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-[#FFE66D] border-4 border-black p-6 space-y-2">
                <p className="text-lg font-bold">Email: privacy@scream.com</p>
                <p className="text-lg font-bold">
                  Data Protection Officer: dpo@scream.com
                </p>
                <p className="text-lg font-bold">
                  Contact Page:{" "}
                  <Link href="/contact" className="underline hover:text-[#FF6B6B]">
                    scream.com/contact
                  </Link>
                </p>
              </div>
              <p className="text-lg leading-relaxed">
                We will respond to all legitimate privacy-related inquiries within 30
                days. For urgent matters, please mark your communication as "Urgent
                Privacy Request."
              </p>
            </div>
          </InfoCard>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 text-center bg-[#4ECDC4] border-4 border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase">
              Still have questions?
            </h2>
            <p className="text-xl font-bold mb-8 max-w-2xl mx-auto">
              We're committed to transparency and protecting your privacy. Reach out
              anytime with questions or concerns.
            </p>
            <NeoButton href="/contact" variant="primary" className="text-xl px-12 py-6">
              Contact Support
            </NeoButton>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}


