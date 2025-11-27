import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Welcome from './components/Welcome'
import ChatInterface from './components/ChatInterface'
import Sidebar from './components/Sidebar'
import FlightResults from './components/FlightResults'
import PassengerTemplate from './components/PassengerTemplate'
import BookingTemplate from './components/BookingTemplate'
import ProfilePanel from './components/ProfilePanel'
import ProfilePage from './components/ProfilePage'
import AuthPanel from './components/AuthPanel'
import HotelResults from './components/HotelResults'
import TripPlanCard from './components/TripPlanCard'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileView, setProfileView] = useState(null) // 'personal' | 'bookings' | 'payment'
  const [authOpen, setAuthOpen] = useState(false)
  const [authedUser, setAuthedUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const bookingSubmittingRef = useRef(false)
  const sampleBookings = [
    {
      type: 'flight',
      ref: 'off_12345',
      route: 'BEY → LCA',
      date: '2025-12-12',
      carrier: 'Royal Jordanian',
      amount: '$277.47',
    },
    {
      type: 'hotel',
      ref: 'HTL-9021',
      name: 'Nomada Seaside Resort',
      date: '2025-12-12 → 2025-12-15',
      amount: '$540.00',
    },
  ]
  const messagesEndRef = useRef(null)

  // Send a structured payload (e.g., passenger details) directly to backend
  const sendPayload = async (payload, targetChatId) => {
    if (bookingSubmittingRef.current) return
    bookingSubmittingRef.current = true
    try {
      setIsTyping(true)
      const enrichedPayload = {
        ...payload,
        user_email: authedUser?.email || payload.user_email,
      }
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: String(targetChatId),
          message: JSON.stringify(enrichedPayload),
        })
      })
      let data
      try {
        data = await response.json()
      } catch (e) {
        data = { reply: await response.text() }
      }
      const replyText = data.reply ?? "I'm here, but I couldn't understand the response."

      let parsedTemplate = null
      let parsedBookingTemplate = null
      try {
        const maybeJson = JSON.parse(replyText)
        if (maybeJson && typeof maybeJson === 'object') {
          if (maybeJson.passenger_template) {
            parsedTemplate = maybeJson.passenger_template
          } else if (maybeJson.passengers && maybeJson.required_fields) {
            parsedTemplate = maybeJson
          }
        }
      } catch (e) {
        // not JSON; keep as-is
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: parsedTemplate ? 'Please fill the passenger details template.' : replyText,
        templateOffer: parsedTemplate,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setChats(prev => prev.map(chat => {
        if (chat.id === targetChatId) {
          return {
            ...chat,
            messages: [...chat.messages, aiMessage],
            messageCount: chat.messages.length + 1
          }
        }
        return chat
      }))
      if (authedUser?.email) {
        fetchBookings(authedUser.email)
      }
    } catch (error) {
      console.error('Error sending payload to backend', error)
    } finally {
      setIsTyping(false)
      bookingSubmittingRef.current = false
    }
  }

  // Get current chat
  const currentChat = chats.find(chat => chat.id === currentChatId)
  const messages = currentChat?.messages || []
  const showWelcome = !currentChat || messages.length === 0

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchBookings = async (email) => {
    if (!email) return
    try {
      const res = await fetch(`${API_BASE_URL}/bookings?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      const mapped = (data.bookings || []).map((b) => {
        const detail = b.detail_json || {}
        const itinerary = Array.isArray(detail.itinerary) ? detail.itinerary : []
        const firstLeg = itinerary[0] || {}
        const lastLeg = itinerary[itinerary.length - 1] || {}

        const normLoc = (loc) => {
          if (!loc) return ''
          if (typeof loc === 'string') return loc
          return loc.iata_code || loc.name || ''
        }

        const origin = normLoc(firstLeg.origin)
        const destination = normLoc(lastLeg.destination)
        const route = origin && destination ? `${origin} → ${destination}` : b.title || ''

        let amount = detail.total_amount || detail.total || detail.amount
        if (amount && detail.total_currency) {
          amount = `${detail.total_currency} ${amount}`
        } else if (amount) {
          amount = `$${amount}`
        }

        return {
          type: b.type,
          ref: b.ref,
          name: b.title,
          route,
          date: b.created_at ? new Date(b.created_at * 1000).toLocaleDateString() : '',
          amount,
          carrier: detail.owner?.name || detail.airline || detail.carrier,
          logo: detail.owner?.logo_symbol_url || detail.owner?.logo_lockup_url,
          departure: firstLeg.departing_at || firstLeg.departing_on || detail.departure_date || detail.departure,
          arrival: lastLeg.arriving_at || lastLeg.arriving_on || detail.arrival_date || detail.arrival,
          status: b.status || 'active',
        }
      })
      setBookings(mapped)
    } catch (e) {
      console.error('Failed to load bookings', e)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (authedUser?.email) {
      fetchBookings(authedUser.email)
    } else {
      setBookings([])
    }
  }, [authedUser])

  const generateChatTitle = (firstMessage) => {
    // Generate a simple title from the first message
    const words = firstMessage.split(' ').slice(0, 6)
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '')
  }

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isTyping) return

    let targetChatId = currentChatId

    // Create new chat if none exists
    if (!currentChatId) {
      const newChatId = Date.now().toString()
      const newChat = {
        id: newChatId,
        title: generateChatTitle(messageText),
        messages: [],
        messageCount: 0,
        createdAt: new Date()
      }
      setChats(prev => [newChat, ...prev])
      setCurrentChatId(newChatId)
      targetChatId = newChatId
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setChats(prev => prev.map(chat => {
      if (chat.id === targetChatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage],
          messageCount: chat.messages.length + 1
        }
      }
      return chat
    }))

    setInputValue('')

    setIsTyping(true)

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: String(targetChatId),
          message: messageText
        })
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      let data
      try {
        data = await response.json()
      } catch (e) {
        data = { reply: await response.text() }
      }
      const replyText = data.reply ?? "I'm here, but I couldn't understand the response."

      let parsedFlights = null
      let parsedTemplate = null
      let parsedPlan = null
      let parsedHotels = null
      let parsedBookingTemplate = null
      if (typeof replyText === 'string') {
        try {
          const maybeJson = JSON.parse(replyText)
          if (Array.isArray(maybeJson)) {
            parsedFlights = maybeJson.slice(0, 10)
          } else if (maybeJson && typeof maybeJson === 'object') {
          if (maybeJson.passenger_template && (maybeJson.hotel_holder || maybeJson.hotel_rooms)) {
            parsedBookingTemplate = maybeJson
          } else if (maybeJson.passenger_template) {
            parsedTemplate = maybeJson.passenger_template
          } else if (maybeJson.passengers && maybeJson.required_fields) {
            // Support backend responses that send the template object directly
            parsedTemplate = maybeJson
          } else if (maybeJson.hotels && Array.isArray(maybeJson.hotels)) {
            parsedHotels = maybeJson.hotels.slice(0, 10)
          } else if (maybeJson.flight && maybeJson.hotel) {
            parsedPlan = maybeJson
          }
          }
        } catch (e) {
          // not JSON; keep as-is
        }
      } else if (Array.isArray(replyText)) {
        parsedFlights = replyText.slice(0, 10)
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: parsedPlan
          ? 'Here is your trip plan.'
          : parsedFlights
            ? 'Here are some flight options.'
            : parsedBookingTemplate
              ? 'Please fill the booking template.'
              : parsedTemplate
                ? 'Please fill the passenger details template.'
                : parsedHotels
                  ? 'Here are some hotel options.'
                  : replyText,
        flights: parsedFlights,
        templateOffer: parsedTemplate,
        bookingTemplate: parsedBookingTemplate,
        hotels: parsedHotels,
        tripPlan: parsedPlan,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setChats(prev => prev.map(chat => {
        if (chat.id === targetChatId) {
          return {
            ...chat,
            messages: [...chat.messages, aiMessage],
            messageCount: chat.messages.length + 1
          }
        }
        return chat
      }))
    } catch (error) {
      console.error('Error contacting Nomada backend', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't reach the Nomada backend. Please try again.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setChats(prev => prev.map(chat => {
        if (chat.id === targetChatId) {
          return {
            ...chat,
            messages: [...chat.messages, errorMessage],
            messageCount: chat.messages.length + 1
          }
        }
        return chat
      }))
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuestionClick = (question) => {
    handleSendMessage(question)
  }

  const handleNewChat = () => {
    setCurrentChatId(null)
    setInputValue('')
    setSidebarOpen(false)
  }

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId)
    setSidebarOpen(false)
  }

  const handleReset = () => {
    handleNewChat()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-navy via-luxury-darkBlue to-luxury-slate flex flex-col">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-luxury-gold/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-luxury-rose/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onAuth={() => setAuthOpen(true)}
        onLogout={() => setAuthedUser(null)}
        authedUser={authedUser}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
        <Header
          onReset={handleReset}
          showReset={messages.length > 0}
          authedUser={authedUser}
          onProfile={() => {
            if (authedUser) {
              setProfileOpen(true)
            } else {
              setAuthOpen(true)
            }
          }}
        />

        {/* Main chat area - fixed height, no scroll on container */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {showWelcome && (
                <Welcome key="welcome" onQuestionClick={handleQuestionClick} />
              )}
            </AnimatePresence>

            {/* Chat Messages - scrollable area */}
            {!showWelcome && (
              <motion.div
                className="w-full flex-1 overflow-y-auto scrollbar-luxury space-y-6 pb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`chat-bubble ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-luxury-gold to-luxury-lightGold text-luxury-navy'
                          : 'glass-effect text-luxury-cream'
                      } w-full`}>
                        {message.text && (
                          <p className="text-base leading-relaxed">{message.text}</p>
                        )}
                        {message.flights && (
                          <div className="mt-4 space-y-2">
                            <FlightResults offers={message.flights} />
                            <p className="text-sm text-luxury-cream/70">
                              Please enter the number of the flight you like to book.
                            </p>
                          </div>
                        )}
                        {message.tripPlan && (
                          <div className="mt-4">
                            <TripPlanCard plan={message.tripPlan} />
                          </div>
                        )}
                        {message.hotels && (
                          <div className="mt-4 space-y-2">
                            <HotelResults hotels={message.hotels} />
                            <details className="text-xs text-luxury-cream/60">
                              <summary className="cursor-pointer">Raw hotel JSON</summary>
                              <pre className="mt-2 whitespace-pre-wrap break-words bg-black/30 p-2 rounded-lg text-[11px] text-luxury-cream/70">
                                {JSON.stringify(message.hotels, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                        {message.templateOffer && (
                          <div className="mt-4">
                            <PassengerTemplate
                              offer={message.templateOffer}
                              onSubmit={(payloadFromForm) => {
                                const payload = {
                                  offer_id: message.templateOffer.id,
                                  passengers: payloadFromForm.passengers,
                                  payment_type: payloadFromForm.payment_type,
                                  payment_source: payloadFromForm.payment_source,
                                }
                                sendPayload(payload, currentChatId)
                              }}
                            />
                          </div>
                        )}
                        {message.bookingTemplate && (
                          <div className="mt-4">
                            <BookingTemplate
                              template={message.bookingTemplate}
                              onSubmit={(data) => {
                                const payload = {
                                  tool: "book_plan_trip",
                                  passengers: data.passengers,
                                  holder: data.holder,
                                  rooms: data.rooms,
                                  client_reference: data.client_reference,
                                  flight_offer_id: data.flight_offer_id,
                                  hotel_rate_key: data.hotel_rate_key,
                                }
                                sendPayload(payload, currentChatId)
                              }}
                            />
                          </div>
                        )}
                        <p className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-luxury-navy/60' : 'text-luxury-cream/50'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-start"
                    >
                      <div className="glass-effect chat-bubble">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <motion.div
                              className="w-2 h-2 bg-luxury-gold rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-luxury-gold rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-luxury-gold rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                          <span className="text-luxury-cream/70 text-sm">Nomada is thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </div>

          {/* Chat Input - Fixed at bottom */}
          <div className="pb-8">
            <ChatInterface
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
            />
          </div>
        </main>
      </div>

      <ProfilePanel
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        bookings={bookings}
        onOpenPage={(mode) => setProfileView(mode)}
      />

      <AuthPanel
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={(user) => {
          setAuthedUser(user)
          setAuthOpen(false)
          if (user?.email) {
            fetchBookings(user.email)
          }
        }}
        apiBase={API_BASE_URL}
      />

      {profileView && (
        <ProfilePage
          mode={profileView}
          bookings={bookings}
          onClose={() => setProfileView(null)}
        />
      )}
    </div>
  )
}

export default App
