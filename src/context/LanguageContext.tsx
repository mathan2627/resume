import React, { createContext, useContext, useState } from "react";

type Language = "en" | "ta";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Navigation & Branding
  "app.name": { en: "ProofPath AI", ta: "புரூவ்பாத் AI" },
  "app.tagline": { en: "Prove Your Skills. Discover Your Future.", ta: "திறன்களை மெய்ப்பியுங்கள். எதிர்காலத்தை கண்டறியுங்கள்." },
  "nav.home": { en: "Home", ta: "முகப்பு" },
  "nav.howItWorks": { en: "How It Works", ta: "செயல்முறை" },
  "nav.features": { en: "Features", ta: "அம்சங்கள்" },
  "nav.internships": { en: "Opportunities", ta: "வேலை வாய்ப்புகள்" },
  "nav.students": { en: "For Students", ta: "மாணவர்களுக்கு" },
  "nav.recruiters": { en: "For Recruiters", ta: "தேர்வாளர்களுக்கு" },
  "nav.signIn": { en: "Sign In", ta: "உள்நுழைக" },
  "nav.getStarted": { en: "Get Started", ta: "தொடங்குக" },
  "nav.dashboard": { en: "Dashboard", ta: "கட்டுப்பாட்டகம்" },
  "nav.skills": { en: "Skill Proof Engine", ta: "திறன் சான்று முறை" },
  "nav.challenges": { en: "Adaptive Challenges", ta: "பயிற்சி சவால்கள்" },
  "nav.roadmap": { en: "Career Roadmap", ta: "வளர்ச்சி வரைபடம்" },
  "nav.passport": { en: "Proof Passport", ta: "புரூவ் பாஸ்போர்ட்" },
  "nav.applications": { en: "Applications", ta: "விண்ணப்பங்கள்" },
  "nav.resume": { en: "Resume & ATS", ta: "சுயவிவரம் & ஏ.டி.எஸ்" },
  "nav.interview": { en: "Mock Interview", ta: "மாதிரி நேர்காணல்" },
  "nav.assistant": { en: "AI Assistant", ta: "AI உதவியாளர்" },
  "nav.admin": { en: "Admin Console", ta: "நிர்வாக மையம்" },
  "nav.settings": { en: "Settings & Privacy", ta: "அமைப்புகள் & தனியுரிமை" },

  // Hero Section
  "hero.badge": { en: "Automated Global Opportunity Intelligence", ta: "தானியங்கி சர்வதேச வேலை நுண்ணறிவு" },
  "hero.title": { en: "Prove Your Skills.", ta: "திறன்களை மெய்ப்பியுங்கள்." },
  "hero.subtitle": { en: "Discover Your Future.", ta: "எதிர்காலத்தை வெல்லுங்கள்." },
  "hero.description": {
    en: "Transform resume claims into verified evidence using GitHub projects, practical coding challenges, and transparent AI matching. Connected to real-time global opportunity feeds with verified employer URLs.",
    ta: "சுயவிவரக் கூற்றுகளை GitHub குறியீட்டுத் திட்டங்கள், நேரடி மதிப்பீடுகள் மற்றும் ஒளிவுமறைவற்ற AI பொருத்தம் மூலம் சரிபார்க்கப்பட்ட திறன்களாக மாற்றுங்கள். சரிபார்க்கப்பட்ட நிறுவன தளங்களுடன் இணைக்கப்பட்டது.",
  },
  "hero.cta.start": { en: "Get Started", ta: "தொடங்குக" },
  "hero.cta.explore": { en: "Explore Opportunities", ta: "வாய்ப்புகளை காண்க" },

  // Workflow Steps
  "workflow.title": { en: "The Evidence-First Pipeline", ta: "சான்று அடிப்படையிலான அணுகுமுறை" },
  "workflow.subtitle": { en: "How ProofPath AI bridges the trust gap between student potential and genuine employer demand.", ta: "மாணவர்களின் திறமைக்கும் நிறுவனங்களின் தேவைகளுக்கும் பாலமாக ProofPath AI எவ்வாறு செயல்படுகிறது." },
  "workflow.step1": { en: "Resume Claims", ta: "சுயவிவரக் கூற்றுகள்" },
  "workflow.step2": { en: "Project Evidence", ta: "திட்ட சான்றுகள்" },
  "workflow.step3": { en: "Practical Assessment", ta: "நேரடி மதிப்பீடு" },
  "workflow.step4": { en: "Skill Proof", ta: "திறன் உறுதிப்பாடு" },
  "workflow.step5": { en: "Intelligent Matching", ta: "புத்திசாலி பொருத்தம்" },
  "workflow.step6": { en: "Career Growth", ta: "தொழில் வளர்ச்சி" },

  // Status Labels
  "status.claimed": { en: "Claimed", ta: "கூறப்பட்டது" },
  "status.evidenceFound": { en: "Evidence Found", ta: "சான்று கிடைத்தது" },
  "status.challengeAssessed": { en: "Challenge Assessed", ta: "சவால் சரிபார்க்கப்பட்டது" },
  "status.insufficient": { en: "Evidence Insufficient", ta: "சான்று போதாது" },
  "status.verified": { en: "Verified", ta: "சரிபார்க்கப்பட்டது" },
  "status.unverified": { en: "Unverified", ta: "சரிபார்க்கப்படாதது" },
  "status.fresh": { en: "Fresh Listing", ta: "புதிய வாய்ப்பு" },
  "status.recent": { en: "Recent", ta: "சமீபத்தியது" },

  // Filters & Search
  "filter.searchPlaceholder": { en: "Search by role, skill, company, or keyword...", ta: "பணி, திறன், நிறுவனம் அல்லது முக்கிய சொற்களை தேடுக..." },
  "filter.allLocations": { en: "All Locations", ta: "அனைத்து இடங்கள்" },
  "filter.remote": { en: "Remote", ta: "தொலைதூரப் பணி" },
  "filter.hybrid": { en: "Hybrid", ta: "கலப்பு முறை" },
  "filter.onsite": { en: "On-site", ta: "நேரடிப் பணி" },
  "filter.internship": { en: "Internship", ta: "பயிற்சிப் பணி" },
  "filter.fullTime": { en: "Full-Time", ta: "முழுநேரப் பணி" },
  "filter.graduate": { en: "Graduate / Entry", ta: "புதிய பட்டதாரிகள்" },

  // Common Actions
  "btn.save": { en: "Save", ta: "சேமிக்க" },
  "btn.saved": { en: "Saved", ta: "சேமிக்கப்பட்டது" },
  "btn.applyDirect": { en: "Apply on Employer Site", ta: "நிறுவன தளத்தில் விண்ணப்பிக்க" },
  "btn.viewDetails": { en: "View Details", ta: "விவரங்களை காண்க" },
  "btn.runChallenge": { en: "Prove This Skill", ta: "திறனை நிரூபிக்க" },
  "btn.generateRoadmap": { en: "Generate Roadmap", ta: "வரைபடம் உருவாக்குக" },
  "btn.refresh": { en: "Refresh Intelligence", ta: "நுண்ணறிவை புதுப்பிக்க" },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("proofpath_lang") as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("proofpath_lang", lang);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key] && TRANSLATIONS[key][language]) {
      return TRANSLATIONS[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
