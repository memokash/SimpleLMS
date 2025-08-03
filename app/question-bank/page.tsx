//app/question-bank/page.tsx
import QuestionBankDashboard from '../components/QuestionBankDashboard';
import DashboardNavigation from '../components/DashboardNavigation';

export default function QuestionBankPage() {
  return (
    <>
      <DashboardNavigation />
      <QuestionBankDashboard />
    </>  
  );
}