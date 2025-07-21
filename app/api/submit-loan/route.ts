export const runtime = "nodejs"
import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { PDFDocument, PDFFont, StandardFonts, rgb, type PDFPage } from "pdf-lib"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    // Extract all form fields
    const data = {
      fullName: formData.get("fullName") as string,
      dob: formData.get("dob") as string,
      gender: formData.get("gender") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      aadhaar: formData.get("aadhaar") as string,
      pan: formData.get("pan") as string,
      permanentAddress: formData.get("permanentAddress") as string,
      permanentDistrict: formData.get("permanentDistrict") as string,
      permanentState: formData.get("permanentState") as string,
      permanentPincode: formData.get("permanentPincode") as string,
      currentAddress: formData.get("currentAddress") as string,
      currentDistrict: formData.get("currentDistrict") as string,
      currentState: formData.get("currentState") as string,
      currentPincode: formData.get("currentPincode") as string,
      employmentType: formData.get("employmentType") as string,
      income: formData.get("income") as string,
      companyName: formData.get("companyName") as string,
      loanAmount: formData.get("loanAmount") as string,
      tenure: formData.get("tenure") as string,
      interestRate: formData.get("interestRate") as string,
      purpose: formData.get("purpose") as string,
      bankName: formData.get("bankName") as string,
      ifsc: formData.get("ifsc") as string,
      accountNumber: formData.get("accountNumber") as string,
      reference1Name: formData.get("reference1Name") as string,
      reference1Phone: formData.get("reference1Phone") as string,
      reference1Relation: formData.get("reference1Relation") as string,
      reference2Name: formData.get("reference2Name") as string,
      reference2Phone: formData.get("reference2Phone") as string,
      reference2Relation: formData.get("reference2Relation") as string,
    }

    // Handle photo file
    const photo = formData.get("photo") as File | null
    let photoBuffer: Buffer | null = null
    if (photo) {
      const arrayBuffer = await photo.arrayBuffer()
      photoBuffer = Buffer.from(new Uint8Array(arrayBuffer))
    }

    // Generate unique application ID
    const applicationId = `MRL${Date.now()}`
    const currentDate = new Date()

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const fontSize = 9
    const smallFontSize = 8
    const headerFontSize = 14
    const titleFontSize = 20
    const margin = 30
    const pageWidth = 600
    const pageHeight = 800

    // Brand colors
    const brandBlue = rgb(0.1, 0.3, 0.7)
    const brandGreen = rgb(0.1, 0.6, 0.3)
    const lightGray = rgb(0.95, 0.95, 0.95)
    const darkGray = rgb(0.3, 0.3, 0.3)
    const white = rgb(1, 1, 1)
    const yellow = rgb(1, 1, 0)

    // Helper to sanitize text for PDF encoding
    const sanitizeText = (text: string): string => {
      if (!text) return ""
      return text
        .replace(/\n/g, " ") // Replace newlines with spaces
        .replace(/\r/g, " ") // Replace carriage returns with spaces
        .replace(/\t/g, " ") // Replace tabs with spaces
        .replace(/[^\x20-\x7E]/g, "") // Remove non-ASCII characters
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim()
    }

    // Helper to add brand header to each page
    const addBrandHeader = (page: PDFPage): number => {
      // Brand background
      page.drawRectangle({
        x: 0,
        y: pageHeight - 80,
        width: pageWidth,
        height: 80,
        color: brandBlue,
      })

      // Brand title
      page.drawText("MONEY RAPID LOAN", {
        x: margin,
        y: pageHeight - 35,
        size: titleFontSize,
        font: boldFont,
        color: white,
      })

      // Subtitle
      page.drawText("Loan Application & Agreement", {
        x: margin,
        y: pageHeight - 55,
        size: 12,
        font,
        color: white,
      })

      // Application ID and date
      page.drawText(`Application ID: ${applicationId}`, {
        x: pageWidth - 200,
        y: pageHeight - 35,
        size: 10,
        font: boldFont,
        color: white,
      })

      page.drawText(`Date: ${currentDate.toLocaleDateString("en-IN")}`, {
        x: pageWidth - 200,
        y: pageHeight - 55,
        size: 10,
        font,
        color: white,
      })

      return pageHeight - 90 // Return Y position for content start
    }

    // Helper to draw text with word wrapping
    const drawWrappedText = (
      page: PDFPage,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight = 12,
      textFont = font,
      textSize = smallFontSize,
    ): number => {
      // Sanitize the text first
      const sanitizedText = sanitizeText(text)
      const words = sanitizedText.split(" ").filter((word) => word.length > 0)
      let currentLine = ""
      let currentY = y

      for (const word of words) {
        const testLine = currentLine + (currentLine ? " " : "") + word
        const textWidth = textFont.widthOfTextAtSize(testLine, textSize)

        if (textWidth <= maxWidth) {
          currentLine = testLine
        } else {
          if (currentLine) {
            page.drawText(currentLine, {
              x,
              y: currentY,
              size: textSize,
              font: textFont,
              color: rgb(0, 0, 0),
            })
            currentY -= lineHeight
          }
          currentLine = word
        }
      }

      if (currentLine) {
        page.drawText(currentLine, {
          x,
          y: currentY,
          size: textSize,
          font: textFont,
          color: rgb(0, 0, 0),
        })
        currentY -= lineHeight
      }

      return currentY
    }

    // New helper function to calculate wrapped text height without drawing
    const calculateWrappedTextHeight = (
      text: string,
      maxWidth: number,
      lineHeight: number,
      textFont: PDFFont,
      textSize: number,
    ): number => {
      const sanitizedText = sanitizeText(text)
      const words = sanitizedText.split(" ").filter((word) => word.length > 0)
      let currentLine = ""
      let lines = 0

      if (words.length === 0) return 0

      for (const word of words) {
        const testLine = currentLine + (currentLine ? " " : "") + word
        const textWidth = textFont.widthOfTextAtSize(testLine, textSize)

        if (textWidth <= maxWidth) {
          currentLine = testLine
        } else {
          lines++
          currentLine = word
        }
      }
      lines++ // For the last line

      return lines * lineHeight
    }

    // Helper to draw a table
    const drawTable = (page: PDFPage, startY: number, title: string, data: [string, string][]): number => {
      let currentY = startY

      // Section title with background
      page.drawRectangle({
        x: margin,
        y: currentY - 25,
        width: pageWidth - 2 * margin,
        height: 25,
        color: brandGreen,
      })

      page.drawText(title, {
        x: margin + 10,
        y: currentY - 18,
        size: headerFontSize,
        font: boldFont,
        color: white,
      })

      currentY -= 30

      const tableWidth = pageWidth - 2 * margin
      const col1Width = tableWidth * 0.4
      const col2Width = tableWidth * 0.6
      const cellPadding = 8
      const textLineHeight = 20 // Standard line height for text within cells

      // Draw table rows
      for (let i = 0; i < data.length; i++) {
        const [label, value] = data[i]
        const isEvenRow = i % 2 === 0
        const sanitizedLabel = sanitizeText(label)
        const sanitizedValue = sanitizeText(String(value ?? "N/A")).replace("₹", "Rs.")

        // Calculate height needed for label and value
        const labelHeight = calculateWrappedTextHeight(
          sanitizedLabel,
          col1Width - 2 * cellPadding,
          textLineHeight,
          boldFont,
          fontSize,
        )
        const valueHeight = calculateWrappedTextHeight(
          sanitizedValue,
          col2Width - 2 * cellPadding,
          textLineHeight,
          font,
          fontSize,
        )

        const actualRowContentHeight = Math.max(labelHeight, valueHeight)
        const actualRowHeight = Math.max(actualRowContentHeight + 2 * cellPadding, 20) // Ensure minimum row height of 20

        // Row background
        page.drawRectangle({
          x: margin,
          y: currentY - actualRowHeight,
          width: tableWidth,
          height: actualRowHeight,
          color: isEvenRow ? lightGray : white,
          borderColor: darkGray,
          borderWidth: 0.5,
        })

        // Column separator
        page.drawLine({
          start: { x: margin + col1Width, y: currentY },
          end: { x: margin + col1Width, y: currentY - actualRowHeight },
          color: darkGray,
          thickness: 0.5,
        })

        // Label (left column) - use drawWrappedText for proper wrapping
        drawWrappedText(
          page,
          sanitizedLabel,
          margin + cellPadding,
          currentY - cellPadding,
          col1Width - 2 * cellPadding,
          textLineHeight,
          boldFont,
          fontSize,
        )

        // Value (right column) - use drawWrappedText for proper wrapping
        drawWrappedText(
          page,
          sanitizedValue,
          margin + col1Width + cellPadding,
          currentY - cellPadding,
          col2Width - 2 * cellPadding,
          textLineHeight,
          font,
          fontSize,
        )

        currentY -= actualRowHeight
      }

      return currentY - 5
    }

    // Helper to draw borrower covenants section
    const drawBorrowerCovenants = (page: PDFPage, startY: number): number => {
      let currentY = startY

      // Title section
      page.drawRectangle({
        x: margin,
        y: currentY - 30,
        width: pageWidth - 2 * margin,
        height: 30,
        color: brandBlue,
      })

      page.drawText("ARTICLE - 6", {
        x: margin + 10,
        y: currentY - 15,
        size: 12,
        font: boldFont,
        color: white,
      })

      page.drawText("BORROWER COVENANTS", {
        x: margin + 10,
        y: currentY - 28,
        size: 12,
        font: boldFont,
        color: white,
      })

      currentY -= 40

      // Section 6.1
      page.drawText("6.1    Particular Affirmative Covenants", {
        x: margin,
        y: currentY,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      currentY -= 20

      const covenants = [
        {
          letter: "(a)",
          title: "Utilization of Loan:",
          content:
            "The Borrower shall utilize the entire Loan for the purposes specified in this Loan Agreement and unless otherwise agreed to by the Lender in writing for no other purpose whatsoever.",
        },
        {
          letter: "(b)",
          title: "Maintenance of Property:",
          content:
            "The Borrower shall maintain the residential property in good order and saleable condition and will make all necessary additions and improvements thereto during the pendency of the Loan.",
        },
        {
          letter: "(c)",
          title: "Compliance with rules etc. and payment of maintenance charges etc:",
          content:
            "The Borrower shall duly and punctually comply with all the terms and conditions for holding the residential property and all the rules, regulations, bye-laws etc. of the concerned Co-operative Society, Association, company or other authority and pay such maintenance and other charges for the upkeep of the residential property as also any other dues etc., as may be payable in respect of the residential property or the use thereof.",
        },
        {
          letter: "(d)",
          title: "Insurance:",
          content:
            "The Borrower at its own expense, insure and keep insured upto the replacement value thereof as approved by the Lender the residential property against fire, earth quake and other calamity or hazards and shall duly pay all premia and sums payable for that purpose. The insurance shall be taken in the joint name of the Borrower and the Lender. Unless otherwise agreed by the Lender, the Borrower shall deposit and keep deposited with the Lender the insurance policy and the renewal thereof.",
        },
        {
          letter: "(e)",
          title: "Loss/Damage by uncovered risk:",
          content:
            "The Borrower shall promptly inform the Lender of any material loss or damage to the residential property which the Borrower may suffer due to any force majeure or act of God, such as flood, explosion, storm, tempest, cyclone, civil commotion etc., war risk and other calamities etc. against which the property may not have been insured.",
        },
        {
          letter: "(f)",
          title: "Notify Additions, Alterations:",
          content:
            "The Borrower agrees to notify and furnish details of any additions to or alterations in the residential property which might be proposed to be made during the pendency of the Loan.",
        },
      ]

      for (const covenant of covenants) {
        // Draw letter identifier
        page.drawText(covenant.letter, {
          x: margin,
          y: currentY,
          size: fontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        // Draw title
        page.drawText(covenant.title, {
          x: margin + 25,
          y: currentY,
          size: fontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentY -= 15

        // Draw content with proper wrapping
        currentY = drawWrappedText(
          page,
          covenant.content,
          margin + 25,
          currentY,
          pageWidth - 2 * margin - 25,
          12,
          font,
          smallFontSize,
        )

        currentY -= 10
      }

      return currentY - 10
    }

    // Helper to draw additional loan information
    const drawAdditionalLoanInfo = (page: PDFPage, startY: number): number => {
      let currentY = startY

      // Important Notes section
      page.drawRectangle({
        x: margin,
        y: currentY - 25,
        width: pageWidth - 2 * margin,
        height: 25,
        color: rgb(0.8, 0.2, 0.2), // Red background for important notes
      })

      page.drawText("IMPORTANT NOTES", {
        x: margin + 10,
        y: currentY - 18,
        size: headerFontSize,
        font: boldFont,
        color: white,
      })

      currentY -= 35

      const importantNotes = [
        "All loan disbursals are subject to final credit approval and verification of documents.",
        "Interest rates are subject to change based on RBI guidelines and company policies.",
        "Processing fees are non-refundable and must be paid before loan processing begins.",
        "EMI payments must be made on or before the due date to avoid penalty charges.",
        "Prepayment of loan is allowed with applicable foreclosure charges as mentioned.",
        
      ]

      for (let i = 0; i < importantNotes.length; i++) {
        page.drawText(`${i + 1}.`, {
          x: margin,
          y: currentY,
          size: smallFontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentY = drawWrappedText(
          page,
          importantNotes[i],
          margin + 15,
          currentY,
          pageWidth - 2 * margin - 15,
          12,
          font,
          smallFontSize,
        )

        currentY -= 5
      }

      return currentY - 10
    }

    // Helper to draw loan calculation details
    const drawLoanCalculations = (page: PDFPage, startY: number): number => {
      let currentY = startY

      page.drawRectangle({
        x: margin,
        y: currentY - 25,
        width: pageWidth - 2 * margin,
        height: 25,
        color: brandGreen,
      })

      page.drawText("LOAN CALCULATION BREAKDOWN", {
        x: margin + 10,
        y: currentY - 18,
        size: headerFontSize,
        font: boldFont,
        color: white,
      })

      currentY -= 35

      const calculateEMI = (principal: number, rate: number, time: number) => {
        const r = rate / 12 / 100
        const n = time
        const num = principal * r * Math.pow(1 + r, n)
        const den = Math.pow(1 + r, n) - 1
        return num / den
      }

      const principal = Number.parseFloat(data.loanAmount)
      const rate = Number.parseFloat(data.interestRate)
      const tenure = Number.parseInt(data.tenure)
      const emi = calculateEMI(principal, rate, tenure)
      const totalAmount = emi * tenure
      const totalInterest = totalAmount - principal

      const calculationData = [
        ["Principal Amount", `Rs. ${principal.toLocaleString("en-IN")}`],
        ["Interest Rate (Annual)", `${rate}%`],
        ["Loan Tenure", `${tenure} months`],
        ["Monthly EMI", `Rs. ${emi.toLocaleString("en-IN")}`],
        ["Total Interest Payable", `Rs. ${totalInterest.toLocaleString("en-IN")}`],
        ["Total Amount Payable", `Rs. ${totalAmount.toLocaleString("en-IN")}`],
        ["Processing Fee", "Rs. 2,999"],
        ["Effective Interest Rate", `${(((totalInterest / principal) * 100) / (tenure / 12)).toFixed(2)}%`],
      ]

      const tableWidth = pageWidth - 2 * margin
      const col1Width = tableWidth * 0.6
      
      const cellPadding = 8

      for (let i = 0; i < calculationData.length; i++) {
        const [label, value] = calculationData[i]
        const isEvenRow = i % 2 === 0
        const rowHeight = 25

        page.drawRectangle({
          x: margin,
          y: currentY - rowHeight,
          width: tableWidth,
          height: rowHeight,
          color: isEvenRow ? lightGray : white,
          borderColor: darkGray,
          borderWidth: 0.5,
        })

        page.drawLine({
          start: { x: margin + col1Width, y: currentY },
          end: { x: margin + col1Width, y: currentY - rowHeight },
          color: darkGray,
          thickness: 0.5,
        })

        page.drawText(label, {
          x: margin + cellPadding,
          y: currentY - 16,
          size: fontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        page.drawText(value, {
          x: margin + col1Width + cellPadding,
          y: currentY - 16,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        })

        currentY -= rowHeight
      }

      return currentY - 10
    }

    // Helper to draw sanction cum loan agreement
    const drawSanctionAgreement = (page: PDFPage, startY: number): number => {
      let currentY = startY

      // Title
      page.drawRectangle({
        x: margin,
        y: currentY - 30,
        width: pageWidth - 2 * margin,
        height: 30,
        color: yellow,
        borderColor: darkGray,
        borderWidth: 1,
      })

      page.drawText("SANCTION CUM LOAN AGREEMENT", {
        x: margin + 10,
        y: currentY - 20,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      currentY -= 30

      // Commercial terms section
      page.drawText("Commercial Terms of the Loan", {
        x: margin,
        y: currentY,
        size: 12,
        font: boldFont,
        color: brandBlue,
      })

      currentY -= 25

      const calculateEMI = (principal: number, rate: number, time: number) => {
        const r = rate / 12 / 100
        const n = time
        const num = principal * r * Math.pow(1 + r, n)
        const den = Math.pow(1 + r, n) - 1
        return num / den
      }

      const emi = calculateEMI(
        Number.parseFloat(data.loanAmount),
        Number.parseFloat(data.interestRate),
        Number.parseInt(data.tenure),
      )

      const agreementData = [
        ["Date of Agreement", currentDate.toLocaleDateString("en-IN")],
        ["Application No.", applicationId],
        ["Place of Execution", "Nellore, Andhra Pradesh"],
        ["Purpose of Loan", data.purpose],
        ["Name of Borrower", data.fullName],
        ["Email", data.email],
        [
          "Customer's Current Address",
          `${data.currentAddress}, ${data.currentDistrict}, ${data.currentState} - ${data.currentPincode}`,
        ],
        ["Mobile No", data.phone],
        ["Processing Fee*", "Rs. 2,999"],
        ["Loan", `Rs. ${Number.parseFloat(data.loanAmount).toLocaleString("en-IN")}`],
        ["Rate of Interest (fixed per annum)", `${data.interestRate}%`],
        ["Tenure", `${data.tenure} months`],
        ["EMI", `Rs. ${emi.toLocaleString("en-IN")}`],
        ["EMI Due Date(s)", "As per schedule"],
        ["Overdue Interest", "2% per month on overdue amount"],
        ["Foreclosure Charges***", "2% of outstanding principal"],
        ["Bounce Charge", "Rs. 500 per bounce"],
        ["Repayment Instrument Swap Charges", "Rs. 200"],
        ["NACH / E-mandate Rejection Service Charge", "Rs. 300"],
        ["Loan Cancellation Charges", "Rs. 1,000"],
        ["Stamp Duty Charges", "As applicable"],
        ["Statement of account", "Rs. 100 per statement"],
        ["Repayment Mode (please specify)", "NACH / E-mandate / Others"],
        ["Cheque / NACH / E-mandate / Others", "As selected by borrower"],
      ]

      // Draw agreement table
      const tableWidth = pageWidth - 2 * margin
      const col1Width = tableWidth * 0.5
      const col2Width = tableWidth * 0.5
      const cellPadding = 5
      const textLineHeight = 12

      for (let i = 0; i < agreementData.length; i++) {
        const [label, value] = agreementData[i]
        const isEvenRow = i % 2 === 0
        const sanitizedLabel = sanitizeText(label)
        const sanitizedValue = sanitizeText(String(value))

        const labelHeight = calculateWrappedTextHeight(
          sanitizedLabel,
          col1Width - 2 * cellPadding,
          textLineHeight,
          boldFont,
          smallFontSize,
        )
        const valueHeight = calculateWrappedTextHeight(
          sanitizedValue,
          col2Width - 2 * cellPadding,
          textLineHeight,
          font,
          smallFontSize,
        )

        const actualRowContentHeight = Math.max(labelHeight, valueHeight)
        const actualRowHeight = Math.max(actualRowContentHeight + 2 * cellPadding, 20)

        page.drawRectangle({
          x: margin,
          y: currentY - actualRowHeight,
          width: tableWidth,
          height: actualRowHeight,
          color: isEvenRow ? lightGray : white,
          borderColor: darkGray,
          borderWidth: 0.5,
        })

        page.drawLine({
          start: { x: margin + col1Width, y: currentY },
          end: { x: margin + col1Width, y: currentY - actualRowHeight },
          color: darkGray,
          thickness: 0.5,
        })

        drawWrappedText(
          page,
          sanitizedLabel,
          margin + cellPadding,
          currentY - cellPadding,
          col1Width - 2 * cellPadding,
          textLineHeight,
          boldFont,
          smallFontSize,
        )

        drawWrappedText(
          page,
          sanitizedValue,
          margin + col1Width + cellPadding,
          currentY - cellPadding,
          col2Width - 2 * cellPadding,
          textLineHeight,
          font,
          smallFontSize,
        )

        currentY -= actualRowHeight
      }

      return currentY - 10
    }

    // Helper to draw terms and conditions
    const drawTermsAndConditions = (page: PDFPage, startY: number): number => {
      let currentY = startY

      page.drawRectangle({
        x: margin,
        y: currentY - 25,
        width: pageWidth - 2 * margin,
        height: 25,
        color: yellow,
        borderColor: darkGray,
        borderWidth: 1,
      })

      page.drawText("Terms and Conditions of the Loan", {
        x: margin + 10,
        y: currentY - 18,
        size: headerFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      currentY -= 40

      const termsAndConditions = [
        'This Loan agreement is between Sugali Finlease Private Limited ("Lender") and you ("Borrower") (details of whom are set out in the Commercial Terms above) and shall be deemed to be executed when accepted by the Lender, which shall be evidenced by the disbursal amount being credited to the account.',
        "Processing Fee - The processing fee is a non-refundable fee that must be paid before loan processing begins.",
        "Insurance Premium - As per the request of the Borrower, for taking insurance on the Borrower Company as mentioned above shall be a third-party product and the Borrower shall be subject to insurance terms of the Insurance Company.",
        "Foreclosure Charges - Pre-prepayment is not permitted. Borrower shall prepay the Loan in full. Foreclosure charges of 2% of outstanding principal will be applicable.",
        "For detailed Statement of Charges (SOC) please refer to www.kreditsathi.com policies. Verification Fee charged by KreditSathi (if any) = 0.00",
        "Benefits and such other terms and conditions as communicated by the Lender to the Borrower from time to time during the Tenure of the Loan as set out in the Commercial Terms.",
        "The Borrower hereby represents and undertakes that the Loan shall be Utilized only by the borrowers personal use of such other specific purpose as may be mentioned by the Borrower and agrees not to utilize the Loan or part thereof for any immoral, illegal and/or speculative purposes.",
        "The Borrower shall, forthwith upon the request of the Lender, furnish to the Lender all such details and evidence as the Lender may require concerning the Utilization of the amount of the Loan.",
        "Interest Rate - The interest rate mentioned in the Commercial Terms is fixed for the entire tenure of the loan and is subject to the terms and conditions mentioned herein.",
        "EMI Payment - The Borrower agrees to pay the Equated Monthly Installment (EMI) on or before the due date each month. Late payment will attract penalty charges as mentioned in the Commercial Terms.",
        "Default and Consequences - In case of default in payment of EMI or any other dues, the Lender reserves the right to recall the entire loan amount along with accrued interest and other charges.",
        "Legal Jurisdiction - This agreement shall be governed by Indian laws and any disputes arising out of this agreement shall be subject to the jurisdiction of courts in Nellore, Andhra Pradesh.",
        "Modification of Terms - The Lender reserves the right to modify any terms and conditions of this agreement with prior notice to the Borrower as per applicable laws.",
        "Prepayment - The Borrower may prepay the loan in part or full subject to the prepayment charges as mentioned in the Commercial Terms.",
        "Documentation - The Borrower agrees to provide all necessary documents and information as required by the Lender for processing and monitoring of the loan.",
      ]

      for (let i = 0; i < termsAndConditions.length; i++) {
        page.drawText(`${i + 1}.`, {
          x: margin,
          y: currentY,
          size: smallFontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentY = drawWrappedText(
          page,
          termsAndConditions[i],
          margin + 15,
          currentY,
          pageWidth - 2 * margin - 15,
          12,
          font,
          smallFontSize,
        )

        currentY -= 8 // Add spacing between terms
      }

      return currentY - 10
    }

    // Helper to draw declaration section
    const drawDeclaration = (page: PDFPage, startY: number): number => {
      let currentY = startY

      page.drawRectangle({
        x: margin,
        y: currentY - 25,
        width: pageWidth - 2 * margin,
        height: 25,
        color: brandGreen,
      })

      page.drawText("DECLARATION", {
        x: margin + 10,
        y: currentY - 18,
        size: headerFontSize,
        font: boldFont,
        color: white,
      })

      currentY -= 30

      const declarations = [
        "I/We hereby authorize Sugali Finlease Private Limited and/or its affiliates/subsidiaries (hereinafter 'KreditSathi') and/or its authorized representatives to collect all relevant application forms, documents and other information as maybe required to facilitate the loan application with KreditSathi",
        "\nI/We shall not hold and/ or raise any claim/objections for receiving calls, SMS or email from Sugali Finlease Private Limited or any of its affiliates or its subsidiaries using my/our information to offer me products and services",
        "\nThe Applicant(s) declare that the information and details given/ filled in this Application Form are true, correct, valid and up-to date. This Application Form has been duly filled and reviewed by the Applicant(s)",
        "\nThe Applicant agrees that the application shall form of the Facility documents if the loan is approved. Further, that KreditSathi reserves the right to reject the loan application and the applicant shall not hold KreditSathi responsible if liable in any manner.",
        "\nI/We understand that the rate of interest and duration need not be standardized. It could vary for different customers depending on various parameters like credit history, employment status, repayment capacity, nature of security, etc. I/We understand that applicable interest rate is based on various other parameters and communicated in the sanction letter / loan agreement. The applicant(s) have been explained and agree to the KreditSathi's Approach for determining Interest Rate Policy.",
        "\nKreditSathi shall use, process, store the information and data disclosed for granting the current loan or any other loan in the future and/ or such other manner as maybe permissible.",
        "\nThe Applicant undertakes that KreditSathi shall ensure security and confidentiality of the data and information submitted herein. In the event that the loan application stands rejected the Applicant may request for return of the data/ information submitted along with KreditSathi within a period of 30 days or destroy the information.",
        "\nThe Applicant agrees that the monies received pursuant to grant of the loan shall not be utilized for any unlawful purpose including but not limited to investment in capital market and speculative purposes.",
        "\nI understand and agree that the first payment on my loan account will be made via a Know Your Customer (KYC) complied account maintained by me with another Commercial Bank in India. I accept all terms and conditions communicated by KreditSathi and agree to have the right to cancel my loan/ call for prepayment with extra charges.",
        "\nThe Applicant agrees that any disclosure/commission or pricing of any associated equipment is purely an offer of the manufacturer/dealer, that no claim shall lie against KreditSathi for such offer/discount. KreditSathi shall not be held responsible in any manner for the same.",
        "\nI/we understand that in the event of change in the address mentioned as per proof of address; I will submit fresh proof of address to KreditSathi within a period of three months of such a change.",
        "\nI/we authorize Sugali Finlease Private Limited to fetch/verify information in this application and to receive and exchange information about me/us, including search/download KYC documents from Central KYC Registry (CKYCR), requesting reports from my/our Bank, consumer credit, reference schemes, Credit Information Companies (CIC), NSDL e-governance Infrastructure Limited, as required by the Regulator, etc",
        "\nI/we have read, understood and accept the Terms & conditions and agree to sign this undertaking. I/we understand that KreditSathi may decline this application at its absolute and sole discretion.",
      ]

      for (let i = 0; i < declarations.length; i++) {
        page.drawText(`${i + 1}.`, {
          x: margin,
          y: currentY,
          size: smallFontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentY = drawWrappedText(page, declarations[i], margin + 15, currentY, pageWidth - 2 * margin - 15, 10)
        currentY -= 5
      }

      return currentY - 10
    }

    // Helper to draw vernacular declaration
    const drawVernacularDeclaration = (page: PDFPage, startY: number): number => {
      let currentY = startY

      page.drawRectangle({
        x: margin,
        y: currentY - 25,
        width: pageWidth - 2 * margin,
        height: 25,
        color: brandBlue,
      })

      page.drawText("Vernacular Declaration", {
        x: margin + 10,
        y: currentY - 18,
        size: headerFontSize,
        font: boldFont,
        color: white,
      })

      currentY -= 30

      const vernacularText = `The contents of the loan agreement and other documents have been explained to me by Mr/Ms.....................................................................(Name of Lender/ Authorized representative) to the Borrower in the vernacular language understood by the borrower i.e.,.................................................................I have agreed and understood the same. I hereby solemnly affirm and declare that my signature appearing on my [PAN card/ Passport/ Driving licence ] (as shown below) is different from the signature as per the records of .....................................................................Bank (as shown below) Signature as per [PAN card/ Passport/Driving licence] (attach copy) That both signatures are appearing above are my signatures. I further declare that the signatures are valid and shall be binding on me. I also undertake to hold harmless and fully keep the Lender, its successors and assigns, its directors,officers, and agents indemnified and harmless from all such Borrower's Signature Signature as per Bank records/ Loan documents/Payment instruments losses, cost, damages, claims, penalty or expense if any which they may be put to due to the mismatch in my signatures/dual signatures, as set out aforesaid.`

      currentY = drawWrappedText(page, vernacularText, margin, currentY, pageWidth - 2 * margin, 12)

      return currentY - 20
    }

    // Helper to draw acknowledgment receipt
    const drawAcknowledgmentReceipt = (page: PDFPage, startY: number): number => {
      let currentY = startY

      page.drawRectangle({
        x: margin,
        y: currentY - 25,
        width: pageWidth - 2 * margin,
        height: 25,
        color: brandGreen,
      })

      page.drawText("Acknowledgment Receipt", {
        x: margin + 10,
        y: currentY - 18,
        size: headerFontSize,
        font: boldFont,
        color: white,
      })

      currentY -= 30

      const receiptData = [
        ["Application No.", applicationId],
        ["Date of Loan Agreement", currentDate.toLocaleDateString("en-IN")],
        ["Name of Borrower", data.fullName],
      ]

      // Draw receipt table
      const tableWidth = pageWidth - 2 * margin
      const col1Width = tableWidth * 0.5
      const col2Width = tableWidth * 0.5
      const cellPadding = 8
      const textLineHeight = 12

      for (let i = 0; i < receiptData.length; i++) {
        const [label, value] = receiptData[i]
        const isEvenRow = i % 2 === 0
        const sanitizedLabel = sanitizeText(label)
        const sanitizedValue = sanitizeText(String(value))

        const labelHeight = calculateWrappedTextHeight(
          sanitizedLabel,
          col1Width - 2 * cellPadding,
          textLineHeight,
          boldFont,
          fontSize,
        )
        const valueHeight = calculateWrappedTextHeight(
          sanitizedValue,
          col2Width - 2 * cellPadding,
          textLineHeight,
          font,
          fontSize,
        )

        const actualRowContentHeight = Math.max(labelHeight, valueHeight)
        const actualRowHeight = Math.max(actualRowContentHeight + 2 * cellPadding, 25) // Ensure minimum row height of 25

        page.drawRectangle({
          x: margin,
          y: currentY - actualRowHeight,
          width: tableWidth,
          height: actualRowHeight,
          color: isEvenRow ? lightGray : white,
          borderColor: darkGray,
          borderWidth: 0.5,
        })

        page.drawLine({
          start: { x: margin + col1Width, y: currentY },
          end: { x: margin + col1Width, y: currentY - actualRowHeight },
          color: darkGray,
          thickness: 0.5,
        })

        drawWrappedText(
          page,
          sanitizedLabel,
          margin + cellPadding,
          currentY - cellPadding,
          col1Width - 2 * cellPadding,
          textLineHeight,
          boldFont,
          fontSize,
        )

        drawWrappedText(
          page,
          sanitizedValue,
          margin + col1Width + cellPadding,
          currentY - cellPadding,
          col2Width - 2 * cellPadding,
          textLineHeight,
          font,
          fontSize,
        )

        currentY -= actualRowHeight
      }

      currentY -= 20

      const acknowledgmentText = `The Borrower acknowledges that the disbursal of the Facility is subject to credit policy of Sugali Finlease Private Limited (Lender). The Borrower acknowledges that he/ she has been provided with a copy of the loan agreement. The Borrower acknowledges and confirms that the Date of Birth given for the purpose of this loan application is the correct one and the same as per Borrowers aadhaar information.`

      currentY = drawWrappedText(page, acknowledgmentText, margin, currentY, pageWidth - 2 * margin, 12)

      return currentY - 20
    }

    // Helper to draw KYC section
    const drawKYCSection = (page: PDFPage, startY: number): number => {
      let currentY = startY
      const textLineHeight = 12

      // Aadhaar Offline e-KYC section
      page.drawRectangle({
        x: margin,
        y: currentY - 25,
        width: (pageWidth - 2 * margin) / 2 - 5,
        height: 25,
        color: darkGray,
      })

      page.drawText("Aadhaar Offline e-KYC", {
        x: margin + 10,
        y: currentY - 18,
        size: 12,
        font: boldFont,
        color: white,
      })

      // Offline e-KYC - Verified section
      page.drawRectangle({
        x: margin + (pageWidth - 2 * margin) / 2 + 5,
        y: currentY - 25,
        width: (pageWidth - 2 * margin) / 2 - 5,
        height: 25,
        color: darkGray,
      })

      page.drawText("Offline e-KYC - Verified", {
        x: margin + (pageWidth - 2 * margin) / 2 + 15,
        y: currentY - 18,
        size: 12,
        font: boldFont,
        color: white,
      })

      currentY -= 30

      // Proof of Identity section
      page.drawText("Proof of Identity", {
        x: margin,
        y: currentY,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      currentY -= 20

      const identityData = [
        ["Aadhaar Number", data.aadhaar],
        ["Name", data.fullName],
        ["Date of Birth", new Date(data.dob).toLocaleDateString("en-IN")],
        ["Gender", data.gender],
        ["Phone Number", data.phone],
        ["Email ID", data.email],
      ]

      for (const [label, value] of identityData) {
        page.drawText(`${sanitizeText(label)}:`, {
          x: margin,
          y: currentY,
          size: smallFontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        const valueStartX = margin + 120
        const valueMaxWidth = pageWidth - margin - valueStartX
        const newYAfterValue = drawWrappedText(
          page,
          String(value),
          valueStartX,
          currentY,
          valueMaxWidth,
          textLineHeight,
          font,
          smallFontSize,
        )

        const labelHeight = calculateWrappedTextHeight(
          `${sanitizeText(label)}:`,
          valueStartX - margin,
          textLineHeight,
          boldFont,
          smallFontSize,
        )
        const valueRenderedHeight = currentY - newYAfterValue
        const rowHeight = Math.max(labelHeight, valueRenderedHeight)

        currentY -= rowHeight + 5
      }

      currentY -= 5

      // Proof of Address section
      page.drawText("Proof of Address", {
        x: margin,
        y: currentY,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      currentY -= 20

      const addressData = [
        ["Care Of", "S/O, D/O, W/O"],
        ["House No.", "As per Aadhaar"],
        ["Street", data.permanentAddress.split(",")[0] || ""],
        ["Landmark", "As per Aadhaar"],
        ["Locality", data.permanentAddress],
        ["VTC", data.permanentDistrict],
        ["Sub District", data.permanentDistrict],
        ["District", data.permanentDistrict],
        ["State", data.permanentState],
        ["PIN Code", data.permanentPincode],
        ["Post Office", "As per PIN"],
      ]

      for (const [label, value] of addressData) {
        page.drawText(`${sanitizeText(label)}:`, {
          x: margin,
          y: currentY,
          size: smallFontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        const valueStartX = margin + 120
        const valueMaxWidth = pageWidth - margin - valueStartX
        const newYAfterValue = drawWrappedText(
          page,
          String(value),
          valueStartX,
          currentY,
          valueMaxWidth,
          textLineHeight,
          font,
          smallFontSize,
        )

        const labelHeight = calculateWrappedTextHeight(
          `${sanitizeText(label)}:`,
          valueStartX - margin,
          textLineHeight,
          boldFont,
          smallFontSize,
        )
        const valueRenderedHeight = currentY - newYAfterValue
        const rowHeight = Math.max(labelHeight, valueRenderedHeight)

        currentY -= rowHeight + 5
      }

      currentY -= 15

      const kycData = [
        ["Aadhaar Response Code", "Y"],
        ["Timestamp of Offline e-KYC", currentDate.toISOString()],
        ["Mode of Offline e-KYC", "OTP KYC"],
        ["Your eNACH has been generated.", ""],
        ["Mandate ID for the same is:", `MID${applicationId}`],
      ]

      for (const [label, value] of kycData) {
        page.drawText(sanitizeText(label), {
          x: margin,
          y: currentY,
          size: smallFontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        if (value) {
          const valueStartX = margin + 200
          const valueMaxWidth = pageWidth - margin - valueStartX
          const newYAfterValue = drawWrappedText(
            page,
            String(value),
            valueStartX,
            currentY,
            valueMaxWidth,
            textLineHeight,
            font,
            smallFontSize,
          )

          const labelHeight = calculateWrappedTextHeight(
            sanitizeText(label),
            valueStartX - margin,
            textLineHeight,
            boldFont,
            smallFontSize,
          )
          const valueRenderedHeight = currentY - newYAfterValue
          const rowHeight = Math.max(labelHeight, valueRenderedHeight)

          currentY -= rowHeight + 5
        } else {
          currentY -= textLineHeight + 5 // For lines without a value
        }
      }

      return currentY - 5
    }

    // Helper to draw signature sections
    const drawSignatureSection = (page: PDFPage, startY: number, title = "Signatures"): number => {
      let currentY = startY

      page.drawText(title, {
        x: margin,
        y: currentY,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      currentY -= 20

      // Signature boxes
      const boxWidth = (pageWidth - 2 * margin - 20) / 2
      const boxHeight = 60

      // Borrower signature
      page.drawRectangle({
        x: margin,
        y: currentY - boxHeight,
        width: boxWidth,
        height: boxHeight,
        color: white,
        borderColor: darkGray,
        borderWidth: 1,
      })

      page.drawText("Signed By:", {
        x: margin + 5,
        y: currentY - 15,
        size: smallFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      page.drawText(sanitizeText(data.fullName), {
        x: margin + 70,
        y: currentY - 15,
        size: smallFontSize,
        font,
        color: rgb(0, 0, 0),
      })

      // This line was already there, just ensure it's correct
      page.drawText("Signed On:", {
        x: margin + 5,
        y: currentY - 30,
        size: smallFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      page.drawText(currentDate.toLocaleDateString("en-IN"), {
        x: margin + 70,
        y: currentY - 30,
        size: smallFontSize,
        font,
        color: rgb(0, 0, 0),
      })

      page.drawText("Signature of the Borrower", {
        x: margin + 5,
        y: currentY - boxHeight + 5,
        size: smallFontSize,
        font,
        color: darkGray,
      })

      // Lender signature
      page.drawRectangle({
        x: margin + boxWidth + 20,
        y: currentY - boxHeight,
        width: boxWidth,
        height: boxHeight,
        color: white,
        borderColor: darkGray,
        borderWidth: 1,
      })

      page.drawText("Signed By:", {
        x: margin + boxWidth + 25,
        y: currentY - 15,
        size: smallFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      page.drawText("JP Ravi Murugappan Rao", {
        x: margin + boxWidth + 25 + 65, // Adjusted X for value
        y: currentY - 15,
        size: smallFontSize,
        font,
        color: rgb(0, 0, 0),
      })

      page.drawText("Signed On:", {
        x: margin + boxWidth + 25,
        y: currentY - 30,
        size: smallFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      page.drawText(currentDate.toLocaleDateString("en-IN"), {
        x: margin + boxWidth + 25 + 65, // Adjusted X for value
        y: currentY - 30,
        size: smallFontSize,
        font,
        color: rgb(0, 0, 0),
      })

      page.drawText("Signature of the Authorized Representative of the Lender", {
        x: margin + boxWidth + 25,
        y: currentY - boxHeight + 5,
        size: smallFontSize,
        font,
        color: darkGray,
      })

      return currentY - boxHeight - 5
    }

    // Helper to draw place and date section
    const drawPlaceDateSection = (page: PDFPage, startY: number): number => {
      const currentY = startY
      const boxWidth = (pageWidth - 2 * margin - 20) / 2
      const boxHeight = 30

      // Place
      page.drawText("Place:", {
        x: margin,
        y: currentY,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      page.drawRectangle({
        x: margin + 50,
        y: currentY - 20,
        width: boxWidth - 50,
        height: boxHeight,
        color: white,
        borderColor: darkGray,
        borderWidth: 1,
      })

      page.drawText("Nellore", {
        x: margin + 55,
        y: currentY - 10,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      })

      // Date
      page.drawText("Date:", {
        x: margin + boxWidth + 20,
        y: currentY,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      page.drawRectangle({
        x: margin + boxWidth + 70,
        y: currentY - 20,
        width: boxWidth - 50,
        height: boxHeight,
        color: white,
        borderColor: darkGray,
        borderWidth: 1,
      })

      page.drawText(currentDate.toLocaleDateString("en-IN"), {
        x: margin + boxWidth + 75,
        y: currentY - 10,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      })

      return currentY - 15
    }

    // Embed photo if available
    let photoImage = null
    if (photoBuffer) {
      try {
        if (photo?.type.includes("png")) {
          photoImage = await pdfDoc.embedPng(photoBuffer)
        } else {
          photoImage = await pdfDoc.embedJpg(photoBuffer)
        }
      } catch (error) {
        console.error("Error embedding photo:", error)
      }
    }

    // Check if current address is same as permanent
    const isSameAddress =
      data.currentAddress === data.permanentAddress &&
      data.currentDistrict === data.permanentDistrict &&
      data.currentState === data.permanentState &&
      data.currentPincode === data.permanentPincode

    // Page 1: Personal Details
    const page1 = pdfDoc.addPage([pageWidth, pageHeight])
    let currentY = addBrandHeader(page1)

    currentY = drawTable(page1, currentY, "Personal Details", [
      ["Full Name", data.fullName],
      ["Date of Birth", new Date(data.dob).toLocaleDateString("en-IN")],
      ["Gender", data.gender],
      ["Phone Number", data.phone],
      ["Email Address", data.email],
      ["Aadhaar Number", data.aadhaar],
      ["PAN Number", data.pan.toUpperCase()],
    ])

    if (photoImage) {
      try {
        const photoDims = photoImage.scale(0.3) // Adjust scale as needed
        const photoX = (pageWidth - photoDims.width) / 2 // Center the photo
        const photoY = currentY - photoDims.height - 10 // Place below table with some margin

        page1.drawRectangle({
          x: photoX - 5,
          y: photoY - 5,
          width: photoDims.width + 10,
          height: photoDims.height + 10,
          color: white,
          borderColor: brandBlue,
          borderWidth: 2,
        })

        page1.drawImage(photoImage, {
          x: photoX,
          y: photoY,
          width: photoDims.width,
          height: photoDims.height,
        })

        page1.drawText("Applicant Photo", {
          x: photoX,
          y: photoY - 20,
          size: 8,
          font,
          color: darkGray,
        })

        currentY = photoY - 30 // Update currentY after placing photo
      } catch (error) {
        console.error("Error adding photo after table:", error)
      }
    }

    // Add additional information to fill space
    currentY = drawAdditionalLoanInfo(page1, currentY)

    // Page 2: Address & Employment
    const page2 = pdfDoc.addPage([pageWidth, pageHeight])
    currentY = addBrandHeader(page2)

    currentY = drawTable(page2, currentY, "Permanent Address", [
      ["Street Address", data.permanentAddress],
      ["District", data.permanentDistrict],
      ["State", data.permanentState],
      ["Pincode", data.permanentPincode],
    ])

    currentY = drawTable(page2, currentY, "Current Address", [
      ["Street Address", isSameAddress ? "Same as Permanent Address" : data.currentAddress],
      ["District", isSameAddress ? "Same as Permanent Address" : data.currentDistrict],
      ["State", isSameAddress ? "Same as Permanent Address" : data.currentState],
      ["Pincode", isSameAddress ? "Same as Permanent Address" : data.currentPincode],
    ])

    currentY = drawTable(page2, currentY, "Employment Details", [
      ["Employment Type", data.employmentType],
      ["Monthly Income", `Rs. ${Number.parseFloat(data.income).toLocaleString("en-IN")}`],
      ["Company Name", data.companyName],
    ])

    // Page 3: Loan & Bank Details
    const page3 = pdfDoc.addPage([pageWidth, pageHeight])
    currentY = addBrandHeader(page3)

    currentY = drawTable(page3, currentY, "Loan Details", [
      ["Loan Amount", `Rs. ${Number.parseFloat(data.loanAmount).toLocaleString("en-IN")}`],
      ["Tenure", `${data.tenure} months`],
      ["Interest Rate", `${data.interestRate}% per annum`],
      ["Loan Purpose", data.purpose],
    ])

    currentY = drawTable(page3, currentY, "Bank Details", [
      ["Bank Name", data.bankName],
      ["IFSC Code", data.ifsc.toUpperCase()],
      ["Account Number", data.accountNumber],
    ])

    // Add loan calculation breakdown to fill space
    currentY = drawLoanCalculations(page3, currentY)

    // Page 4: References & Borrower Covenants
    const page4 = pdfDoc.addPage([pageWidth, pageHeight])
    currentY = addBrandHeader(page4)

    // References table
    page4.drawRectangle({
      x: margin,
      y: currentY - 25,
      width: pageWidth - 2 * margin,
      height: 25,
      color: brandGreen,
    })

    page4.drawText("Personal References", {
      x: margin + 10,
      y: currentY - 18,
      size: headerFontSize,
      font: boldFont,
      color: white,
    })

    currentY -= 30

    const tableWidth = pageWidth - 2 * margin
    const rowHeight = 20
    const colWidth = tableWidth / 4
    const cellPadding = 8
    const textLineHeight = 12

    // Table headers
    const headers = ["Reference", "Name", "Phone", "Relationship"]
    page4.drawRectangle({
      x: margin,
      y: currentY - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: brandBlue,
    })

    for (let i = 0; i < headers.length; i++) {
      page4.drawText(headers[i], {
        x: margin + i * colWidth + 8,
        y: currentY - 16,
        size: fontSize,
        font: boldFont,
        color: white,
      })

      if (i < headers.length - 1) {
        page4.drawLine({
          start: { x: margin + (i + 1) * colWidth, y: currentY },
          end: { x: margin + (i + 1) * colWidth, y: currentY - rowHeight },
          color: white,
          thickness: 0.5,
        })
      }
    }

    currentY -= rowHeight

    // Reference data
    const references = [
      ["Reference 1", data.reference1Name, data.reference1Phone, data.reference1Relation],
      ["Reference 2", data.reference2Name, data.reference2Phone, data.reference2Relation],
    ]

    for (let i = 0; i < references.length; i++) {
      const [refLabel, name, phone, relation] = references[i]
      const isEvenRow = i % 2 === 0

      const refLabelHeight = calculateWrappedTextHeight(
        refLabel,
        colWidth - 2 * cellPadding,
        textLineHeight,
        boldFont,
        fontSize,
      )
      const nameHeight = calculateWrappedTextHeight(name, colWidth - 2 * cellPadding, textLineHeight, font, fontSize)
      const phoneHeight = calculateWrappedTextHeight(phone, colWidth - 2 * cellPadding, textLineHeight, font, fontSize)
      const relationHeight = calculateWrappedTextHeight(
        relation,
        colWidth - 2 * cellPadding,
        textLineHeight,
        font,
        fontSize,
      )

      const actualRowContentHeight = Math.max(refLabelHeight, nameHeight, phoneHeight, relationHeight)
      const actualRowHeight = Math.max(actualRowContentHeight + 2 * cellPadding, 20)

      page4.drawRectangle({
        x: margin,
        y: currentY - actualRowHeight,
        width: tableWidth,
        height: actualRowHeight,
        color: isEvenRow ? lightGray : white,
        borderColor: darkGray,
        borderWidth: 0.5,
      })

      // Draw column separators for this row
      for (let j = 0; j < headers.length - 1; j++) {
        page4.drawLine({
          start: { x: margin + (j + 1) * colWidth, y: currentY },
          end: { x: margin + (j + 1) * colWidth, y: currentY - actualRowHeight },
          color: darkGray,
          thickness: 0.5,
        })
      }

      // Draw cell content
      drawWrappedText(
        page4,
        refLabel,
        margin + cellPadding,
        currentY - cellPadding,
        colWidth - 2 * cellPadding,
        textLineHeight,
        boldFont,
        fontSize,
      )

      drawWrappedText(
        page4,
        name,
        margin + colWidth + cellPadding,
        currentY - cellPadding,
        colWidth - 2 * cellPadding,
        textLineHeight,
        font,
        fontSize,
      )

      drawWrappedText(
        page4,
        phone,
        margin + 2 * colWidth + cellPadding,
        currentY - cellPadding,
        colWidth - 2 * cellPadding,
        textLineHeight,
        font,
        fontSize,
      )

      drawWrappedText(
        page4,
        relation,
        margin + 3 * colWidth + cellPadding,
        currentY - cellPadding,
        colWidth - 2 * cellPadding,
        textLineHeight,
        font,
        fontSize,
      )

      currentY -= actualRowHeight
    }

    // Add Borrower Covenants section to fill remaining space
    currentY = drawBorrowerCovenants(page4, currentY - 20)

    // Page 5: Sanction Agreement
    const page5 = pdfDoc.addPage([pageWidth, pageHeight])
    currentY = addBrandHeader(page5)
    currentY = drawSanctionAgreement(page5, currentY)

    // Page 6: Terms and Conditions
    const page6 = pdfDoc.addPage([pageWidth, pageHeight])
    currentY = addBrandHeader(page6)
    currentY = drawTermsAndConditions(page6, currentY)
    currentY = drawSignatureSection(page6, currentY, "Agreement Signatures")

    // Page 7: Declaration
    const page7 = pdfDoc.addPage([pageWidth, pageHeight])
    currentY = addBrandHeader(page7)
    currentY = drawDeclaration(page7, currentY)

    // Page 8: Vernacular Declaration & Acknowledgment
    const page8 = pdfDoc.addPage([pageWidth, pageHeight])
    currentY = addBrandHeader(page8)
    currentY = drawVernacularDeclaration(page8, currentY)
    currentY = drawSignatureSection(page8, currentY, "Vernacular Declaration Signatures")

    // Page 9: Acknowledgment Receipt
    const page9 = pdfDoc.addPage([pageWidth, pageHeight])
    currentY = addBrandHeader(page9)
    currentY = drawAcknowledgmentReceipt(page9, currentY)
    currentY = drawSignatureSection(page9, currentY, "Acknowledgment Signatures")

    // Page 10: KYC Section
    const page10 = pdfDoc.addPage([pageWidth, pageHeight])
    currentY = addBrandHeader(page10)
    currentY = drawKYCSection(page10, currentY)

    // Final page: Place, Date and Contact Info
    currentY = drawPlaceDateSection(page10, currentY)

    // Company contact information
    page10.drawText("MONEY RAPID LOAN", {
      x: margin,
      y: currentY - 10,
      size: 12,
      font: boldFont,
      color: brandBlue,
    })

    page10.drawText("NSR Venue, Nellore, India, Andhra Pradesh", {
      x: margin,
      y: currentY - 25,
      size: smallFontSize,
      font,
      color: rgb(0, 0, 0),
    })

    page10.drawText("Ph - +91 9038143289, Email - moneyrapidloan@gmail.com", {
      x: margin,
      y: currentY - 40,
      size: smallFontSize,
      font,
      color: rgb(0, 0, 0),
    })

    // Footer
    page10.drawText("This is a system generated document.", {
      x: margin,
      y: 35,
      size: smallFontSize,
      font,
      color: darkGray,
    })

    page10.drawText(`Generated on: ${currentDate.toLocaleString("en-IN")}`, {
      x: margin,
      y: 20,
      size: smallFontSize,
      font,
      color: darkGray,
    })

    page10.drawText(`Application ID: ${applicationId}`, {
      x: pageWidth - 200,
      y: 20,
      size: smallFontSize,
      font: boldFont,
      color: brandBlue,
    })

    const pdfBuffer = Buffer.from(await pdfDoc.save())

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_EMAIL_PASS,
      },
    })

    // Calculate EMI for email
    const calculateEMI = (principal: number, rate: number, time: number) => {
      const r = rate / 12 / 100
      const n = time
      const num = principal * r * Math.pow(1 + r, n)
      const den = Math.pow(1 + r, n) - 1
      return num / den
    }

    const emi = calculateEMI(
      Number.parseFloat(data.loanAmount),
      Number.parseFloat(data.interestRate),
      Number.parseInt(data.tenure),
    )

    const emailSubject = `🏦 New Loan Application - ${data.fullName} | ${applicationId}`
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .info-item { background: #f8fafc; padding: 10px; border-radius: 5px; }
        .info-label { font-weight: bold; color: #374151; }
        .info-value { color: #1f2937; }
        .highlight { background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
        .amount { font-size: 18px; font-weight: bold; color: #059669; }
    </style>
</head>
<body>
    <div class="header">
        <h1>💰 MONEY RAPID LOAN</h1>
        <h2>New Loan Application Received</h2>
        <p>Application ID: <strong>${applicationId}</strong></p>
    </div>
            
    <div class="content">
        <div class="highlight">
            <h3>🎯 Quick Summary</h3>
            <div class="info-grid">
                <div><span class="info-label">Applicant:</span> <span class="info-value">${data.fullName}</span></div>
                <div><span class="info-label">Phone:</span> <span class="info-value">${data.phone}</span></div>
                <div><span class="info-label">Email:</span> <span class="info-value">${data.email}</span></div>
                <div><span class="info-label">Loan Amount:</span> <span class="amount">₹${Number.parseFloat(data.loanAmount).toLocaleString("en-IN")}</span></div>
            </div>
        </div>

        <div class="section">
            <h3>👤 Personal Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Full Name</div>
                    <div class="info-value">${data.fullName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Date of Birth</div>
                    <div class="info-value">${new Date(data.dob).toLocaleDateString("en-IN")}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Gender</div>
                    <div class="info-value">${data.gender}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Aadhaar</div>
                    <div class="info-value">${data.aadhaar}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">PAN</div>
                    <div class="info-value">${data.pan.toUpperCase()}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>🏠 Address Information</h3>
            <div class="info-item" style="margin-bottom: 10px;">
                <div class="info-label">Permanent Address</div>
                <div class="info-value">${data.permanentAddress}<br>
                ${data.permanentDistrict}, ${data.permanentState} - ${data.permanentPincode}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Current Address</div>
                <div class="info-value">${
                  isSameAddress
                    ? "Same as Permanent Address"
                    : `${data.currentAddress}<br>${data.currentDistrict}, ${data.currentState} - ${data.currentPincode}`
                }</div>
            </div>
        </div>

        <div class="section">
            <h3>💼 Employment Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Employment Type</div>
                    <div class="info-value">${data.employmentType}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Monthly Income</div>
                    <div class="info-value">₹${Number.parseFloat(data.income).toLocaleString("en-IN")}</div>
                </div>
                <div class="info-item" style="grid-column: span 2;">
                    <div class="info-label">Company Name</div>
                    <div class="info-value">${data.companyName}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>💰 Loan Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Loan Amount</div>
                    <div class="info-value amount">₹${Number.parseFloat(data.loanAmount).toLocaleString("en-IN")}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Tenure</div>
                    <div class="info-value">${data.tenure} months</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Interest Rate</div>
                    <div class="info-value">${data.interestRate}% per annum</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Monthly EMI</div>
                    <div class="info-value amount">₹${emi.toLocaleString("en-IN")}</div>
                </div>
                <div class="info-item" style="grid-column: span 2;">
                    <div class="info-label">Loan Purpose</div>
                    <div class="info-value">${data.purpose}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>🏦 Bank Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Bank Name</div>
                    <div class="info-value">${data.bankName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">IFSC Code</div>
                    <div class="info-value">${data.ifsc.toUpperCase()}</div>
                </div>
                <div class="info-item" style="grid-column: span 2;">
                    <div class="info-label">Account Number</div>
                    <div class="info-value">${data.accountNumber}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>👥 References</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Reference 1</div>
                    <div class="info-value">
                        <strong>${data.reference1Name}</strong><br>
                        ${data.reference1Phone}<br>
                        <em>${data.reference1Relation}</em>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Reference 2</div>
                    <div class="info-value">
                        <strong>${data.reference2Name}</strong><br>
                        ${data.reference2Phone}<br>
                        <em>${data.reference2Relation}</em>
                    </div>
                </div>
            </div>
        </div>

        <div class="highlight">
            <h3>📋 Next Steps</h3>
            <ul>
                <li>Review the attached PDF for complete application details</li>
                <li>Verify applicant documents and information</li>
                <li>Contact applicant for any clarifications needed</li>
                <li>Process loan approval based on company policies</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p>Application submitted on: ${currentDate.toLocaleString("en-IN")}</p>
        <p>This is an automated email from Money Rapid Loan application system.</p>
        ${photo ? "<p>📷 Applicant photo is included in the PDF attachment.</p>" : "<p>⚠️ No photo was provided by the applicant.</p>"}
    </div>
</body>
</html>
`

    // Define email options
    const mailOptions = {
      from: `"Money Rapid Loan System" <${process.env.COMPANY_EMAIL }>`,
      to: "moneyrapidloan@gmail.com",
      subject: emailSubject,
      html: emailHtml,
      attachments: [
        {
          filename: `Loan_Application_${data.fullName}_${applicationId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    }

    // Send email
    try {
      await transporter.sendMail(mailOptions)
      console.log("Email sent successfully")
    } catch (error) {
      console.error("Error sending email:", error)
      return NextResponse.json({ message: "Error sending email", error }, { status: 500 })
    }

    return NextResponse.json({ message: "Loan application submitted successfully!", applicationId }, { status: 200 })
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error("Error processing loan application:", error.message)
  } else {
    console.error("Unexpected error:", error)
  }
}
}
