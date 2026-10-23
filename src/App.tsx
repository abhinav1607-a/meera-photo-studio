import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown, ArrowRight, ArrowUpRight, Camera, Check, ChevronLeft, ChevronRight,
  Clapperboard, Clock3, Instagram, Mail, MapPin, Menu, Phone, Play, Send,
  Sparkles, Video, X, MessageCircle, Aperture, Users, Award, Heart
} from 'lucide-react';
import { isSupabaseConfigured, supabase, type GalleryItem, type Enquiry } from './lib/supabase';

const CLOUDINARY_UPLOAD_ENDPOINT = '/api/cloudinary/sign-upload';
const CLOUDINARY_DELETE_ENDPOINT = '/api/cloudinary/delete';

type CloudinaryUploadResult = { secure_url: string; public_id: string };

async function getCloudinaryAuthHeaders() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please sign in again before uploading media.');
  return { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
}

async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const headers = await getCloudinaryAuthHeaders();
  const signResponse = await fetch(CLOUDINARY_UPLOAD_ENDPOINT, { method: 'POST', headers, body: JSON.stringify({}) });
  const signData = await signResponse.json();
  if (!signResponse.ok) throw new Error(signData.error || 'Could not authorize Cloudinary upload.');
  const body = new FormData();
  body.append('file', file);
  body.append('api_key', signData.api_key);
  body.append('timestamp', String(signData.timestamp));
  body.append('signature', signData.signature);
  body.append('public_id', signData.public_id);
  body.append('upload_preset', signData.upload_preset);
  const response = await fetch('https://api.cloudinary.com/v1_1/' + signData.cloud_name + '/image/upload', { method: 'POST', body });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Cloudinary upload failed.');
  return { secure_url: result.secure_url, public_id: result.public_id };
}

async function deleteFromCloudinary(publicId: string) {
  const headers = await getCloudinaryAuthHeaders();
  const response = await fetch(CLOUDINARY_DELETE_ENDPOINT, { method: 'POST', headers, body: JSON.stringify({ public_id: publicId }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not delete Cloudinary asset.');
}

const WHATSAPP_NUMBER = '919827486699';
const PHONE_DISPLAY = '+91 9827486699';
const EMAIL_ADDRESS = 'meerastudiorpr@gmail.com';

const demoPhotos: GalleryItem[] = [
  { id: 'sample-1', title: 'A Celebration of Love', caption: 'Wedding stories · sample imagery', category: 'Weddings', image_url: 'https://qzvbbytilxyzqslvnocm.supabase.co/storage/v1/object/public/Photos%20For%20website/DSC_1269.JPG', alt_text: 'Wedding celebration in warm evening light', is_published: true, is_featured: true, position: 1 },
  { id: 'sample-2', title: 'Quiet Promises', caption: 'Pre-wedding · sample imagery', category: 'Pre-Wedding', image_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1400&q=85', alt_text: 'Couple portrait in a natural setting', is_published: true, is_featured: false, position: 2 },
  { id: 'sample-3', title: 'The Little Moments', caption: 'Celebrations · sample imagery', category: 'Birthdays', image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=85', alt_text: 'Colorful birthday celebration details', is_published: true, is_featured: false, position: 3 },
  { id: 'sample-4', title: 'In Their Element', caption: 'Portraits · sample imagery', category: 'Portraits', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85', alt_text: 'Expressive studio portrait', is_published: true, is_featured: false, position: 4 },
  { id: 'sample-5', title: 'The Joy Between Frames', caption: 'Candid · sample imagery', category: 'Candid Photography', image_url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1400&q=85', alt_text: 'Candid moment at an outdoor celebration', is_published: true, is_featured: false, position: 5 },
  { id: 'sample-6', title: 'A Wider Perspective', caption: 'Locations · sample imagery', category: 'Drone Photography', image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85', alt_text: 'Wide landscape with a dramatic sky', is_published: true, is_featured: false, position: 6 },
  { id: 'sample-7', title: 'Made to Remember', caption: 'Album stories · sample imagery', category: 'Kazima Albums', image_url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1400&q=85', alt_text: 'Wedding details in soft natural light', is_published: true, is_featured: false, position: 7 },
  { id: 'sample-8', title: 'People and Purpose', caption: 'Events · sample imagery', category: 'Events', image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=85', alt_text: 'Elegant event space prepared for a gathering', is_published: true, is_featured: false, position: 8 },
  { id: 'sample-9', title: 'The Details Matter', caption: 'Editorial · sample imagery', category: 'Commercial Photography', image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85', alt_text: 'Creative event lighting and atmosphere', is_published: true, is_featured: false, position: 9 },
];

const baseServices = [
  { title: 'Wedding Photography', short: 'Every ritual, every glance, every emotion—preserved with care.', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80', number: '01' },
  { title: 'Pre-Wedding Shoots', short: 'Thoughtful concepts and portraits that feel unmistakably yours.', image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=900&q=80', number: '02' },
  { title: 'Birthdays & Celebrations', short: 'The energy, the people, and the little moments worth keeping.', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80', number: '03' },
  { title: 'Events & Institutions', short: 'Reliable, considered coverage for public, cultural and professional events.', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80', number: '04' },
  { title: 'Videography & Films', short: 'Atmospheric films and highlight edits that bring the day back to life.', image: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=80', number: '05' },
  { title: 'Drone Cinematography', short: 'Aerial perspectives for suitable venues, outdoor shoots and events.', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=900&q=80', number: '06' },
  { title: 'Portraits & Families', short: 'Honest portraits and family photographs to return to for years.', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80', number: '07' },
  { title: 'Kazima Album Making', short: 'Beautifully arranged photographs, thoughtfully brought together in print.', image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80', number: '08' },
  { title: 'Retirement & Anniversary Celebrations', short: 'Warm, respectful coverage of milestone anniversaries, retirement ceremonies and the people who make them memorable.', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80', number: '09' },
];

const categoryNames = ['All Work', 'Weddings', 'Pre-Wedding', 'Ring Ceremony', 'Birthdays', 'Retirement & Anniversary', 'Events', 'Candid Photography', 'Portraits', 'Family Photography', 'Commercial Photography', 'Sports Photography', 'Drone Photography', 'Cinematic Projects', 'Kazima Albums'];

const wa = (service: string, details = '') => 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Hello Meera Photo Studio, I would like to enquire about ' + service + '.' + (details ? '\n\n' + details : '') + ' Please share your packages, availability, and pricing.');

type VideoProject = { id: string; title: string; description: string | null; category: string; video_url: string; poster_url: string | null; is_published: boolean; position: number };
type ServiceRecord = { id: string; title: string; description: string; image_url: string | null; is_published: boolean; position: number };
type SiteConfig = { hero_title: string; hero_subtitle: string; about_text: string; hero_image: string; phone: string; email: string; location: string };
const defaultConfig: SiteConfig = {
  hero_title: 'Stories Captured.\nMemories Preserved.',
  hero_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=90',
  hero_subtitle: 'Professional photography & cinematography in Raipur, Chhattisgarh. Creating timeless visual stories for more than three decades.',
  about_text: 'Photography is more than capturing an image. It is about preserving emotions, celebrating milestones, and telling stories that remain meaningful for generations. With more than 30 years of experience, Mukesh Agrawal brings dedication, creativity, and professional expertise to every assignment.',
  phone: PHONE_DISPLAY,
  email: EMAIL_ADDRESS,
  location: 'Raipur, Chhattisgarh, India',
};

function openWhatsApp(service: string, details = '') {
  window.open(wa(service, details), '_blank', 'noopener,noreferrer');
}

function App() {
  const isAdmin = window.location.pathname.replace(/\/$/, '') === '/admin';
  return isAdmin ? <AdminPage /> : <PortfolioSite />;
}


const studioStats = [
  { label: 'SESSIONS COMPLETED', target: 6000, suffix: '+', Icon: Camera },
  { label: 'HAPPY CLIENTS', target: 1000, suffix: '+', Icon: Users },
  { label: 'YEARS EXPERIENCE', target: 30, suffix: '+', Icon: Award },
  { label: 'CLIENT SATISFACTION', target: 99, suffix: '%', Icon: Heart },
];

function AboutStatistics() {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const [values, setValues] = useState<number[]>(studioStats.map(() => 0));

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = false;
    const cancelFrame = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      startRef.current = null;
    };
    const reset = () => {
      cancelFrame();
      setValues(studioStats.map(() => 0));
    };
    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / 1800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValues(studioStats.map((stat) => progress >= 1 ? stat.target : Math.floor(stat.target * eased)));
      if (progress < 1 && visible) frameRef.current = requestAnimationFrame(animate);
      else frameRef.current = null;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        cancelFrame();
        if (reduceMotion) setValues(studioStats.map((stat) => stat.target));
        else {
          setValues(studioStats.map(() => 0));
          frameRef.current = requestAnimationFrame(animate);
        }
      } else reset();
    }, { threshold: 0.25 });
    observer.observe(panel);
    return () => {
      observer.disconnect();
      cancelFrame();
    };
  }, []);

  return (
    <div className="about-stats" ref={panelRef} aria-label="Meera Photo Studio statistics">
      {studioStats.map(({ label, target, suffix, Icon }, index) => (
        <div className="about-stat" key={label}>
          <Icon className="about-stat-icon" size={22} strokeWidth={1.35} aria-hidden="true" />
          <strong aria-label={target.toLocaleString('en-IN') + suffix}>{values[index].toLocaleString('en-IN')}<span>{suffix}</span></strong>
          <span className="about-stat-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

function PortfolioSite() {
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState('All Work');
  const [showAllWork, setShowAllWork] = useState(false);
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [usingDemoPhotos, setUsingDemoPhotos] = useState(false);
  const [videos, setVideos] = useState<VideoProject[]>([]);
  const [serviceContent, setServiceContent] = useState(baseServices);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultConfig);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoProject | null>(null);
  const [formState, setFormState] = useState({ full_name: '', phone: '', email: '', service: 'Wedding Photography', event_date: '', event_location: '', message: '' });
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let alive = true;
    async function loadContent() {
      try {
        const [galleryResult, videoResult, servicesResult, settingsResult] = await Promise.all([
          client!.from('gallery_items').select('id,title,caption,category,image_url,alt_text,is_published,is_featured,position,created_at').eq('is_published', true).order('position', { ascending: true }),
          client!.from('video_projects').select('id,title,description,category,video_url,poster_url,is_published,position').eq('is_published', true).order('position', { ascending: true }),
          client!.from('services').select('id,title,description,image_url,is_published,position').eq('is_published', true).order('position', { ascending: true }),
          client!.from('site_settings').select('key,value').eq('key', 'homepage').maybeSingle(),
        ]);
        if (!alive) return;
        if (!galleryResult.error && galleryResult.data && galleryResult.data.length > 0) { setPhotos(galleryResult.data as GalleryItem[]); setUsingDemoPhotos(false); }
        if (!videoResult.error && videoResult.data) setVideos(videoResult.data as VideoProject[]);
        if (!servicesResult.error && servicesResult.data && servicesResult.data.length > 0) setServiceContent(servicesResult.data.map((item: ServiceRecord, index: number) => ({ title: item.title, short: item.description, image: item.image_url || baseServices[index % baseServices.length].image, number: String(index + 1).padStart(2, '0') })));
        if (!settingsResult.error && settingsResult.data?.value) setSiteConfig({ ...defaultConfig, ...(settingsResult.data.value as Partial<SiteConfig>) });
      } catch (error) {
        console.error('Could not load portfolio content:', error);
      }
    }
    void loadContent();
    return () => { alive = false; };
  }, []);

  const allWorkPreview = useMemo(() => {
    const seenCategories = new Set<string>();
    return photos.filter((photo) => {
      if (seenCategories.has(photo.category)) return false;
      seenCategories.add(photo.category);
      return true;
    });
  }, [photos]);
  const visiblePhotos = useMemo(() => category === 'All Work' ? (showAllWork ? photos : allWorkPreview) : photos.filter((photo) => photo.category === category), [photos, category, showAllWork, allWorkPreview]);
  const lightboxPhoto = lightboxIndex === null ? null : visiblePhotos[lightboxIndex];

  useEffect(() => {
    if (!activeVideo) return;
    const onVideoKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setActiveVideo(null); };
    window.addEventListener('keydown', onVideoKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onVideoKey); document.body.style.overflow = ''; };
  }, [activeVideo]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowRight') setLightboxIndex((index) => index === null ? null : (index + 1) % visiblePhotos.length);
      if (event.key === 'ArrowLeft') setLightboxIndex((index) => index === null ? null : (index - 1 + visiblePhotos.length) % visiblePhotos.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lightboxIndex, visiblePhotos.length]);

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage('');
    setFormError('');
    if (formState.full_name.trim().length < 2 || formState.phone.trim().length < 7) {
      setFormError('Please enter your name and a valid phone number.');
      return;
    }
    setSending(true);
    const details = 'Name: ' + formState.full_name + '\nPhone: ' + formState.phone + (formState.email ? '\nEmail: ' + formState.email : '') + '\nPreferred date: ' + (formState.event_date || 'Not specified') + '\nLocation: ' + (formState.event_location || 'Not specified') + '\nMessage: ' + (formState.message || '—');
    const client = supabase;
    if (!client) {
      openWhatsApp(formState.service, details);
      setFormMessage('WhatsApp has opened with your enquiry draft. Please press Send in WhatsApp to contact the studio.');
      setSending(false);
      return;
    }
    try {
      const { error } = await client.from('enquiries').insert([{
        full_name: formState.full_name.trim(),
        phone: formState.phone.trim(),
        email: formState.email.trim() || null,
        service: formState.service,
        event_date: formState.event_date || null,
        event_location: formState.event_location.trim() || null,
        message: formState.message.trim() || null,
      }]);
      if (error) throw error;
      setFormMessage('Thank you. Your enquiry has been received; the studio will contact you directly. This is an enquiry, not a confirmed booking.');
      setFormState({ full_name: '', phone: '', email: '', service: 'Wedding Photography', event_date: '', event_location: '', message: '' });
    } catch (error) {
      console.error('Enquiry submission failed:', error);
      setFormError('We could not submit your enquiry online. You can send the same details to the studio through WhatsApp instead.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a href="#home" className="wordmark" aria-label="Meera Photo Studio home">
          <span className="wordmark-icon"><Aperture size={24} strokeWidth={1.4} /></span>
          <span><strong>MEERA</strong><small>PHOTO STUDIO</small></span>
        </a>
        <nav className={menuOpen ? 'main-nav nav-open' : 'main-nav'} aria-label="Main navigation">
          {[['About', '#about'], ['Services', '#services'], ['Portfolio', '#portfolio'], ['Kazima Albums', '#albums'], ['Films', '#films'], ['Contact', '#contact']].map(([label, href]) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <a className="nav-book mobile-book" href="#contact" onClick={() => setMenuOpen(false)}>Book a Shoot <ArrowUpRight size={15} /></a>
        </nav>
        <a className="nav-book desktop-book" href="#contact">Book a Shoot <ArrowUpRight size={15} /></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-image" style={{ backgroundImage: "url(\'" + siteConfig.hero_image + "\')" }} role="img" aria-label="Cinematic wedding scene in warm evening light" />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow light-eyebrow"><span /> PHOTOGRAPHY · CINEMATOGRAPHY · VIDEOGRAPHY</div>
            <p className="hero-kicker">RAIPUR, CHHATTISGARH · EST. WITH EXPERIENCE</p>
            <h1>{siteConfig.hero_title.split('\n').map((line, index) => <span key={index}>{line}{index === 0 ? <br /> : null}</span>)}</h1>
            <p className="hero-copy">{siteConfig.hero_subtitle}</p>
            <div className="hero-actions">
              <a className="button button-light" href="#portfolio">Explore the Portfolio <ArrowRight size={17} /></a>
              <button className="button button-outline-light" onClick={() => openWhatsApp('a photography or film booking')}>Book Your Shoot <ArrowUpRight size={17} /></button>
            </div>
          </div>
          <div className="hero-bottom"><span>01 — THE ART OF PRESENCE</span><a href="#about">SCROLL TO DISCOVER <ArrowDown size={14} /></a></div>
          <div className="hero-side-note">REAL MOMENTS. LASTING STORIES.</div>
        </section>

        <section className="about-editorial section-pad" id="about">
          <div className="about-layout">
            <div className="about-portrait-wrap">
              <div className="about-portrait">
                <img src="/about-mukesh.jpg" alt="Mukesh Agrawal, lead photographer at Meera Photo Studio" fetchPriority="high" />
                <div className="about-portrait-shade" />
                <div className="about-identity"><h3>Mukesh Agrawal</h3><span>LEAD PHOTOGRAPHER</span></div>
              </div>
              <div className="about-experience-badge"><strong>30<span>+</span></strong><span>YEARS BEHIND<br />THE LENS</span></div>
            </div>
            <div className="about-copy">
              <div className="eyebrow"><span /> 01 — ABOUT THE STUDIO</div>
              <h2>Crafting Visual<br /><em>Stories That Last Forever</em></h2>
              <p className="about-lead">With over 30 years of experience in professional photography and videography, Mukesh Agrawal specializes in capturing authentic emotions and meaningful moments. His approach combines technical expertise with artistic vision to create timeless photographs and cinematic films.</p>
              <p className="about-secondary">From weddings and pre-wedding celebrations to birthdays, events, and cinematic films, every moment deserves to be preserved with care, creativity, and attention to detail. Meera Photo Studio is committed to creating photographs and films that turn meaningful occasions into lasting memories.</p>
              <div className="about-features">
                <div><span><Check size={14} /></span>Traditional &amp; candid photography</div>
                <div><span><Check size={14} /></span>Premium albums &amp; prints</div>
                <div><span><Check size={14} /></span>Photography and videography</div>
                <div><span><Check size={14} /></span>Professional event coverage</div>
              </div>
            </div>
          </div>
          <AboutStatistics />
        </section>

        <section className="services section-pad" id="services">
          <div className="section-heading">
            <div><div className="eyebrow"><span /> WHAT WE DO</div><h2>Made for the moments<br /><em>that matter.</em></h2></div>
            <p>Thoughtful photography and cinematic storytelling for life's milestones, celebrations and meaningful work.</p>
          </div>
          <div className="service-grid">
            {serviceContent.map((service) => (
              <article className="service-card" key={service.title}>
                <button className="service-photo" onClick={() => openWhatsApp(service.title)} aria-label={'Enquire about ' + service.title}>
                  <img src={service.image} alt={service.title + ' sample photograph'} loading="lazy" />
                  <span className="service-photo-arrow"><ArrowUpRight size={19} /></span>
                </button>
                <div className="service-card-info"><span className="service-number">{service.number}</span><div><h3>{service.title}</h3><p>{service.short}</p><button className="text-link" onClick={() => openWhatsApp(service.title)}>Enquire about this service <ArrowUpRight size={14} /></button></div></div>
              </article>
            ))}
          </div>
          <p className="service-footnote">Drone operations are subject to applicable permissions, airspace restrictions and weather conditions.</p>
        </section>

        <section className="booking-band">
          <div className="booking-backdrop" />
          <div className="booking-copy">
            <div className="eyebrow light-eyebrow"><span /> THE CALENDAR IS OPEN</div>
            <h2>Bookings<br /><em>are open.</em></h2>
            <p>Tell us what you're planning. We'll help you make room for the moments you'll want to remember.</p>
          </div>
          <div className="booking-list">
            {['Wedding Photography', 'Pre-Wedding Shoots', 'Birthday Photography', 'Retirement & Anniversary Photography', 'Events & Celebrations'].map((service, index) => (
              <button key={service} onClick={() => openWhatsApp(service)}><span>0{index + 1}</span><strong>{service}</strong><ArrowUpRight size={19} /></button>
            ))}
            <p>Also accepting enquiries for retirement ceremonies, anniversaries, films, drone shoots, portraits and Kazima Albums.</p>
          </div>
        </section>

        <section className="portfolio section-pad" id="portfolio">
          <div className="section-heading portfolio-heading">
            <div><div className="eyebrow"><span /> SELECTED STORIES</div><h2>The art of<br /><em>remembering.</em></h2></div>
            <p>Every story has its own rhythm. Browse by occasion and explore a few of the ways we see the world.</p>
          </div>
          <div className="filter-row" role="group" aria-label="Filter portfolio by category">
            {categoryNames.map((item) => <button type="button" key={item} aria-pressed={category === item} className={category === item ? 'filter-pill active' : 'filter-pill'} onClick={() => { setCategory(item); setShowAllWork(false); setLightboxIndex(null); }}>{item}</button>)}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={category}
              className="portfolio-grid"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
            >
              {visiblePhotos.map((photo, index) => (
                <motion.button
                  type="button"
                  className={'portfolio-item portfolio-item-' + (index % 6 + 1)}
                  key={photo.id}
                  onClick={() => setLightboxIndex(index)}
                  aria-label={'View ' + photo.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22, delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.21) }}
                >
                  <img src={photo.image_url} alt={photo.alt_text || photo.title} loading="lazy" />
                  <span className="portfolio-hover"><span>{photo.category}</span><strong>{photo.title}</strong><i><ArrowUpRight size={18} /></i></span>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
          {visiblePhotos.length === 0 && <div className="empty-gallery"><Camera size={27} /><h3>More stories are on the way.</h3><p>There are no published photographs in this category yet.</p><button className="text-link" onClick={() => { setCategory('All Work'); setShowAllWork(false); }}>View all work <ArrowRight size={15} /></button></div>}
          {category === 'All Work' && photos.length > allWorkPreview.length && <div className="portfolio-view-all"><button className="button button-outline-light" type="button" onClick={() => { setShowAllWork(!showAllWork); setLightboxIndex(null); }}>{showAllWork ? 'Show one from each category' : 'View all ' + photos.length + ' photographs'} <ArrowRight size={16} /></button></div>}
          <div className="portfolio-bottom"><span>PHOTOGRAPHS THAT TAKE YOU BACK.</span><button className="text-link" onClick={() => openWhatsApp('a portfolio consultation')}>Discuss your project <ArrowUpRight size={15} /></button></div>
        </section>

        <section className="album-feature" id="albums">
          <div className="album-image"><img src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1400&q=85" alt="Beautifully arranged wedding album details, sample imagery" loading="lazy" /><span className="image-caption">THE PHYSICAL BEAUTY OF A MEMORY</span></div>
          <div className="album-copy">
            <div className="eyebrow"><span /> THE KAZIMA ALBUM EXPERIENCE</div>
            <span className="album-overline">A STORY, HELD IN YOUR HANDS</span>
            <h2>Memories,<br /><em>beautifully bound.</em></h2>
            <p>Some photographs deserve more than a place on a screen. Kazima Album Making brings your chosen images together in a thoughtful, beautifully arranged keepsake made to be revisited and shared.</p>
            <ul><li><Check size={15} /> Personalised image selection and layout</li><li><Check size={15} /> Wedding, pre-wedding and family albums</li><li><Check size={15} /> An elegant way to preserve your story</li></ul>
            <button className="button button-dark" onClick={() => openWhatsApp('Kazima Album Making')}>Enquire about Kazima Albums <ArrowUpRight size={16} /></button>
          </div>
        </section>

        <section className="films section-pad" id="films">
          <div className="section-heading">
            <div><div className="eyebrow"><span /> IN MOTION</div><h2>More than a moment.<br /><em>A feeling, in motion.</em></h2></div>
            <p>Wedding films, pre-wedding stories, event highlights and institutional coverage—crafted to bring the atmosphere back.</p>
          </div>
          {videos.length > 0 ? <div className="video-grid">
            {videos.map((video) => <article className="video-card" key={video.id}>
              <button type="button" className="video-poster video-trigger" onClick={() => setActiveVideo(video)} aria-label={'Play ' + video.title}>
                <img src={video.poster_url || demoPhotos[0].image_url} alt={video.title + ' poster'} loading="lazy" /><span className="play-button"><Play size={18} fill="currentColor" /></span>
              </button><span className="video-category">{video.category}</span><h3><button type="button" className="video-title-button" onClick={() => setActiveVideo(video)}>{video.title}</button></h3><p>{video.description}</p>
            </article>)}
          </div> : <div className="film-teaser">
            <div className="film-teaser-image"><img src="https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1500&q=85" alt="Professional video production equipment, sample imagery" loading="lazy" /><div className="film-overlay"><span className="play-symbol"><Play size={18} fill="currentColor" /></span><span>THE STORY CONTINUES</span></div></div>
            <div className="film-teaser-copy"><Clapperboard size={28} strokeWidth={1.25} /><h3>From the first look<br />to the final frame.</h3><p>Ask us about wedding cinematography, event films and cinematic highlight edits.</p><button className="text-link" onClick={() => openWhatsApp('Videography and Cinematography')}>Explore film services <ArrowUpRight size={15} /></button></div>
          </div>}
          <div className="film-service-line"><span><Video size={17} /> WEDDING FILMS</span><span><Clapperboard size={17} /> EVENT HIGHLIGHTS</span><span><Sparkles size={17} /> DRONE CINEMATOGRAPHY</span></div>
        </section>

        <section className="credentials">
          <div className="credentials-top"><div className="eyebrow light-eyebrow"><span /> INSTITUTIONAL PHOTOGRAPHY</div><h2>Official photographer<br /><em>for institutions.</em></h2><p>Photography coverage for Sports & Youth Welfare, C.G. Olympic Association, Public Work Devison and CG Cricket Asso., as supplied by the studio.</p></div>
          <div className="credentials-list">
            {['Sports & Youth Welfare', 'C.G. Olympic Association', 'Public Work Devison', 'CG Cricket Asso.'].map((name, index) => <div key={name}><span>0{index + 1}</span><strong>{name}</strong><ArrowUpRight size={17} /></div>)}
          </div>
          <div className="credentials-note">Organisational names shown as supplied. Please confirm official styling and permissions before publishing any institutional logo or endorsement.</div>
        </section>

        <section className="contact section-pad" id="contact">
          <div className="contact-heading">
            <div className="eyebrow"><span /> BEGIN A CONVERSATION</div>
            <h2>Let's create<br /><em>something memorable.</em></h2>
            <p>Share a little about what you're planning. We'll get back to you to discuss the details and availability.</p>
            <div className="contact-details">
              <a href={'tel:' + (siteConfig.phone || PHONE_DISPLAY).replace(/[^+\d]/g, '')}><span className="contact-icon"><Phone size={17} /></span><span><small>CALL THE STUDIO</small><strong>{siteConfig.phone || PHONE_DISPLAY}</strong></span><ArrowUpRight size={16} /></a>
              <a href={'mailto:' + (siteConfig.email || EMAIL_ADDRESS)}><span className="contact-icon"><Mail size={17} /></span><span><small>EMAIL</small><strong>{siteConfig.email || EMAIL_ADDRESS}</strong></span><ArrowUpRight size={16} /></a>
              <div><span className="contact-icon"><MapPin size={17} /></span><span><small>BASED IN</small><strong>{siteConfig.location}</strong></span></div>
            </div>
          </div>
          <form className="contact-form" onSubmit={submitEnquiry}>
            <div className="form-intro"><span>ENQUIRY FORM</span><span className="form-step">01 — 02</span></div>
            <div className="form-row">
              <label>Full name <span>*</span><input required minLength={2} maxLength={120} value={formState.full_name} onChange={(e) => setFormState({ ...formState, full_name: e.target.value })} placeholder="Your name" autoComplete="name" /></label>
              <label>Phone number <span>*</span><input required minLength={7} maxLength={30} value={formState.phone} onChange={(e) => setFormState({ ...formState, phone: e.target.value })} placeholder="+91" autoComplete="tel" /></label>
            </div>
            <label>Email address <span className="optional">(optional)</span><input type="email" maxLength={254} value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })} placeholder="you@example.com" autoComplete="email" /></label>
            <label>What are you planning? <span>*</span><select required value={formState.service} onChange={(e) => setFormState({ ...formState, service: e.target.value })}>{['Wedding Photography', 'Pre-Wedding Shoots', 'Birthday Photography', 'Events & Celebrations', 'Videography', 'Drone Shoot', 'Portrait & Family Photography', 'Kazima Album Making', 'Commercial / Institutional Photography', 'Other Enquiry'].map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="form-row">
              <label>Preferred date <span className="optional">(optional)</span><input type="date" value={formState.event_date} onChange={(e) => setFormState({ ...formState, event_date: e.target.value })} /></label>
              <label>Event location <span className="optional">(optional)</span><input maxLength={200} value={formState.event_location} onChange={(e) => setFormState({ ...formState, event_location: e.target.value })} placeholder="City or venue" /></label>
            </div>
            <label>Tell us a little more <span className="optional">(optional)</span><textarea rows={3} maxLength={5000} value={formState.message} onChange={(e) => setFormState({ ...formState, message: e.target.value })} placeholder="Your plans, the kind of coverage you need…" /></label>
            {formError && <div className="form-alert form-alert-error" role="alert">{formError}{isSupabaseConfigured && <button type="button" onClick={() => openWhatsApp(formState.service, 'Name: ' + formState.full_name + '\nPhone: ' + formState.phone + '\nMessage: ' + formState.message)}>Continue with WhatsApp <ArrowUpRight size={14} /></button>}</div>}
            {formMessage && <div className="form-alert form-alert-success" role="status"><Check size={16} />{formMessage}</div>}
            <button type="submit" className="button button-dark submit-button" disabled={sending}>{sending ? 'Sending enquiry…' : (isSupabaseConfigured ? 'Send enquiry' : 'Continue to WhatsApp')} <Send size={15} /></button>
            <p className="privacy-note">Your details are used only to respond to this enquiry. Sending an enquiry does not confirm a booking.</p>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand"><a href="#home" className="wordmark footer-wordmark"><span className="wordmark-icon"><Aperture size={25} strokeWidth={1.3} /></span><span><strong>MEERA</strong><small>PHOTO STUDIO</small></span></a><p>Preserving moments.<br />Creating legacies.</p><span className="footer-location"><MapPin size={14} /> RAIPUR, CHHATTISGARH, INDIA</span></div>
          <div className="footer-nav"><span className="footer-label">EXPLORE</span><a href="#about">About the studio</a><a href="#services">Photography services</a><a href="#portfolio">Portfolio</a><a href="#albums">Kazima Albums</a><a href="#films">Videography</a></div>
          <div className="footer-nav"><span className="footer-label">GET IN TOUCH</span><a href={'tel:' + (siteConfig.phone || PHONE_DISPLAY).replace(/[^+\d]/g, '')}>{siteConfig.phone || PHONE_DISPLAY}</a><a href={'mailto:' + (siteConfig.email || EMAIL_ADDRESS)}>{siteConfig.email || EMAIL_ADDRESS}</a><a href={wa('a photography booking')} target="_blank" rel="noreferrer">WhatsApp enquiries <ArrowUpRight size={13} /></a><span className="footer-open">Bookings open for upcoming dates</span></div>
        </div>
        <div className="footer-associations"><span>OFFICIAL PHOTOGRAPHER FOR</span><p>Sports & Youth Welfare <i>·</i> C.G. Olympic Association <i>·</i> Public Work Devison <i>·</i> CG Cricket Asso.</p></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} MEERA PHOTO STUDIO. ALL RIGHTS RESERVED.</span><span>PHOTOGRAPHY WITH PURPOSE, SINCE DAY ONE.</span></div>
      </footer>

      <a className="whatsapp-float" href={wa('a photography booking')} target="_blank" rel="noreferrer" aria-label="Contact Meera Photo Studio on WhatsApp"><MessageCircle size={21} /><span>Let's talk</span></a>

      <AnimatePresence>
        {activeVideo && <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
        {lightboxPhoto && <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="Portfolio image viewer" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }} onClick={() => setLightboxIndex(null)}>
          <button className="lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Close image viewer"><X size={25} /></button>
          <button className="lightbox-arrow lightbox-prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); setLightboxIndex((index) => index === null ? null : (index - 1 + visiblePhotos.length) % visiblePhotos.length); }}><ChevronLeft size={28} /></button>
          <figure onClick={(e) => e.stopPropagation()}><img src={lightboxPhoto.image_url} alt={lightboxPhoto.alt_text || lightboxPhoto.title} /><figcaption><span>{lightboxPhoto.category}</span><strong>{lightboxPhoto.title}</strong><small>{(lightboxIndex ?? 0) + 1} / {visiblePhotos.length}</small></figcaption></figure>
          <button className="lightbox-arrow lightbox-next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); setLightboxIndex((index) => index === null ? null : (index + 1) % visiblePhotos.length); }}><ChevronRight size={28} /></button>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}

function getEmbeddableVideoUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id ? 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' : null;
    }
    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const id = parsed.searchParams.get('v') || (['embed', 'shorts', 'live'].includes(pathParts[0] || '') ? pathParts[1] : null);
      return id ? 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' : null;
    }
    if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      if (id && /^\\d+$/.test(id)) return 'https://player.vimeo.com/video/' + id + '?autoplay=1';
    }
    return null;
  } catch {
    return null;
  }
}

function VideoPlayerModal({ video, onClose }: { video: VideoProject; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  const embedUrl = getEmbeddableVideoUrl(video.video_url);
  const isDirectVideo = /\\.(mp4|webm|ogg)(?:\\?.*)?$/i.test(video.video_url);
  return <motion.div className="video-modal" role="dialog" aria-modal="true" aria-label={video.title} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }} onClick={onClose}>
    <button className="video-modal-close" onClick={onClose} aria-label="Close video player"><X size={24} /></button>
    <div className="video-modal-content" onClick={(event) => event.stopPropagation()}>
      {embedUrl ? <iframe src={embedUrl} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : isDirectVideo ? <video src={video.video_url} controls autoPlay playsInline poster={video.poster_url || undefined}>Your browser does not support this video.</video> : <div className="video-external-fallback"><Play size={27} /><h3>Watch the film</h3><p>This project uses an external video link that cannot be embedded here.</p><a className="button button-light" href={video.video_url} target="_blank" rel="noreferrer">Open video externally <ArrowUpRight size={15} /></a></div>}
      <div className="video-modal-caption"><span>{video.category}</span><h2>{video.title}</h2>{video.description && <p>{video.description}</p>}</div>
    </div>
  </motion.div>;
}

function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [working, setWorking] = useState(false);
  const [tab, setTab] = useState<'gallery' | 'videos' | 'services' | 'enquiries' | 'content'>('gallery');
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoProject[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [adminMessage, setAdminMessage] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formCategory, setFormCategory] = useState('Weddings');
  const [formAlt, setFormAlt] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPublish, setFormPublish] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoCategory, setVideoCategory] = useState('Wedding Films');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPoster, setVideoPoster] = useState('');
  const [videoPublish, setVideoPublish] = useState(true);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceImage, setServiceImage] = useState('');
  const [servicePublish, setServicePublish] = useState(true);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [homepageConfig, setHomepageConfig] = useState<SiteConfig>(defaultConfig);

  const loadAdminData = async () => {
    const client = supabase;
    if (!client) return;
    const [gallery, videoResult, serviceResult, enquiryResult, siteResult] = await Promise.all([
      client.from('gallery_items').select('*').order('position', { ascending: true }),
      client.from('video_projects').select('*').order('position', { ascending: true }),
      client.from('services').select('*').order('position', { ascending: true }),
      client.from('enquiries').select('*').order('created_at', { ascending: false }).limit(200),
      client.from('site_settings').select('key,value').eq('key', 'homepage').maybeSingle(),
    ]);
    if (gallery.error) setAdminMessage('Gallery: ' + gallery.error.message);
    else setPhotos((gallery.data || []) as GalleryItem[]);
    if (!videoResult.error) setVideos((videoResult.data || []) as VideoProject[]);
    if (!serviceResult.error) setServices((serviceResult.data || []) as ServiceRecord[]);
    if (!enquiryResult.error) setEnquiries((enquiryResult.data || []) as Enquiry[]);
    if (siteResult.data?.value) setHomepageConfig({ ...defaultConfig, ...(siteResult.data.value as Partial<SiteConfig>) });
  };

  const checkAdmin = async (userId: string, userEmail?: string) => {
    const client = supabase;
    if (!client) return;
    const { data, error } = await client.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
    if (error || !data) {
      setAccessDenied(true);
      setUser(null);
      setLoginError('This account is signed in but is not registered as a studio administrator. Add its user UUID to the public.admins table in Supabase.');
      setChecking(false);
      return;
    }
    setUser({ id: userId, email: userEmail });
    setAccessDenied(false);
    await loadAdminData();
    setChecking(false);
  };

  useEffect(() => {
    const client = supabase;
    if (!client) { setChecking(false); return; }
    let alive = true;
    client.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      if (data.session?.user) await checkAdmin(data.session.user.id, data.session.user.email);
      else setChecking(false);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      if (session?.user) void checkAdmin(session.user.id, session.user.email);
      else { setUser(null); setChecking(false); }
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = supabase;
    if (!client) return;
    setWorking(true);
    setLoginError('');
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
    setWorking(false);
  }

  async function uploadPhotos(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = supabase;
    if (!client || !selectedFiles?.length) { setAdminMessage('Choose one or more photographs to upload.'); return; }
    setWorking(true);
    setAdminMessage('');
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    try {
      const newRows: Partial<GalleryItem>[] = [];
      for (const file of Array.from(selectedFiles)) {
        if (!supportedTypes.includes(file.type)) throw new Error(file.name + ' is not a supported image type. Use JPG, PNG, WEBP or AVIF.');
        if (file.size > 15 * 1024 * 1024) throw new Error(file.name + ' is larger than the 15 MB upload limit.');
        const uploaded = await uploadToCloudinary(file);
        newRows.push({
          title: formTitle.trim() || file.name.replace(/\.[^.]+$/, ''),
          caption: formCaption.trim() || null,
          category: formCategory,
          image_url: uploaded.secure_url,
          cloudinary_public_id: uploaded.public_id,
          storage_path: null,
          alt_text: formAlt.trim() || formTitle.trim() || file.name,
          is_published: formPublish,
          is_featured: formFeatured,
          position: photos.length + newRows.length,
        } as Partial<GalleryItem>);
      }
      const { error: insertError } = await client.from('gallery_items').insert(newRows);
      if (insertError) throw insertError;
      setAdminMessage(newRows.length + ' photograph(s) uploaded successfully.');
      setFormTitle(''); setFormCaption(''); setFormAlt(''); setSelectedFiles(null); setFormFeatured(false);
      const fileInput = document.getElementById('admin-photo-files') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      await loadAdminData();
    } catch (error) {
      setAdminMessage('Upload did not finish: ' + (error instanceof Error ? error.message : String(error)));
    } finally { setWorking(false); }
  }

  async function togglePhoto(photo: GalleryItem) {
    const client = supabase;
    if (!client || photo.id.startsWith('sample-')) return;
    const { error } = await client.from('gallery_items').update({ is_published: !photo.is_published }).eq('id', photo.id);
    setAdminMessage(error ? error.message : (photo.is_published ? 'Photograph unpublished.' : 'Photograph published.'));
    await loadAdminData();
  }

  async function deletePhoto(photo: GalleryItem) {
    const client = supabase;
    if (!client || !window.confirm('Delete “' + photo.title + '”? This cannot be undone.')) return;
    const row = photo as GalleryItem & { storage_path?: string | null; cloudinary_public_id?: string | null };
    if (row.cloudinary_public_id) {
      try { await deleteFromCloudinary(row.cloudinary_public_id); }
      catch (error) { setAdminMessage('Could not delete the Cloudinary image, so the gallery record was kept: ' + (error instanceof Error ? error.message : String(error))); return; }
    }
    const { error } = await client.from('gallery_items').delete().eq('id', photo.id);
    if (error) { setAdminMessage('Could not delete the gallery record: ' + error.message); return; }
    if (row.storage_path) {
      const { error: storageError } = await client.storage.from('portfolio').remove([row.storage_path]);
      if (storageError) {
        setAdminMessage('Gallery record deleted, but an old Supabase Storage file could not be removed: ' + storageError.message);
        await loadAdminData();
        return;
      }
    }
    setAdminMessage('Photograph and its stored media deleted.');
    await loadAdminData();
  }

  async function addVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = supabase;
    if (!client) return;
    setWorking(true);
    const { error } = await client.from('video_projects').insert([{
      title: videoTitle.trim(), description: videoDescription.trim() || null, category: videoCategory,
      video_url: videoUrl.trim(), poster_url: videoPoster.trim() || null, is_published: videoPublish, position: videos.length,
    }]);
    setAdminMessage(error ? 'Could not add video: ' + error.message : 'Video project saved.');
    if (!error) { setVideoTitle(''); setVideoDescription(''); setVideoUrl(''); setVideoPoster(''); await loadAdminData(); }
    setWorking(false);
  }

  async function toggleVideo(video: VideoProject) {
    const client = supabase;
    if (!client) return;
    const { error } = await client.from('video_projects').update({ is_published: !video.is_published }).eq('id', video.id);
    setAdminMessage(error ? error.message : 'Video visibility updated.');
    await loadAdminData();
  }

  async function deleteVideo(video: VideoProject) {
    const client = supabase;
    if (!client || !window.confirm('Delete “' + video.title + '”?')) return;
    const { error } = await client.from('video_projects').delete().eq('id', video.id);
    setAdminMessage(error ? error.message : 'Video project deleted.');
    await loadAdminData();
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = supabase;
    if (!client) return;
    const payload = { title: serviceTitle.trim(), description: serviceDescription.trim(), image_url: serviceImage.trim() || null, is_published: servicePublish, position: editingServiceId ? (services.find((item) => item.id === editingServiceId)?.position ?? 0) : services.length, updated_at: new Date().toISOString() };
    if (!payload.title || !payload.description) { setAdminMessage('Enter a service title and description.'); return; }
    setWorking(true);
    const result = editingServiceId
      ? await client.from('services').update(payload).eq('id', editingServiceId)
      : await client.from('services').insert([payload]);
    setAdminMessage(result.error ? 'Could not save service: ' + result.error.message : (editingServiceId ? 'Service updated.' : 'Service added.'));
    if (!result.error) {
      setServiceTitle(''); setServiceDescription(''); setServiceImage(''); setServicePublish(true); setEditingServiceId(null);
      await loadAdminData();
    }
    setWorking(false);
  }

  function editService(service: ServiceRecord) {
    setEditingServiceId(service.id);
    setServiceTitle(service.title);
    setServiceDescription(service.description);
    setServiceImage(service.image_url || '');
    setServicePublish(service.is_published);
    setAdminMessage('Editing “' + service.title + '”. Save the form to apply your changes.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function toggleService(service: ServiceRecord) {
    const client = supabase;
    if (!client) return;
    const { error } = await client.from('services').update({ is_published: !service.is_published, updated_at: new Date().toISOString() }).eq('id', service.id);
    setAdminMessage(error ? error.message : 'Service visibility updated.');
    await loadAdminData();
  }

  async function deleteService(service: ServiceRecord) {
    const client = supabase;
    if (!client || !window.confirm('Delete the service “' + service.title + '”?')) return;
    const { error } = await client.from('services').delete().eq('id', service.id);
    setAdminMessage(error ? error.message : 'Service deleted.');
    await loadAdminData();
  }

  async function replacePhoto(photo: GalleryItem, file?: File) {
    const client = supabase;
    if (!client || !file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 15 * 1024 * 1024) {
      setAdminMessage('Choose a JPG, PNG, WEBP or AVIF image under 15 MB.');
      return;
    }
    setWorking(true);
    const oldRow = photo as GalleryItem & { storage_path?: string | null; cloudinary_public_id?: string | null };
    try {
      const uploaded = await uploadToCloudinary(file);
      const { error } = await client.from('gallery_items').update({ image_url: uploaded.secure_url, cloudinary_public_id: uploaded.public_id, storage_path: null, alt_text: file.name }).eq('id', photo.id);
      if (error) {
        try { await deleteFromCloudinary(uploaded.public_id); } catch { /* keep the original database error visible */ }
        setAdminMessage('Could not update the gallery record: ' + error.message);
        setWorking(false);
        return;
      }
      if (oldRow.cloudinary_public_id) {
        try { await deleteFromCloudinary(oldRow.cloudinary_public_id); }
        catch (error) { setAdminMessage('Photograph replaced, but the previous Cloudinary asset could not be cleaned up: ' + (error instanceof Error ? error.message : String(error))); await loadAdminData(); setWorking(false); return; }
      }
      if (oldRow.storage_path) await client.storage.from('portfolio').remove([oldRow.storage_path]);
      setAdminMessage('Photograph replaced successfully.');
      await loadAdminData();
    } catch (error) {
      setAdminMessage('Replacement upload failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally { setWorking(false); }
  }

  async function updateEnquiryStatus(enquiry: Enquiry, status: Enquiry['status']) {
    const client = supabase;
    if (!client) return;
    const { error } = await client.from('enquiries').update({ status }).eq('id', enquiry.id);
    setAdminMessage(error ? error.message : 'Enquiry status updated.');
    await loadAdminData();
  }

  async function deleteEnquiry(enquiry: Enquiry) {
    const client = supabase;
    if (!client || !window.confirm('Delete this enquiry from ' + enquiry.full_name + '?')) return;
    const { error } = await client.from('enquiries').delete().eq('id', enquiry.id);
    setAdminMessage(error ? error.message : 'Enquiry deleted.');
    await loadAdminData();
  }

  async function saveHomepage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = supabase;
    if (!client) return;
    setWorking(true);
    const { error } = await client.from('site_settings').upsert({ key: 'homepage', value: homepageConfig, updated_at: new Date().toISOString() });
    setAdminMessage(error ? 'Could not save website content: ' + error.message : 'Homepage content saved.');
    setWorking(false);
  }

  async function signOut() {
    const client = supabase;
    if (client) await client.auth.signOut();
    setUser(null);
  }

  if (!isSupabaseConfigured) return <div className="admin-setup-page">
    <a className="wordmark admin-wordmark" href="/"><span className="wordmark-icon"><Aperture size={24} /></span><span><strong>MEERA</strong><small>STUDIO ADMIN</small></span></a>
    <div className="admin-setup-card"><span className="admin-eyebrow">ADMIN SETUP</span><h1>Your studio,<br /><em>your stories.</em></h1><p>The admin dashboard is included, but secure sign-in and persistent uploads require a Supabase project to be connected first.</p><ol><li>Add your project URL and anon key to the local environment using .env.example.</li><li>Run supabase/schema.sql in the Supabase SQL Editor.</li><li>Create your admin user in Supabase Authentication and add its UUID to public.admins.</li></ol><a className="button button-dark" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Open Supabase <ArrowUpRight size={16} /></a><a className="admin-back-link" href="/">← Back to the website</a></div>
  </div>;

  if (checking) return <div className="admin-loading"><span className="loader" /> Checking secure studio access…</div>;
  if (!user) return <div className="admin-setup-page"><a className="wordmark admin-wordmark" href="/"><span className="wordmark-icon"><Aperture size={24} /></span><span><strong>MEERA</strong><small>STUDIO ADMIN</small></span></a><form className="admin-login-card" onSubmit={signIn}><span className="admin-eyebrow">PRIVATE STUDIO AREA</span><h1>Welcome<br /><em>back.</em></h1><p>Sign in with your authorised studio administrator account.</p><label>Email address<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label><label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>{loginError && <div className="form-alert form-alert-error" role="alert">{loginError}</div>}<button className="button button-dark admin-login-submit" type="submit" disabled={working}>{working ? 'Signing in…' : 'Sign in securely'} <ArrowRight size={16} /></button><a className="admin-back-link" href="/">← Back to the website</a></form></div>;

  return <div className="dashboard">
    <aside className="dashboard-sidebar"><a className="wordmark dashboard-wordmark" href="/"><span className="wordmark-icon"><Aperture size={23} /></span><span><strong>MEERA</strong><small>STUDIO ADMIN</small></span></a><div className="dashboard-side-caption">WORKSPACE</div><nav className="dashboard-nav">
      <button className={tab === 'gallery' ? 'selected' : ''} onClick={() => setTab('gallery')}><Camera size={17} /> Photo gallery <span>{photos.length}</span></button>
      <button className={tab === 'videos' ? 'selected' : ''} onClick={() => setTab('videos')}><Clapperboard size={17} /> Video projects <span>{videos.length}</span></button>
      <button className={tab === 'services' ? 'selected' : ''} onClick={() => setTab('services')}><Camera size={17} /> Services <span>{services.length}</span></button>
      <button className={tab === 'enquiries' ? 'selected' : ''} onClick={() => setTab('enquiries')}><Mail size={17} /> Enquiries <span>{enquiries.filter((item) => item.status === 'New').length}</span></button>
      <button className={tab === 'content' ? 'selected' : ''} onClick={() => setTab('content')}><Aperture size={17} /> Website content</button>
    </nav><div className="dashboard-sidebar-bottom"><div className="online-indicator"><i /> Supabase database · Cloudinary media</div><span>{user.email}</span><button onClick={signOut}>Sign out <ArrowUpRight size={13} /></button><a href="/">View public website ↗</a></div></aside>
    <main className="dashboard-main"><header className="dashboard-topbar"><div><span className="admin-eyebrow">MEERA PHOTO STUDIO / ADMINISTRATION</span><h1>{tab === 'gallery' ? 'Photo gallery' : tab === 'videos' ? 'Video projects' : tab === 'services' ? 'Photography services' : tab === 'enquiries' ? 'Bookings & enquiries' : 'Website content'}</h1></div><button className="dashboard-refresh" onClick={() => void loadAdminData()}><Clock3 size={15} /> Refresh data</button></header>
      <div className="dashboard-welcome"><div><span className="welcome-mark"><Aperture size={20} /></span><div><strong>Good to see you in the studio.</strong><p>Keep the portfolio current and every enquiry in view.</p></div></div><span className="dashboard-private"><i /> PRIVATE DASHBOARD</span></div>
      {adminMessage && <div className="admin-message" role="status">{adminMessage}<button onClick={() => setAdminMessage('')} aria-label="Dismiss message"><X size={14} /></button></div>}
      {tab === 'gallery' && <div className="dashboard-content"><div className="dashboard-stats"><div><span>PUBLISHED PHOTOS</span><strong>{photos.filter((item) => item.is_published).length}</strong></div><div><span>ALL PHOTOS</span><strong>{photos.length}</strong></div><div><span>FEATURED PHOTOS</span><strong>{photos.filter((item) => item.is_featured).length}</strong></div></div>
        <section className="dashboard-panel"><div className="panel-heading"><div><span className="admin-eyebrow">NEW CONTENT</span><h2>Upload photographs</h2><p>JPG, PNG, WEBP or AVIF · maximum 15 MB per image · multi-file upload supported.</p></div><span className="panel-icon"><Camera size={21} /></span></div>
          <form className="admin-form" onSubmit={uploadPhotos}><label className="file-drop" htmlFor="admin-photo-files"><input id="admin-photo-files" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(e) => setSelectedFiles(e.target.files)} /><span className="file-drop-icon"><ArrowUpRight size={20} /></span><strong>{selectedFiles?.length ? selectedFiles.length + ' file(s) selected' : 'Choose photographs to upload'}</strong><small>Click to browse files from your device</small></label>
            <div className="admin-form-grid"><label>Title (optional)<input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} maxLength={160} placeholder="e.g. A Celebration of Love" /></label><label>Gallery category<select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>{categoryNames.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Caption (optional)<input value={formCaption} onChange={(e) => setFormCaption(e.target.value)} maxLength={500} placeholder="A short note about the photograph" /></label><label>Alt text (optional)<input value={formAlt} onChange={(e) => setFormAlt(e.target.value)} maxLength={300} placeholder="Accessible image description" /></label></div>
            <div className="admin-check-row"><label><input type="checkbox" checked={formFeatured} onChange={(e) => setFormFeatured(e.target.checked)} /> Mark as featured</label><label><input type="checkbox" checked={formPublish} onChange={(e) => setFormPublish(e.target.checked)} /> Publish immediately</label></div>
            <button className="button button-dark" type="submit" disabled={working}>{working ? 'Uploading…' : 'Upload selected photos'} <ArrowUpRight size={15} /></button>
          </form>
        </section>
        <section className="dashboard-panel"><div className="panel-heading"><div><span className="admin-eyebrow">LIBRARY</span><h2>Manage photographs</h2><p>Publish or unpublish images, or remove images you no longer need.</p></div><span className="panel-count">{photos.length} ITEMS</span></div>
          {photos.length === 0 ? <div className="admin-empty"><Camera size={25} /><p>No photos uploaded yet. Your new portfolio starts here.</p></div> : <div className="admin-photo-list">{photos.map((photo) => <div className="admin-photo-row" key={photo.id}><img src={photo.image_url} alt="" /><div className="admin-photo-info"><strong>{photo.title}</strong><span>{photo.category}{photo.is_featured ? ' · Featured' : ''}</span></div><span className={photo.is_published ? 'status-pill status-published' : 'status-pill'}>{photo.is_published ? 'Published' : 'Draft'}</span><label className="small-action replace-action">Replace<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={working || photo.id.startsWith('sample-')} onChange={(e) => { const file = e.target.files?.[0]; if (file) void replacePhoto(photo, file); e.currentTarget.value = ''; }} /></label><button className="small-action" onClick={() => void togglePhoto(photo)} disabled={photo.id.startsWith('sample-')}>{photo.is_published ? 'Unpublish' : 'Publish'}</button><button className="small-action danger-action" onClick={() => void deletePhoto(photo)} disabled={photo.id.startsWith('sample-')}>Delete</button></div>)}</div>}
        </section>
      </div>}
      {tab === 'videos' && <div className="dashboard-content"><section className="dashboard-panel"><div className="panel-heading"><div><span className="admin-eyebrow">FILM LIBRARY</span><h2>Add a video project</h2><p>Use a public video URL or embed-compatible share link. Public cards open the supplied URL.</p></div><span className="panel-icon"><Clapperboard size={21} /></span></div><form className="admin-form" onSubmit={addVideo}><div className="admin-form-grid"><label>Project title *<input required value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} maxLength={160} /></label><label>Category<select value={videoCategory} onChange={(e) => setVideoCategory(e.target.value)}>{['Wedding Films', 'Pre-Wedding Films', 'Event Highlights', 'Birthday Films', 'Drone Cinematography', 'Institutional / Sports', 'Cinematic Films'].map((x) => <option key={x}>{x}</option>)}</select></label><label>Video URL *<input required type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…" /></label><label>Poster image URL (optional)<input type="url" value={videoPoster} onChange={(e) => setVideoPoster(e.target.value)} placeholder="https://…" /></label></div><label>Description (optional)<textarea rows={2} value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} maxLength={1000} /></label><div className="admin-check-row"><label><input type="checkbox" checked={videoPublish} onChange={(e) => setVideoPublish(e.target.checked)} /> Publish immediately</label></div><button className="button button-dark" type="submit" disabled={working}>{working ? 'Saving…' : 'Save video project'} <ArrowUpRight size={15} /></button></form></section><section className="dashboard-panel"><div className="panel-heading"><div><span className="admin-eyebrow">CURRENT PROJECTS</span><h2>Manage video projects</h2></div><span className="panel-count">{videos.length} ITEMS</span></div>{videos.length === 0 ? <div className="admin-empty"><Clapperboard size={25} /><p>No video projects yet.</p></div> : <div className="admin-photo-list">{videos.map((video) => <div className="admin-photo-row" key={video.id}><img src={video.poster_url || demoPhotos[0].image_url} alt="" /><div className="admin-photo-info"><strong>{video.title}</strong><span>{video.category}</span></div><span className={video.is_published ? 'status-pill status-published' : 'status-pill'}>{video.is_published ? 'Published' : 'Draft'}</span><button className="small-action" onClick={() => void toggleVideo(video)}>{video.is_published ? 'Unpublish' : 'Publish'}</button><button className="small-action danger-action" onClick={() => void deleteVideo(video)}>Delete</button></div>)}</div>}</section></div>}
      {tab === 'services' && <div className="dashboard-content"><section className="dashboard-panel"><div className="panel-heading"><div><span className="admin-eyebrow">SERVICE CATALOGUE</span><h2>{editingServiceId ? 'Edit service' : 'Add a service'}</h2><p>Published services replace the default homepage list. Add an image URL from your public storage or other hosted image location.</p></div><span className="panel-icon"><Camera size={21} /></span></div><form className="admin-form" onSubmit={saveService}><label>Service title *<input required value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)} maxLength={150} placeholder="e.g. Wedding Photography" /></label><label>Description *<textarea required rows={3} value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} maxLength={1000} placeholder="Describe the service" /></label><label>Image URL (optional)<input type="url" value={serviceImage} onChange={(e) => setServiceImage(e.target.value)} placeholder="https://…" /></label><div className="admin-check-row"><label><input type="checkbox" checked={servicePublish} onChange={(e) => setServicePublish(e.target.checked)} /> Publish service</label></div><div className="service-editor-buttons"><button className="button button-dark" type="submit" disabled={working}>{working ? 'Saving…' : editingServiceId ? 'Save service changes' : 'Add service'} <Check size={15} /></button>{editingServiceId && <button className="small-action" type="button" onClick={() => { setEditingServiceId(null); setServiceTitle(''); setServiceDescription(''); setServiceImage(''); setServicePublish(true); }}>Cancel edit</button>}</div></form></section><section className="dashboard-panel"><div className="panel-heading"><div><span className="admin-eyebrow">CURRENT SERVICES</span><h2>Manage services</h2><p>Control what visitors see on the public homepage.</p></div><span className="panel-count">{services.length} ITEMS</span></div>{services.length === 0 ? <div className="admin-empty"><Camera size={25} /><p>No custom services yet. The public site uses its built-in starter service list until you add your own.</p></div> : <div className="admin-photo-list">{services.map((service) => <div className="admin-photo-row service-admin-row" key={service.id}><img src={service.image_url || demoPhotos[0].image_url} alt="" /><div className="admin-photo-info"><strong>{service.title}</strong><span>{service.description}</span></div><span className={service.is_published ? 'status-pill status-published' : 'status-pill'}>{service.is_published ? 'Published' : 'Draft'}</span><button className="small-action" onClick={() => editService(service)}>Edit</button><button className="small-action" onClick={() => void toggleService(service)}>{service.is_published ? 'Unpublish' : 'Publish'}</button><button className="small-action danger-action" onClick={() => void deleteService(service)}>Delete</button></div>)}</div>}</section></div>}
      {tab === 'enquiries' && <div className="dashboard-content"><div className="dashboard-stats"><div><span>TOTAL ENQUIRIES LOADED</span><strong>{enquiries.length}</strong></div><div><span>NEW</span><strong>{enquiries.filter((item) => item.status === 'New').length}</strong></div><div><span>CONFIRMED</span><strong>{enquiries.filter((item) => item.status === 'Confirmed').length}</strong></div></div><section className="dashboard-panel"><div className="panel-heading"><div><span className="admin-eyebrow">CLIENT CONTACT</span><h2>Recent enquiries</h2><p>Private visitor information is visible only to authorised studio admins.</p></div><span className="panel-count">LATEST 200</span></div>{enquiries.length === 0 ? <div className="admin-empty"><Mail size={25} /><p>No enquiries have been received yet.</p></div> : <div className="enquiry-list">{enquiries.map((enquiry) => <article className="enquiry-row" key={enquiry.id}><div className="enquiry-top"><div><h3>{enquiry.full_name}</h3><span>{enquiry.service} · {new Date(enquiry.created_at).toLocaleString()}</span></div><select aria-label={'Status for ' + enquiry.full_name} value={enquiry.status} onChange={(e) => void updateEnquiryStatus(enquiry, e.target.value as Enquiry['status'])}>{['New', 'Contacted', 'In Discussion', 'Confirmed', 'Closed'].map((x) => <option key={x}>{x}</option>)}</select></div><div className="enquiry-meta"><a href={'tel:' + enquiry.phone}><Phone size={14} />{enquiry.phone}</a>{enquiry.email && <a href={'mailto:' + enquiry.email}><Mail size={14} />{enquiry.email}</a>}{enquiry.event_date && <span>Event date: {enquiry.event_date}</span>}{enquiry.event_location && <span>Location: {enquiry.event_location}</span>}</div>{enquiry.message && <p className="enquiry-message">{enquiry.message}</p>}<button className="small-action danger-action" onClick={() => void deleteEnquiry(enquiry)}>Delete enquiry</button></article>)}</div>}</section></div>}
      {tab === 'content' && <div className="dashboard-content"><section className="dashboard-panel"><div className="panel-heading"><div><span className="admin-eyebrow">PUBLIC WEBSITE</span><h2>Homepage content</h2><p>Update the hero message, introductory copy and public contact information.</p></div><span className="panel-icon"><Aperture size={21} /></span></div><form className="admin-form" onSubmit={saveHomepage}><label>Hero heading<textarea rows={2} value={homepageConfig.hero_title} onChange={(e) => setHomepageConfig({ ...homepageConfig, hero_title: e.target.value })} maxLength={180} /></label><label>Hero supporting text<textarea rows={3} value={homepageConfig.hero_subtitle} onChange={(e) => setHomepageConfig({ ...homepageConfig, hero_subtitle: e.target.value })} maxLength={800} /></label><label>About the studio<textarea rows={5} value={homepageConfig.about_text} onChange={(e) => setHomepageConfig({ ...homepageConfig, about_text: e.target.value })} maxLength={1800} /></label><div className="admin-form-grid"><label>Hero image URL<input type="url" value={homepageConfig.hero_image} onChange={(e) => setHomepageConfig({ ...homepageConfig, hero_image: e.target.value })} maxLength={1500} /></label><label>Choose a photo from your gallery<select value={photos.some((photo) => photo.image_url === homepageConfig.hero_image) ? homepageConfig.hero_image : ''} onChange={(e) => { if (e.target.value) setHomepageConfig({ ...homepageConfig, hero_image: e.target.value }); }}><option value="">Choose an uploaded photograph…</option>{photos.filter((photo) => !photo.id.startsWith('sample-')).map((photo) => <option key={photo.id} value={photo.image_url}>{photo.title}</option>)}</select></label><label>Public phone<input value={homepageConfig.phone} onChange={(e) => setHomepageConfig({ ...homepageConfig, phone: e.target.value })} maxLength={40} /></label><label>Public email<input type="email" value={homepageConfig.email} onChange={(e) => setHomepageConfig({ ...homepageConfig, email: e.target.value })} maxLength={254} /></label><label>Location<input value={homepageConfig.location} onChange={(e) => setHomepageConfig({ ...homepageConfig, location: e.target.value })} maxLength={180} /></label></div><button className="button button-dark" type="submit" disabled={working}>{working ? 'Saving…' : 'Save homepage content'} <Check size={15} /></button></form></section><div className="content-hint"><Sparkles size={19} /><p>Public changes will load from Supabase as soon as the database is configured. Keep private details and all API secrets out of website content fields.</p></div></div>}
      <footer className="dashboard-footer"><span>MEERA PHOTO STUDIO · PRIVATE ADMIN</span><span>Preserving moments, creating legacies.</span></footer>
    </main>
  </div>;
}

export default App;
