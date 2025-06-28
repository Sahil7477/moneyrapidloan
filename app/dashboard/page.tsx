"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  MapPin,
  Briefcase,
  CreditCard,
  Building2,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  FileText,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
} from "lucide-react"

interface LoanFormData {
  fullName: string
  dob: string
  gender: string
  phone: string
  email: string
  aadhaar: string
  pan: string
  permanentAddress: string
  currentAddress: string
  employmentType: string
  income: string
  companyName: string
  loanAmount: string
  tenure: string
  interestRate: string
  purpose: string
  bankName: string
  ifsc: string
  accountNumber: string
}

const initialFormData: LoanFormData = {
  fullName: "",
  dob: "",
  gender: "",
  phone: "",
  email: "",
  aadhaar: "",
  pan: "",
  permanentAddress: "",
  currentAddress: "",
  employmentType: "",
  income: "",
  companyName: "",
  loanAmount: "",
  tenure: "",
  interestRate: "",
  purpose: "",
  bankName: "",
  ifsc: "",
  accountNumber: "",
}

const steps = [
  { id: 1, title: "Personal Details", icon: User, description: "Basic information about you" },
  { id: 2, title: "Address & Employment", icon: MapPin, description: "Your address and work details" },
  { id: 3, title: "Loan Details", icon: CreditCard, description: "Loan amount and terms" },
  { id: 4, title: "Bank Details", icon: Building2, description: "Your banking information" },
  { id: 5, title: "Review & Submit", icon: CheckCircle, description: "Review and confirm your application" },
]

export default function MultiStepLoanForm() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialFormData)

  const handleChange = (key: keyof LoanFormData, value: string) => {
    setForm({ ...form, [key]: value })
  }

  const next = () => setStep((s) => Math.min(s + 1, 5))
  const prev = () => setStep((s) => Math.max(s - 1, 1))

  const calculateEMI = () => {
    const P = Number.parseFloat(form.loanAmount)
    const r = Number.parseFloat(form.interestRate) / 12 / 100
    const n = Number.parseInt(form.tenure)
    if (isNaN(P) || isNaN(r) || isNaN(n)) return 0
    return Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
  }

  const processingFee = () => {
    const fee = Number.parseFloat(form.loanAmount) * 0.015
    return isNaN(fee) ? 0 : Math.round(fee)
  }

  const totalPayable = () => {
    const emi = calculateEMI()
    const tenure = Number.parseInt(form.tenure)
    return isNaN(emi) || isNaN(tenure) ? 0 : emi * tenure
  }

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/submit-loan", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          emi: calculateEMI(),
          fee: processingFee(),
          totalPayable: totalPayable(),
        }),
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) alert("Application submitted successfully! ✅")
      else alert("Failed to submit application ❌")
    } catch (error) {
      console.error("Submission error:", error)
    }
  }

  const progress = (step / 5) * 100
  const currentStep = steps.find((s) => s.id === step)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Loan Application</h1>
          <p className="text-gray-600">Complete your loan application in simple steps</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {currentStep && <currentStep.icon className="h-5 w-5 text-blue-600" />}
                <span className="font-semibold text-gray-900">{currentStep?.title}</span>
              </div>
              <Badge variant="secondary">Step {step} of 5</Badge>
            </div>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-gray-600">{currentStep?.description}</p>
          </CardContent>
        </Card>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${step >= s.id ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-400"}
                `}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                {s.id < 5 && <div className={`w-12 h-0.5 mx-2 ${step > s.id ? "bg-blue-600" : "bg-gray-300"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {currentStep && <currentStep.icon className="h-6 w-6 text-blue-600" />}
              <span>{currentStep?.title}</span>
            </CardTitle>
            <CardDescription>{currentStep?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Full Name</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Date of Birth</span>
                  </Label>
                  <Input id="dob" type="date" value={form.dob} onChange={(e) => handleChange("dob", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select onValueChange={(val) => handleChange("gender", val)} value={form.gender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone Number</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhaar" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Aadhaar Number</span>
                  </Label>
                  <Input
                    id="aadhaar"
                    placeholder="Enter Aadhaar number"
                    value={form.aadhaar}
                    onChange={(e) => handleChange("aadhaar", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input
                    id="pan"
                    placeholder="Enter PAN number"
                    value={form.pan}
                    onChange={(e) => handleChange("pan", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="permanentAddress" className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Permanent Address</span>
                  </Label>
                  <Textarea
                    id="permanentAddress"
                    placeholder="Enter your permanent address"
                    value={form.permanentAddress}
                    onChange={(e) => handleChange("permanentAddress", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentAddress">Current Address</Label>
                  <Textarea
                    id="currentAddress"
                    placeholder="Enter your current address"
                    value={form.currentAddress}
                    onChange={(e) => handleChange("currentAddress", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Employment Type</span>
                    </Label>
                    <Select onValueChange={(val) => handleChange("employmentType", val)} value={form.employmentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Salaried">Salaried</SelectItem>
                        <SelectItem value="Self-employed">Self-employed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income" className="flex items-center space-x-2">
                      <IndianRupee className="h-4 w-4" />
                      <span>Monthly Income</span>
                    </Label>
                    <Input
                      id="income"
                      placeholder="Enter monthly income"
                      value={form.income}
                      onChange={(e) => handleChange("income", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter company name"
                    value={form.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount" className="flex items-center space-x-2">
                      <IndianRupee className="h-4 w-4" />
                      <span>Loan Amount</span>
                    </Label>
                    <Input
                      id="loanAmount"
                      placeholder="Enter loan amount"
                      value={form.loanAmount}
                      onChange={(e) => handleChange("loanAmount", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenure">Tenure (months)</Label>
                    <Input
                      id="tenure"
                      placeholder="Enter tenure in months"
                      value={form.tenure}
                      onChange={(e) => handleChange("tenure", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      placeholder="e.g., 12"
                      value={form.interestRate}
                      onChange={(e) => handleChange("interestRate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Loan Purpose</Label>
                    <Input
                      id="purpose"
                      placeholder="Enter loan purpose"
                      value={form.purpose}
                      onChange={(e) => handleChange("purpose", e.target.value)}
                    />
                  </div>
                </div>

                {/* EMI Calculator Preview */}
                {form.loanAmount && form.tenure && form.interestRate && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">EMI Calculation</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Monthly EMI:</span>
                          <p className="font-semibold text-blue-900">₹{calculateEMI().toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Processing Fee:</span>
                          <p className="font-semibold text-blue-900">₹{processingFee().toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>Bank Name</span>
                  </Label>
                  <Input
                    id="bankName"
                    placeholder="Enter bank name"
                    value={form.bankName}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    placeholder="Enter IFSC code"
                    value={form.ifsc}
                    onChange={(e) => handleChange("ifsc", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter account number"
                    value={form.accountNumber}
                    onChange={(e) => handleChange("accountNumber", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Application</h2>
                  <p className="text-gray-600">Please review all details before submitting</p>
                </div>

                {/* Loan Summary */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Loan Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Loan Amount</p>
                        <p className="text-xl font-bold text-blue-900">
                          ₹{Number.parseFloat(form.loanAmount || "0").toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Monthly EMI</p>
                        <p className="text-xl font-bold text-blue-900">₹{calculateEMI().toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Processing Fee</p>
                        <p className="text-xl font-bold text-blue-900">₹{processingFee().toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Payable</p>
                        <p className="text-xl font-bold text-blue-900">₹{totalPayable().toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Application Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{form.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{form.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{form.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employment:</span>
                        <span className="font-medium">{form.employmentType}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Loan Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purpose:</span>
                        <span className="font-medium">{form.purpose}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tenure:</span>
                        <span className="font-medium">{form.tenure} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interest Rate:</span>
                        <span className="font-medium">{form.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">{form.bankName}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Submit Application
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prev}
            disabled={step === 1}
            className="flex items-center space-x-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {step < 5 && (
            <Button onClick={next} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
