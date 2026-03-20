import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  Car, 
  Bike, 
  MapPin, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  Calendar, 
  Info, 
  Sun, 
  Moon, 
  Compass, 
  TrendingUp, 
  Globe 
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const App = () => {
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState('dark');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 'moderate',
    transport: 'aeroplane'
  });
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateTravelPlan = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

      const prompt = `You are a professional luxury travel planner. 
      Generate a detailed travel itinerary for a trip from ${formData.origin} to ${formData.destination}.
      Dates: from ${formData.startDate} to ${formData.endDate}.
      Budget: ${formData.budget}.
      Transport: ${formData.transport}.
      All money values MUST be calculated and displayed in PKR (Pakistani Rupees).
      Format the output as a JSON object with these exact keys:
      {
        "title": "A catchy title",
        "duration": "date range",
        "highlights": ["string array of 3 things"],
        "budgetBreakdown": { "transport": "string in PKR", "stays": "string in PKR", "dining": "string in PKR", "activities": "string in PKR" },
        "totalEstimate": "string total with PKR symbol",
        "days": [ { "day": number, "activity": "string description" } ]
      }
      Only return the JSON object, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanedJson = text.replace(/```json|```/g, "").trim();
      const mockPlan = JSON.parse(cleanedJson);

      setItinerary(mockPlan);
      setLoading(false);
      setStep(3);
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Failed to generate plan. Please check your API key.");
      setLoading(false);
    }
  };

  const transportOptions = [
    { id: 'aeroplane', icon: Plane, label: 'Aeroplane' },
    { id: 'car', icon: Car, label: 'Car' },
    { id: 'bike', icon: Bike, label: 'Bike' }
  ];

  return (
    <div className="container-fluid min-vh-100 p-0 position-relative">
      {/* Dynamic Blobs */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>

      {/* Premium Navbar */}
      <nav className="navbar navbar-expand-lg py-4 px-4 px-md-5">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center gap-2" href="#">
            <div className="icon-box m-0" style={{ width: '40px', height: '40px' }}>
              <Compass size={24} />
            </div>
            <span className="fw-bold fs-4" style={{ letterSpacing: '2px', color: 'var(--text-main)' }}>OMER'S TRAVEL</span>
          </a>
          
          <div className="d-flex align-items-center gap-4">
            <div className="d-none d-md-flex gap-4">
              <a href="#" className="nav-link text-decoration-none">Destinations</a>
              <a href="#" className="nav-link text-decoration-none">Experiences</a>
              <a href="#" className="nav-link text-decoration-none">Concierge</a>
            </div>
            
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="container pt-5">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="row justify-content-center text-center py-5"
            >
              <div className="col-lg-8">
                <div className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2 mb-4">
                  <Sparkles size={14} className="me-2" />
                  AI-POWERED EXPLORATION
                </div>
                <h1 className="display-2 fw-800 mb-4">
                  Discover Your Next <br />
                  <span style={{ color: 'var(--primary-green)' }}>Grand Journey</span>
                </h1>
                <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '600px' }}>
                  Experience travel redefined with our AI-curated itineraries, tailored precisely to your mobility preferences and style.
                </p>

                <div className="premium-card p-4 p-md-5 mt-4 text-start">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Departure Point</label>
                      <div className="position-relative">
                        <MapPin className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={18} />
                        <input
                          type="text"
                          name="origin"
                          value={formData.origin}
                          onChange={handleInputChange}
                          className="form-control premium-input ps-5"
                          placeholder="Where are you starting?"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Target Destination</label>
                      <div className="position-relative">
                        <Globe className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={18} />
                        <input
                          type="text"
                          name="destination"
                          value={formData.destination}
                          onChange={handleInputChange}
                          className="form-control premium-input ps-5"
                          placeholder="The world is yours..."
                        />
                      </div>
                    </div>

                    <div className="col-12 mt-4">
                      <label className="form-label text-muted small fw-bold text-uppercase mb-3">Preferred Mobility</label>
                      <div className="row g-3">
                        {transportOptions.map((opt) => (
                          <div className="col-4" key={opt.id}>
                            <button
                              onClick={() => setFormData(p => ({ ...p, transport: opt.id }))}
                              className={`w-100 p-3 premium-card d-flex flex-column align-items-center gap-2 border-0 ${formData.transport === opt.id ? 'bg-success bg-opacity-10' : 'bg-transparent'}`}
                              style={{ borderColor: formData.transport === opt.id ? 'var(--primary-green)' : 'transparent', border: '1px solid' }}
                            >
                              <opt.icon size={24} color={formData.transport === opt.id ? 'var(--primary-green)' : 'var(--text-muted)'} />
                              <span className="small fw-bold" style={{ color: formData.transport === opt.id ? 'var(--primary-green)' : 'var(--text-muted)' }}>{opt.label}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-12 text-center mt-5">
                      <button
                        onClick={() => setStep(2)}
                        disabled={!formData.origin || !formData.destination}
                        className="btn btn-green btn-lg px-5 py-3"
                      >
                        Proceed to Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="row justify-content-center py-5"
            >
              <div className="col-lg-6">
                <div className="d-flex justify-content-between align-items-center mb-5">
                  <button onClick={() => setStep(1)} className="btn text-muted p-0 d-flex align-items-center gap-2 bg-transparent border-0">
                    <ArrowLeft size={18} /> GO BACK
                  </button>
                  <div className="d-flex gap-2">
                    {[1, 2, 3].map(n => (
                      <div 
                        key={n}
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          background: step === n ? 'var(--primary-green)' : 'var(--bg-card)',
                          color: step === n ? 'white' : 'var(--text-muted)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          border: '1px solid var(--border-card)'
                        }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                <h2 className="display-5 fw-bold mb-2">Finalizing Details</h2>
                <p className="text-muted mb-4">Set your timeline and financial preferences.</p>

                <form onSubmit={generateTravelPlan} className="premium-card p-4 p-md-5">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Departure</label>
                      <input
                        type="date"
                        name="startDate"
                        required
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="form-control premium-input"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Return</label>
                      <input
                        type="date"
                        name="endDate"
                        required
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="form-control premium-input"
                      />
                    </div>
                    <div className="col-12 mt-4">
                      <label className="form-label text-muted small fw-bold text-uppercase">Budget Strategy</label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="form-select premium-input"
                      >
                        <option value="economy">Economy - Value Driven</option>
                        <option value="moderate">Moderate - Comfort First</option>
                        <option value="luxury">Luxury - No Compromise</option>
                      </select>
                    </div>
                    <div className="col-12 mt-5">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-green btn-lg w-100 py-3 d-flex align-items-center justify-content-center gap-3"
                      >
                        {loading ? (
                          <>
                            <div className="spinner-border spinner-border-sm" role="status"></div>
                            Architecting Plan...
                          </>
                        ) : (
                          <>
                            Generate Elite Itinerary
                            <TrendingUp size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 3 && itinerary && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="row py-5"
            >
              <div className="col-12 mb-5">
                <button onClick={() => setStep(2)} className="btn text-muted p-0 d-flex align-items-center gap-2 bg-transparent border-0">
                  <RefreshCw size={18} /> ADJUST PARAMETERS
                </button>
              </div>

              <div className="col-lg-8">
                <div className="premium-card p-4 p-md-5 mb-4">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="icon-box m-0" style={{ width: '40px', height: '40px' }}>
                      {formData.transport === 'car' ? <Car size={20} /> : formData.transport === 'bike' ? <Bike size={20} /> : <Plane size={20} />}
                    </div>
                    <h1 className="h2 fw-bold mb-0">{itinerary.title}</h1>
                  </div>
                  
                  <div className="d-flex align-items-center gap-2 text-success fw-bold mb-5 bg-success bg-opacity-10 p-3 rounded-4">
                    <Calendar size={18} /> {itinerary.duration}
                  </div>

                  <div className="mb-5">
                    <h4 className="fw-bold mb-4 text-muted small text-uppercase" style={{ letterSpacing: '2px' }}>Day-by-Day Journey</h4>
                    {itinerary.days.map((d, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="d-flex gap-4 mb-4"
                      >
                        <div className="flex-shrink-0" style={{ width: '50px', height: '50px', background: 'var(--primary-green)', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <span className="h5 fw-bold m-0">{d.day}</span>
                        </div>
                        <div className="pt-2 border-start ps-4 ms-2 border-success border-opacity-25" style={{ paddingBottom: '2rem' }}>
                          <p className="lh-lg mb-0 text-main" style={{ fontSize: '1.1rem' }}>{d.activity}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="premium-card p-4 mb-4">
                  <h5 className="fw-bold mb-4">Financial Overview</h5>
                  {[
                    { label: 'Mobility', value: itinerary.budgetBreakdown.transport },
                    { label: 'Stays', value: itinerary.budgetBreakdown.stays },
                    { label: 'Dining', value: itinerary.budgetBreakdown.dining },
                    { label: 'Experiences', value: itinerary.budgetBreakdown.activities }
                  ].map((item, i) => (
                    <div className="d-flex justify-content-between mb-3" key={i}>
                      <span className="text-muted">{item.label}</span>
                      <span className="fw-bold">{item.value}</span>
                    </div>
                  ))}
                  <hr className="opacity-10" />
                  <div className="d-flex justify-content-between h5 fw-bold mt-4 text-success">
                    <span>Investment</span>
                    <span>{itinerary.totalEstimate || "Calculated by AI"}</span>
                  </div>
                </div>

                <div className="premium-card p-4 border-success border-opacity-25 bg-success bg-opacity-5">
                  <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <Info size={18} className="text-success" />
                    Pro Insights
                  </h5>
                  <p className="small text-muted m-0">
                    We've optimized this route for your chosen transport mode. Ensure your {formData.transport} is ready for the terrain in {formData.destination}.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Premium Footer */}
      <footer className="py-5 text-center mt-auto border-top border-opacity-10">
        <div className="container">
          <p className="text-muted small">&copy; 2026 Omer's Travel AI. The Future of Exploration.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
