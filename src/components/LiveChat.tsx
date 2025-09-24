'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Heart, Smile } from 'lucide-react'

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: string
  isOwner?: boolean
  likes?: number
}

interface LiveChatProps {
  isOpen: boolean
  onClose: () => void
  title: string
  initialMessages?: ChatMessage[]
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    user: '@cryptoking',
    message: 'Thanks for watching! What do you think about this analysis? 🚀',
    timestamp: '2m ago',
    isOwner: true,
    likes: 12
  },
  {
    id: '2',
    user: '@hodler2024',
    message: 'Great breakdown! This is exactly what I needed to hear 📈',
    timestamp: '1m ago',
    likes: 5
  },
  {
    id: '3',
    user: '@moonboy',
    message: 'SOL TO THE MOON! 🌙🚀',
    timestamp: '45s ago',
    likes: 8
  },
  {
    id: '4',
    user: '@traderpro',
    message: 'The technical analysis here is spot on. Thanks for sharing!',
    timestamp: '30s ago',
    likes: 3
  },
  {
    id: '5',
    user: '@newbie_trader',
    message: 'Can someone explain the RSI indicator mentioned?',
    timestamp: '15s ago',
    likes: 1
  }
]

export function LiveChat({ isOpen, onClose, title, initialMessages = mockMessages }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      inputRef.current?.focus()
    }
  }, [isOpen, messages])

  // Simulate live messages coming in
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 3 seconds
        const newLiveMessage: ChatMessage = {
          id: Date.now().toString(),
          user: `@user${Math.floor(Math.random() * 1000)}`,
          message: [
            'This is amazing! 🔥',
            'Love this content ❤️',
            'Great explanation!',
            'Can you do more like this?',
            'SOL gang! 💎🙌',
            'Thanks for sharing 🙏'
          ][Math.floor(Math.random() * 6)],
          timestamp: 'now',
          likes: 0
        }
        setMessages(prev => [...prev, newLiveMessage])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isOpen])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: '@you',
      message: newMessage,
      timestamp: 'now',
      likes: 0,
      isOwner: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 2000)
  }

  const handleLikeMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, likes: (msg.likes || 0) + 1 }
        : msg
    ))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md h-[600px] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h3 className="text-white font-bold text-lg">Live Chat</h3>
            <p className="text-gray-400 text-sm">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black text-xs font-bold">
                    {message.user.charAt(1).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-sm ${
                      message.isOwner ? 'text-green-400' : 'text-white'
                    }`}>
                      {message.user}
                    </span>
                    {message.isOwner && (
                      <span className="bg-green-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                        CREATOR
                      </span>
                    )}
                    <span className="text-gray-500 text-xs">{message.timestamp}</span>
                  </div>
                  <p className="text-gray-300 text-sm break-words">{message.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleLikeMessage(message.id)}
                      className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-xs transition-colors"
                    >
                      <Heart className="w-3 h-3" />
                      <span>{message.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-xs">•••</span>
              </div>
              <span className="text-sm italic">Someone is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`p-2 rounded-lg transition-colors ${
                newMessage.trim()
                  ? 'bg-green-500 hover:bg-green-600 text-black'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2 text-center">
            🔴 Live • {messages.length} messages • {Math.floor(Math.random() * 50) + 20} viewers
          </p>
        </div>
      </div>
    </div>
  )
}