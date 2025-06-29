export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Generate PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const { height } = page.getSize()
    const fontSize = 12
    let y = height - 40

    const lines = Object.entries(data).map(([key, value]) => `${key}: ${value}`)

    lines.forEach((line) => {
      if (y < 50) return
      page.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      })
      y -= 20
    })

    const pdfBuffer = Buffer.from(await pdfDoc.save())

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Loan Portal" <${process.env.COMPANY_EMAIL}>`,
      to: 'sahilaktar648@gmail.com',
      subject: 'New Loan Application',
      text: 'A new loan application has been submitted. See attached PDF.',
      attachments: [
        {
          filename: 'loan-application.pdf',
          content: pdfBuffer,
        },
      ],
    })

    return NextResponse.json({ message: 'PDF sent via email!' }, { status: 200 })
  } catch (error: any) {
    console.error('Submit loan error:', error.message)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
