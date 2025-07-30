import './globals.css'
import { AuthProvider } from './components/AuthContext'

export const metadata = {
  title: 'MedicalSchoolQuizzes - Master Medical School With Smart Quizzes',
  description: 'Practice with expert-crafted medical questions. Track progress and effortlessly pass your exams.',
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
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
