import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  const { pdfUrl, estateName, email } = req.body;
  if (!pdfUrl || !estateName || !email) return res.status(400).json({ success: false, error: 'Missing required fields' });

  try {
    // Download the PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error('Failed to download PDF');
    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    // Configure Nodemailer (replace with your SMTP details)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password',
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@crewzen.app',
      to: email,
      subject: `Access Bundle for ${estateName}`,
      text: `Attached is the access bundle for ${estateName}.`,
      attachments: [
        {
          filename: `AccessBundle-${estateName.replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to send email' });
  }
} 