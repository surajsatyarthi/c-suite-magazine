'use server'

import { headers } from 'next/headers'
import nodemailer from 'nodemailer'

interface ContactState {
  success: boolean
  message: string
}

// ---------------------------------------------------------------------------
// Rate limiting — max 3 submissions per IP per hour (in-memory, no Redis)
// ---------------------------------------------------------------------------
const _rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = _rateLimitStore.get(ip)

  if (!record || now > record.resetAt) {
    _rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) return false

  record.count++
  return true
}

// ---------------------------------------------------------------------------
// Keyword filter — phrases that appear in SEO/spam cold-outreach templates
// ---------------------------------------------------------------------------
const SPAM_KEYWORDS = [
  '1st page',
  'first page',
  'rank your website',
  'rank your site',
  'google ranking',
  'search engine ranking',
  'seo service',
  'seo package',
  'drive traffic',
  'wa.me',
  'whatsapp',
  'toll free',
  'we can place',
  'increase your ranking',
  'top of google',
  'page 1 of google',
  'place your website',
  'rank on google',
]

function isSpamContent(text: string): boolean {
  const lower = text.toLowerCase()
  return SPAM_KEYWORDS.some((kw) => lower.includes(kw))
}

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------
export async function submitContactForm(prevState: ContactState | null, formData: FormData) {
  // 1. Honeypot check — the `website` field is hidden off-screen from real
  //    users via CSS (not display:none, which bots detect). Bots that
  //    auto-fill forms will populate it; we silently accept so they don't retry.
  const honeypot = formData.get('website') as string
  if (honeypot) {
    return { success: true, message: 'Thank you! Your submission has been received.' }
  }

  // 2. Timing check — form must have been open for at least 3 seconds.
  //    Bots typically submit instantly after page load.
  const loadedAt = parseInt((formData.get('_loadedAt') as string) || '0', 10)
  const elapsed = Date.now() - loadedAt
  if (loadedAt > 0 && elapsed < 3000) {
    return { success: true, message: 'Thank you! Your submission has been received.' }
  }

  // 3. Rate limiting by IP
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'

  if (!checkRateLimit(ip)) {
    return { success: false, message: 'Too many submissions. Please try again later.' }
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const company = formData.get('company') as string
  const position = formData.get('position') as string
  const phone = formData.get('phone') as string
  const type = formData.get('submissionType') as string
  const subject = formData.get('subject') as string
  const message = formData.get('message') as string

  // 4. Keyword / content filter — silent accept so spammers don't know they
  //    were blocked and switch tactics.
  if (isSpamContent(`${subject} ${message} ${company}`)) {
    return { success: true, message: 'Thank you! Your submission has been received.' }
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    // eslint-disable-next-line
    console.error('Missing email credentials')
    return { success: false, message: 'Server configuration error. Please try again later.' }
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: `"C-Suite Magazine Contact Form" <${process.env.EMAIL_USER}>`,
      to: 'csuitebrandagency@gmail.com',
      replyTo: email,
      subject: `[${type}] ${subject} - ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Position:</strong> ${position}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Type:</strong> ${type}</p>
        <hr />
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    }

    await transporter.sendMail(mailOptions)

    return { success: true, message: 'Thank you! Your submission has been received.' }
  } catch (error) {
    // eslint-disable-next-line
    console.error('Email sending failed:', error)
    return { success: false, message: 'Failed to send details. Please try again.' }
  }
}
