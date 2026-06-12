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
        "RewardsPro pays automatic cashback as Shopify store credit. Set your reward tiers once and turn first-time buyers into repeat customers — no code required.",
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
    emoji: "🔁",
    title: "Bring customers back",
    text: "A store-credit balance is a standing reason to return — customers come back to spend what they have waiting.",
  },
  {
    emoji: "📈",
    title: "Grow order value",
    text: "Tiers reward bigger spenders with higher cashback, giving shoppers a reason to reach their next level.",
  },
  {
    emoji: "⚙️",
    title: "Run on autopilot",
    text: "Cashback is calculated and issued automatically on every paid order. Configure your tiers once and you're done.",
  },
];

const steps = [
  {
    when: "On every order",
    title: "Customer earns cashback",
    text: "Each paid order earns cashback at the customer's tier rate, issued automatically as Shopify store credit.",
    emoji: "🧾",
  },
  {
    when: "Between visits",
    title: "Their balance grows",
    text: "Store credit waits in their account, ready to apply at checkout — a reason to come back and buy again.",
    emoji: "💳",
  },
  {
    when: "Next purchase",
    title: "They reorder",
    text: "Spending their credit makes the next order an easy yes, lifting repeat-purchase rate over time.",
    emoji: "🛍️",
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
    text: "Track repeat-purchase rate, lifetime value, and program ROI so you can see what loyalty is earning you.",
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

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "month",
    ordersIncluded: "200 orders/month",
    features: ["Basic loyalty tiers", "Store credit tracking", "Customer dashboard", "Email support"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$49",
    period: "month",
    ordersIncluded: "500 orders/month",
    features: ["Everything in Free", "Unlimited tiers", "Custom emails", "Priority support", "Basic analytics"],
    cta: "Start trial",
    highlighted: true,
  },
  {
    name: "Growth",
    price: "$199",
    period: "month",
    ordersIncluded: "2,500 orders/month",
    overageRate: "$20 per 100 additional",
    features: ["Everything in Starter", "Advanced analytics", "API webhooks", "VIP tier features", "Phone support"],
    cta: "Start trial",
    highlighted: false,
  },
  {
    name: "Plus",
    price: "$999",
    period: "month",
    ordersIncluded: "7,500 orders/month",
    overageRate: "$5 per 100 additional",
    features: ["Everything in Growth", "Custom reporting", "Dedicated manager", "White-glove setup", "SLA guarantee"],
    cta: "Contact sales",
    highlighted: false,
  },
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
        Enter your store to get started
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
          Install on Shopify
        </button>
      </div>
      <p id={`shop-hint-${variant}`} className="lp-store-hint">
        Free to install · No credit card required · Setup in minutes
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
            <a href="#pricing" className="lp-nav-link">
              Pricing
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
            Turn first-time buyers into <span className="lp-accent">repeat customers</span>
          </h1>
          <p className="lp-hero-subtitle">
            RewardsPro pays automatic cashback as Shopify store credit. Set your reward tiers once, and every
            order gives customers a balance — and a reason to come back.
          </p>
          {showForm ? (
            <StoreLoginForm variant="hero" />
          ) : (
            <a href="#pricing" className="lp-btn lp-btn-primary lp-btn-lg">
              See plans
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
            <p className="lp-section-lede">Loyalty that runs itself and pays off in repeat orders.</p>
          </div>
          <div className="lp-grid lp-grid--3">
            {valueProps.map((v) => (
              <div key={v.title} className="lp-card lp-value">
                <div className="lp-icon" aria-hidden="true" style={{ fontSize: "1.5rem" }}>
                  {v.emoji}
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
            <p className="lp-section-lede">Three steps to a loyalty loop that keeps customers coming back.</p>
          </div>
          <div className="lp-steps">
            {steps.map((step, i) => (
              <div key={step.title} className="lp-step">
                <div className="lp-step-num">{i + 1}</div>
                <div aria-hidden="true" style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
                  {step.emoji}
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

      {/* Pricing */}
      <section className="lp-section" id="pricing">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2 className="lp-section-title">Choose your plan</h2>
            <p className="lp-section-lede">Start free and scale as you grow.</p>
          </div>
          <div className="lp-grid lp-grid--2 lp-grid--4">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`lp-price${plan.highlighted ? " lp-price--featured" : ""}`}>
                {plan.highlighted && <span className="lp-price-badge">Most popular</span>}
                <h3 className="lp-price-name">{plan.name}</h3>
                <div>
                  <span className="lp-price-amount">{plan.price}</span>
                  <span className="lp-price-period">/{plan.period}</span>
                </div>
                <p className="lp-price-orders">{plan.ordersIncluded}</p>
                {plan.overageRate && <p className="lp-price-overage">{plan.overageRate}</p>}
                <ul className="lp-price-features">
                  {plan.features.map((feature) => (
                    <li key={feature} className="lp-price-feature">
                      <svg className="lp-check" width="18" height="18" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#get-started"
                  className={`lp-btn ${plan.highlighted ? "lp-btn-primary" : "lp-btn-secondary"}`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
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
          <h2 className="lp-cta-title">Ready to turn buyers into regulars?</h2>
          <p className="lp-cta-subtitle">
            Install RewardsPro on your store and have cashback rewards running in minutes.
          </p>
          {showForm ? (
            <StoreLoginForm variant="cta" />
          ) : (
            <a href="#pricing" className="lp-btn lp-btn-primary lp-btn-lg">
              See plans
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
              <p className="lp-footer-tag">The easiest way to build customer loyalty on Shopify.</p>
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
                  <a href="#pricing" className="lp-footer-link">
                    Pricing
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
