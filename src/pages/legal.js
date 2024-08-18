import React from "react";
import Sidebar from "@/components/Sidebar";
import withAuth from "@/components/withAuth";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const TermsAndConditions = () => {
  return (
    <>
      <Sidebar />
      <section
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <div style={{ width: "90%" }}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ArrowDownwardIcon />}
              aria-controls="terms-conditions-content"
              id="terms-conditions-header"
            >
              <Typography variant="h6">Terms & Conditions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <Typography variant="h6">A. User Agreement</Typography>
                <ol>
                  <li>
                    <strong>Acceptance of Terms</strong>
                    <ul>
                      <li>
                        By accessing or using our site, you acknowledge that you
                        have read, understood, and agree to these Terms and our
                        Privacy Policy.
                      </li>
                      <li>
                        You may use our services only if you meet the following
                        criteria:
                        <ul>
                          <li>You are at least 18 years old.</li>
                          <li>
                            You are not a resident of Tamil Nadu, Andhra
                            Pradesh, Telangana, Assam, Orissa, Sikkim, or
                            Nagaland.
                          </li>
                          <li>
                            You are not legally barred or restricted from using
                            our site.
                          </li>
                        </ul>
                      </li>
                      <li>
                        This Agreement governs your use of our services and may
                        be supplemented by additional agreements. In the event
                        of a conflict, the additional agreement will prevail.
                      </li>
                    </ul>
                  </li>
                </ol>

                <Typography variant="h6">B. Provision of Services</Typography>
                <ol>
                  <li>
                    <strong>Games of Skill</strong>
                    <ul>
                      <li>
                        Our platform offers games that qualify as "Games of
                        Skill" under Indian law. According to the Public
                        Gambling Act of 1867 and subsequent judicial
                        interpretations, games where skill predominates over
                        chance are exempt from gambling restrictions.
                      </li>
                      <li>
                        We do not offer games of chance for monetary stakes.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>State-Specific Restrictions</strong>
                    <ul>
                      <li>
                        Certain states have enacted laws that restrict or
                        prohibit games of skill with monetary stakes.
                        Consequently, residents of Assam, Odisha, Telangana, and
                        Gujarat are not permitted to use our platform.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Game Mechanics</strong>
                    <ul>
                      <li>
                        The rules for each game are outlined on our platform.
                        Success in our games is influenced by your skill,
                        experience, and performance. Elements of luck may be
                        present but are secondary to skill.
                      </li>
                      <li>
                        Performance in our games can improve with practice. Some
                        games may have predetermined outcomes, achievable
                        through skillful play.
                      </li>
                    </ul>
                  </li>
                </ol>

                <Typography variant="h6">C. Game Rules</Typography>
                <ol>
                  <li>
                    <strong>Challenge Setup</strong>
                    <ul>
                      <li>
                        Players will share a room ID or code to challenge
                        opponents.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Result Reporting</strong>
                    <ul>
                      <li>
                        Winners must select 'I Won' and upload a screenshot of
                        the game.
                      </li>
                      <li>Losers must select 'I Lost.'</li>
                      <li>
                        If the game is not started, players should select
                        'Cancel.'
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Recording and Cheating</strong>
                    <ul>
                      <li>
                        All games must be recorded. Report any cheating to
                        support. In the absence of proof, you will be considered
                        the loser.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Match Cancellations</strong>
                    <ul>
                      <li>
                        If no moves are made, the game will be canceled. If an
                        opponent leaves intentionally without valid reason, you
                        will be declared the winner.
                      </li>
                    </ul>
                  </li>
                </ol>

                <Typography variant="h6">D. Deposit and Withdrawal</Typography>
                <ol>
                  <li>
                    <strong>Account Management</strong>
                    <ul>
                      <li>
                        Deposits can be made via the 'Add Cash' section. Any
                        suspicious activity may lead to a temporary account
                        block.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Withdrawal Process</strong>
                    <ul>
                      <li>
                        Withdrawals can be requested through the app. Please
                        ensure correct payment details, as incorrect information
                        will not be refunded.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Processing Times</strong>
                    <ul>
                      <li>
                        Deposit and withdrawal requests are processed by
                        support. Withdrawals may take 1-5 days.
                      </li>
                    </ul>
                  </li>
                </ol>

                <Typography variant="h6">
                  E. Penalties for Incorrect Updates
                </Typography>
                <ol>
                  <li>
                    <strong>Penalty Charges</strong>
                    <ul>
                      <li>
                        Incorrect match updates will incur penalties based on
                        the game amount:
                        <ul>
                          <li>Games below ₹1000: 10% penalty</li>
                          <li>
                            Games between ₹1000 and ₹5000: ₹50 flat penalty
                          </li>
                          <li>
                            Games between ₹5000 and ₹15000: ₹100 flat penalty
                          </li>
                        </ul>
                      </li>
                      <li>
                        Failure to update results after losing incurs a ₹25
                        penalty.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Account Restrictions</strong>
                    <ul>
                      <li>
                        Only one account per user is permitted. Multiple
                        accounts may result in permanent bans and penalties.
                      </li>
                    </ul>
                  </li>
                </ol>

                <Typography variant="h6">F. Commission Charges</Typography>
                <ol>
                  <li>
                    <strong>Commission Fees</strong>
                    <ul>
                      <li>
                        A commission will be charged on the challenge amount
                        after referral deductions.
                      </li>
                    </ul>
                  </li>
                </ol>

                <Typography variant="body1">
                  For any queries or concerns regarding these Terms, please
                  contact our support team. We are here to assist you.
                </Typography>
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Additional Accordions with unique IDs */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ArrowDownwardIcon />}
              aria-controls="accordion2-content"
              id="accordion2-header"
            >
              <Typography variant="h6">Cancellation & Refund Policy</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <Typography variant="h6">User Approval</Typography>
                <Typography paragraph>
                  Thank you for choosing Aarush Enterprises. If you are not completely
                  satisfied with your subscription, we are here to assist you.
                </Typography>
                <Typography variant="h6">Refund Process</Typography>
                <Typography paragraph>
                  Upon receiving your refund request, we will review it and
                  update you on the status.
                </Typography>
                <Typography paragraph>
                  If your request is approved, we will process a refund to your
                  credit card (or original payment method) within 7 business
                  days. The credit will appear in your account according to your
                  card issuer’s policies.
                </Typography>
                <Typography paragraph>
                  In the event of an unforeseen technical issue, Aarush Enterprises will
                  review the complaint and may issue a refund. The final
                  decision will be made by the company.
                </Typography>
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ArrowDownwardIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              <Typography variant="h6">Privacy Policy</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div>
                <Typography variant="h6">Introduction</Typography>
                <Typography paragraph>
                  This document outlines how Aoneludo (https://aoneludo.com)
                  collects, processes, stores, and shares personal data and
                  information ("Information"). By using our Services, you agree
                  to the collection, transfer, manipulation, storage,
                  disclosure, and other uses of your information as detailed in
                  this Privacy Policy. If you have any concerns about sharing
                  your data or how it will be used, please refrain from using
                  the Services. As specified in our Terms, you must be at least
                  18 years old to access or use the Services, or, if legally
                  allowed, do so with the consent and authorization of a legal
                  guardian who agrees to this Privacy Policy.
                </Typography>

                <Typography variant="h6">Information We Collect</Typography>
                <Typography paragraph>
                  Aoneludo and/or third parties, such as business partners,
                  advertising networks, and analytics providers, may collect and
                  process various types of data about you, including:
                </Typography>
                <Typography paragraph>
                  <ul>
                    <li>
                      Information provided when filling out forms or creating an
                      account.
                    </li>
                    <li>
                      Details about your usage of the Services and the resources
                      you access.
                    </li>
                    <li>
                      Correspondence and interactions between you and Aoneludo
                      or other users.
                    </li>
                    <li>
                      Data collected through cookies and similar technologies.
                    </li>
                  </ul>
                </Typography>

                <Typography variant="h6">Personal Data</Typography>
                <Typography paragraph>
                  While using our Services, we may ask for personal information,
                  such as:
                </Typography>
                <Typography paragraph>
                  <ul>
                    <li>Email address</li>
                    <li>First and last name</li>
                    <li>Address, State, Province, ZIP/Postal code, City</li>
                  </ul>
                </Typography>

                <Typography variant="h6">Cookies</Typography>
                <Typography paragraph>
                  Aoneludo uses cookies and similar technologies to store
                  information on your device and recognize you. Cookies help us
                  enhance your experience, manage payments, and collect data
                  about your device and usage. By using our Services, you
                  consent to the use of cookies. You can disable cookies through
                  your browser settings, but some features of the Services may
                  not function properly if you do so.
                </Typography>

                <Typography variant="h6">Advertising</Typography>
                <Typography paragraph>
                  We and third parties may use advertising identifiers to
                  deliver personalized ads based on your interests. These
                  identifiers are non-permanent and device-specific, helping us
                  improve ad delivery and effectiveness.
                </Typography>

                <Typography variant="h6">Payment Information</Typography>
                <Typography paragraph>
                  If you make purchases through our Services, we may collect
                  billing and financial information necessary to process the
                  transactions. Third-party payment service providers handle
                  payments and are subject to their own policies.
                </Typography>

                <Typography variant="h6">Customer Support</Typography>
                <Typography paragraph>
                  When you contact Aoneludo customer support, we may collect
                  information about your game activity, user ID, and
                  correspondence. You may also provide optional profile
                  information for account customization. This data helps us
                  assist you and improve our Services.
                </Typography>

                <Typography variant="h6">Use of Information</Typography>
                <Typography paragraph>
                  We use your information to manage your account, send updates,
                  enhance the Services, conduct research, and personalize your
                  experience. Additionally, we may use it for marketing and
                  promotional purposes.
                </Typography>

                <Typography variant="h6">
                  Information Sharing and Disclosure
                </Typography>
                <Typography paragraph>
                  We may share your data with third parties as necessary to
                  provide the Services, process payments, or comply with legal
                  obligations. We may also disclose information in anonymous or
                  aggregated forms as required by law.
                </Typography>

                <Typography variant="h6">Data Retention</Typography>
                <Typography paragraph>
                  We retain your information as needed to fulfill its purpose or
                  comply with legal requirements, even after account deletion or
                  termination of Services.
                </Typography>

                <Typography variant="h6">Data Protection</Typography>
                <Typography paragraph>
                  We implement appropriate safeguards to protect your data from
                  unauthorized access or processing. However, we cannot
                  guarantee absolute security. Information may be transferred or
                  stored globally. In the event of a business transition, your
                  data may be transferred to the new entity.
                </Typography>

                <Typography variant="h6">Legal Compliance</Typography>
                <Typography paragraph>
                  We may disclose your information to comply with laws, protect
                  safety, address technical issues, or safeguard our rights.
                  This Privacy Policy is governed by Indian law, and disputes
                  will be subject to the jurisdiction of courts in Jaipur,
                  Rajasthan, India. By using our Services, you consent to this
                  jurisdiction.
                </Typography>
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ArrowDownwardIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              <Typography variant="h6">About Us</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div>
                <Typography paragraph>
                  Welcome to Aarush Enterprises, a premier real-money online
                  entertainment platform owned and operated by Aarush Enterprises. As
                  an HTML5 entertainment-publishing company, our mission is to
                  provide seamless access to entertainment by eliminating the
                  need for app installations. At Aarush Enterprises, we offer a
                  skill-based real-money gaming experience exclusively for users
                  in India. Our platform, accessible at Aarush Enterprises,
                  allows players to engage in exciting Tournaments and Battles
                  where they can compete for real cash prizes. Winnings can be
                  easily encashed through popular payment methods such as Paytm
                  Wallet, UPI, or PhonePe, ensuring a convenient and smooth
                  experience for our users. Join us at Aarush Enterprises for an
                  unparalleled gaming experience where skill meets opportunity!
                </Typography>
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ArrowDownwardIcon />}
              aria-controls="panel3-content"
              id="panel3-header"
            >
              <Typography variant="h6">Contact Us</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div>
                <Typography variant="body1" paragraph>
                  For any inquiries or support, please reach out to us through
                  the following:
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Email:</strong>{" "}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://aoneludo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.aoneludo.com
                  </a>
                </Typography>
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      </section>
    </>
  );
};

export default withAuth(TermsAndConditions);
