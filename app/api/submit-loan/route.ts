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
    const {  height } = page.getSize()
    const fontSize = 12
    let y = height - 40

    const lines: string[] = []
    for (const [key, value] of Object.entries(data)) {
      lines.push(`${key}: ${value}`)
    }

    lines.forEach((line) => {
      page.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0)
      })
      y -= 20
    })

    const pdfBytes = await pdfDoc.save()
    const pdfBuffer = Buffer.from(pdfBytes)

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: `"Loan Portal" <${process.env.COMPANY_EMAIL}>`,
      to: 'loans@company.com', // your company email
      subject: 'New Loan Application',
      text: 'A new loan application has been submitted. See attached PDF.',
      attachments: [
        {
          filename: 'loan-application.pdf',
          content: pdfBuffer
        }
      ]
    })

    return NextResponse.json({ message: 'PDF sent via email!' }, { status: 200 })
  } catch (error) {
    console.error('Submit loan error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
