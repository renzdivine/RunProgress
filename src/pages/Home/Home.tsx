import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity, Gauge, TrendingUp, Footprints, MapPin, BarChart3, ArrowRight,
  Clock, Users, Star, Shield, Smartphone, ChevronLeft, ChevronRight
} from 'lucide-react'
import AnimatedBackground from '../../components/ui/AnimatedBackground'
import {
  ThreeDScrollTriggerContainer,
  ThreeDScrollTriggerRow
} from '../../components/lightswind/3d-scroll-trigger'
import { SlidingLogoMarquee, type SlidingLogoMarqueeItem } from '../../components/lightswind/sliding-logo-marquee'
import { isAuthenticated } from '../../services/strava'
import './Home.css'

const heroFeatures = [
  { icon: TrendingUp, text: 'Zone analysis & pace trends from Strava' },
  { icon: Activity, text: 'Auto-sync your Strava runs instantly' },
  { icon: Gauge, text: 'Deeper insights than Strava alone' }
]

const features = [
  {
    icon: Footprints, badge: 'FEATURED', heading: 'Track Every Step of Your Journey',
    subtitle: 'Seamless multi-route GPS logging & performance history',
    desc: 'Log every run with distance, time, elevation, and route details synced directly from Strava. Zero manual entry, no friction — just run and it appears.',
    detail: 'Supports GPS routes, elevation profiles, and split times for every kilometer or mile.',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1000&q=80'
  },
  {
    icon: Gauge, badge: 'FEATURED', heading: 'Analyze Pace Like Never Before',
    subtitle: 'Deep pace distribution, moving time & threshold trends',
    desc: 'See your average pace over time and compare runs side by side. Understand exactly how your speed is trending across different workout distances.',
    detail: 'Moving pace, best pace, and heart rate zone distribution charts help you pinpoint efficiency improvements.',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1000&q=80'
  },
  {
    icon: MapPin, badge: 'FEATURED', heading: 'Organize Runs by Distance',
    subtitle: 'Categorized distance buckets & training block analysis',
    desc: 'Filter and group runs by distance categories to spot progress patterns. See how your 5K tempo pace compares to your half-marathon endurance effort.',
    detail: 'Custom distance ranges let you focus on specific training blocks that matter most to your race goals.',
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1000&q=80'
  },
  {
    icon: BarChart3, badge: 'FEATURED', heading: 'Visualize Your Statistics',
    subtitle: 'Dynamic visual charts, streaks & recovery tracking',
    desc: 'Visual summaries of your weekly mileage, elevation gain, and workout frequency. Sleek charts that make your running progress clear at a glance.',
    detail: 'Track active streaks, recovery trends, and cumulative training volume over any custom date range.',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1000&q=80'
  }
]

const steps = [
  {
    num: '01', title: 'Connect Strava',
    desc: 'Link your Strava account with one click. We only request read access — your data stays yours.',
    detail: 'OAuth 2.0 authentication. No passwords stored. Connect in under 10 seconds.'
  },
  {
    num: '02', title: 'Sync Activities',
    desc: 'Your recent runs appear automatically. Past activities sync in seconds, not hours.',
    detail: 'Bulk import your entire history. New runs sync within minutes of finishing.'
  },
  {
    num: '03', title: 'Explore Analytics',
    desc: 'Dive into charts and stats that reveal your running story. Spot trends, celebrate progress, find areas to grow.',
    detail: 'Interactive graphs, filterable date ranges, and exportable reports for your coach.'
  },
  {
    num: '04', title: 'Stay Motivated',
    desc: 'Set goals, track streaks, and watch your personal records fall. Share your progress with friends.',
    detail: 'Weekly summaries delivered to your inbox. Friendly competition with optional leaderboards.'
  }
]

const testimonials = [
  {
    quote: 'RunProgress completely changed how I view my training. Seeing my pace trend across months keeps me consistent.',
    author: 'Alex M.',
    role: 'Marathoner, 3:12 PR'
  },
  {
    quote: 'The zone analysis alone is worth it. I finally understand which runs build endurance and which build speed.',
    author: 'Sarah K.',
    role: 'Triathlete, Coach'
  },
  {
    quote: 'I tried every running app out there. RunProgress is the first one that makes me actually want to look at the data.',
    author: 'James R.',
    role: 'Ultra-runner, 100mi finisher'
  }
]

const stats = [
  { value: '12,000+', label: 'Active Runners', icon: Users },
  { value: '500K+', label: 'Runs Analyzed', icon: Activity },
  { value: '4.9', label: 'App Store Rating', icon: Star },
  { value: '99.9%', label: 'Uptime', icon: Shield }
]

const partnerLogos: SlidingLogoMarqueeItem[] = [
  { id: '1', content: <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '17px', letterSpacing: '0.02em' }}>Strava</div> },
  { id: '2', content: <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '17px', letterSpacing: '0.02em' }}>Nike</div> },
  { id: '3', content: <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '17px', letterSpacing: '0.02em' }}>Garmin</div> },
  { id: '4', content: <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '17px', letterSpacing: '0.02em' }}>adidas</div> },
  { id: '5', content: <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '17px', letterSpacing: '0.02em' }}>Hoka</div> },
  { id: '6', content: <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '17px', letterSpacing: '0.02em' }}>ASICS</div> },
  { id: '7', content: <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '17px', letterSpacing: '0.02em' }}>Coros</div> }
]

function redirectStrava() {
  fetch('/api/url')
    .then(r => {
      const contentType = r.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error('API server is not running')
      }
      return r.json()
    })
    .then(d => {
      if (d.url) window.location.href = d.url
    })
    .catch(() => {
      alert('Could not connect to the server. Please ensure the API server is running on port 3001.')
    })
}

export default function Home() {
  const navigate = useNavigate()
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
      return
    }
    const refs = [featuresRef, statsRef, stepsRef, testimonialsRef, ctaRef]
    const observers: IntersectionObserver[] = []

    refs.forEach((ref) => {
      const el = ref.current
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add('reveal-visible')
          }
        },
        { threshold: 0.12 }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => {
      observers.forEach((obs) => obs.disconnect())
    }
  }, [])

  const nextFeature = () => setActiveFeature((prev) => (prev + 1) % features.length)
  const prevFeature = () => setActiveFeature((prev) => (prev - 1 + features.length) % features.length)

  return (
    <div className="home-page">
      <AnimatedBackground />


      <section id="home" className="hero-section">
        <div className="hero-overlay" />

        <div className="hero-content">


          <h1 className="hero-title">
            Get More From<br />Your Strava Data
          </h1>
          <p className="hero-desc">
            RunProgress connects to Strava and transforms your runs into
            detailed pace charts, heart rate zone breakdowns, and trend
            insights. See what Strava doesn't show you.
          </p>

          <div className="hero-actions">
            <button className="btn-hero" onClick={redirectStrava}>
              Connect with Strava
              <ArrowRight size={16} />
            </button>
            <button className="btn-hero-outline">
              See How It Works
            </button>
          </div>

          <ul className="hero-bullets">
            {heroFeatures.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.text}>
                  <Icon size={16} />
                  <span>{item.text}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="hero-bottom">
          <div className="hero-bottom-left">
            <span className="hero-users">Seamlessly syncs with Strava</span>
            <div className="hero-logos">
              <span className="hero-logo-text">NIKE</span>
              <span className="hero-logo-text">STRAVA</span>
              <span className="hero-logo-text">GARMIN</span>
              <span className="hero-logo-text">COROS</span>
            </div>
          </div>
          <div className="hero-bottom-right">
            <Clock size={14} />
            <span className="hero-milestone">Free during beta — no credit card needed</span>
          </div>
        </div>
      </section>

      <section className="partners-section">
        <p className="partners-heading">Seamlessly syncs with the brands you already run with.</p>
        <SlidingLogoMarquee
          items={partnerLogos}
          speed={1.5}
          height="80px"
          enableBlur={true}
          blurIntensity={1}
          pauseOnHover={true}
          showControls={false}
          backgroundColor="!transparent"
        />
      </section>

      <section id="features" className="features-section">
        <div ref={featuresRef} className="reveal">
          <div className="features-editorial">

            <div className="features-editorial-image">
              <div className="features-image-placeholder">
                <img
                  src={features[activeFeature].image}
                  alt={features[activeFeature].heading}
                  className="features-img"
                />
                <div className="features-image-overlay" />
              </div>
            </div>

            <div className="features-editorial-main">
              <div className="features-editorial-content">
                <span className="features-badge">{features[activeFeature].badge}</span>
                <h2 className="features-editorial-heading">{features[activeFeature].heading}</h2>
                <p className="features-editorial-subtitle">{features[activeFeature].subtitle}</p>
                <p className="features-editorial-desc">{features[activeFeature].desc}</p>
                <p className="features-editorial-detail">{features[activeFeature].detail}</p>
              </div>
              <div className="features-editorial-nav">
                <button className="features-nav-btn" onClick={prevFeature} aria-label="Previous feature">
                  <ChevronLeft size={20} />
                </button>
                <div className="features-nav-dots">
                  {features.map((_, i) => (
                    <button
                      key={i}
                      className={`features-nav-dot ${i === activeFeature ? 'active' : ''}`}
                      onClick={() => setActiveFeature(i)}
                      aria-label={`Go to feature ${i + 1}`}
                    />
                  ))}
                </div>
                <button className="features-nav-btn" onClick={nextFeature} aria-label="Next feature">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

          </div>

          <div className="features-highlight">
            <div className="features-highlight-content">
              <h3 className="features-highlight-heading">Elevate Your Running Journey</h3>
              <p className="features-highlight-subtitle">Turn raw Strava mileage into actionable personal breakthroughs.</p>
              <p className="features-highlight-desc">Whether you are training for your first 5K or targeting a marathon personal record, consistency and intelligent pacing are key. RunProgress brings clarity to your running history so you can run smarter and hit your next milestone.</p>
              <button className="btn-hero-outline features-learn-more" onClick={redirectStrava}>Connect Strava</button>
            </div>
            <div className="features-highlight-image">
              <div className="features-image-placeholder features-image-placeholder--nature">
                <img
                  src="https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1000&q=80"
                  alt="Runner on scenic trail"
                  className="features-img"
                />
                <div className="features-image-overlay" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="stats-banner">
        <div ref={statsRef} className="stats-inner glass-card reveal">
          <div className="stats-grid">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="stat-item">
                  <Icon size={20} />
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="steps-section">
        <div ref={stepsRef} className="reveal">
          <div className="section-header section-header--center">
            <span className="section-label">How It Works</span>
            <h2>Get started in minutes</h2>
            <p>From zero to insights in four simple steps. No credit card, no complicated setup.</p>
          </div>
          <div className="split-grid">
            <div className="split-col">
              {steps.slice(0, 2).map((s) => (
                <div key={s.num} className="step-item glass-card">
                  <span className="step-item-num">{s.num}</span>
                  <div className="step-body">
                    <h3>{s.title}</h3>
                    <p className="step-desc">{s.desc}</p>
                    <p className="step-detail">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="split-col">
              {steps.slice(2).map((s) => (
                <div key={s.num} className="step-item glass-card">
                  <span className="step-item-num">{s.num}</span>
                  <div className="step-body">
                    <h3>{s.title}</h3>
                    <p className="step-desc">{s.desc}</p>
                    <p className="step-detail">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="steps-footer">
            <button className="btn-hero" onClick={redirectStrava}>
              Get Started Now
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials-section">
        <div ref={testimonialsRef} className="reveal">
          <div className="section-header section-header--center">
            <span className="section-label">Testimonials</span>
            <h2>Loved by runners at every level</h2>
            <p>From first-time 5K runners to seasoned ultra-marathoners — RunProgress fits your workflow.</p>
          </div>
          <ThreeDScrollTriggerContainer>
            <ThreeDScrollTriggerRow baseVelocity={3} direction={-1}>
              {testimonials.map((t) => (
                <div key={t.author} className="testimonial-card glass-card">
                  <div className="testimonial-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="testimonial-quote">{t.quote}</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.author[0]}</div>
                    <div>
                      <span className="testimonial-name">{t.author}</span>
                      <span className="testimonial-role">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </ThreeDScrollTriggerRow>
          </ThreeDScrollTriggerContainer>
        </div>
      </section>

      <section id="cta" className="cta-section">
        <div ref={ctaRef} className="cta-container reveal">
          <span className="section-label">Start Today</span>
          <h2>Ready to see your progress?</h2>
          <p>Join thousands of runners who already track smarter. Free during beta — no credit card needed.</p>
          <div className="cta-actions">
            <button className="btn-hero btn-cta">
              <Smartphone size={16} />
              Get the App Free
            </button>
            <button className="btn-hero-outline">
              Learn More
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
