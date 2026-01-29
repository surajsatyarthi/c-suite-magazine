'use server'

import nodemailer from 'nodemailer'

interface ContactState {
  success: boolean
  message: string
}

export async function submitContactForm(prevState: ContactState | null, formData: FormData) {
  const name = formData.get('name')
  const email = formData.get('email')
  const company = formData.get('company')
  const position = formData.get('position')
  const phone = formData.get('phone')
  const type = formData.get('submissionType')
  const subject = formData.get('subject')
  const message = formData.get('message')

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
      replyTo: email as string,
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
        <p>${(message as string).replace(/\n/g, '<br/>')}</p>
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
