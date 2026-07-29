import { Activity } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Activity size={20} />
          <span>RunProgress</span>
        </div>
        <p className="footer-text">
          Track your runs. Analyze your progress. Reach new goals.
        </p>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RunProgress. All rights reserved.</p>
      </div>
    </footer>
  )
}
