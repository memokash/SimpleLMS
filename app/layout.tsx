import './globals.css'
import { AuthProvider } from './components/AuthContext'

import Footer from './components/Footer'

export const metadata = {
  title: 'MedicalSchoolQuizzes - Master Medical School With Smart Quizzes',
  description: 'Practice with expert-crafted medical questions. Track progress and effortlessly pass your exams.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}