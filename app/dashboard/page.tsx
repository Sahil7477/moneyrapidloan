"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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
  Upload,
  X,
  Users,
  Camera,
} from "lucide-react"
import Image from "next/image"

interface LoanFormData {
  fullName: string
  dob: string
  gender: string
  phone: string
  email: string
  aadhaar: string
  pan: string
  photo: File | null
  permanentAddress: string
  permanentDistrict: string
  permanentState: string
  permanentPincode: string
  currentAddress: string
  currentDistrict: string
  currentState: string
  currentPincode: string
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
  reference1Name: string
  reference1Phone: string
  reference1Relation: string
  reference2Name: string
  reference2Phone: string
  reference2Relation: string
}

interface ValidationErrors {
  [key: string]: string
}

const initialFormData: LoanFormData = {
  fullName: "",
  dob: "",
  gender: "",
  phone: "",
  email: "",
  aadhaar: "",
  pan: "",
  photo: null,
  permanentAddress: "",
  permanentDistrict: "",
  permanentState: "",
  permanentPincode: "",
  currentAddress: "",
  currentDistrict: "",
  currentState: "",
  currentPincode: "",
  employmentType: "",
  income: "",
  companyName: "",
  loanAmount: "",
  tenure: "",
  interestRate: "5.9",
  purpose: "",
  bankName: "",
  ifsc: "",
  accountNumber: "",
  reference1Name: "",
  reference1Phone: "",
  reference1Relation: "",
  reference2Name: "",
  reference2Phone: "",
  reference2Relation: "",
}

const steps = [
  { id: 1, title: "Personal Details", icon: User, description: "Basic information and photo" },
  { id: 2, title: "Address & Employment", icon: MapPin, description: "Your address and work details" },
  { id: 3, title: "Loan Details", icon: CreditCard, description: "Loan amount and terms" },
  { id: 4, title: "Bank Details", icon: Building2, description: "Your banking information" },
  { id: 5, title: "References", icon: Users, description: "Personal references" },
  { id: 6, title: "Review & Submit", icon: CheckCircle, description: "Review and confirm your application" },
]

const requiredFieldsByStep = {
  1: ["fullName", "dob", "gender", "phone", "email", "aadhaar", "pan", "photo"],
  2: [
    "permanentAddress",
    "permanentDistrict",
    "permanentState",
    "permanentPincode",
    "currentAddress",
    "currentDistrict",
    "currentState",
    "currentPincode",
    "employmentType",
    "income",
    "companyName",
  ],
  3: ["loanAmount", "tenure", "interestRate", "purpose"],
  4: ["bankName", "ifsc", "accountNumber"],
  5: [
    "reference1Name",
    "reference1Phone",
    "reference1Relation",
    "reference2Name",
    "reference2Phone",
    "reference2Relation",
  ],
}

export default function MultiStepLoanForm() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialFormData)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [sameAsPermament, setSameAsPermament] = useState(false)

  useEffect(() => {
    if (sameAsPermament) {
      setForm((prevForm) => ({
        ...prevForm,
        currentAddress: prevForm.permanentAddress,
        currentDistrict: prevForm.permanentDistrict,
        currentState: prevForm.permanentState,
        currentPincode: prevForm.permanentPincode,
      }))
    }
  }, [sameAsPermament, form.permanentAddress, form.permanentDistrict, form.permanentState, form.permanentPincode])

  const handleChange = (key: keyof LoanFormData, value: string | File | null) => {
    setForm({ ...form, [key]: value })
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: "" })
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, photo: "Please upload a valid image file" })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, photo: "Image size should be less than 5MB" })
        return
      }

      handleChange("photo", file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    handleChange("photo", null)
    setPhotoPreview(null)
  }

  const validateStep = (stepNumber: number): boolean => {
    const requiredFields = requiredFieldsByStep[stepNumber as keyof typeof requiredFieldsByStep]
    const newErrors: ValidationErrors = {}
    let isValid = true

    requiredFields.forEach((field) => {
      if (field === "photo") {
        if (!form.photo) {
          newErrors.photo = "Please upload your photo"
          isValid = false
        }
      } else if (
        !form[field as keyof LoanFormData] ||
        (typeof form[field as keyof LoanFormData] === "string" && !(form[field as keyof LoanFormData] as string).trim())
      ) {
        newErrors[field] = "This field is required"
        isValid = false
      }
    })

    // Additional validations
    if (stepNumber === 1) {
      // Email validation
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = "Please enter a valid email address"
        isValid = false
      }

      // Phone validation
      if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) {
        newErrors.phone = "Please enter a valid 10-digit phone number"
        isValid = false
      }

      // Aadhaar validation
      if (form.aadhaar && !/^\d{12}$/.test(form.aadhaar.replace(/\D/g, ""))) {
        newErrors.aadhaar = "Please enter a valid 12-digit Aadhaar number"
        isValid = false
      }

      // PAN validation
      if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan.toUpperCase())) {
        newErrors.pan = "Please enter a valid PAN number (e.g., ABCDE1234F)"
        isValid = false
      }
    }

    if (stepNumber === 2) {
      // Income validation
      if (form.income && isNaN(Number(form.income))) {
        newErrors.income = "Please enter a valid income amount"
        isValid = false
      }

      // Pincode validation
      if (form.permanentPincode && !/^\d{6}$/.test(form.permanentPincode)) {
        newErrors.permanentPincode = "Please enter a valid 6-digit pincode"
        isValid = false
      }
      if (form.currentPincode && !/^\d{6}$/.test(form.currentPincode)) {
        newErrors.currentPincode = "Please enter a valid 6-digit pincode"
        isValid = false
      }
    }

    if (stepNumber === 3) {
      // Loan amount validation
      if (form.loanAmount && (isNaN(Number(form.loanAmount)) || Number(form.loanAmount) <= 0)) {
        newErrors.loanAmount = "Please enter a valid loan amount"
        isValid = false
      }

      // Tenure validation
      if (form.tenure && (isNaN(Number(form.tenure)) || Number(form.tenure) <= 0)) {
        newErrors.tenure = "Please enter a valid tenure in months"
        isValid = false
      }

      // Interest rate validation
      if (form.interestRate && (isNaN(Number(form.interestRate)) || Number(form.interestRate) <= 0)) {
        newErrors.interestRate = "Please enter a valid interest rate"
        isValid = false
      }
    }

    if (stepNumber === 4) {
      // IFSC validation
      if (form.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.toUpperCase())) {
        newErrors.ifsc = "Please enter a valid IFSC code"
        isValid = false
      }

      // Account number validation
      if (form.accountNumber && !/^\d{9,18}$/.test(form.accountNumber)) {
        newErrors.accountNumber = "Please enter a valid account number"
        isValid = false
      }
    }

    if (stepNumber === 5) {
      // Reference phone validation
      if (form.reference1Phone && !/^\d{10}$/.test(form.reference1Phone.replace(/\D/g, ""))) {
        newErrors.reference1Phone = "Please enter a valid 10-digit phone number"
        isValid = false
      }
      if (form.reference2Phone && !/^\d{10}$/.test(form.reference2Phone.replace(/\D/g, ""))) {
        newErrors.reference2Phone = "Please enter a valid 10-digit phone number"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const next = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 6))
      toast.success("Step completed successfully!")
    } else {
      toast.error("Please fill in all required fields correctly")
    }
  }

  const prev = () => setStep((s) => Math.max(s - 1, 1))

  const calculateEMI = () => {
    const P = Number.parseFloat(form.loanAmount)
    const r = 5.9/ 12 / 100
    const n = Number.parseInt(form.tenure)
    if (isNaN(P) || isNaN(r) || isNaN(n)) return 0
    return Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
  }

  const processingFee = () => 3200

  const totalPayable = () => {
    const emi = calculateEMI()
    const tenure = Number.parseInt(form.tenure)
    return isNaN(emi) || isNaN(tenure) ? 0 : emi * tenure
  }

  const router = useRouter()

  const handleSubmit = async () => {
    try {
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(form).forEach(([key, value]) => {
        if (key === "photo" && value instanceof File) {
          formData.append(key, value)
        } else if (typeof value === "string") {
          formData.append(key, value)
        }
      })

      const res = await fetch("/api/submit-loan", {
        method: "POST",
        body: formData,
      })

      // Check if response is ok before trying to parse JSON
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const contentType = res.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
         await res.json()
        toast.success(
          "🎉 Thank you. Your Loan application has been submitted. We will review it and connect with you. Visit our website.",
        )
        // Wait 2 seconds, then redirect to blank thank-you page
        setTimeout(() => {
          router.push("/thank-you")
        }, 2000)
      } else {
        // Handle non-JSON response
        toast.success(
          "🎉 Thank you. Your Loan application has been submitted. We will review it and connect with you. Visit our website.",
        )
        setTimeout(() => {
          router.push("/thank-you")
        }, 2000)
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Something went wrong while submitting the form.")
    }
  }

  const progress = (step / 6) * 100
  const currentStep = steps.find((s) => s.id === step)

  const renderInput = (
    key: keyof LoanFormData,
    label: string,
    placeholder: string,
    type = "text",
    icon?: React.ComponentType<{ className?: string }>,
  ) => {
    const Icon = icon
    return (
      <div className="space-y-2">
        <Label htmlFor={key} className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4" />}
          <span>
            {label} <span className="text-red-500">*</span>
          </span>
        </Label>
        <Input
          id={key}
          type={type}
          placeholder={placeholder}
          value={form[key] as string}
          onChange={(e) => handleChange(key, e.target.value)}
          className={errors[key] ? "border-red-500 focus:border-red-500" : ""}
        />
        {errors[key] && <p className="text-red-500 text-sm">{errors[key]}</p>}
      </div>
    )
  }

  const renderSelect = (
    key: keyof LoanFormData,
    label: string,
    placeholder: string,
    options: { value: string; label: string }[],
    icon?: React.ComponentType<{ className?: string }>,
  ) => {
    const Icon = icon
    return (
      <div className="space-y-2">
        <Label className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4" />}
          <span>
            {label} <span className="text-red-500">*</span>
          </span>
        </Label>
        <Select onValueChange={(val) => handleChange(key, val)} value={form[key] as string}>
          <SelectTrigger className={errors[key] ? "border-red-500 focus:border-red-500" : ""}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors[key] && <p className="text-red-500 text-sm">{errors[key]}</p>}
      </div>
    )
  }

  const renderTextarea = (
    key: keyof LoanFormData,
    label: string,
    placeholder: string,
    icon?: React.ComponentType<{ className?: string }>,
  ) => {
    const Icon = icon
    return (
      <div className="space-y-2">
        <Label htmlFor={key} className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4" />}
          <span>
            {label} <span className="text-red-500">*</span>
          </span>
        </Label>
        <Textarea
          id={key}
          placeholder={placeholder}
          value={form[key] as string}
          onChange={(e) => handleChange(key, e.target.value)}
          className={errors[key] ? "border-red-500 focus:border-red-500" : ""}
        />
        {errors[key] && <p className="text-red-500 text-sm">{errors[key]}</p>}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Loan Application</h1>
          <p className="text-gray-600">Complete your loan application in simple steps</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {currentStep && <currentStep.icon className="h-5 w-5 text-blue-600" />}
                <span className="font-semibold text-gray-900">{currentStep?.title}</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Step {step} of 6
              </Badge>
            </div>
            <Progress value={progress} className="mb-2 h-2" />
            <p className="text-sm text-gray-600">{currentStep?.description}</p>
          </CardContent>
        </Card>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center flex-shrink-0">
                <div
                  className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${step >= s.id ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-110" : "bg-white border-gray-300 text-gray-400"}
                `}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                {s.id < 6 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${step > s.id ? "bg-blue-600" : "bg-gray-300"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center space-x-2">
              {currentStep && <currentStep.icon className="h-6 w-6 text-blue-600" />}
              <span>{currentStep?.title}</span>
            </CardTitle>
            <CardDescription>{currentStep?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput("fullName", "Full Name", "Enter your full name", "text", User)}
                  {renderInput("dob", "Date of Birth", "", "date", Calendar)}
                  {renderSelect("gender", "Gender", "Select gender", [
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ])}
                  {renderInput("phone", "Phone Number", "Enter 10-digit phone number", "tel", Phone)}
                  {renderInput("email", "Email Address", "Enter email address", "email", Mail)}
                  {renderInput("aadhaar", "Aadhaar Number", "Enter 12-digit Aadhaar number", "text", FileText)}
                  {renderInput("pan", "PAN Number", "Enter PAN number (e.g., ABCDE1234F)", "text")}
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>
                      Upload Photo <span className="text-red-500">*</span>
                    </span>
                  </Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors relative cursor-pointer"
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const files = e.dataTransfer.files
                      if (files && files[0]) {
                        const file = files[0]
                        // Validate file type
                        if (!file.type.startsWith("image/")) {
                          setErrors({ ...errors, photo: "Please upload a valid image file" })
                          return
                        }
                        // Validate file size (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          setErrors({ ...errors, photo: "Image size should be less than 5MB" })
                          return
                        }
                        handleChange("photo", file)
                        // Create preview
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setPhotoPreview(e.target?.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    onClick={() => {
                      const input = document.getElementById("photo-upload") as HTMLInputElement
                      input?.click()
                    }}
                  >
                    {photoPreview ? (
                      <div className="relative inline-block">
                        <Image
                          src={photoPreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            removePhoto()
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      </div>
                    )}
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  {errors.photo && <p className="text-red-500 text-sm">{errors.photo}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Permanent Address Section */}
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Permanent Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderTextarea("permanentAddress", "Street Address", "Enter your permanent address", MapPin)}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderInput("permanentDistrict", "District", "Enter district", "text")}
                      {renderSelect("permanentState", "State", "Select state", [
                        { value: "Andhra Pradesh", label: "Andhra Pradesh" },
                        { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
                        { value: "Assam", label: "Assam" },
                        { value: "Bihar", label: "Bihar" },
                        { value: "Chhattisgarh", label: "Chhattisgarh" },
                        { value: "Goa", label: "Goa" },
                        { value: "Gujarat", label: "Gujarat" },
                        { value: "Haryana", label: "Haryana" },
                        { value: "Himachal Pradesh", label: "Himachal Pradesh" },
                        { value: "Jharkhand", label: "Jharkhand" },
                        { value: "Karnataka", label: "Karnataka" },
                        { value: "Kerala", label: "Kerala" },
                        { value: "Madhya Pradesh", label: "Madhya Pradesh" },
                        { value: "Maharashtra", label: "Maharashtra" },
                        { value: "Manipur", label: "Manipur" },
                        { value: "Meghalaya", label: "Meghalaya" },
                        { value: "Mizoram", label: "Mizoram" },
                        { value: "Nagaland", label: "Nagaland" },
                        { value: "Odisha", label: "Odisha" },
                        { value: "Punjab", label: "Punjab" },
                        { value: "Rajasthan", label: "Rajasthan" },
                        { value: "Sikkim", label: "Sikkim" },
                        { value: "Tamil Nadu", label: "Tamil Nadu" },
                        { value: "Telangana", label: "Telangana" },
                        { value: "Tripura", label: "Tripura" },
                        { value: "Uttar Pradesh", label: "Uttar Pradesh" },
                        { value: "Uttarakhand", label: "Uttarakhand" },
                        { value: "West Bengal", label: "West Bengal" },
                        { value: "Delhi", label: "Delhi" },
                        { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
                        { value: "Ladakh", label: "Ladakh" },
                        { value: "Puducherry", label: "Puducherry" },
                        { value: "Chandigarh", label: "Chandigarh" },
                        {
                          value: "Dadra and Nagar Haveli and Daman and Diu",
                          label: "Dadra and Nagar Haveli and Daman and Diu",
                        },
                        { value: "Lakshadweep", label: "Lakshadweep" },
                        { value: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
                      ])}
                      {renderInput("permanentPincode", "Pincode", "Enter 6-digit pincode", "text")}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Address Section */}
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Current Address
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="sameAsPermament"
                        checked={sameAsPermament}
                        onChange={(e) => {
                          const isChecked = e.target.checked
                          setSameAsPermament(isChecked)

                          if (isChecked) {
                            // Copy permanent address to current address
                            setForm((prevForm) => ({
                              ...prevForm,
                              currentAddress: prevForm.permanentAddress,
                              currentDistrict: prevForm.permanentDistrict,
                              currentState: prevForm.permanentState,
                              currentPincode: prevForm.permanentPincode,
                            }))
                          } else {
                            // Clear current address fields
                            setForm((prevForm) => ({
                              ...prevForm,
                              currentAddress: "",
                              currentDistrict: "",
                              currentState: "",
                              currentPincode: "",
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor="sameAsPermament" className="text-sm text-gray-600">
                        Same as permanent address
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentAddress" className="flex items-center space-x-2">
                        <span>
                          Street Address <span className="text-red-500">*</span>
                        </span>
                      </Label>
                      <Textarea
                        id="currentAddress"
                        placeholder="Enter your current address"
                        value={form.currentAddress}
                        onChange={(e) => handleChange("currentAddress", e.target.value)}
                        disabled={sameAsPermament}
                        className={`${errors.currentAddress ? "border-red-500 focus:border-red-500" : ""} ${sameAsPermament ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      />
                      {errors.currentAddress && <p className="text-red-500 text-sm">{errors.currentAddress}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentDistrict" className="flex items-center space-x-2">
                          <span>
                            District <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <Input
                          id="currentDistrict"
                          type="text"
                          placeholder="Enter district"
                          value={form.currentDistrict}
                          onChange={(e) => handleChange("currentDistrict", e.target.value)}
                          disabled={sameAsPermament}
                          className={`${errors.currentDistrict ? "border-red-500 focus:border-red-500" : ""} ${sameAsPermament ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        />
                        {errors.currentDistrict && <p className="text-red-500 text-sm">{errors.currentDistrict}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center space-x-2">
                          <span>
                            State <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <Select
                          onValueChange={(val) => handleChange("currentState", val)}
                          value={form.currentState}
                          disabled={sameAsPermament}
                        >
                          <SelectTrigger
                            className={`${errors.currentState ? "border-red-500 focus:border-red-500" : ""} ${sameAsPermament ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          >
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: "Andhra Pradesh", label: "Andhra Pradesh" },
                              { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
                              { value: "Assam", label: "Assam" },
                              { value: "Bihar", label: "Bihar" },
                              { value: "Chhattisgarh", label: "Chhattisgarh" },
                              { value: "Goa", label: "Goa" },
                              { value: "Gujarat", label: "Gujarat" },
                              { value: "Haryana", label: "Haryana" },
                              { value: "Himachal Pradesh", label: "Himachal Pradesh" },
                              { value: "Jharkhand", label: "Jharkhand" },
                              { value: "Karnataka", label: "Karnataka" },
                              { value: "Kerala", label: "Kerala" },
                              { value: "Madhya Pradesh", label: "Madhya Pradesh" },
                              { value: "Maharashtra", label: "Maharashtra" },
                              { value: "Manipur", label: "Manipur" },
                              { value: "Meghalaya", label: "Meghalaya" },
                              { value: "Mizoram", label: "Mizoram" },
                              { value: "Nagaland", label: "Nagaland" },
                              { value: "Odisha", label: "Odisha" },
                              { value: "Punjab", label: "Punjab" },
                              { value: "Rajasthan", label: "Rajasthan" },
                              { value: "Sikkim", label: "Sikkim" },
                              { value: "Tamil Nadu", label: "Tamil Nadu" },
                              { value: "Telangana", label: "Telangana" },
                              { value: "Tripura", label: "Tripura" },
                              { value: "Uttar Pradesh", label: "Uttar Pradesh" },
                              { value: "Uttarakhand", label: "Uttarakhand" },
                              { value: "West Bengal", label: "West Bengal" },
                              { value: "Delhi", label: "Delhi" },
                              { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
                              { value: "Ladakh", label: "Ladakh" },
                              { value: "Puducherry", label: "Puducherry" },
                              { value: "Chandigarh", label: "Chandigarh" },
                              {
                                value: "Dadra and Nagar Haveli and Daman and Diu",
                                label: "Dadra and Nagar Haveli and Daman and Diu",
                              },
                              { value: "Lakshadweep", label: "Lakshadweep" },
                              { value: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
                            ].map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.currentState && <p className="text-red-500 text-sm">{errors.currentState}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currentPincode" className="flex items-center space-x-2">
                          <span>
                            Pincode <span className="text-red-500">*</span>
                          </span>
                        </Label>
                        <Input
                          id="currentPincode"
                          type="text"
                          placeholder="Enter 6-digit pincode"
                          value={form.currentPincode}
                          onChange={(e) => handleChange("currentPincode", e.target.value)}
                          disabled={sameAsPermament}
                          className={`${errors.currentPincode ? "border-red-500 focus:border-red-500" : ""} ${sameAsPermament ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        />
                        {errors.currentPincode && <p className="text-red-500 text-sm">{errors.currentPincode}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Employment Details */}
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Employment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderSelect(
                        "employmentType",
                        "Employment Type",
                        "Select employment type",
                        [
                          { value: "Salaried", label: "Salaried" },
                          { value: "Self-employed", label: "Self-employed" },
                        ],
                        Briefcase,
                      )}
                      {renderInput("income", "Monthly Income", "Enter monthly income in ₹", "number", IndianRupee)}
                    </div>
                    {renderInput("companyName", "Company Name", "Enter company name", "text")}
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput("loanAmount", "Loan Amount", "Enter loan amount in ₹", "number", IndianRupee)}
                  {renderInput("tenure", "Tenure (months)", "Enter tenure in months", "number")}

                  {renderInput("purpose", "Loan Purpose", "Enter loan purpose", "text")}
                </div>

                {/* EMI Calculator Preview */}
                {form.loanAmount &&
                  form.tenure &&
                  form.interestRate &&
                  !errors.loanAmount &&
                  !errors.tenure &&
                  !errors.interestRate && (
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <Calculator className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-900">EMI Calculation</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <span className="text-gray-600">Monthly EMI</span>
                            <p className="font-bold text-blue-900 text-lg">₹{calculateEMI().toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <span className="text-gray-600">Processing Fee</span>
                            <p className="font-bold text-blue-900 text-lg">₹{processingFee().toLocaleString()}</p>
                          </div>
                          <div className="text-center md:col-span-1 col-span-2">
                            <span className="text-gray-600">Total Payable</span>
                            <p className="font-bold text-blue-900 text-lg">₹{totalPayable().toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput("bankName", "Bank Name", "Enter bank name", "text", Building2)}
                {renderInput("ifsc", "IFSC Code", "Enter IFSC code (e.g., SBIN0001234)", "text")}
                <div className="md:col-span-2">
                  {renderInput("accountNumber", "Account Number", "Enter account number", "text")}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Personal References</h2>
                  <p className="text-gray-600">Please provide two personal references</p>
                </div>

                {/* Reference 1 */}
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900">Reference 1</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderInput("reference1Name", "Full Name", "Enter reference full name", "text", User)}
                      {renderInput("reference1Phone", "Phone Number", "Enter 10-digit phone number", "tel", Phone)}
                    </div>
                    {renderSelect("reference1Relation", "Relationship", "Select relationship", [
                      { value: "Friend", label: "Friend" },
                      { value: "Colleague", label: "Colleague" },
                      { value: "Relative", label: "Relative" },
                      { value: "Neighbor", label: "Neighbor" },
                      { value: "Other", label: "Other" },
                    ])}
                  </CardContent>
                </Card>

                {/* Reference 2 */}
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900">Reference 2</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderInput("reference2Name", "Full Name", "Enter reference full name", "text", User)}
                      {renderInput("reference2Phone", "Phone Number", "Enter 10-digit phone number", "tel", Phone)}
                    </div>
                    {renderSelect("reference2Relation", "Relationship", "Select relationship", [
                      { value: "Friend", label: "Friend" },
                      { value: "Colleague", label: "Colleague" },
                      { value: "Relative", label: "Relative" },
                      { value: "Neighbor", label: "Neighbor" },
                      { value: "Other", label: "Other" },
                    ])}
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Application</h2>
                  <p className="text-gray-600">Please review all details before submitting</p>
                </div>

                {/* Loan Summary */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md">
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
                  <Card className="shadow-md">
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
                      {photoPreview && (
                        <div className="pt-2">
                          <span className="text-gray-600 block mb-2">Photo:</span>
                          <Image
                            src={photoPreview || "/placeholder.svg"}
                            alt="Uploaded"
                            className="w-16 h-16 object-cover rounded"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-md">
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

                  <Card className="shadow-md md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">References</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Reference 1</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span className="font-medium">{form.reference1Name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium">{form.reference1Phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Relation:</span>
                              <span className="font-medium">{form.reference1Relation}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Reference 2</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span className="font-medium">{form.reference2Name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium">{form.reference2Phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Relation:</span>
                              <span className="font-medium">{form.reference2Relation}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Permanent Address:</span>
                      <p className="font-medium">{form.permanentAddress}</p>
                      <p className="font-medium">
                        {form.permanentDistrict}, {form.permanentState} - {form.permanentPincode}
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className="text-gray-600 font-medium">Current Address:</span>
                      <p className="font-medium">{form.currentAddress}</p>
                      <p className="font-medium">
                        {form.currentDistrict}, {form.currentState} - {form.currentPincode}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
            className="flex items-center space-x-2 bg-white hover:bg-gray-50 shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          {step < 6 && (
            <Button
              onClick={next}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
