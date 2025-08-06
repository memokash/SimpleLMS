//app/question-bank/page.tsx
import QuestionBankDashboard from '../components/QuestionBankDashboard';
import DashboardNavigation from '../components/DashboardNavigation';
import FirebaseDebug from '../components/FirebaseDebug';

export default function QuestionBankPage() {
  return (
    <>
      <DashboardNavigation />
      <QuestionBankDashboard />
      <FirebaseDebug />  {/* Add this temporarily */}
    </>  
  );
}