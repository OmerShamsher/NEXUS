import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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
  Globe, 
  Search as SearchIcon, 
  Bookmark, 
  Layers, 
  Mail, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

/* --- SHARED COMPONENTS --- */

const Navbar = ({ theme, toggleTheme, setSearchQuery }) => {
  return (
    <nav className="navbar navbar-expand-lg py-4 px-4 px-md-5">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" to="/">
          <div className="icon-box m-0" style={{ width: '40px', height: '40px' }}>
            <Compass size={24} />
          </div>
          <span className="fw-bold fs-4 d-none d-sm-inline" style={{ letterSpacing: '2px', color: 'var(--text-main)' }}>OMER'S TRAVEL</span>
        </Link>
        
        <div className="d-flex align-items-center gap-3 ms-auto">
          {/* Search Bar in Navbar */}
          <div className="position-relative d-none d-lg-block">
            <SearchIcon className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={16} />
            <input 
              type="text" 
              className="form-control premium-input ps-5 bg-opacity-5" 
              placeholder="Search experiences..." 
              style={{ width: '250px' }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="d-none d-md-flex gap-4 me-3">
            <Link to="/saved" className="nav-link text-decoration-none d-flex align-items-center gap-2">
              <Bookmark size={18} />
              Saved
            </Link>
            <Link to="/about" className="nav-link text-decoration-none">About</Link>
            <Link to="/contact" className="nav-link text-decoration-none">Contact</Link>
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
  );
};

const Footer = () => (
  <footer className="py-5 mt-auto border-top border-opacity-10">
    <div className="container px-4">
      <div className="row g-5">
        <div className="col-lg-4">
          <div className="d-flex align-items-center gap-2 mb-4">
            <Compass size={24} className="text-success" />
            <span className="fw-bold fs-5" style={{ letterSpacing: '1px' }}>OMER'S TRAVEL AI</span>
          </div>
          <p className="text-muted lh-lg">Empowering explorers with AI-curated journeys that prioritize authenticity over everything else.</p>
        </div>
        <div className="col-6 col-lg-2">
          <h6 className="fw-bold mb-4">Platform</h6>
          <ul className="list-unstyled d-flex flex-column gap-3 text-muted">
            <li><Link to="/" className="text-decoration-none text-muted hover-green">Generator</Link></li>
            <li><Link to="/saved" className="text-decoration-none text-muted hover-green">Saved Trips</Link></li>
            <li><Link to="/comparison" className="text-decoration-none text-muted hover-green">Comparison</Link></li>
          </ul>
        </div>
        <div className="col-6 col-lg-2">
          <h6 className="fw-bold mb-4">Support</h6>
          <ul className="list-unstyled d-flex flex-column gap-3 text-muted">
            <li><Link to="/about" className="text-decoration-none text-muted hover-green">About Us</Link></li>
            <li><Link to="/contact" className="text-decoration-none text-muted hover-green">Contact</Link></li>
            <li><HelpCircle size={16} className="me-2" />FAQ</li>
          </ul>
        </div>
        <div className="col-lg-4">
          <h6 className="fw-bold mb-4">Stay Inspired</h6>
          <div className="position-relative">
            <input type="email" className="form-control premium-input pe-5" placeholder="Your email address" />
            <button className="btn btn-green position-absolute end-0 top-0 h-100 px-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="text-center mt-5 pt-5 border-top border-opacity-5">
        <p className="text-muted small">&copy; 2026 Omer's Travel AI. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const ComparisonBar = ({ comparisonList, removeFromComparison, clearComparison }) => {
  if (comparisonList.length === 0) return null;

  return (
    <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4 z-3 w-100 px-3" style={{ maxWidth: '800px' }}>
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="premium-card p-3 shadow-lg d-flex align-items-center justify-content-between gap-3 bg-success bg-opacity-10 border-success"
      >
        <div className="d-flex align-items-center gap-3 overflow-auto py-2">
          <div className="d-flex align-items-center gap-2">
            <Layers size={20} className="text-success" />
            <span className="fw-bold text-nowrap">Compare ({comparisonList.length}):</span>
          </div>
          {comparisonList.map((item, idx) => (
            <div key={idx} className="badge rounded-pill bg-success p-2 d-flex align-items-center gap-2">
              <span className="text-truncate" style={{ maxWidth: '100px' }}>{item.title}</span>
              <X size={14} className="cursor-pointer" onClick={() => removeFromComparison(idx)} />
            </div>
          ))}
        </div>
        <div className="d-flex gap-2">
          <Link to="/comparison" className="btn btn-green btn-sm px-4">Compare Now</Link>
          <button onClick={clearComparison} className="btn btn-link text-muted btn-sm d-none d-md-block">Clear</button>
        </div>
      </motion.div>
    </div>
  );
};

/* --- PAGES --- */

const Home = ({ addToSaved, addToComparison, recentlySaved }) => {
  const [step, setStep] = useState(1);
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
        "budgetBreakdown": { "transport": "string", "stays": "string", "dining": "string", "activities": "string" },
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
    <div className="container">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="row justify-content-center text-center py-5">
            <div className="col-lg-8">
              <div className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2 mb-4">
                <Sparkles size={14} className="me-2" />
                AI-POWERED EXPLORATION
              </div>
              <h1 className="display-2 fw-800 mb-4">Discover Your Next <br /> <span style={{ color: 'var(--primary-green)' }}>Grand Journey</span></h1>
              <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '600px' }}>Experience travel redefined with our AI-curated itineraries, tailored precisely to your style.</p>
              <div className="premium-card p-4 p-md-5 mt-4 text-start">
                <div className="row g-4">
                  <div className="col-md-6"><label className="form-label text-muted small fw-bold text-uppercase">Departure Point</label><div className="position-relative"><MapPin className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={18} /><input type="text" name="origin" value={formData.origin} onChange={handleInputChange} className="form-control premium-input ps-5" placeholder="Starting City..." /></div></div>
                  <div className="col-md-6"><label className="form-label text-muted small fw-bold text-uppercase">Target Destination</label><div className="position-relative"><Globe className="position-absolute translate-middle-y top-50 ms-3 text-muted" size={18} /><input type="text" name="destination" value={formData.destination} onChange={handleInputChange} className="form-control premium-input ps-5" placeholder="Destination..." /></div></div>
                  <div className="col-12 mt-4"><label className="form-label text-muted small fw-bold text-uppercase mb-3">Preferred Mobility</label><div className="row g-3">{transportOptions.map(opt => (<div className="col-4" key={opt.id}><button onClick={() => setFormData(p => ({ ...p, transport: opt.id }))} className={`w-100 p-3 premium-card d-flex flex-column align-items-center gap-2 border-0 ${formData.transport === opt.id ? 'bg-success bg-opacity-10' : 'bg-transparent'}`} style={{ borderColor: formData.transport === opt.id ? 'var(--primary-green)' : 'transparent', border: '1px solid' }}><opt.icon size={24} color={formData.transport === opt.id ? 'var(--primary-green)' : 'var(--text-muted)'} /><span className="small fw-bold" style={{ color: formData.transport === opt.id ? 'var(--primary-green)' : 'var(--text-muted)' }}>{opt.label}</span></button></div>))}</div></div>
                  <div className="col-12 text-center mt-5"><button onClick={() => setStep(2)} disabled={!formData.origin || !formData.destination} className="btn btn-green btn-lg px-5 py-3">Next Step</button></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="row justify-content-center py-5">
            <div className="col-lg-6">
              <button onClick={() => setStep(1)} className="btn text-muted p-0 d-flex align-items-center gap-2 mb-4 bg-transparent border-0"><ArrowLeft size={18} /> BACK</button>
              <h2 className="display-5 fw-bold mb-4">Set Your Horizon</h2>
              <form onSubmit={generateTravelPlan} className="premium-card p-4 p-md-5">
                <div className="row g-4">
                  <div className="col-md-6"><label className="form-label text-muted small fw-bold text-uppercase">Departure Date</label><input type="date" name="startDate" required onChange={handleInputChange} className="form-control premium-input" /></div>
                  <div className="col-md-6"><label className="form-label text-muted small fw-bold text-uppercase">Return Date</label><input type="date" name="endDate" required onChange={handleInputChange} className="form-control premium-input" /></div>
                  <div className="col-12 mt-4"><label className="form-label text-muted small fw-bold text-uppercase">Budget Approach</label><select name="budget" defaultValue="moderate" onChange={handleInputChange} className="form-select premium-input"><option value="economy">Economy</option><option value="moderate">Moderate</option><option value="luxury">Luxury</option></select></div>
                  <div className="col-12 mt-5"><button type="submit" disabled={loading} className="btn btn-green btn-lg w-100 py-3">{loading ? 'Curating Plan...' : 'Generate Itinerary'}</button></div>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {step === 3 && itinerary && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="row py-5">
            <div className="col-12 d-flex justify-content-between mb-5">
              <button onClick={() => setStep(2)} className="btn text-muted p-0 d-flex align-items-center gap-2 bg-transparent border-0"><RefreshCw size={18} /> RESET</button>
              <div className="d-flex gap-2">
                <button onClick={() => addToSaved(itinerary)} className="btn btn-green d-flex align-items-center gap-2 px-4 shadow-sm">
                  <Bookmark size={18} /> Save Trip
                </button>
                <button onClick={() => addToComparison(itinerary)} className="btn btn-outline-success d-flex align-items-center gap-2 px-4 premium-card bg-transparent">
                  <Layers size={18} /> Compare
                </button>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="premium-card p-4 p-md-5 mb-4">
                <h1 className="display-5 fw-bold mb-3">{itinerary.title}</h1>
                <p className="text-success fw-bold d-flex align-items-center gap-2"><Calendar size={18} /> {itinerary.duration}</p>
                <div className="my-5">
                  <h5 className="fw-bold mb-4 opacity-50">DAY BY DAY EXPLORATION</h5>
                  {itinerary.days.map((d, i) => (
                    <div key={i} className="d-flex gap-4 mb-5 pb-5 border-start border-success border-opacity-25 ps-4 ms-3 position-relative">
                      <div className="position-absolute translate-middle-x" style={{ left: '-25px', top: '0', background: 'var(--primary-green)', width: '20px', height: '20px', borderRadius: '50%', border: '4px solid var(--bg-main)' }}></div>
                      <div>
                        <span className="small fw-bold text-success mb-2 d-block">DAY {d.day}</span>
                        <p className="fs-5 lh-lg m-0">{d.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="premium-card p-4 mb-4">
                <h5 className="fw-bold mb-4">Financial Insight</h5>
                {Object.entries(itinerary.budgetBreakdown).map(([k, v], i) => (
                  <div key={i} className="d-flex justify-content-between mb-3 text-muted">
                    <span className="text-capitalize">{k}</span>
                    <span className="fw-bold text-main">{v}</span>
                  </div>
                ))}
                <hr className="opacity-10 my-4" />
                <div className="d-flex justify-content-between h3 fw-bold text-success">
                  <span>Investment</span>
                  <span>{itinerary.totalEstimate}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SavedTrips = ({ savedTrips, removeSaved }) => (
  <div className="container py-5">
    <h1 className="display-4 fw-bold mb-5">Your Saved Journeys</h1>
    {savedTrips.length === 0 ? (
      <div className="premium-card p-5 text-center mt-5">
        <Bookmark size={48} className="text-muted mb-4 opacity-25" />
        <h3>Empty List</h3>
        <p className="text-muted">Start generating some itineraries to save them here!</p>
        <Link to="/" className="btn btn-green mt-4 px-5">Back to Home</Link>
      </div>
    ) : (
      <div className="row g-4">
        {savedTrips.map((trip, i) => (
          <div className="col-md-6 col-lg-4" key={i}>
            <div className="premium-card p-4 position-relative h-100">
              <button 
                className="btn btn-link text-muted position-absolute top-0 end-0 m-3"
                onClick={() => removeSaved(i)}
              >
                <X size={20} />
              </button>
              <h4 className="fw-bold mb-3">{trip.title}</h4>
              <p className="text-success small fw-bold mb-3 d-flex align-items-center gap-2">
                <Calendar size={14} /> {trip.duration}
              </p>
              <div className="mt-4 pt-3 border-top border-opacity-10 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-success">{trip.totalEstimate}</span>
                <Link to="/" className="btn btn-sm btn-outline-success">View Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ComparisonPage = ({ comparisonList, removeOne }) => (
  <div className="container py-5">
    <h1 className="display-4 fw-bold mb-5">Side-by-Side Comparison</h1>
    {comparisonList.length < 2 ? (
      <div className="premium-card p-5 text-center mt-5">
        <Layers size={48} className="text-muted mb-4 opacity-25" />
        <h3>Add More Trips</h3>
        <p className="text-muted">You need at least two trips to start a comparison.</p>
        <Link to="/" className="btn btn-green mt-4 px-5">Go Back</Link>
      </div>
    ) : (
      <div className="table-responsive mt-5">
        <table className="table table-borderless text-main">
          <thead>
            <tr>
              <th className="bg-transparent">Points</th>
              {comparisonList.map((item, id) => (
                <th key={id} className="bg-transparent text-center">
                   <div className="premium-card p-3 bg-opacity-5">
                     <span className="fw-bold">{item.title}</span>
                     <X size={16} className="ms-3 cursor-pointer text-muted" onClick={() => removeOne(id)} />
                   </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="fw-bold opacity-50 py-4">Destination</td>
              {comparisonList.map((item, id) => (
                <td key={id} className="text-center py-4">{item.title.split(":")[1] || item.title}</td>
              ))}
            </tr>
            <tr>
              <td className="fw-bold opacity-50 py-4">Timeline</td>
              {comparisonList.map((item, id) => (
                <td key={id} className="text-center py-4">{item.duration}</td>
              ))}
            </tr>
            <tr>
              <td className="fw-bold opacity-50 py-4">Investment</td>
              {comparisonList.map((item, id) => (
                <td key={id} className="text-center py-4 fw-bold text-success">{item.totalEstimate}</td>
              ))}
            </tr>
            <tr>
              <td className="fw-bold opacity-50 py-4">Highlights</td>
              {comparisonList.map((item, id) => (
                <td key={id} className="text-center py-4">
                  {item.highlights.map((h, j) => <div key={j} className="small text-muted mb-1">{h}</div>)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const About = () => (
  <div className="container py-5">
    <div className="row justify-content-center">
      <div className="col-lg-8 text-center py-5">
        <Globe size={64} className="text-success mb-5" />
        <h1 className="display-3 fw-bold mb-4">Our Mission</h1>
        <p className="lead fs-4 text-muted lh-lg">We believe that every journey should be as unique as the explorer themselves. By combining cutting-edge AI with deep travel insights, we create experiences that foster connection, curiosity, and awe.</p>
      </div>
    </div>
    <div className="row g-4 mt-5">
      {['Intelligence', 'Personalization', 'Authenticity'].map(item => (
        <div className="col-md-4" key={item}>
          <div className="premium-card p-5 text-center h-100">
            <h3 className="fw-bold mb-3">{item}</h3>
            <p className="text-muted">Curating the world's most impressive experiences through the lens of data and passion.</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Contact = () => (
  <div className="container py-5">
    <div className="row justify-content-center">
      <div className="col-lg-10">
        <div className="premium-card p-5">
          <div className="row g-5">
            <div className="col-lg-5">
              <h2 className="display-5 fw-bold mb-4">Let's Talk Travel</h2>
              <p className="text-muted mb-5">Have custom requests or need assistance with your AI-generated plan? We're here to help.</p>
              <div className="d-flex flex-column gap-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box m-0" style={{ width: '48px', height: '48px' }}><Mail size={20} /></div>
                  <span className="fw-bold">hello@omerstravel.ai</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box m-0" style={{ width: '48px', height: '48px' }}><HelpCircle size={20} /></div>
                  <span className="fw-bold">24/7 Concierge Support</span>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <form className="row g-4">
                <div className="col-md-6"><input type="text" className="form-control premium-input" placeholder="Full Name" /></div>
                <div className="col-md-6"><input type="email" className="form-control premium-input" placeholder="Email Address" /></div>
                <div className="col-12"><textarea className="form-control premium-input" rows="5" placeholder="Your Message"></textarea></div>
                <div className="col-12"><button type="submit" className="btn btn-green btn-lg px-5">Send Message</button></div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* --- MAIN APP --- */

const App = () => {
  const [theme, setTheme] = useState('dark');
  const [savedTrips, setSavedTrips] = useState(() => JSON.parse(localStorage.getItem('savedTrips') || '[]'));
  const [comparisonList, setComparisonList] = useState(() => JSON.parse(localStorage.getItem('comparisonList') || '[]'));
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
  }, [savedTrips]);

  useEffect(() => {
    localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
  }, [comparisonList]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const addToSaved = (trip) => {
    if (!savedTrips.find(t => t.title === trip.title)) {
      setSavedTrips([...savedTrips, trip]);
      alert("Trip saved successfully!");
    } else {
      alert("This trip is already in your saves.");
    }
  };

  const addToComparison = (trip) => {
    if (comparisonList.length >= 4) {
      alert("You can only compare up to 4 trips at once.");
      return;
    }
    if (!comparisonList.find(t => t.title === trip.title)) {
      setComparisonList([...comparisonList, trip]);
    }
  };

  const removeFromComparison = (index) => setComparisonList(prev => prev.filter((_, i) => i !== index));
  const removeSaved = (index) => setSavedTrips(prev => prev.filter((_, i) => i !== index));

  return (
    <div className="container-fluid min-vh-100 p-0 d-flex flex-column">
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>

      <Navbar theme={theme} toggleTheme={toggleTheme} setSearchQuery={setSearchQuery} />

      <main className="flex-grow-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home addToSaved={addToSaved} addToComparison={addToComparison} />} />
            <Route path="/saved" element={<SavedTrips savedTrips={savedTrips} removeSaved={removeSaved} />} />
            <Route path="/comparison" element={<ComparisonPage comparisonList={comparisonList} removeOne={removeFromComparison} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </AnimatePresence>
      </main>

      <ComparisonBar 
        comparisonList={comparisonList} 
        removeFromComparison={removeFromComparison}
        clearComparison={() => setComparisonList([])}
      />
      
      <Footer />
    </div>
  );
};

export default App;
