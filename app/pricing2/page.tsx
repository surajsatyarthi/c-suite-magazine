import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Executive Feature Packages - C-Suite Magazine',
  description: 'Premium PR packages for global C-suite executives',
  robots: {
    index: false,
    follow: false,
  },
}

export default function Pricing2Page() {
  return (
    <>
      {/* SEO: Additional noindex safeguard */}
      <meta name="robots" content="noindex, nofollow" />

      <div dangerouslySetInnerHTML={{ __html: pricing2HTML }} />
    </>
  )
}

const pricing2HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            /* Premium Color Palette - Matching Site */
            --primary-dark: #082945;
            --secondary-dark: #0a3350;
            --primary-gold: #c8ab3d;
            --gold-medium: #b39935;
            --gold-light: #f2f0eb;
            --luxury-cream: #fefdfb;

            /* Typography Colors */
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #64748b;

            /* Backgrounds */
            --background-white: #ffffff;
            --background-grey: #f8fafc;
            --card-bg: #ffffff;

            /* Borders & Effects */
            --border-subtle: #e2e8f0;
            --border-light: rgba(226, 232, 240, 0.5);
            --gold-shadow: rgba(200, 171, 61, 0.3);
            --gold-translucent: rgba(200, 171, 61, 0.1);

            /* Shadows */
            --shadow-minimal: 0 1px 2px rgba(0, 0, 0, 0.05);
            --shadow-soft: 0 1px 3px rgba(0, 0, 0, 0.1);
            --shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.1);
            --shadow-hover: 0 8px 25px rgba(0, 0, 0, 0.15);
            --shadow-gold: 0 4px 20px rgba(200, 171, 61, 0.25);

            /* Fonts */
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-serif: 'Playfair Display', Georgia, serif;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-sans);
            background: var(--background-white);
            color: var(--text-primary);
            line-height: 1.6;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 24px;
        }

        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, rgba(8, 41, 69, 0.97) 0%, rgba(10, 51, 80, 0.95) 100%),
                        url('/hero-image.webp') center/cover no-repeat;
            padding: 100px 0 80px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
                radial-gradient(circle at 20% 50%, rgba(200, 171, 61, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(200, 171, 61, 0.1) 0%, transparent 50%),
                linear-gradient(135deg, transparent 0%, rgba(200, 171, 61, 0.05) 100%);
            pointer-events: none;
        }

        .hero::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 100px;
            background: linear-gradient(to bottom, transparent, var(--background-white));
            pointer-events: none;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 20px;
            background: var(--background-white);
            border: 1px solid var(--primary-gold);
            border-radius: 100px;
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-gold);
            margin-bottom: 24px;
            box-shadow: var(--shadow-soft);
            animation: fadeInUp 0.6s ease-out;
        }

        .hero-title {
            font-family: var(--font-serif);
            font-size: 44px;
            font-weight: 400;
            line-height: 53px;
            margin-bottom: 24px;
            color: #ffffff;
            animation: fadeInUp 0.6s ease-out 0.1s both;
        }

        .hero-title-accent {
            background: linear-gradient(135deg, var(--primary-gold), var(--gold-medium));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero-subtitle {
            font-size: clamp(16px, 2vw, 20px);
            color: rgba(255, 255, 255, 0.9);
            max-width: 900px;
            margin: 0 auto 40px;
            font-weight: 400;
            line-height: 1.7;
            animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .social-proof {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 48px;
            flex-wrap: wrap;
            margin-top: 56px;
            animation: fadeInUp 0.6s ease-out 0.3s both;
        }

        .proof-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .proof-number {
            font-size: 48px;
            font-weight: 800;
            color: var(--primary-gold);
            font-family: var(--font-serif);
            line-height: 1;
        }

        .proof-label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 8px;
            font-weight: 500;
        }

        /* Alert Box */
        .alert-box {
            max-width: 900px;
            margin: 48px auto;
            padding: 28px 32px;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
            border-left: 4px solid #10B981;
            border-radius: 8px;
            animation: fadeInUp 0.6s ease-out 0.4s both;
        }

        .alert-title {
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 10px;
            color: #10B981;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .alert-text {
            font-size: 16px;
            color: var(--text-secondary);
            line-height: 1.7;
        }

        /* Comparison Section */
        .comparison-section {
            background: var(--background-grey);
            padding: 80px 0;
        }

        .section-header {
            text-align: center;
            margin-bottom: 64px;
        }

        .section-title {
            font-family: var(--font-serif);
            font-size: 32px;
            font-weight: 400;
            line-height: 42px;
            margin-bottom: 16px;
            color: var(--primary-dark);
        }

        .section-subtitle {
            font-size: 18px;
            color: var(--text-secondary);
            max-width: 700px;
            margin: 0 auto;
            line-height: 1.6;
        }

        .comparison-table {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--background-white);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--border-subtle);
            box-shadow: var(--shadow-soft);
        }

        .table-scroll {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead {
            background: linear-gradient(135deg, var(--gold-light) 0%, var(--luxury-cream) 100%);
        }

        th {
            padding: 24px 20px;
            text-align: left;
            font-weight: 700;
            font-size: 15px;
            color: var(--text-primary);
            border-bottom: 2px solid var(--border-subtle);
        }

        th:first-child {
            font-size: 16px;
            color: var(--primary-gold);
        }

        td {
            padding: 20px;
            border-bottom: 1px solid var(--border-light);
            font-size: 14px;
            color: var(--text-secondary);
        }

        tr:hover {
            background: rgba(200, 171, 61, 0.03);
        }

        .check-icon {
            color: #10B981;
            font-size: 20px;
        }

        .cross-icon {
            color: var(--text-muted);
            font-size: 18px;
        }

        /* Feature Comparison Table */
        .features-comparison-section {
            padding: 80px 0;
            background: var(--background-white);
        }

        .features-table {
            max-width: 1400px;
            margin: 0 auto;
            background: var(--background-white);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--border-subtle);
            box-shadow: var(--shadow-soft);
        }

        .features-table th {
            text-align: center;
            padding: 24px 16px;
        }

        .features-table th:first-child {
            text-align: left;
            width: 35%;
        }

        .features-table th:nth-child(2) {
            width: 25%;
        }

        .features-table td:first-child {
            font-weight: 600;
            color: var(--text-primary);
        }

        .features-table td {
            text-align: center;
        }

        .features-table td:first-child {
            text-align: left;
        }

        .feature-description {
            font-size: 13px;
            color: var(--text-muted);
            font-weight: 400;
            display: block;
            margin-top: 4px;
        }

        /* Pricing Section */
        .pricing-section {
            padding: 80px 0;
            background: var(--background-white);
        }

        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
            gap: 32px;
            margin-bottom: 80px;
        }

        .pricing-card {
            background: var(--card-bg);
            border: 2px solid var(--border-subtle);
            border-radius: 12px;
            padding: 40px;
            position: relative;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }

        .pricing-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--tier-color, var(--border-subtle)), var(--tier-color, var(--border-subtle)));
            opacity: 0.6;
        }

        .pricing-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-hover);
            border-color: var(--primary-gold);
        }

        .pricing-card.featured {
            border: 2px solid var(--primary-gold);
            box-shadow: var(--shadow-gold);
            position: relative;
        }

        .pricing-card.featured::before {
            opacity: 1;
        }

        .tier-badge {
            position: absolute;
            top: -1px;
            right: 32px;
            background: linear-gradient(135deg, var(--primary-gold), var(--gold-medium));
            color: var(--background-white);
            padding: 8px 20px;
            border-radius: 0 0 8px 8px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: var(--shadow-soft);
        }

        .availability-badge {
            display: inline-block;
            padding: 6px 14px;
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 100px;
            font-size: 12px;
            font-weight: 600;
            color: #d97706;
            margin-bottom: 16px;
        }

        .tier-name {
            font-family: var(--font-serif);
            font-size: 24px;
            font-weight: 400;
            line-height: 31px;
            margin-bottom: 12px;
            color: var(--primary-dark);
        }

        .tier-description {
            font-size: 15px;
            color: var(--text-secondary);
            margin-bottom: 28px;
            line-height: 1.6;
        }

        .features-list {
            list-style: none;
            margin-bottom: 32px;
        }

        .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-light);
            font-size: 15px;
            transition: all 0.2s ease;
        }

        .feature-item:hover {
            background: var(--gold-translucent);
            padding-left: 8px;
            margin-left: -8px;
            border-radius: 6px;
        }

        .feature-item:last-child {
            border-bottom: none;
        }

        .feature-icon {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--gold-translucent);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-gold);
            font-size: 11px;
            font-weight: 700;
            margin-top: 2px;
        }

        .feature-text {
            flex: 1;
            color: var(--text-secondary);
            line-height: 1.5;
        }

        .feature-text strong {
            color: var(--text-primary);
        }

        .feature-tooltip {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--border-subtle);
            color: var(--text-muted);
            font-size: 11px;
            cursor: help;
            margin-left: 6px;
            font-weight: 600;
        }

        .tooltip-content {
            position: absolute;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-dark);
            color: var(--background-white);
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            line-height: 1.5;
            width: 280px;
            box-shadow: var(--shadow-hover);
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            z-index: 100;
            pointer-events: none;
        }

        .feature-tooltip:hover .tooltip-content {
            opacity: 1;
            visibility: visible;
        }

        .bonus-section {
            background: linear-gradient(135deg, var(--gold-translucent) 0%, rgba(200, 171, 61, 0.05) 100%);
            border: 1px solid rgba(200, 171, 61, 0.2);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 28px;
        }

        .bonus-title {
            font-weight: 700;
            font-size: 15px;
            color: var(--primary-gold);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .bonus-list {
            list-style: none;
            font-size: 14px;
            color: var(--text-secondary);
        }

        .bonus-list li {
            padding: 6px 0;
            display: flex;
            align-items: flex-start;
            gap: 8px;
            line-height: 1.5;
        }

        .bonus-list li::before {
            content: '🎁';
            flex-shrink: 0;
        }

        /* Testimonials */
        .testimonials-section {
            padding: 80px 0;
            background: var(--background-white);
        }

        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
            gap: 32px;
            margin-top: 48px;
        }

        .testimonial-card {
            background: var(--background-white);
            border: 2px solid var(--border-subtle);
            border-radius: 12px;
            padding: 32px;
            transition: all 0.3s ease;
        }

        .testimonial-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-medium);
            border-color: var(--primary-gold);
        }

        .testimonial-stars {
            color: var(--primary-gold);
            font-size: 18px;
            margin-bottom: 16px;
        }

        .testimonial-text {
            font-size: 16px;
            line-height: 1.7;
            color: var(--text-secondary);
            margin-bottom: 24px;
            font-style: italic;
        }

        .testimonial-author {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .author-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-gold), var(--gold-medium));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 700;
            color: var(--background-white);
        }

        .author-info h4 {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 4px;
            color: var(--text-primary);
        }

        .author-info p {
            font-size: 14px;
            color: var(--text-muted);
        }

        /* FAQ Section */
        .faq-section {
            max-width: 900px;
            margin: 80px auto;
            padding: 0 24px;
        }

        .faq-item {
            background: var(--background-white);
            border: 2px solid var(--border-subtle);
            border-radius: 8px;
            margin-bottom: 16px;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .faq-item:hover {
            border-color: var(--primary-gold);
        }

        .faq-question {
            padding: 24px 28px;
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
        }

        .faq-icon {
            font-size: 24px;
            color: var(--primary-gold);
            transition: transform 0.3s ease;
            font-weight: 300;
        }

        .faq-item.active .faq-icon {
            transform: rotate(45deg);
        }

        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .faq-answer-content {
            padding: 0 28px 24px;
            font-size: 16px;
            line-height: 1.7;
            color: var(--text-secondary);
        }

        .faq-item.active .faq-answer {
            max-height: 500px;
        }

        /* Guarantee Section */
        .guarantee-section {
            max-width: 800px;
            margin: 60px auto;
            padding: 40px;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
            border: 2px solid #10B981;
            border-radius: 12px;
            text-align: center;
        }

        .guarantee-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }

        .guarantee-title {
            font-family: var(--font-serif);
            font-size: 24px;
            font-weight: 400;
            line-height: 31px;
            margin-bottom: 16px;
            color: #10B981;
        }

        .guarantee-text {
            font-size: 18px;
            line-height: 1.7;
            color: var(--text-secondary);
        }

        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero {
                padding: 80px 0 60px;
            }

            .hero-title {
                font-size: 32px;
                line-height: 40px;
            }

            .section-title {
                font-size: 24px;
                line-height: 32px;
            }

            .tier-name {
                font-size: 18px;
                line-height: 24px;
            }

            .guarantee-title {
                font-size: 18px;
                line-height: 24px;
            }

            .pricing-grid {
                grid-template-columns: 1fr;
                gap: 24px;
            }

            .social-proof {
                gap: 32px;
            }

            .proof-number {
                font-size: 36px;
            }

            .testimonials-grid {
                grid-template-columns: 1fr;
            }

            th, td {
                padding: 12px;
                font-size: 13px;
            }

            .features-table th:first-child {
                width: auto;
            }
        }

        /* Tier-specific colors */
        .pricing-card.tier-professional {
            --tier-color: #94A3B8;
        }

        .pricing-card.tier-authority {
            --tier-color: var(--primary-gold);
        }

        .pricing-card.tier-visionary {
            --tier-color: #FFD700;
        }
    </style>
</head>
<body>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-badge">
                ✨ Trusted by 500+ Global C-Suite Leaders
            </div>
            <h1 class="hero-title">
                Executive Feature Packages:<br>
                <span class="hero-title-accent">Your Brand, Amplified Globally</span>
            </h1>
            <p class="hero-subtitle">
                Join the world's most influential CEOs, board members, and thought leaders who leveraged our platform to secure speaking engagements, board appointments, and $50M+ in new business opportunities.
            </p>

            <div class="social-proof">
                <div class="proof-item">
                    <div class="proof-number">4M+</div>
                    <div class="proof-label">Global Readers</div>
                </div>
                <div class="proof-item">
                    <div class="proof-number">500+</div>
                    <div class="proof-label">CXOs Featured</div>
                </div>
                <div class="proof-item">
                    <div class="proof-number">14 Day</div>
                    <div class="proof-label">Turnaround</div>
                </div>
                <div class="proof-item">
                    <div class="proof-number">100%</div>
                    <div class="proof-label">Satisfaction</div>
                </div>
            </div>

            <div class="alert-box">
                <div class="alert-title">🎯 Performance Guaranteed</div>
                <div class="alert-text">
                    If we don't meet our agreed performance benchmarks within 90 days, we'll run a bonus campaign at no cost. All packages include 14-day article publication and minimal client effort (just a 30-minute interview).
                </div>
            </div>
        </div>
    </section>

    <!-- Why C-Suite Magazine (Moved to Top) -->
    <section class="comparison-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Why C-Suite Magazine?</h2>
                <p class="section-subtitle">See how we compare to traditional PR agencies and competitor publications</p>
            </div>

            <div class="comparison-table">
                <div class="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th style="text-align: center;">Traditional PR Firms</th>
                                <th style="text-align: center;">Competitor Publications</th>
                                <th style="text-align: center; color: var(--primary-gold);">C-Suite Magazine</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Turnaround Time</strong></td>
                                <td style="text-align: center;">4-12 weeks</td>
                                <td style="text-align: center;">3-8 weeks</td>
                                <td style="text-align: center;"><span class="check-icon">✓</span> 14 days</td>
                            </tr>
                            <tr>
                                <td><strong>Reprint Rights</strong></td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span> Extra fees</td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span> Limited</td>
                                <td style="text-align: center;"><span class="check-icon">✓</span> Unlimited</td>
                            </tr>
                            <tr>
                                <td><strong>AI Search Optimization</strong></td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span> ChatGPT, Gemini, Grok</td>
                            </tr>
                            <tr>
                                <td><strong>Content Longevity</strong></td>
                                <td style="text-align: center;">Temporary</td>
                                <td style="text-align: center;">1-2 years</td>
                                <td style="text-align: center;"><span class="check-icon">✓</span> Evergreen (Forever)</td>
                            </tr>
                            <tr>
                                <td><strong>Monthly Reporting</strong></td>
                                <td style="text-align: center;">Basic metrics</td>
                                <td style="text-align: center;">Quarterly</td>
                                <td style="text-align: center;"><span class="check-icon">✓</span> Performance report at campaign end</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <!-- Feature Comparison Table -->
    <section class="features-comparison-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Package Features Comparison</h2>
                <p class="section-subtitle">
                    Compare all features across our three executive packages
                </p>
            </div>

            <div class="features-table">
                <div class="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Feature<br><span class="feature-description">What's included</span></th>
                                <th>Professional</th>
                                <th>Authority</th>
                                <th>Visionary</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>Profile Article Length</strong>
                                    <span class="feature-description">In-depth executive profile optimized for SEO and thought leadership</span>
                                </td>
                                <td style="text-align: center;">Up to 4,000 words</td>
                                <td style="text-align: center;">Up to 4,000 words</td>
                                <td style="text-align: center;">Up to 4,000 words</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Digital Cover Feature</strong>
                                    <span class="feature-description">Featured on magazine cover design</span>
                                </td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Executive in Focus Placement</strong>
                                    <span class="feature-description">Priority placement on magazine homepage</span>
                                </td>
                                <td style="text-align: center;">2 days</td>
                                <td style="text-align: center;">4 days</td>
                                <td style="text-align: center;">7 days</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Reprint Rights</strong>
                                    <span class="feature-description">Use article across your marketing materials</span>
                                </td>
                                <td style="text-align: center;">Unlimited</td>
                                <td style="text-align: center;">Unlimited</td>
                                <td style="text-align: center;">Unlimited</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>⭐ Evergreen Content</strong>
                                    <span class="feature-description">How long article stays published</span>
                                </td>
                                <td style="text-align: center;">Forever</td>
                                <td style="text-align: center;">Forever</td>
                                <td style="text-align: center;">Forever</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Search Engine Indexing</strong>
                                    <span class="feature-description">Google, Bing, Yahoo visibility</span>
                                </td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>⭐ AI Search Optimization</strong>
                                    <span class="feature-description">ChatGPT, Gemini, and Grok optimization</span>
                                </td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Performance Reports</strong>
                                    <span class="feature-description">Analytics and engagement tracking</span>
                                </td>
                                <td style="text-align: center;">At campaign end</td>
                                <td style="text-align: center;">At campaign end</td>
                                <td style="text-align: center;">At campaign end</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Digital Certificate</strong>
                                    <span class="feature-description">Framed certification of feature</span>
                                </td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Images & Do-Follow Links</strong>
                                    <span class="feature-description">SEO-boosting backlinks to your website</span>
                                </td>
                                <td style="text-align: center;">2 images & 2 links</td>
                                <td style="text-align: center;">4 images & 4 links</td>
                                <td style="text-align: center;">6 images & 6 links</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Guest Article Opportunities</strong>
                                    <span class="feature-description">Additional thought leadership articles over 6 months at 25% discount</span>
                                </td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;">4 articles</td>
                                <td style="text-align: center;">4 articles</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Executive Profile Page</strong>
                                    <span class="feature-description">Dedicated profile among global leaders</span>
                                </td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Magazine Logo Usage</strong>
                                    <span class="feature-description">Rights to use C-Suite Magazine branding</span>
                                </td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Returning Client Discount</strong>
                                    <span class="feature-description">Discount on future campaigns within 9 months</span>
                                </td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;">25%</td>
                                <td style="text-align: center;">25%</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>EDM Campaign</strong>
                                    <span class="feature-description">Email blast to 100K+ subscribers</span>
                                </td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;">Bonus</td>
                                <td style="text-align: center;">Dedicated</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Social Media Amplification</strong>
                                    <span class="feature-description">Meta & Partner Sites brand campaign</span>
                                </td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Press Release Distribution</strong>
                                    <span class="feature-description">Distributed to partner media outlets</span>
                                </td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>LinkedIn Ads</strong>
                                    <span class="feature-description">Paid promotion up to 100K views</span>
                                </td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Article Revisions</strong>
                                    <span class="feature-description">Number of revision rounds included</span>
                                </td>
                                <td style="text-align: center;">Up to 3</td>
                                <td style="text-align: center;">Up to 3</td>
                                <td style="text-align: center;">Up to 3</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Personal Branding Consultation</strong>
                                    <span class="feature-description">60-minute strategy session</span>
                                </td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;"><span class="check-icon">✓</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Customer Success Manager</strong>
                                    <span class="feature-description">Dedicated support contact</span>
                                </td>
                                <td style="text-align: center;"><span class="cross-icon">✗</span></td>
                                <td style="text-align: center;">Priority</td>
                                <td style="text-align: center;">VIP</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <!-- Package Overview Cards (No Prices, No CTAs) -->
    <section class="pricing-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Choose Your Growth Path</h2>
                <p class="section-subtitle">
                    Each tier is designed to match your ambitions. From establishing credibility to commanding global influence.
                </p>
            </div>

            <div class="pricing-grid">
                <!-- Professional Tier -->
                <div class="pricing-card tier-professional">
                    <div class="availability-badge">⚡ 10 slots/quarter</div>
                    <h3 class="tier-name">Professional</h3>
                    <p class="tier-description">Perfect for executives establishing their thought leadership and digital presence.</p>

                    <ul class="features-list">
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">
                                Up to 4,000 Word Profile Article
                                <span class="feature-tooltip">ⓘ
                                    <span class="tooltip-content">In-depth executive profile showcasing your expertise, achievements, and vision. Optimized for SEO and thought leadership.</span>
                                </span>
                            </span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">2 images & 2 do-follow links</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Up to 3 article revisions</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Digital Cover Feature</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Executive in Focus Placement (2 days)</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Unlimited Reprint Rights</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">⭐ Evergreen Content (No Expiration)</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Google, Bing, Yahoo Indexing</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Performance Report (at campaign end)</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Framed Digital Certificate</span>
                        </li>
                    </ul>
                </div>

                <!-- Authority Tier (Featured) -->
                <div class="pricing-card tier-authority featured">
                    <div class="tier-badge">Most Popular</div>
                    <div class="availability-badge">🔥 7 slots/quarter</div>
                    <h3 class="tier-name">Authority</h3>
                    <p class="tier-description">For leaders ready to dominate their industry narrative and build lasting influence.</p>

                    <ul class="features-list">
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text"><strong>Everything in Professional, plus:</strong></span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">
                                4 Guest Article Opportunities
                                <span class="feature-tooltip">ⓘ
                                    <span class="tooltip-content">Contribute four additional thought leadership articles over 6 months at 25% discount, maintaining ongoing visibility.</span>
                                </span>
                            </span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">4 images & 4 do-follow links</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Up to 3 article revisions</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Executive in Focus Placement (4 days)</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">⭐ AI Search Optimization (ChatGPT, Gemini & Grok)</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Executive Profile Among Global Leaders</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Magazine Logo Usage Rights</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">25% Discount on Next Campaign (9 months)</span>
                        </li>
                    </ul>

                    <div class="bonus-section">
                        <div class="bonus-title">🎁 Limited-Time Bonus</div>
                        <ul class="bonus-list">
                            <li>Complimentary EDM campaign to 100K+ subscribers</li>
                            <li>Priority customer success manager</li>
                        </ul>
                    </div>
                </div>

                <!-- Visionary Tier -->
                <div class="pricing-card tier-visionary">
                    <div class="availability-badge">💎 5 slots/quarter - VIP</div>
                    <h3 class="tier-name">Visionary</h3>
                    <p class="tier-description">For transformational leaders commanding attention across continents and industries.</p>

                    <ul class="features-list">
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text"><strong>Everything in Authority, plus:</strong></span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">
                                Direct Reach to 4M+ Global C-Suite
                                <span class="feature-tooltip">ⓘ
                                    <span class="tooltip-content">Verified reach via Google Analytics and third-party certification. Includes CEOs, board members, and decision-makers worldwide.</span>
                                </span>
                            </span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">6 images & 6 do-follow links</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Up to 3 article revisions</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Meta & Partner Sites Brand Campaign</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Dedicated EDM Campaign Blast</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Executive in Focus Placement (7 days)</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Performance Report (at campaign end)</span>
                        </li>
                        <li class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">Press Release Distribution (Partner Outlets)</span>
                        </li>
                    </ul>

                    <div class="bonus-section">
                        <div class="bonus-title">💎 VIP Exclusive Bonuses</div>
                        <ul class="bonus-list">
                            <li>Priority homepage placement extension (+30 days)</li>
                            <li>Free guest article upgrade (standard → featured)</li>
                            <li>Personal branding consultation (60 minutes)</li>
                            <li>LinkedIn ads up to 100K views</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Guarantee Section -->
    <section class="guarantee-section">
        <div class="container">
            <div class="guarantee-icon">🛡️</div>
            <h3 class="guarantee-title">100% Performance Guarantee</h3>
            <p class="guarantee-text">
                We're so confident in our platform's ability to deliver results that if we don't meet our agreed performance benchmarks within 90 days, we'll run a bonus campaign at no cost.
            </p>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">What Global Leaders Say</h2>
                <p class="section-subtitle">Real results from real executives who transformed their brand presence</p>
            </div>

            <div class="testimonials-grid">
                <div class="testimonial-card">
                    <div class="testimonial-stars">★★★★★</div>
                    <p class="testimonial-text">
                        "Within 60 days of my feature, I received 3 speaking invitations and 2 board appointment inquiries. The ROI has been extraordinary—easily 50x what I invested."
                    </p>
                    <div class="testimonial-author">
                        <div class="author-avatar">MR</div>
                        <div class="author-info">
                            <h4>Michael Rodriguez</h4>
                            <p>CEO, TechVentures Global</p>
                        </div>
                    </div>
                </div>

                <div class="testimonial-card">
                    <div class="testimonial-stars">★★★★★</div>
                    <p class="testimonial-text">
                        "The quality of leads we received after my feature was exceptional. I closed a $2.3M partnership directly from someone who read my profile. Best marketing investment we've made."
                    </p>
                    <div class="testimonial-author">
                        <div class="author-avatar">SP</div>
                        <div class="author-info">
                            <h4>Sarah Patterson</h4>
                            <p>Founder & CEO, Innovation Capital</p>
                        </div>
                    </div>
                </div>

                <div class="testimonial-card">
                    <div class="testimonial-stars">★★★★★</div>
                    <p class="testimonial-text">
                        "I've worked with 5 different PR agencies over my career. None delivered the level of polish, speed, and measurable results that C-Suite Magazine provided. Game changer."
                    </p>
                    <div class="testimonial-author">
                        <div class="author-avatar">DK</div>
                        <div class="author-info">
                            <h4>David Kim</h4>
                            <p>Board Member, Fortune 500</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
        <div class="section-header">
            <h2 class="section-title">Frequently Asked Questions</h2>
        </div>

        <div class="faq-item">
            <div class="faq-question">
                How is this different from paying traditional PR firms?
                <span class="faq-icon">+</span>
            </div>
            <div class="faq-answer">
                <div class="faq-answer-content">
                    Traditional PR firms charge $10,000-$50,000 per month with no guarantees, temporary exposure, and limited reprint rights. We provide guaranteed performance, evergreen content with unlimited reprint rights, faster turnaround (14 days vs 4-12 weeks), and pricing that's 70-90% lower—all with a bonus campaign guarantee if we don't meet agreed benchmarks.
                </div>
            </div>
        </div>

        <div class="faq-item">
            <div class="faq-question">
                What if I'm not satisfied with the article?
                <span class="faq-icon">+</span>
            </div>
            <div class="faq-answer">
                <div class="faq-answer-content">
                    We offer up to 3 revisions until you're completely satisfied. Our editorial team works closely with you through a collaborative review process. Additionally, our 100% performance guarantee means if we don't meet our agreed metrics within 90 days, we'll run a bonus campaign at no cost.
                </div>
            </div>
        </div>

        <div class="faq-item">
            <div class="faq-question">
                Can I upgrade to a higher tier later?
                <span class="faq-icon">+</span>
            </div>
            <div class="faq-answer">
                <div class="faq-answer-content">
                    Absolutely! If you start with Professional and want to upgrade to Authority or Visionary within 9 months, we'll apply your initial payment as credit and you only pay the difference. Plus, you'll still receive the 25% returning client discount on your next campaign.
                </div>
            </div>
        </div>

        <div class="faq-item">
            <div class="faq-question">
                How do you verify the 4 million reader claim?
                <span class="faq-icon">+</span>
            </div>
            <div class="faq-answer">
                <div class="faq-answer-content">
                    Our reach is verified through Google Analytics, third-party traffic analysis tools (SimilarWeb), and our email subscriber database. We provide detailed audience demographics and engagement metrics in your performance reports. We're happy to share redacted analytics during your strategy call.
                </div>
            </div>
        </div>

        <div class="faq-item">
            <div class="faq-question">
                What's the time commitment required from me?
                <span class="faq-icon">+</span>
            </div>
            <div class="faq-answer">
                <div class="faq-answer-content">
                    Minimal. We only require a 30-minute initial interview (phone or video) and 15-20 minutes for article review. Our expert writers and editorial team handle everything else—research, writing, SEO optimization, image selection, and distribution. We respect your time.
                </div>
            </div>
        </div>

        <div class="faq-item">
            <div class="faq-question">
                Do you guarantee specific results or metrics?
                <span class="faq-icon">+</span>
            </div>
            <div class="faq-answer">
                <div class="faq-answer-content">
                    Yes. During your strategy call, we establish clear, measurable KPIs based on your tier (views, engagement, reach, referral traffic). If we fall short of these agreed benchmarks within 90 days, we'll run an additional promotional campaign at no cost. We're the only publication in our space offering this guarantee.
                </div>
            </div>
        </div>
    </section>

    <script>
        // FAQ Accordion
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const isActive = faqItem.classList.contains('active');

                // Close all FAQ items
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                });

                // Open clicked item if it wasn't active
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe pricing cards
        document.querySelectorAll('.pricing-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = \`all 0.6s ease \${index * 0.1}s\`;
            observer.observe(card);
        });

        // Observe testimonials
        document.querySelectorAll('.testimonial-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = \`all 0.6s ease \${index * 0.15}s\`;
            observer.observe(card);
        });
    </script>

</body>
</html>
`
