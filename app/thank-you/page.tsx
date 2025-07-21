import { CheckCircle, Home, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Application Submitted Successfully!</CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-6 pt-8">
            <div className="space-y-4">
              <p className="text-lg text-gray-700">Thank you for submitting your loan application.</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">
                  🎉 Your application has been received and is being reviewed by our team.
                </p>
              </div>

              <div className="space-y-2 text-gray-600">
                <p>• We will review your application within 24-48 hours</p>
                <p>• Our team will contact you via phone or email</p>
                <p>• Keep your documents ready for verification</p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What is Next?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Document Verification</h4>
                  <p className="text-sm text-gray-600 mt-1">Our team will verify your submitted documents</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Final Approval</h4>
                  <p className="text-sm text-gray-600 mt-1">Get final approval and loan disbursement</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="text-sm text-gray-500 pt-4 border-t">
              <p>
                Need help? Contact us at <span className="font-medium text-blue-600">moneyrapidloan@gmail.com</span>
              </p>
              <p>
                or call <span className="font-medium text-blue-600">1-800-LOAN-HELP</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
