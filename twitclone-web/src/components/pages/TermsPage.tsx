"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Scale,
  Shield,
  AlertTriangle,
  UserX,
  Gavel,
  Globe,
} from "lucide-react";
import { NeoButton, InfoCard, LandingNav, LandingFooter } from "@/components/landing";

export function TermsPage() {
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
              Terms of{" "}
              <span className="text-[#4ECDC4] bg-black px-4 transform -skew-x-6 inline-block">
                Service
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-bold mb-6 max-w-2xl mx-auto bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              Legal agreement governing your use of SCREAM. Please read carefully.
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
            title="1. Acceptance of Terms"
            description="Agreement to our terms and conditions"
            icon={<FileText className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                By accessing, browsing, or using SCREAM ("the Service", "Platform",
                "we", "us", or "our"), you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service ("Terms")
                and our Privacy Policy, incorporated herein by reference.
              </p>
              <p className="text-lg leading-relaxed">
                These Terms constitute a legally binding agreement between you
                ("User", "you", or "your") and SCREAM. If you do not agree to these
                Terms, you must immediately cease using the Service.
              </p>
              <p className="text-lg leading-relaxed">
                By creating an account or using the Service, you represent and
                warrant that you have the legal capacity to enter into this agreement
                and are not prohibited from using the Service under applicable law.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="2. Eligibility"
            description="Who may use our platform"
            icon={<Shield className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                <strong>Age Requirements:</strong> You must be at least 13 years of
                age to use SCREAM. If you are between 13 and 18 years of age (or the
                age of legal majority in your jurisdiction), you may only use the
                Service with the consent and supervision of a parent or legal
                guardian who agrees to be bound by these Terms.
              </p>
              <p className="text-lg leading-relaxed">
                <strong>Account Accuracy:</strong> You agree to provide accurate,
                current, and complete information during registration and to update
                such information to maintain its accuracy. Fraudulent, false, or
                misleading information may result in immediate termination of your
                account.
              </p>
              <p className="text-lg leading-relaxed">
                <strong>Prohibited Users:</strong> Use of the Service is prohibited
                for individuals or entities in jurisdictions where such use would
                violate applicable laws, or for individuals previously banned or
                suspended from the Service.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="3. Account Responsibilities"
            description="Your obligations regarding account security"
            icon={<UserX className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Account Security
                </h3>
                <p className="text-lg leading-relaxed">
                  You are solely responsible for maintaining the confidentiality of
                  your account credentials, including your password. You agree to
                  immediately notify SCREAM of any unauthorized access or security
                  breach. You are liable for all activities conducted through your
                  account, whether authorized by you or not, until you notify us of a
                  breach.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  One Account Per User
                </h3>
                <p className="text-lg leading-relaxed">
                  You may maintain only one account. Creating multiple accounts,
                  including for purposes of evading bans or restrictions, is strictly
                  prohibited and will result in immediate suspension or termination
                  of all associated accounts.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Account Transfer
                </h3>
                <p className="text-lg leading-relaxed">
                  Your account is personal to you. You may not sell, transfer, or
                  assign your account or any account rights to any third party
                  without our prior written consent.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="4. User Content & License"
            description="Rights and licenses for content you post"
            icon={<Scale className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Content Ownership
                </h3>
                <p className="text-lg leading-relaxed">
                  You retain all ownership rights to content you submit, post, or
                  display on or through the Service ("User Content"). However, by
                  posting User Content, you grant SCREAM a worldwide, non-exclusive,
                  royalty-free, transferable, sublicensable license to use, copy,
                  reproduce, process, adapt, modify, publish, transmit, display,
                  distribute, and create derivative works of such User Content in
                  connection with operating and providing the Service.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Content Responsibility
                </h3>
                <p className="text-lg leading-relaxed">
                  You are solely responsible for your User Content. You represent and
                  warrant that: (i) you own or have the necessary rights to post your
                  User Content, (ii) your User Content does not violate any
                  third-party rights, including intellectual property, privacy, or
                  publicity rights, and (iii) posting your User Content does not
                  violate any applicable laws or regulations.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Content Monitoring
                </h3>
                <p className="text-lg leading-relaxed">
                  We reserve the right, but not the obligation, to monitor, review,
                  or remove User Content at our sole discretion, for any reason,
                  including content that violates these Terms or is otherwise
                  objectionable. We do not endorse or guarantee the accuracy,
                  integrity, or quality of User Content.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="5. Prohibited Conduct"
            description="Activities that are strictly forbidden"
            icon={<AlertTriangle className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed font-bold">
                You agree NOT to engage in any of the following prohibited
                activities:
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed ml-4">
                <li>
                  Posting content that is illegal, harmful, threatening, abusive,
                  harassing, defamatory, vulgar, obscene, invasive of privacy,
                  hateful, or racially or ethnically offensive
                </li>
                <li>
                  Impersonating any person or entity, or falsely stating or
                  misrepresenting your affiliation with a person or entity
                </li>
                <li>
                  Posting content that infringes any patent, trademark, trade secret,
                  copyright, or other proprietary rights
                </li>
                <li>
                  Uploading or transmitting viruses, malware, or any other malicious
                  code
                </li>
                <li>
                  Spamming, phishing, or engaging in any form of unsolicited
                  advertising or promotion
                </li>
                <li>
                  Attempting to gain unauthorized access to the Service, other user
                  accounts, or computer systems
                </li>
                <li>
                  Interfering with or disrupting the Service or servers or networks
                  connected to the Service
                </li>
                <li>
                  Using automated systems (bots, scripts, scrapers) to access or
                  interact with the Service
                </li>
                <li>
                  Collecting or harvesting any personally identifiable information
                  from the Service
                </li>
                <li>
                  Using the Service for any illegal purpose or in violation of any
                  laws or regulations
                </li>
              </ul>
            </div>
          </InfoCard>

          <InfoCard
            title="6. Intellectual Property"
            description="Platform ownership and trademarks"
            icon={<Shield className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                The Service and its original content (excluding User Content),
                features, and functionality are and will remain the exclusive
                property of SCREAM and its licensors. The Service is protected by
                copyright, trademark, and other laws of both domestic and foreign
                jurisdictions.
              </p>
              <p className="text-lg leading-relaxed">
                Our trademarks, service marks, logos, and trade dress may not be used
                in connection with any product or service without our prior written
                consent. All other trademarks, service marks, and logos used on the
                Service are the property of their respective owners.
              </p>
              <p className="text-lg leading-relaxed">
                <strong>DMCA Compliance:</strong> We respect intellectual property
                rights. If you believe that any content on the Service infringes your
                copyright, please contact us with a detailed notice including: (i)
                identification of the copyrighted work, (ii) identification of the
                infringing material, (iii) your contact information, (iv) a statement
                of good faith belief, and (v) a statement of accuracy under penalty
                of perjury.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="7. Third-Party Services"
            description="External links and integrations"
            icon={<Globe className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                The Service may contain links to third-party websites, services, or
                resources that are not owned or controlled by SCREAM. We have no
                control over, and assume no responsibility for, the content, privacy
                policies, or practices of any third-party websites or services.
              </p>
              <p className="text-lg leading-relaxed">
                You acknowledge and agree that SCREAM shall not be responsible or
                liable, directly or indirectly, for any damage or loss caused or
                alleged to be caused by or in connection with the use of or reliance
                on any third-party content, goods, or services available through such
                websites or services.
              </p>
              <p className="text-lg leading-relaxed">
                We strongly advise you to read the terms and conditions and privacy
                policies of any third-party websites or services that you visit.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="8. Disclaimers & Warranties"
            description="Service provided 'as is'"
            icon={<AlertTriangle className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed font-bold uppercase">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis
                without warranties of any kind.
              </p>
              <p className="text-lg leading-relaxed">
                SCREAM expressly disclaims all warranties, whether express, implied,
                or statutory, including but not limited to implied warranties of
                merchantability, fitness for a particular purpose, title, and
                non-infringement. We do not warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed ml-4">
                <li>The Service will meet your requirements or expectations</li>
                <li>
                  The Service will be uninterrupted, timely, secure, or error-free
                </li>
                <li>
                  The results obtained from using the Service will be accurate or
                  reliable
                </li>
                <li>Any errors in the Service will be corrected</li>
                <li>
                  The Service is free from viruses or other harmful components
                </li>
              </ul>
              <p className="text-lg leading-relaxed">
                You use the Service at your own risk. Any material downloaded or
                otherwise obtained through the use of the Service is accessed at your
                own discretion and risk.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="9. Limitation of Liability"
            description="Damages and liability limitations"
            icon={<Scale className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed font-bold uppercase">
                To the maximum extent permitted by applicable law:
              </p>
              <p className="text-lg leading-relaxed">
                In no event shall SCREAM, its officers, directors, employees,
                partners, agents, suppliers, or affiliates be liable for any
                indirect, incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use, goodwill,
                or other intangible losses, resulting from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed ml-4">
                <li>
                  Your access to or use of or inability to access or use the Service
                </li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any User Content obtained from the Service</li>
                <li>
                  Unauthorized access, use, or alteration of your transmissions or
                  content
                </li>
              </ul>
              <p className="text-lg leading-relaxed">
                Our total liability to you for all claims arising from or related to
                the Service shall not exceed the greater of (i) the amount you have
                paid SCREAM in the 12 months prior to the claim, or (ii) $100 USD.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="10. Indemnification"
            description="Your agreement to defend us"
            icon={<Shield className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                You agree to defend, indemnify, and hold harmless SCREAM, its
                affiliates, licensors, and service providers, and their respective
                officers, directors, employees, contractors, agents, licensors,
                suppliers, successors, and assigns from and against any claims,
                liabilities, damages, judgments, awards, losses, costs, expenses, or
                fees (including reasonable attorneys' fees) arising out of or
                relating to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed ml-4">
                <li>Your violation of these Terms</li>
                <li>Your use of the Service</li>
                <li>Your User Content</li>
                <li>
                  Your violation of any third-party rights, including intellectual
                  property or privacy rights
                </li>
                <li>Any claim that your User Content caused damage to a third party</li>
              </ul>
              <p className="text-lg leading-relaxed">
                This indemnification obligation will survive the termination of these
                Terms and your use of the Service.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="11. Termination"
            description="Account suspension and termination rights"
            icon={<UserX className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">Our Rights</h3>
                <p className="text-lg leading-relaxed">
                  We reserve the right to suspend, disable, or terminate your account
                  and access to the Service at any time, with or without notice, for
                  any reason or no reason, including without limitation if we believe
                  you have violated these Terms, engaged in fraudulent or illegal
                  activity, or for extended periods of inactivity.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">Your Rights</h3>
                <p className="text-lg leading-relaxed">
                  You may terminate your account at any time by following the account
                  deletion process in your account settings. Upon termination, your
                  right to use the Service will immediately cease.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Effect of Termination
                </h3>
                <p className="text-lg leading-relaxed">
                  Upon termination, we may delete your User Content. Some provisions
                  of these Terms shall survive termination, including but not limited
                  to: ownership provisions, warranty disclaimers, indemnification,
                  and limitations of liability.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="12. Dispute Resolution"
            description="Arbitration and governing law"
            icon={<Gavel className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">Governing Law</h3>
                <p className="text-lg leading-relaxed">
                  These Terms shall be governed by and construed in accordance with
                  the laws of the jurisdiction in which SCREAM operates, without
                  regard to its conflict of law provisions.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Informal Resolution
                </h3>
                <p className="text-lg leading-relaxed">
                  If you have any dispute with us, you agree to first contact us and
                  attempt to resolve the dispute informally. We will attempt to
                  resolve disputes in good faith.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Arbitration Agreement
                </h3>
                <p className="text-lg leading-relaxed">
                  Any dispute arising from these Terms or your use of the Service
                  that cannot be resolved informally shall be resolved through
                  binding arbitration in accordance with the commercial arbitration
                  rules of the applicable arbitration association. You agree to waive
                  your right to a jury trial or to participate in a class action
                  lawsuit or class-wide arbitration.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="13. Modifications & Updates"
            description="Changes to these terms"
            icon={<FileText className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                We reserve the right to modify or replace these Terms at any time at
                our sole discretion. If a revision is material, we will provide at
                least 30 days' notice prior to any new terms taking effect through a
                notice on the Service or by sending you an email to the address
                associated with your account.
              </p>
              <p className="text-lg leading-relaxed">
                By continuing to access or use the Service after revisions become
                effective, you agree to be bound by the revised Terms. If you do not
                agree to the new Terms, you must stop using the Service.
              </p>
              <p className="text-lg leading-relaxed">
                We may also update or modify the Service from time to time, including
                by adding or removing features or functionality. We are not obligated
                to provide any updates or continue to provide particular features.
              </p>
            </div>
          </InfoCard>

          <InfoCard
            title="14. General Provisions"
            description="Additional legal terms"
            icon={<Scale className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  Entire Agreement
                </h3>
                <p className="text-lg leading-relaxed">
                  These Terms, together with our Privacy Policy, constitute the
                  entire agreement between you and SCREAM regarding the Service and
                  supersede all prior agreements or understandings.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">Severability</h3>
                <p className="text-lg leading-relaxed">
                  If any provision of these Terms is found to be unenforceable or
                  invalid, that provision shall be limited or eliminated to the
                  minimum extent necessary, and the remaining provisions shall remain
                  in full force and effect.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">Waiver</h3>
                <p className="text-lg leading-relaxed">
                  Our failure to enforce any right or provision of these Terms will
                  not be considered a waiver of those rights. Any waiver must be in
                  writing and signed by an authorized representative of SCREAM.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase mb-3">Assignment</h3>
                <p className="text-lg leading-relaxed">
                  You may not assign or transfer these Terms or your rights hereunder
                  without our prior written consent. We may assign our rights and
                  obligations under these Terms without restriction.
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard
            title="15. Contact Information"
            description="How to reach us"
            icon={<FileText className="w-8 h-8 text-black" />}
            iconBgColor="bg-[#FF6B6B]"
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                If you have any questions, concerns, or complaints about these Terms
                or the Service, please contact us:
              </p>
              <div className="bg-[#FFE66D] border-4 border-black p-6 space-y-2">
                <p className="text-lg font-bold">Email: legal@scream.com</p>
                <p className="text-lg font-bold">
                  Contact Page:{" "}
                  <Link href="/contact" className="underline hover:text-[#FF6B6B]">
                    scream.com/contact
                  </Link>
                </p>
              </div>
              <p className="text-lg leading-relaxed">
                We will endeavor to respond to all legitimate inquiries within a
                reasonable timeframe.
              </p>
            </div>
          </InfoCard>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 text-center bg-[#FF6B6B] border-4 border-black p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase">
              Ready to agree and join?
            </h2>
            <p className="text-xl font-bold mb-8 max-w-2xl mx-auto">
              By creating an account, you agree to these Terms of Service. Start
              screaming your thoughts to the world.
            </p>
            <NeoButton
              href="/sign-up"
              variant="secondary"
              className="text-xl px-12 py-6"
            >
              Get Started Now
            </NeoButton>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}


