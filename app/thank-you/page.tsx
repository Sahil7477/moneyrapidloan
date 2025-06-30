import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Home } from "lucide-react"
import Link from "next/link"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Thank You Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Thank You!</h1>
            <p className="text-gray-600">
              Your submission has been received successfully. We appreciate your time and will get back to you soon.
            </p>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>What happens next?</strong>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              You&apos;ll receive a confirmation email within the next few minutes. Our team will review your submission and
              respond within 24-48 hours.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            
          </div>

          {/* Footer Text */}
          <p className="text-xs text-gray-500">
            Need immediate assistance? Email us at{" "}
            <a href="mailto:moneyrapidloan@gmail.com" className="text-blue-600 hover:underline">
              moneyrapidloan@gmail.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
