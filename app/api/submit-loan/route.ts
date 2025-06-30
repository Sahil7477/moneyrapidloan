export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontSize = 12
    const margin = 50
    const lineHeight = 20

    // Helper to add a page with a section title
    const addPageWithTitle = (title: string): PDFPage => {
      const page = pdfDoc.addPage([600, 800])
      page.drawText(title, {
        x: margin,
        y: 750,
        size: 18,
        font,
        color: rgb(0, 0, 0),
      })
      return page
    }

    // Helper to draw key-value pairs on the page
    const drawKeyValuePairs = (
      page: PDFPage,
      fields: [string, string | number | null | undefined][]
    ): PDFPage => {
      let y = 720
      for (const [label, value] of fields) {
        if (y < 50) break
        const sanitizedValue = String(value ?? "N/A").replace("₹", "Rs.")
        page.drawText(`${label}: ${sanitizedValue}`, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        })
        y -= lineHeight
      }
      return page
    }

    // Step 1: Personal Details
    drawKeyValuePairs(
      addPageWithTitle("Step 1: Personal Details"),
      [
        ["Full Name", data.fullName],
        ["Date of Birth", data.dob],
        ["Gender", data.gender],
        ["Phone", data.phone],
        ["Email", data.email],
        ["Aadhaar", data.aadhaar],
        ["PAN", data.pan],
      ]
    )

    // Step 2: Address & Employment
    drawKeyValuePairs(
      addPageWithTitle("Step 2: Address & Employment"),
      [
        ["Permanent Address", data.permanentAddress],
        ["Current Address", data.currentAddress],
        ["Employment Type", data.employmentType],
        ["Monthly Income", `Rs. ${data.income}`],
        ["Company Name", data.companyName],
      ]
    )

    // Step 3: Loan Details
    drawKeyValuePairs(
      addPageWithTitle("Step 3: Loan Details"),
      [
        ["Loan Amount", `Rs. ${data.loanAmount}`],
        ["Tenure", `${data.tenure} months`],
        ["Interest Rate", `${data.interestRate}%`],
        ["Loan Purpose", data.purpose],
      ]
    )

    // Step 4: Bank Details
    drawKeyValuePairs(
      addPageWithTitle("Step 4: Bank Details"),
      [
        ["Bank Name", data.bankName],
        ["IFSC", data.ifsc],
        ["Account Number", data.accountNumber],
      ]
    )

    const pdfBuffer = Buffer.from(await pdfDoc.save())

    // Nodemailer config
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
      to: 'moneyrapidloan@gmail.com',
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Submit loan error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      console.error("Submit loan error:", error)
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 })
    }
  }
}
