import { PAID_SUBSCRIPTIONS_RETIRED_MESSAGE } from "~/constants/commercial-retirement";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { login } from "../../shopify.server";
import landingStyles from "./styles.css?url";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: landingStyles }];

export const meta: MetaFunction = () => {
  return [
    { title: "RewardsPro — Loyalty & Cashback for Shopify" },
    {
      name: "description",
      content:
        "Explore loyalty rules, balances and existing reward records. New paid subscriptions are retired.",
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

/** Accept what merchants actually type ("my-store", "https://my-store.myshopify.com/")
 *  and resolve it to the bare shop domain Shopify's OAuth expects. A value that
 *  already carries a dot (myshopify.com or a custom domain) is left intact. */
function normalizeShopDomain(value: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  if (!cleaned) return "";
  return cleaned.includes(".") ? cleaned : `${cleaned}.myshopify.com`;
}

// ── Content ──────────────────────────────────────────────────────────

const valueProps = [
  {
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    title: "Read reward balances",
    text: "Follow how recorded purchases and refunds affect a store-credit balance.",
  },
  {
    icon: "M3 17l6-6 4 4 8-8M14 7h7v7",
    title: "Understand reward rules",
    text: "Explore how tier thresholds determine cashback rates.",
  },
  {
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    title: "Run on autopilot",
    text: "Cashback is calculated and issued automatically on every paid order. Configure your tiers once and you're done.",
  },
];

const steps = [
  {
    when: "On every order",
    title: "Customer earns cashback",
    text: "Each paid order earns cashback at the customer's tier rate, issued automatically as Shopify store credit.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    when: "Between visits",
    title: "Their balance grows",
    text: "Store credit stays recorded in their account and remains available under the existing programme.",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    when: "Next purchase",
    title: "They use their balance",
    text: "An eligible purchase reduces the recorded balance according to programme rules.",
    icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  },
];

const features = [
  {
    title: "Tiered rewards",
    text: "Create unlimited tiers with progressive cashback rates that reward your highest-spending customers.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    title: "Native store credit",
    text: "Balances are tracked through Shopify's own store-credit system and apply at checkout — nothing bolted on.",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Customer portal",
    text: "A self-service dashboard where shoppers track their balance, tier status, and progress to the next level.",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    title: "Automatic order sync",
    text: "Orders sync straight from Shopify and cashback is calculated the moment a payment is captured.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "Analytics",
    text: "Read programme activity and understand the records behind reward balances.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    title: "Email updates",
    text: "Automated notifications for tier changes and cashback earned keep customers engaged with their rewards.",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
];

const trustPoints = [
  "Uses Shopify's native store credit",
  "Works with any Shopify theme",
  "No code or theme edits required",
  "Refunds reverse cashback automatically",
];

const faqs = [
  {
    question: "How does the loyalty program work?",
    answer:
      "RewardsPro automatically tracks customer purchases and awards store credit based on your configured tiers. Customers earn cashback percentages that increase as they spend more, encouraging repeat purchases.",
  },
  {
    question: "Can I customize the reward tiers?",
    answer:
      "Yes. You have full control over tier names, spending thresholds, and cashback percentages. Set up as many tiers as you want to match your business strategy.",
  },
  {
    question: "How do customers redeem their rewards?",
    answer:
      "Store credit is applied at checkout automatically. Customers can see their balance and apply it to any purchase with a single click.",
  },
  {
    question: "Does it work with my Shopify theme?",
    answer:
      "RewardsPro works with any Shopify theme. It integrates directly with Shopify's native store-credit system, so there's nothing to edit in your theme.",
  },
  {
    question: "What happens with refunds?",
    answer:
      "Refunds are handled automatically. If an order is refunded, the associated cashback is reversed so balances stay accurate.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The free plan includes up to 200 orders per month — a good fit for smaller stores just getting started with loyalty.",
  },
];

// ── Shop entry form (the entry point into the app) ──────────────────

function StoreLoginForm({ variant }: { variant: "hero" | "cta" }) {
  const [shop, setShop] = useState("");
  const onBrand = variant === "cta";

  return (
    <Form
      method="post"
      action="/auth/login"
      className={`lp-store-form lp-store-form--center${onBrand ? " lp-store-form--onbrand" : ""}`}
    >
      <label htmlFor={`shop-${variant}`} className="lp-store-label">
        Open your existing store
      </label>
      <div className="lp-store-row">
        <input
          id={`shop-${variant}`}
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="your-store.myshopify.com"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
          className="lp-store-input"
          aria-describedby={`shop-hint-${variant}`}
          required
        />
        {/* Submit the normalized domain so "my-store" still resolves. */}
        <input type="hidden" name="shop" value={normalizeShopDomain(shop)} />
        <button type="submit" className="lp-btn lp-btn-primary lp-btn-lg">
          Open existing app
        </button>
      </div>
      <p id={`shop-hint-${variant}`} className="lp-store-hint">
        Existing records and support remain available. New paid subscriptions are retired.
      </p>
    </Form>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className="lp-faq-chevron"
      data-open={open}
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function LandingPage() {
  const { showForm } = useLoaderData<typeof loader>();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="lp">
      {/* Navigation */}
      <nav className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <a href="#top" className="lp-brand">
            RewardsPro
          </a>
          <div className="lp-nav-links">
            <a href="#how-it-works" className="lp-nav-link">
              How it works
            </a>
            <a href="#features" className="lp-nav-link">
              Features
            </a>
            <a href="#subscription-records" className="lp-nav-link">
              Subscription records
            </a>
            <a href="#faq" className="lp-nav-link">
              FAQ
            </a>
            <a href="#get-started" className="lp-btn lp-btn-primary">
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero — explanation + entry point above the fold */}
      <section className="lp-hero" id="top">
        <div className="lp-container">
          <span className="lp-eyebrow">⚡ Loyalty &amp; cashback for Shopify</span>
          <h1 className="lp-hero-title">
            Understand how <span className="lp-accent">rewards work</span>
          </h1>
          <p className="lp-hero-subtitle">
            Explore reward rules and the records they create. Curiosity does not need a revenue or growth target.
          </p>
          {showForm ? (
            <StoreLoginForm variant="hero" />
          ) : (
            <a href="#subscription-records" className="lp-btn lp-btn-primary lp-btn-lg">
              Subscription records
            </a>
          )}
          <div className="lp-hero-actions">
            <a href="#how-it-works" className="lp-nav-link">
              See how it works ↓
            </a>
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 className="lp-section-title">Why RewardsPro?</h2>
            <p className="lp-section-lede">Explore the mechanics of loyalty systems.</p>
          </div>
          <div className="lp-grid lp-grid--3">
            {valueProps.map((v) => (
              <div key={v.title} className="lp-card lp-value">
                <div className="lp-icon" aria-hidden="true">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={v.icon} />
                  </svg>
                </div>
                <h3 className="lp-card-title">{v.title}</h3>
                <p className="lp-card-text">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="lp-section lp-section--subdued" id="how-it-works">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 className="lp-section-title">How it works</h2>
            <p className="lp-section-lede">Follow a reward balance through its lifecycle.</p>
          </div>
          <div className="lp-steps">
            {steps.map((step, i) => (
              <div key={step.title} className="lp-step">
                <div className="lp-step-num">{i + 1}</div>
                <div className="lp-icon" aria-hidden="true" style={{ width: 36, height: 36, marginBottom: 12 }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={step.icon} />
                  </svg>
                </div>
                <p className="lp-step-when">{step.when}</p>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-card-text">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="lp-section" id="features">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 className="lp-section-title">Everything you need for customer loyalty</h2>
            <p className="lp-section-lede">Powerful features that work seamlessly with your Shopify store.</p>
          </div>
          <div className="lp-grid lp-grid--2 lp-grid--3-lg">
            {features.map((f) => (
              <div key={f.title} className="lp-card">
                <div className="lp-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="lp-card-title">{f.title}</h3>
                <p className="lp-card-text">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Shopify — honest trust signals (no invented metrics) */}
      <section className="lp-section lp-section--subdued">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 className="lp-section-title">Built natively for Shopify</h2>
            <p className="lp-section-lede">No workarounds, no theme surgery — it just plugs in.</p>
          </div>
          <div className="lp-grid lp-grid--2 lp-grid--4">
            {trustPoints.map((point) => (
              <div key={point} className="lp-card lp-value">
                <div className="lp-check" aria-hidden="true">
                  <svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="lp-card-text" style={{ color: "var(--lp-ink)", fontWeight: 600 }}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" id="subscription-records">
        <div className="lp-container">
          <h2 className="lp-section-title">Existing subscription records</h2>
          <p className="lp-section-lede">{PAID_SUBSCRIPTIONS_RETIRED_MESSAGE}</p>
          <p>For existing billing or refund questions, contact support@rewardspro.app.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section lp-section--subdued" id="faq">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 className="lp-section-title">Frequently asked questions</h2>
          </div>
          <div className="lp-faq">
            {faqs.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div key={faq.question} className="lp-faq-item">
                  <button
                    type="button"
                    className="lp-faq-button"
                    aria-expanded={open}
                    aria-controls={`faq-panel-${index}`}
                    onClick={() => setOpenFaq(open ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <Chevron open={open} />
                  </button>
                  {open && (
                    <p id={`faq-panel-${index}`} className="lp-faq-answer">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA — entry point repeated */}
      <section className="lp-cta" id="get-started">
        <div className="lp-container">
          <h2 className="lp-cta-title">Open existing records</h2>
          <p className="lp-cta-subtitle">
            Existing agreements, balances, cancellation and support remain available.
          </p>
          {showForm ? (
            <StoreLoginForm variant="cta" />
          ) : (
            <a href="#subscription-records" className="lp-btn lp-btn-primary lp-btn-lg">
              Subscription records
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <div>
              <p className="lp-footer-brand">RewardsPro</p>
              <p className="lp-footer-tag">A place to understand reward systems and their records.</p>
            </div>
            <div>
              <p className="lp-footer-col-title">Explore</p>
              <ul className="lp-footer-links">
                <li>
                  <a href="#how-it-works" className="lp-footer-link">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#features" className="lp-footer-link">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#subscription-records" className="lp-footer-link">
                    Subscription records
                  </a>
                </li>
                <li>
                  <a href="#faq" className="lp-footer-link">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">© 2026 RewardsPro. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
