'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface ReportPopupProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
}

export function ReportPopup({ isOpen, onClose, videoId }: ReportPopupProps) {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [customReason, setCustomReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const reportReasons = [
    { value: 'spam', label: 'Spam or Misleading' },
    { value: 'offensive', label: 'Offensive Content' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'other', label: 'Other' }
  ]

  const handleSubmit = async () => {
    const reason = selectedReason === 'other' ? customReason : selectedReason
    if (!reason) {
      alert('Please select or enter a reason')
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/videos/${videoId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reason })
      })

      const data = await response.json()
      if (data.success) {
        alert('Thank you for your report. We will review it shortly.')
        onClose()
      } else {
        alert('Failed to submit report. Please try again.')
      }
    } catch (error) {
      console.error('Report failed:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl w-full max-w-md border border-red-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Report Content
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-400 text-sm">
            Help us keep the community safe. Why are you reporting this content?
          </p>

          {/* Reason Selection */}
          <div className="space-y-2">
            {reportReasons.map((reason) => (
              <label
                key={reason.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedReason === reason.value
                    ? 'bg-red-500/10 border-red-500/50'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-4 h-4 text-red-500"
                />
                <span className="text-white">{reason.label}</span>
              </label>
            ))}
          </div>

          {/* Custom Reason Input */}
          {selectedReason === 'other' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please describe the issue..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
            />
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              isSubmitting || !selectedReason
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  )
}
