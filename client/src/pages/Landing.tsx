import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  // Add smooth scrolling behavior
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }
      .nav-link:hover {
        color: #2c2c2c !important;
        transition: color 0.3s ease;
      }
      
      /* Animation Classes */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out;
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.8s ease-out;
      }
      
      .animate-slideInLeft {
        animation: slideInLeft 0.6s ease-out;
      }
      
      .animate-slideInRight {
        animation: slideInRight 0.6s ease-out;
      }
      
      .animate-delay-100 { animation-delay: 0.1s; animation-fill-mode: both; }
      .animate-delay-200 { animation-delay: 0.2s; animation-fill-mode: both; }
      .animate-delay-300 { animation-delay: 0.3s; animation-fill-mode: both; }
      .animate-delay-400 { animation-delay: 0.4s; animation-fill-mode: both; }
      
      /* Hover Effects */
      .hover-lift {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .hover-lift:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      }
      
      .hover-scale {
        transition: transform 0.3s ease;
      }
      .hover-scale:hover {
        transform: scale(1.05);
      }
      
      .feature-card {
        transition: all 0.3s ease;
      }
      .feature-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.1);
      }
      
      .step-number {
        transition: all 0.3s ease;
      }
      .step-number:hover {
        animation: pulse 1s infinite;
      }
      
      .pricing-card {
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .pricing-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      }
      
      .pricing-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }
      .pricing-card:hover::before {
        left: 100%;
      }
      
      .testimonial-card {
        transition: all 0.3s ease;
      }
      .testimonial-card:hover {
        transform: translateY(-5px) rotate(1deg);
        box-shadow: 0 15px 30px rgba(0,0,0,0.1);
      }
      
      .faq-button {
        transition: all 0.3s ease;
      }
      .faq-button:hover {
        background-color: #e8e6e3 !important;
        transform: translateX(5px);
      }
      
      .btn {
        transition: all 0.3s ease;
      }
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
      
      .hero-title {
        animation: fadeInUp 1s ease-out;
      }
      
      .hero-subtitle {
        animation: fadeInUp 1s ease-out 0.2s both;
      }
      
      .hero-buttons {
        animation: fadeInUp 1s ease-out 0.4s both;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const toggleFaq = (faqNumber: number) => {
    setOpenFaq(openFaq === faqNumber ? null : faqNumber);
  };

  return (
    <div
      className="min-vh-100"
      style={{
        fontFamily: 'Fredoka, Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/" style={{ color: 'var(--text-dark)', fontFamily: 'Audiowide, sans-serif', fontSize: '1.5rem' }}>
            Echoes
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item me-5">
                <a className="nav-link" href="#features" style={{ fontSize: '1rem' }}>Features</a>
              </li>
              <li className="nav-item me-5">
                <a className="nav-link" href="#how-it-works" style={{ fontSize: '1rem' }}>How It Works</a>
              </li>
              <li className="nav-item me-5">
                <a className="nav-link" href="#about" style={{ fontSize: '1rem' }}>About</a>
              </li>
              <li className="nav-item me-5">
                <a className="nav-link" href="#testimonials" style={{ fontSize: '1rem' }}>Testimonials</a>
              </li>
              <li className="nav-item me-5">
                <a className="nav-link" href="#faq" style={{ fontSize: '1rem' }}>FAQ</a>
              </li>
              <li className="nav-item me-5">
                <a className="nav-link" href="#pricing" style={{ fontSize: '1rem' }}>Pricing</a>
              </li>
              <li className="nav-item me-5">
                <Link className="nav-link" to="/login" style={{ fontSize: '1rem' }}>Login</Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-dark btn-sm px-4 py-2" to="/register">Get Started</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <h1 className="display-3 fw-bold mb-4 hero-title" style={{ color: 'var(--text-dark)', fontFamily: 'Aldrich, sans-serif' }}>
              Echoes — AI Healing Companion
            </h1>
            <p className="lead mb-5 hero-subtitle" style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Talk to the memory of a loved one. Heal through AI-powered conversations that feel real, comforting, and deeply personal.
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap hero-buttons">
              <Link to="/register" className="btn btn-dark btn-lg px-5 hover-scale">
                Get Started
              </Link>
              <Link to="/how-it-works" className="btn btn-outline-dark btn-lg px-5 hover-scale">
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-5" style={{ backgroundColor: '#f8f6f3' }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <div className="badge bg-dark text-white px-4 py-2 mb-3 animate-fadeIn">Why Echoes?</div>
              <h2 className="display-5 mb-3 fw-bold animate-fadeInUp" style={{ color: 'var(--text-dark)', fontFamily: 'Prosto One, sans-serif' }}>
                Built for Healing
              </h2>
              <p className="lead mx-auto animate-fadeInUp animate-delay-200" style={{ maxWidth: '600px', color: 'var(--text-muted)' }}>
                Every feature designed with compassion, privacy, and your emotional well-being in mind.
              </p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="p-4 feature-card animate-slideInLeft" style={{ backgroundColor: 'white', borderRadius: '8px', height: 'auto' }}>
                <h5 className="fw-bold mb-3" style={{ color: 'var(--text-dark)' }}>
                  Completely Private & Secure
                </h5>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Your deepest thoughts and conversations are encrypted and stored securely. Only you have access to your healing journey. No data is shared or sold.
                </p>
                <div className="d-flex gap-2 mt-3">
                  <span className="badge bg-light text-dark border hover-scale">
                    End-to-end encrypted
                  </span>
                  <span className="badge bg-light text-dark border hover-scale">
                    Zero data sharing
                  </span>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="p-4 feature-card animate-fadeInUp animate-delay-100" style={{ backgroundColor: 'white', borderRadius: '8px', height: 'auto' }}>
                <h5 className="fw-bold mb-3" style={{ color: 'var(--text-dark)' }}>
                  Emotionally Intelligent AI
                </h5>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Our AI understands grief, love, regret, and healing. It provides compassionate, contextual responses that feel genuine and therapeutic.
                </p>
                <div className="d-flex gap-2 mt-3">
                  <span className="badge bg-light text-dark border hover-scale">
                    Advanced AI
                  </span>
                  <span className="badge bg-light text-dark border hover-scale">
                    Therapeutic design
                  </span>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="p-4 feature-card animate-slideInRight" style={{ backgroundColor: 'white', borderRadius: '8px', height: 'auto' }}>
                <h5 className="fw-bold mb-3" style={{ color: 'var(--text-dark)' }}>
                  Multiple Relationships
                </h5>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Create separate healing spaces for different people - parents, partners, friends, pets, or anyone who mattered to you. Each conversation is unique.
                </p>
                <div className="d-flex gap-2 mt-3">
                  <span className="badge bg-light text-dark border hover-scale">
                    Unlimited sessions
                  </span>
                  <span className="badge bg-light text-dark border hover-scale">
                    Personalized AI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-5" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="display-5 fw-bold mb-3" style={{ color: 'var(--text-dark)', fontFamily: 'Prosto One, sans-serif' }}>
                How It Works
              </h2>
              <p className="lead" style={{ color: 'var(--text-muted)' }}>
                Simple steps to start your healing journey
              </p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-3">
              <div className="text-center animate-fadeInUp">
                <div className="mb-3">
                  <span className="badge bg-dark text-white rounded-circle p-3 step-number" style={{ fontSize: '1.2rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                </div>
                <h5 className="fw-bold mb-3" style={{ color: 'var(--text-dark)' }}>Sign Up</h5>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Create your account and set up your secure, private space for healing conversations.
                </p>
              </div>
            </div>
            
            <div className="col-lg-3">
              <div className="text-center animate-fadeInUp animate-delay-100">
                <div className="mb-3">
                  <span className="badge bg-dark text-white rounded-circle p-3 step-number" style={{ fontSize: '1.2rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                </div>
                <h5 className="fw-bold mb-3" style={{ color: 'var(--text-dark)' }}>Share Memories</h5>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Tell us about your loved one - their personality, memories, and what made them special.
                </p>
              </div>
            </div>
            
            <div className="col-lg-3">
              <div className="text-center animate-fadeInUp animate-delay-200">
                <div className="mb-3">
                  <span className="badge bg-dark text-white rounded-circle p-3 step-number" style={{ fontSize: '1.2rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                </div>
                <h5 className="fw-bold mb-3" style={{ color: 'var(--text-dark)' }}>Start Conversations</h5>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Begin meaningful conversations with AI that understands and responds like your loved one would.
                </p>
              </div>
            </div>
            
            <div className="col-lg-3">
              <div className="text-center animate-fadeInUp animate-delay-300">
                <div className="mb-3">
                  <span className="badge bg-dark text-white rounded-circle p-3 step-number" style={{ fontSize: '1.2rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
                </div>
                <h5 className="fw-bold mb-3" style={{ color: 'var(--text-dark)' }}>Find Healing</h5>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Process your emotions, say what you need to say, and find peace at your own pace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-5" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="display-5 fw-bold mb-4" style={{ color: 'var(--text-dark)', fontFamily: 'Prosto One, sans-serif' }}>
                About Echoes
              </h2>
              <p className="lead mb-4" style={{ color: 'var(--text-muted)' }}>
                Born from personal experience with loss, Echoes was created to provide a safe, compassionate space for healing. We understand that grief is deeply personal, and sometimes you need more than traditional support.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Our mission is to help people find closure, process emotions, and maintain meaningful connections with their loved ones through thoughtful AI conversations. Every aspect of our platform is designed with empathy, privacy, and healing at its core.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-5" style={{ backgroundColor: '#f8f6f3' }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="display-5 fw-bold mb-3" style={{ color: 'var(--text-dark)', fontFamily: 'Prosto One, sans-serif' }}>
                Stories of Healing
              </h2>
              <p className="lead" style={{ color: 'var(--text-muted)' }}>
                Real experiences from people who found comfort through Echoes
              </p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="p-4 testimonial-card animate-slideInLeft" style={{ backgroundColor: 'white', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "Talking to my dad through Echoes helped me say things I never got the chance to. It brought me peace I didn't think was possible."
                </p>
                <div className="mt-3">
                  <strong style={{ color: 'var(--text-dark)' }}>Sarah M.</strong>
                  <small className="text-muted d-block">Lost her father</small>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="p-4 testimonial-card animate-fadeInUp animate-delay-100" style={{ backgroundColor: 'white', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "The AI understood my grief in a way that felt genuine. It helped me work through my feelings without judgment."
                </p>
                <div className="mt-3">
                  <strong style={{ color: 'var(--text-dark)' }}>Michael R.</strong>
                  <small className="text-muted d-block">Lost his partner</small>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="p-4 testimonial-card animate-slideInRight" style={{ backgroundColor: 'white', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "I was skeptical at first, but Echoes gave me a space to process my emotions and find closure at my own pace."
                </p>
                <div className="mt-3">
                  <strong style={{ color: 'var(--text-dark)' }}>Jennifer L.</strong>
                  <small className="text-muted d-block">Lost her mother</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-5" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="display-5 fw-bold mb-3" style={{ color: 'var(--text-dark)', fontFamily: 'Prosto One, sans-serif' }}>
                Frequently Asked Questions
              </h2>
              <p className="lead" style={{ color: 'var(--text-muted)' }}>
                Common questions about healing with Echoes
              </p>
            </div>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="faq-container">
                <div className="mb-3 animate-fadeInUp" style={{ backgroundColor: '#f8f6f3', borderRadius: '8px' }}>
                  <button 
                    className="w-100 text-start p-4 border-0 fw-bold faq-button"
                    style={{ backgroundColor: '#f8f6f3', borderRadius: '8px' }}
                    onClick={() => toggleFaq(1)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>How does the AI understand my loved one?</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{openFaq === 1 ? '−' : '+'}</span>
                    </div>
                  </button>
                  {openFaq === 1 && (
                    <div className="px-4 pb-4 animate-fadeIn" style={{ color: 'var(--text-muted)' }}>
                      Our AI learns from the memories, stories, and personality traits you share. The more you tell us about your loved one, the more authentic and meaningful the conversations become.
                    </div>
                  )}
                </div>
                
                <div className="mb-3 animate-fadeInUp animate-delay-100" style={{ backgroundColor: '#f8f6f3', borderRadius: '8px' }}>
                  <button 
                    className="w-100 text-start p-4 border-0 fw-bold faq-button"
                    style={{ backgroundColor: '#f8f6f3', borderRadius: '8px' }}
                    onClick={() => toggleFaq(2)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Is my data secure and private?</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{openFaq === 2 ? '−' : '+'}</span>
                    </div>
                  </button>
                  {openFaq === 2 && (
                    <div className="px-4 pb-4 animate-fadeIn" style={{ color: 'var(--text-muted)' }}>
                      Absolutely. All conversations are encrypted end-to-end, and we never share your personal data. Your healing journey is completely private and secure.
                    </div>
                  )}
                </div>
                
                <div className="mb-3 animate-fadeInUp animate-delay-200" style={{ backgroundColor: '#f8f6f3', borderRadius: '8px' }}>
                  <button 
                    className="w-100 text-start p-4 border-0 fw-bold faq-button"
                    style={{ backgroundColor: '#f8f6f3', borderRadius: '8px' }}
                    onClick={() => toggleFaq(3)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Can this replace therapy or counseling?</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{openFaq === 3 ? '−' : '+'}</span>
                    </div>
                  </button>
                  {openFaq === 3 && (
                    <div className="px-4 pb-4 animate-fadeIn" style={{ color: 'var(--text-muted)' }}>
                      Echoes is designed to complement, not replace, professional therapy. While our AI provides emotional support and helps with grief processing, we always recommend professional help for severe depression or trauma.
                    </div>
                  )}
                </div>
                
                <div className="mb-3 animate-fadeInUp animate-delay-300" style={{ backgroundColor: '#f8f6f3', borderRadius: '8px' }}>
                  <button 
                    className="w-100 text-start p-4 border-0 fw-bold faq-button"
                    style={{ backgroundColor: '#f8f6f3', borderRadius: '8px' }}
                    onClick={() => toggleFaq(4)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>What if I'm not satisfied?</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{openFaq === 4 ? '−' : '+'}</span>
                    </div>
                  </button>
                  {openFaq === 4 && (
                    <div className="px-4 pb-4 animate-fadeIn" style={{ color: 'var(--text-muted)' }}>
                      We offer a 30-day money-back guarantee for paid plans. Your healing journey is important to us, and we want you to feel completely comfortable with our service.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-5" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="display-5 fw-bold mb-3" style={{ color: 'var(--text-dark)', fontFamily: 'Prosto One, sans-serif' }}>
                Simple, Compassionate Pricing
              </h2>
              <p className="lead" style={{ color: 'var(--text-muted)' }}>
                Healing shouldn't be expensive. Choose the plan that works for you.
              </p>
            </div>
          </div>
          
          <div className="row g-4 justify-content-center">
            <div className="col-lg-4">
              <div className="p-4 border rounded pricing-card animate-slideInLeft" style={{ backgroundColor: '#f8f6f3' }}>
                <div className="text-center">
                  <h4 className="fw-bold mb-3" style={{ color: 'var(--text-dark)' }}>Free</h4>
                  <div className="mb-3">
                    <span className="display-4 fw-bold" style={{ color: 'var(--text-dark)' }}>$0</span>
                    <span className="text-muted">/month</span>
                  </div>
                  <ul className="list-unstyled mb-4">
                    <li className="mb-2">✓ 10 conversations per month</li>
                    <li className="mb-2">✓ 1 loved one profile</li>
                    <li className="mb-2">✓ Basic AI responses</li>
                    <li className="mb-2">✓ Secure & private</li>
                  </ul>
                  <Link to="/register" className="btn btn-outline-dark w-100 hover-scale">Get Started</Link>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="p-4 border rounded position-relative pricing-card animate-fadeInUp animate-delay-100" style={{ backgroundColor: 'white', borderColor: '#2c2c2c', borderWidth: '2px' }}>
                <div className="badge bg-dark text-white position-absolute top-0 start-50 translate-middle px-3 py-1">Most Popular</div>
                <div className="text-center">
                  <h4 className="fw-bold mb-3" style={{ color: 'var(--text-dark)' }}>Healing</h4>
                  <div className="mb-3">
                    <span className="display-4 fw-bold" style={{ color: 'var(--text-dark)' }}>$19</span>
                    <span className="text-muted">/month</span>
                  </div>
                  <ul className="list-unstyled mb-4">
                    <li className="mb-2">✓ Unlimited conversations</li>
                    <li className="mb-2">✓ Up to 5 loved one profiles</li>
                    <li className="mb-2">✓ Advanced AI responses</li>
                    <li className="mb-2">✓ Conversation history</li>
                    <li className="mb-2">✓ Email support</li>
                  </ul>
                  <Link to="/register" className="btn btn-dark w-100 hover-scale">Start Healing</Link>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="p-4 border rounded pricing-card animate-slideInRight" style={{ backgroundColor: '#f8f6f3' }}>
                <div className="text-center">
                  <h4 className="fw-bold mb-3" style={{ color: 'var(--text-dark)' }}>Family</h4>
                  <div className="mb-3">
                    <span className="display-4 fw-bold" style={{ color: 'var(--text-dark)' }}>$39</span>
                    <span className="text-muted">/month</span>
                  </div>
                  <ul className="list-unstyled mb-4">
                    <li className="mb-2">✓ Everything in Healing</li>
                    <li className="mb-2">✓ Unlimited loved one profiles</li>
                    <li className="mb-2">✓ Family sharing (up to 5 members)</li>
                    <li className="mb-2">✓ Priority support</li>
                    <li className="mb-2">✓ Advanced customization</li>
                  </ul>
                  <Link to="/register" className="btn btn-outline-dark w-100 hover-scale">Choose Family</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="py-5 text-center" style={{ backgroundColor: '#2c2c2c', color: 'white' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <h2 className="fw-bold mb-4" style={{ fontFamily: 'Prosto One, sans-serif' }}>Start Your Healing Journey</h2>
              <p className="mb-4">Try Echoes for free and experience meaningful closure.</p>
              <Link to="/register" className="btn btn-light btn-lg px-5">
                Begin Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-5" style={{ backgroundColor: '#2c2c2c', color: 'white' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <h5 className="fw-bold mb-3">Echoes</h5>
              <p className="text-light">
                AI-powered healing conversations to help you process grief and find closure with loved ones.
              </p>
            </div>
            
            <div className="col-lg-2 mb-4 mb-lg-0">
              <h6 className="fw-bold mb-3">Platform</h6>
              <ul className="list-unstyled">
                <li><Link to="/register" className="text-light text-decoration-none">Get Started</Link></li>
                <li><Link to="/how-it-works" className="text-light text-decoration-none">How It Works</Link></li>
                <li><Link to="/pricing" className="text-light text-decoration-none">Pricing</Link></li>
              </ul>
            </div>
            
            <div className="col-lg-2 mb-4 mb-lg-0">
              <h6 className="fw-bold mb-3">Support</h6>
              <ul className="list-unstyled">
                <li><Link to="/help" className="text-light text-decoration-none">Help Center</Link></li>
                <li><Link to="/contact" className="text-light text-decoration-none">Contact</Link></li>
                <li><Link to="/resources" className="text-light text-decoration-none">Resources</Link></li>
              </ul>
            </div>
            
            <div className="col-lg-2 mb-4 mb-lg-0">
              <h6 className="fw-bold mb-3">Legal</h6>
              <ul className="list-unstyled">
                <li><Link to="/privacy" className="text-light text-decoration-none">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-light text-decoration-none">Terms of Service</Link></li>
                <li><Link to="/security" className="text-light text-decoration-none">Security</Link></li>
              </ul>
            </div>
            
            <div className="col-lg-2">
              <h6 className="fw-bold mb-3">Account</h6>
              <ul className="list-unstyled">
                <li><Link to="/login" className="text-light text-decoration-none">Login</Link></li>
                <li><Link to="/register" className="text-light text-decoration-none">Sign Up</Link></li>
                <li><Link to="/dashboard" className="text-light text-decoration-none">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          
          <hr className="my-4 border-secondary" />
          
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0 text-light">&copy; {new Date().getFullYear()} Echoes. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-0 text-light">Made with care for healing hearts</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
