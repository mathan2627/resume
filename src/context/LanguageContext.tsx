import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ta";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Navigation & Branding
  "app.name": { en: "ProofPath AI", ta: "புரூவ்பாத் AI" },
  "app.tagline": { en: "Prove Your Skills. Discover Your Path.", ta: "திறன்களை மெய்ப்பியுங்கள். பாதையை கண்டறியுங்கள்." },
  "nav.home": { en: "Home", ta: "முகப்பு" },
  "nav.howItWorks": { en: "How It Works", ta: "செயல்முறை" },
  "nav.features": { en: "Features", ta: "அம்சங்கள்" },
  "nav.internships": { en: "Internship Discovery", ta: "பயிற்சி வாய்ப்புகள்" },
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

  // Hero Section
  "hero.badge": { en: "Evidence-Based Career Platform", ta: "சான்று அடிப்படையிலான தொழில் தளம்" },
  "hero.title": { en: "Prove Your Skills.", ta: "திறன்களை மெய்ப்பியுங்கள்." },
  "hero.subtitle": { en: "Discover Your Path.", ta: "பாதையை கண்டறியுங்கள்." },
  "hero.description": {
    en: "Transform resume claims into verified evidence using GitHub projects, practical coding challenges, and transparent AI matching. Real opportunities with verified source links.",
    ta: "சுயவிவர கூற்றுகளை GitHub திட்டங்கள், நடைமுறை குறியீட்டு சவால்கள் மற்றும் ஒளிவுமறைவற்ற AI பொருத்தம் மூலம் சரிபார்க்கப்பட்ட சான்றுகளாக மாற்றுங்கள்.",
  },
  "hero.cta.start": { en: "Build Your Proof Passport", ta: "உங்கள் பாஸ்போர்ட்டை உருவாக்குங்கள்" },
  "hero.cta.explore": { en: "Explore Internships", ta: "வாய்ப்புகளை காண்க" },

  // Status Labels
  "status.claimed": { en: "Claimed", ta: "கூறப்பட்டது" },
  "status.evidenceFound": { en: "Evidence Found", ta: "சான்று கிடைத்தது" },
  "status.challengeAssessed": { en: "Challenge Assessed", ta: "சவால் சரிபார்க்கப்பட்டது" },
  "status.insufficient": { en: "Evidence Insufficient", ta: "சான்று போதாது" },
  "status.verified": { en: "Verified", ta: "சரிபார்க்கப்பட்டது" },
  "status.unverified": { en: "Unverified", ta: "சரிபார்க்கப்படாதது" },
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
