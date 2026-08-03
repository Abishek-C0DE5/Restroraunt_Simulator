import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, LogIn, Utensils, MessageCircle, X, Send,
  Sparkles, LogOut, Trash2, CheckCircle, AlertCircle, Shield,
  TrendingUp, Package, Clock, Check, Receipt, ChevronRight, ArrowLeft
} from 'lucide-react';
import { supabase } from './lib/supabase';
import './index.css';

const AI_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY; // Updated to use the Mistral env variable
const ADMIN_EMAIL = 'kenjistha@gmail.com';

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
}

interface CartItem extends Product {
  qty: number;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

/* ═══════════════════════════════════════════
   MASSIVE MENU (30 Mind-Blowing Items)
   ═══════════════════════════════════════════ */
const MENU_ITEMS: Product[] = [
  // DRINKS
  { id: 'd1', name: 'Neon Nectar', category: 'Drinks', price: 500, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop', description: 'Electric citrus blend with a glowing finish.' },
  { id: 'd2', name: 'Quantum Cola', category: 'Drinks', price: 800, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop', description: 'Fizzy dark energy drink to keep you awake across galaxies.' },
  { id: 'd3', name: 'Midnight Mojito', category: 'Drinks', price: 650, image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=600&auto=format&fit=crop', description: 'Minty lime refresher crafted in complete darkness.' },
  { id: 'd4', name: 'Berry Matrix Shake', category: 'Drinks', price: 900, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop', description: 'Triple berry smoothie infused with simulated reality.' },
  { id: 'd5', name: 'Cyberpunk Latte', category: 'Drinks', price: 750, image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop', description: 'Espresso infused with sweet vanilla and neon foam.' },
  { id: 'd6', name: 'Galactic Slush', category: 'Drinks', price: 600, image: 'https://images.unsplash.com/photo-1572490122747-3968b75bf699?q=80&w=600&auto=format&fit=crop', description: 'Icy blue raspberry perfection from the Andromeda system.' },
  { id: 'd7', name: 'Venom Shot', category: 'Drinks', price: 1400, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop', description: 'Concentrated sour apple energy shot. Extremely potent.' },
  { id: 'd8', name: 'Stardust Tea', category: 'Drinks', price: 550, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop', description: 'Calming chamomile with shimmering edible glitter.' },
  { id: 'd9', name: 'Plasma Punch', category: 'Drinks', price: 1200, image: 'https://images.unsplash.com/photo-1587883012610-e3df17d41270?q=80&w=600&auto=format&fit=crop', description: 'Smoking dry-ice fruit punch.' },
  { id: 'd10', name: 'Liquid Gold', category: 'Drinks', price: 5000, image: 'https://images.unsplash.com/photo-1583223667854-e0e05b1ad4f3?q=80&w=600&auto=format&fit=crop', description: 'Honey & saffron elixir topped with 24k gold leaf.' },

  // WEED
  { id: 'w1', name: 'Purple Haze OG', category: 'Weed', price: 15000, image: 'https://images.unsplash.com/photo-1603807920395-58da53f932e6?q=80&w=600&auto=format&fit=crop', description: 'Premium indica strain for deep relaxation.' },
  { id: 'w2', name: 'Sour Diesel Premium', category: 'Weed', price: 18000, image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=600&auto=format&fit=crop', description: 'Top-shelf sativa for an energetic vibe.' },
  { id: 'w3', name: 'Blue Dream Kush', category: 'Weed', price: 16500, image: 'https://images.unsplash.com/photo-1616690002498-c6dd33ade2ef?q=80&w=600&auto=format&fit=crop', description: 'Perfectly balanced hybrid.' },
  { id: 'w4', name: 'Gelato 41', category: 'Weed', price: 20000, image: 'https://images.unsplash.com/photo-1587304193633-80b6a6c4a8ee?q=80&w=600&auto=format&fit=crop', description: 'Sweet, dessert-like aroma and heavy effects.' },
  { id: 'w5', name: 'Northern Lights', category: 'Weed', price: 14000, image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=600&auto=format&fit=crop', description: 'Classic indica for a peaceful night.' },
  { id: 'w6', name: 'Jack Herer Reserve', category: 'Weed', price: 19000, image: 'https://images.unsplash.com/photo-1556928045-16f7f50be0f3?q=80&w=600&auto=format&fit=crop', description: 'Spicy, pine-scented sativa.' },
  { id: 'w7', name: 'Alien OG', category: 'Weed', price: 22000, image: 'https://images.unsplash.com/photo-1625449281218-cbb6183f0aec?q=80&w=600&auto=format&fit=crop', description: 'Out of this world potency.' },
  { id: 'w8', name: 'Moon Rocks', category: 'Weed', price: 35000, image: 'https://images.unsplash.com/photo-1581452695507-68c1303cc56f?q=80&w=600&auto=format&fit=crop', description: 'Nugs dipped in oil and rolled in kief. Handle with care.' },

  // OTHERS (FOOD)
  { id: 'o1', name: 'Spicy Cyber Noodles', category: 'Others', price: 1200, image: 'https://images.unsplash.com/photo-1612929633738-8fe01f746761?q=80&w=600&auto=format&fit=crop', description: 'Fire-level ramen bowl with crispy pork.' },
  { id: 'o2', name: 'Void Burger', category: 'Others', price: 2800, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', description: 'Double wagyu patty on a pitch-black charcoal bun.' },
  { id: 'o3', name: 'Loaded Nachos', category: 'Others', price: 1800, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=600&auto=format&fit=crop', description: 'Cheese, jalapeños, and guacamole mountain.' },
  { id: 'o4', name: 'Galaxy Pizza', category: 'Others', price: 3200, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop', description: 'Wood-fired pizza with vibrant, color-shifting cheese.' },
  { id: 'o5', name: 'Brownie Lava Cake', category: 'Others', price: 1400, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop', description: 'Molten chocolate centre with vanilla scoop.' },
  { id: 'o6', name: 'Neon Sushi Roll', category: 'Others', price: 2200, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop', description: 'Spicy tuna with a fluorescent wasabi drizzle.' },
  { id: 'o7', name: 'Plasma Tacos', category: 'Others', price: 1600, image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=600&auto=format&fit=crop', description: 'Three street tacos with fiery glowing salsa.' },
  { id: 'o8', name: 'Quantum Fries', category: 'Others', price: 800, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=600&auto=format&fit=crop', description: 'Crispy seasoned fries with garlic aioli.' },
  { id: 'o9', name: 'Dragon Breath Wings', category: 'Others', price: 2100, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=600&auto=format&fit=crop', description: 'Wings so spicy they literally smoke.' },
  { id: 'o10', name: 'Matrix Mac & Cheese', category: 'Others', price: 1500, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=600&auto=format&fit=crop', description: 'Truffle-infused four cheese pasta.' },
  { id: 'o11', name: '24k Gold Steak', category: 'Others', price: 15000, image: 'https://images.unsplash.com/photo-1544025162-811114b0df14?q=80&w=600&auto=format&fit=crop', description: 'Tomahawk steak wrapped entirely in edible gold.' },
  { id: 'o12', name: 'Holographic Donut', category: 'Others', price: 900, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop', description: 'Glazed donut that shifts colors in the light.' }
];

/* ═══════════════════════════════════════════
   TOAST SYSTEM
   ═══════════════════════════════════════════ */
let toastId = 0;

function ToastContainer({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: number) => void }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onRemove(t.id)}>
          {t.type === 'success' && <CheckCircle size={16} />}
          {t.type === 'error' && <AlertCircle size={16} />}
          {t.type === 'info' && <Sparkles size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════ */
function Navbar({
  balance, user, isAdmin, onLogin, onLogout, cartCount, onCartClick
}: {
  balance: number | null; user: any; isAdmin: boolean;
  onLogin: () => void; onLogout: () => void;
  cartCount: number; onCartClick: () => void;
}) {
  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="brand">
          <Utensils className="brand-icon" size={24} />
          <span>Prail Cooked Food</span>
        </Link>

        <div className="nav-actions">
          {isAdmin && (
            <Link to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={16} /> Admin Dashboard
            </Link>
          )}

          {user ? (
            <>
              <div className="balance-badge">
                Rs. {balance !== null ? balance.toLocaleString() : '...'}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onLogout} title="Sign Out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onLogin}>
              <LogIn size={16} /> Sign in with Google
            </button>
          )}

          <button className="cart-btn" onClick={onCartClick} id="cart-button">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════
   FOOD CARD
   ═══════════════════════════════════════════ */
function FoodCard({ item, onAdd }: { item: Product; onAdd: (item: Product) => void }) {
  return (
    <div className="food-card">
      <div className="card-image-wrapper">
        <img src={item.image} alt={item.name} className="card-image" loading="lazy" />
        <div className={`category-badge category-${item.category.toLowerCase()}`}>
          {item.category}
        </div>
      </div>
      <div className="card-content">
        <h3>{item.name}</h3>
        {item.description && <p className="card-desc">{item.description}</p>}
        <div className="card-footer">
          <span className="price">Rs. {item.price.toLocaleString()}</span>
          <button className="btn btn-primary btn-sm" onClick={() => onAdd(item)}>Add</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════ */
const CATEGORIES = ['All', 'Drinks', 'Weed', 'Others'];

function Home({ items, onAddToCart }: { items: Product[]; onAddToCart: (item: Product) => void }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  return (
    <div className="page container animate-in">
      <header className="hero">
        <span className="hero-eyebrow">Welcome to Prail Cooked Food</span>
        <h1 className="hero-title">Premium Food, Delivered</h1>
        <p className="hero-subtitle">
          Curated drinks, top-tier greens, and gourmet bites — crafted with care, delivered to your door.
        </p>
      </header>

      <div className="filter-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="menu-grid">
        {filtered.length > 0
          ? filtered.map(item => <FoodCard key={item.id} item={item} onAdd={onAddToCart} />)
          : <div className="empty-state"><p>Loading menu items…</p></div>
        }
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CART & CHECKOUT MODAL
   ═══════════════════════════════════════════ */
function CartModal({
  isOpen, onClose, cart, onRemove, onCheckout, isCheckingOut, user,
  checkoutStep, setCheckoutStep, orderReceipt, setOrderReceipt
}: {
  isOpen: boolean; onClose: () => void;
  cart: CartItem[]; onRemove: (id: string) => void;
  onCheckout: (details: any) => void; isCheckingOut: boolean; user: any;
  checkoutStep: 'cart' | 'details' | 'receipt';
  setCheckoutStep: (step: 'cart' | 'details' | 'receipt') => void;
  orderReceipt: any; setOrderReceipt: (r: any) => void;
}) {
  const [formData, setFormData] = useState({ address: '', phone: '', notes: '' });
  
  if (!isOpen) return null;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCheckoutStep('cart');
      setOrderReceipt(null);
    }, 300); // reset after closing animation
  };

  return (
    <div className="overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        
        {/* STEP 1: CART ITEMS */}
        {checkoutStep === 'cart' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Your Cart</h2>
              <button className="close-btn" onClick={handleClose}><X size={24} /></button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 0' }}>
                <ShoppingCart size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                <p>Your cart is empty. Add some items!</p>
              </div>
            ) : (
              <>
                <div className="cart-items-wrapper">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <img src={item.image} alt={item.name} className="cart-item-img" />
                        <div>
                          <div className="cart-item-name">{item.name} {item.qty > 1 && <span style={{ color: 'var(--text-muted)' }}>×{item.qty}</span>}</div>
                          <div className="cart-item-price">Rs. {(item.price * item.qty).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="cart-item-right">
                        <button className="btn btn-danger btn-sm" onClick={() => onRemove(item.id)} style={{ padding: '0.4rem' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Total</span>
                  <span className="text-accent">Rs. {total.toLocaleString()}</span>
                </div>
              </>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
              disabled={cart.length === 0}
              onClick={() => {
                if (!user) { alert("Please sign in with Google first!"); return; }
                setCheckoutStep('details');
              }}
            >
              {!user ? 'Login to Order' : 'Proceed to Checkout'} <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* STEP 2: DELIVERY DETAILS */}
        {checkoutStep === 'details' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="close-btn" onClick={() => setCheckoutStep('cart')}><ArrowLeft size={20} /></button>
                <h2>Delivery Details</h2>
              </div>
              <button className="close-btn" onClick={handleClose}><X size={24} /></button>
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea 
                className="form-input" 
                placeholder="Enter your full address..."
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 9812345678"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Extra Notes (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Leave at the door"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="cart-total" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
              <span>Total to Pay</span>
              <span className="text-accent">Rs. {total.toLocaleString()}</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}
              disabled={!formData.address.trim() || !formData.phone.trim() || isCheckingOut}
              onClick={() => onCheckout(formData)}
            >
              {isCheckingOut ? 'Processing Order…' : 'Confirm & Pay'}
            </button>
          </>
        )}

        {/* STEP 3: ORDER RECEIPT */}
        {checkoutStep === 'receipt' && orderReceipt && (
          <div className="receipt-card animate-in">
            <CheckCircle className="receipt-icon" size={48} />
            <div className="receipt-title">Order Confirmed!</div>
            <p>Your food is being prepared.</p>
            
            <div className="receipt-code">
              {orderReceipt.code}
            </div>

            <div className="receipt-details">
              <p><strong>Total Billed:</strong> Rs. {orderReceipt.total.toLocaleString()}</p>
              <p><strong>Items:</strong> {orderReceipt.itemsCount}</p>
              <p><strong>Deliver To:</strong> {orderReceipt.address}</p>
              <p><strong>Phone:</strong> {orderReceipt.phone}</p>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem' }} onClick={handleClose}>
              Close & Keep Browsing
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHATBOT (Mistral API Integration)
   ═══════════════════════════════════════════ */
function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: "Hey there! 👋 Welcome to Prail Cooked Food. I'm your AI assistant — ask me about our menu, ordering, or anything else!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: `You are a friendly AI assistant for "Prail Cooked Food", a premium online food ordering app. The restaurant sells premium drinks (Neon Nectar, Quantum Cola, Midnight Mojito, Berry Blast Shake, Cyberpunk Latte, Galactic Slush, Venom Shot, Stardust Tea), weed strains (Purple Haze OG, Sour Diesel Premium, Blue Dream Kush, Gelato 41, Northern Lights, Jack Herer Reserve), and food items (Spicy Cyber Noodles, Glitch Burger, Loaded Nachos, Galaxy Pizza, Brownie Lava Cake, Neon Sushi Roll, Plasma Tacos, Quantum Fries, Cyber Wings, Matrix Mac & Cheese). Every new user who signs in with Google gets Rs. 10,000,000 as a welcome bonus. Be helpful, witty, and concise. Keep answers short (2-3 sentences max).`
            },
            ...updatedMessages
          ]
        })
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops, I'm having connection issues right now. Try again in a moment! 🔌" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title"><Sparkles size={16} style={{ color: 'var(--accent)' }} /> AI Assistant</div>
            <button className="close-btn" onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role === 'assistant' ? 'bot-message' : 'user-message'}`}>
                {m.content}
              </div>
            ))}
            {isLoading && <div className="message bot-message" style={{ opacity: 0.6 }}>Typing…</div>}
            <div ref={endRef} />
          </div>
          <div className="chat-input-area">
            <input
              className="chat-input" placeholder="Ask me anything…"
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
      <button
        className={`chatbot-bubble btn-primary`}
        onClick={() => setIsOpen(!isOpen)}
        id="chatbot-toggle"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ADMIN DASHBOARD (Polished)
   ═══════════════════════════════════════════ */
function AdminDashboard({ isAdmin, addToast }: { isAdmin: boolean, addToast: (msg: string, type: Toast['type']) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();

    // Subscribe to real-time changes on the orders table
    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        // When any change happens, just re-fetch orders to keep it simple and get the related profile email
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [isAdmin]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const updateOrderStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = 'pending';
    if (currentStatus === 'pending') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'delivered';
    else return; // delivered is final state

    const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId);
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
      addToast(`Order ${orderId.slice(0,6)} marked as ${nextStatus}`, 'success');
    } else {
      addToast('Failed to update order status.', 'error');
    }
  };

  if (!isAdmin) {
    return (
      <div className="page container admin-page animate-in">
        <h2>Admin Access Required</h2>
        <p>You need admin privileges to view the dashboard.</p>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
          Only the master account ({ADMIN_EMAIL}) is permitted to view this panel.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const preparing = orders.filter(o => o.status === 'preparing').length;

  return (
    <div className="page container admin-page animate-in">
      <h2>Admin Dashboard</h2>
      <p style={{ color: 'var(--text-muted)' }}>Manage incoming orders and track revenue.</p>

      <div className="admin-stats">
        <div className="stat-card">
          <Package className="stat-icon" size={28} />
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <Clock className="stat-icon" size={28} />
          <div className="stat-value">{pending + preparing}</div>
          <div className="stat-label">Active Orders</div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" size={28} />
          <div className="stat-value">Rs. {totalRevenue.toLocaleString()}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'auto', marginTop: 'var(--space-xl)' }}>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Details</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.id.slice(0, 8)}</td>
                <td>{order.profiles?.email || '—'}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div>{order.items?.delivery?.phone || ''}</div>
                  <div style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {order.items?.delivery?.address || '—'}
                  </div>
                </td>
                <td>{Array.isArray(order.items?.cart) ? order.items.cart.map((i: any) => `${i.qty}x ${i.name}`).join(', ') : '—'}</td>
                <td className="text-accent font-bold">Rs. {Number(order.total_amount).toLocaleString()}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(order.created_at).toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  {order.status !== 'delivered' ? (
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => updateOrderStatus(order.id, order.status)}
                    >
                      {order.status === 'pending' ? 'Mark Preparing' : 'Mark Delivered'}
                    </button>
                  ) : (
                    <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} /> Done
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'receipt'>('cart');
  const [orderReceipt, setOrderReceipt] = useState<any>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast helper
  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch products
  useEffect(() => {
    // We are deliberately overriding Supabase products to show all 30 crazy items locally.
    setItems(MENU_ITEMS);
  }, []);

  // Fetch user profile when logged in
  useEffect(() => {
    if (!user) { setBalance(null); setIsAdmin(false); return; }
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('balance, email')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setBalance(data.balance);
        // ONLY ONE ADMIN ALLOWED
        if (data.email === ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    })();
  }, [user]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) addToast('Login failed. Try again.', 'error');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCart([]);
    addToast('Signed out successfully.', 'info');
  };

  const addToCart = useCallback((item: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    addToast(`${item.name} added to cart`, 'info');
  }, [addToast]);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleCheckout = async (deliveryDetails: any) => {
    if (!user) {
      addToast("Please login first!", 'error');
      setIsCartOpen(false);
      return;
    }

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    if (balance !== null && balance < total) {
      addToast('Insufficient balance!', 'error');
      return;
    }

    setIsCheckingOut(true);

    const orderCode = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // We store the cart items and the delivery details inside the `items` JSONB column.
    const orderData = {
      cart: cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty })),
      delivery: deliveryDetails
    };

    const { error: orderError } = await supabase.from('orders').insert([{
      user_id: user.id,
      items: orderData,
      total_amount: total,
      status: 'pending'
    }]);

    if (orderError) {
      console.error(orderError);
      addToast('Failed to place order. Try again.', 'error');
      setIsCheckingOut(false);
      return;
    }

    const newBalance = (balance ?? 0) - total;
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', user.id);

    if (!balanceError) {
      setBalance(newBalance);
      setCart([]);
      
      // SHOW RECEIPT
      setOrderReceipt({
        code: orderCode,
        total: total,
        itemsCount: cart.reduce((s, c) => s + c.qty, 0),
        address: deliveryDetails.address,
        phone: deliveryDetails.phone
      });
      setCheckoutStep('receipt');
      
      addToast('Order placed successfully! 🎉', 'success');
    } else {
      addToast('Order placed but balance update failed.', 'error');
    }

    setIsCheckingOut(false);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar
          balance={balance} user={user} isAdmin={isAdmin}
          onLogin={handleLogin} onLogout={handleLogout}
          cartCount={cart.reduce((s, c) => s + c.qty, 0)}
          onCartClick={() => setIsCartOpen(true)}
        />

        <Routes>
          <Route path="/" element={<Home items={items} onAddToCart={addToCart} />} />
          <Route path="/admin" element={<AdminDashboard isAdmin={isAdmin} addToast={addToast} />} />
        </Routes>

        <Chatbot />
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <CartModal
          isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}
          cart={cart} onRemove={removeFromCart}
          onCheckout={handleCheckout} isCheckingOut={isCheckingOut}
          user={user}
          checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep}
          orderReceipt={orderReceipt} setOrderReceipt={setOrderReceipt}
        />
      </div>
    </Router>
  );
}
