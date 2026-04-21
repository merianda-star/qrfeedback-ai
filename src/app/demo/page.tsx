'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'

// ── FAKE DATA ──────────────────────────────────────────────────────────────

const DEMO_BUSINESS = 'The Golden Fork & Co.'

const DEMO_FORMS = [
  { id: 'f1', title: 'Main Branch', location: 'MG Road, Bangalore', responses: 28, avg: 4.3 },
  { id: 'f2', title: 'Online Orders', location: 'Delivery Hub, Koramangala', responses: 14, avg: 3.8 },
  { id: 'f3', title: 'Events Desk', location: 'Indiranagar', responses: 5, avg: 4.7 },
]

const DEMO_RESPONSES = [
  { id: 'r1', form: 'Main Branch', rating: 5, sentiment: 'positive', time: '2h ago', answers: { 1: 5, 2: 4, 3: 5, 4: 4, 5: 'The ambiance was perfect and staff were incredibly attentive.' } },
  { id: 'r2', form: 'Online Orders', rating: 2, sentiment: 'negative', time: '4h ago', answers: { 1: 2, 2: 1, 3: 3, 4: 3, 5: 'Delivery was very late and food arrived cold.', 6: 'Wait time' } },
  { id: 'r3', form: 'Main Branch', rating: 4, sentiment: 'positive', time: '1d ago', answers: { 1: 4, 2: 5, 3: 4, 4: 5, 5: 'Quick service and clean environment.' } },
  { id: 'r4', form: 'Events Desk', rating: 5, sentiment: 'positive', time: '1d ago', answers: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 'The event setup was flawless. Will book again!' } },
  { id: 'r5', form: 'Main Branch', rating: 3, sentiment: 'negative', time: '2d ago', answers: { 1: 3, 2: 2, 3: 4, 4: 3, 5: 'Food was okay but the wait was too long during peak hours.', 6: 'Wait time' } },
  { id: 'r6', form: 'Online Orders', rating: 4, sentiment: 'positive', time: '2d ago', answers: { 1: 4, 2: 4, 3: 3, 4: 4, 5: 'Good food quality and packaging.' } },
  { id: 'r7', form: 'Main Branch', rating: 5, sentiment: 'positive', time: '3d ago', answers: { 1: 5, 2: 4, 3: 5, 4: 5, 5: 'Best dining experience in Bangalore!' } },
  { id: 'r8', form: 'Main Branch', rating: 1, sentiment: 'negative', time: '3d ago', answers: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 'Found a hair in my food. Very disappointing.', 6: 'Food quality' } },
  { id: 'r9', form: 'Events Desk', rating: 4, sentiment: 'positive', time: '4d ago', answers: { 1: 4, 2: 4, 3: 5, 4: 4, 5: 'Great team, very professional.' } },
  { id: 'r10', form: 'Online Orders', rating: 5, sentiment: 'positive', time: '5d ago', answers: { 1: 5, 2: 5, 3: 4, 4: 5, 5: 'Fastest delivery ever and food was hot!' } },
]

const RATINGS_OVER_TIME = [
  { date: 'Mar 7', 'Avg Rating': 4.1 },
  { date: 'Mar 8', 'Avg Rating': 4.5 },
  { date: 'Mar 9', 'Avg Rating': 4.3 },
  { date: 'Mar 10', 'Avg Rating': 3.8 },
  { date: 'Mar 11', 'Avg Rating': 4.2 },
  { date: 'Mar 12', 'Avg Rating': 4.4 },
  { date: 'Mar 13', 'Avg Rating': 4.3 },
]

const VOLUME_OVER_TIME = [
  { date: 'Mar 7', Responses: 4 },
  { date: 'Mar 8', Responses: 6 },
  { date: 'Mar 9', Responses: 5 },
  { date: 'Mar 10', Responses: 8 },
  { date: 'Mar 11', Responses: 7 },
  { date: 'Mar 12', Responses: 9 },
  { date: 'Mar 13', Responses: 8 },
]

const AVG_BY_FORM = [
  { name: 'Events Desk', 'Avg Rating': 4.7 },
  { name: 'Main Branch', 'Avg Rating': 4.3 },
  { name: 'Online Orders', 'Avg Rating': 3.8 },
]

const SENTIMENT_DATA = [
  { name: 'Positive (4–5★)', value: 32, color: '#4a7a5a' },
  { name: 'Negative (1–3★)', value: 15, color: '#b05c52' },
]

const BREAKDOWN_DATA = [
  { name: 'Staff service', count: 18 },
  { name: 'Food quality', count: 15 },
  { name: 'Ambiance', count: 12 },
  { name: 'Speed of service', count: 9 },
  { name: 'Value for money', count: 7 },
  { name: 'Cleanliness', count: 5 },
]

const DEMO_QUESTIONS = [
  { id: 1, text: 'How would you rate the overall food quality?', type: 'star', required: true, preloaded: true },
  { id: 2, text: 'How satisfied were you with the speed of service?', type: 'star', required: true, preloaded: true },
  { id: 3, text: 'How would you rate the friendliness of our staff?', type: 'star', required: false, preloaded: true },
  { id: 4, text: 'How clean was the restaurant during your visit?', type: 'star', required: false, preloaded: true },
  { id: 5, text: 'How likely are you to visit us again?', type: 'star', required: false, preloaded: true },
  { id: 6, text: 'What did you like the most about our restaurant?', type: 'choice', required: false, preloaded: true, options: ['Food quality', 'Ambiance', 'Staff service', 'Value for money', 'Speed of service'] },
  { id: 7, text: 'What did you enjoy most about your visit today?', type: 'text', required: false, preloaded: true },
  { id: 8, text: 'Is there anything specific we could have done better?', type: 'text', required: false, preloaded: true },
  { id: 9, text: 'Would you recommend us to a friend?', type: 'yesno', required: false, preloaded: false },
]

// Demo AI insights data
const DEMO_AI_INSIGHTS = [
  {
    id: 'ai1', form: 'Online Orders', rating: 2, time: '4h ago',
    category: 'waiting', categoryLabel: '⏱ Wait Time',
    categoryBg: '#f0f0fe', categoryColor: '#5a5ab0',
    sentiment: -0.72,
    summary: 'Customer experienced a significantly delayed delivery with food arriving cold. Primary complaint centres on wait time exceeding expectations for an online order.',
    suggestedReply: "Thank you for your honest feedback. We sincerely apologise for the delay and the condition your food arrived in — that's not the standard we hold ourselves to. We've flagged this with our delivery team and would love to make it right. Please reach out and we'll arrange a complimentary order for you.",
    answers: { 1: 2, 2: 1, 3: 3, 4: 3, 5: 'Delivery was very late and food arrived cold.', 6: 'Wait time' }
  },
  {
    id: 'ai2', form: 'Main Branch', rating: 3, time: '2d ago',
    category: 'waiting', categoryLabel: '⏱ Wait Time',
    categoryBg: '#f0f0fe', categoryColor: '#5a5ab0',
    sentiment: -0.41,
    summary: 'Customer found food quality acceptable but flagged excessive wait times during peak hours as a concern. Suggests operational inefficiency during busy periods.',
    suggestedReply: "Thank you for taking the time to share your experience. We understand that long waits can be frustrating, especially during peak hours. We're actively working on streamlining our service flow and your feedback helps us prioritise. We hope to welcome you back and show you the improvement.",
    answers: { 1: 3, 2: 2, 3: 4, 4: 3, 5: 'Food was okay but the wait was too long.', 6: 'Wait time' }
  },
  {
    id: 'ai3', form: 'Main Branch', rating: 1, time: '3d ago',
    category: 'food', categoryLabel: '🍽 Food Quality',
    categoryBg: '#fef3e8', categoryColor: '#c4696a',
    sentiment: -0.91,
    summary: 'Critical hygiene complaint — customer reported finding a foreign object (hair) in their food. This represents a serious food safety concern requiring immediate internal review.',
    suggestedReply: "We are deeply sorry for your experience and take this matter extremely seriously. Finding a foreign object in food is completely unacceptable and does not reflect our hygiene standards. Our kitchen team has been informed and we are reviewing our food preparation protocols immediately. We would very much like to speak with you directly — please contact us so we can make this right.",
    answers: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 'Found a hair in my food. Very disappointing.', 6: 'Food quality' }
  },
]

// Demo digest data
const DIGEST_WEEKLY = [
  { day: 'Mon', responses: 6, avg: 4.1 },
  { day: 'Tue', responses: 8, avg: 4.4 },
  { day: 'Wed', responses: 5, avg: 3.9 },
  { day: 'Thu', responses: 9, avg: 4.6 },
  { day: 'Fri', responses: 11, avg: 4.2 },
  { day: 'Sat', responses: 14, avg: 4.5 },
  { day: 'Sun', responses: 7, avg: 4.3 },
]

const PLAN_FEATURES = {
  free: {
    color: '#7a8a9a', label: 'Free', price: '$0',
    features: [
      { text: 'Up to 3 forms & QR codes', unlocked: true },
      { text: '50 responses / month', unlocked: true },
      { text: 'Basic analytics', unlocked: true },
      { text: 'Review Shield (Google routing)', unlocked: true },
      { text: 'Custom QR colors & styles', unlocked: false },
      { text: 'AI complaint analysis', unlocked: false },
      { text: 'Weekly AI digest', unlocked: false },
      { text: 'CSV export', unlocked: false },
      { text: 'White-label forms', unlocked: false },
      { text: 'Remove branding', unlocked: false },
    ]
  },
  pro: {
    color: '#c4896a', label: 'Pro', price: '$19/mo',
    features: [
      { text: 'Unlimited forms & QR codes', unlocked: true },
      { text: 'Unlimited responses', unlocked: true },
      { text: 'Advanced analytics', unlocked: true },
      { text: 'Review Shield (Google routing)', unlocked: true },
      { text: 'Custom QR colors & styles', unlocked: true },
      { text: 'AI complaint analysis', unlocked: true },
      { text: 'Weekly AI digest', unlocked: true },
      { text: 'CSV export', unlocked: true },
      { text: 'White-label forms', unlocked: false },
      { text: 'Remove branding', unlocked: false },
    ]
  },
  business: {
    color: '#4a7a5a', label: 'Business', price: '$49/mo',
    features: [
      { text: 'Unlimited forms & QR codes', unlocked: true },
      { text: 'Unlimited responses', unlocked: true },
      { text: 'Advanced analytics', unlocked: true },
      { text: 'Review Shield (Google routing)', unlocked: true },
      { text: 'Custom QR colors & styles', unlocked: true },
      { text: 'AI complaint analysis', unlocked: true },
      { text: 'Weekly AI digest', unlocked: true },
      { text: 'CSV export', unlocked: true },
      { text: 'White-label forms', unlocked: true },
      { text: 'Remove branding', unlocked: true },
    ]
  }
}

type DemoPage = 'overview' | 'responses' | 'analytics' | 'insights' | 'digest' | 'questions' | 'qr'
type DemoPlan = 'free' | 'pro' | 'business'

const ROSE = '#b05c52'
const TERRA = '#c4896a'
const GREEN = '#4a7a5a'
const COLORS = [ROSE, TERRA, GREEN, '#7a5a9a', '#5a7aaa', '#9a6a5a']

function starStr(n: number) { return '★'.repeat(n) + '☆'.repeat(5 - n) }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e8d5cf', borderRadius: 8, padding: '10px 14px', fontSize: '0.78rem', color: '#2a1f1d', boxShadow: '0 4px 12px rgba(42,31,29,0.1)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: '#7a5a56' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || ROSE }}>{p.name}: <b>{typeof p.value === 'number' ? p.value.toFixed(p.name === 'Avg Rating' || p.name === 'avg' ? 1 : 0) : p.value}</b></div>
      ))}
    </div>
  )
}

function SentimentBar({ score }: { score: number }) {
  const pct = Math.round(((score + 1) / 2) * 100)
  const color = score < -0.3 ? '#b05c52' : score < 0.3 ? '#c4896a' : '#4a7a5a'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: '0.6rem', color: '#b09490', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sentiment</span>
        <span style={{ fontSize: '0.6rem', fontWeight: 700, color }}>{score > 0 ? '+' : ''}{score.toFixed(2)}</span>
      </div>
      <div style={{ height: 5, background: '#f7ece9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: '0.55rem', color: '#b09490' }}>Negative</span>
        <span style={{ fontSize: '0.55rem', color: '#b09490' }}>Positive</span>
      </div>
    </div>
  )
}

export default function DemoPage() {
  const [activePage, setActivePage] = useState<DemoPage>('overview')
  const [demoPlan, setDemoPlan] = useState<DemoPlan>('pro')
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null)
  const [expandedReply, setExpandedReply] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const planInfo = PLAN_FEATURES[demoPlan]
  const isFree = demoPlan === 'free'
  const isPro = demoPlan === 'pro'
  const isBusiness = demoPlan === 'business'
  const canDigest = isPro || isBusiness
  const canInsights = isPro || isBusiness

  // If free user is on a locked page, reset to overview
  const currentPage = (isFree && (activePage === 'insights' || activePage === 'digest'))
    ? 'overview' : activePage

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        :root {
          --bg: #fdf6f4; --surface: #ffffff;
          --border: #e8d5cf; --border-md: #d9c2bb;
          --rose: #b05c52; --rose-dark: #8c3d34; --rose-soft: #f7ece9;
          --text: #2a1f1d; --text-mid: #7a5a56; --text-soft: #b09490;
          --terra: #c4896a; --green: #4a7a5a; --green-soft: #edf4ef;
        }

        .demo-banner { background: linear-gradient(135deg, #2a1f1d, #4a2f2a); color: #fff; padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; position: sticky; top: 0; z-index: 100; }
        .demo-badge { background: #b05c52; color: #fff; font-size: 0.6rem; font-weight: 800; padding: 3px 9px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .demo-banner-text { font-size: 0.78rem; color: rgba(255,255,255,0.75); }
        .demo-signup-btn { padding: 7px 20px; border-radius: 8px; border: none; background: #b05c52; color: #fff; font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; transition: all 0.15s; white-space: nowrap; }
        .demo-signup-btn:hover { background: #8c3d34; }

        .plan-switcher { background: var(--surface); border-bottom: 1px solid var(--border); padding: 10px 24px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .plan-switcher-label { font-size: 0.7rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; }
        .plan-pill { padding: 5px 16px; border-radius: 20px; border: 2px solid var(--border); font-size: 0.74rem; font-weight: 700; cursor: pointer; background: var(--bg); color: var(--text-mid); transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
        .plan-pill.free.active { border-color: #7a8a9a; background: #f0f2f4; color: #4a5a6a; }
        .plan-pill.pro.active { border-color: var(--terra); background: #fff3e8; color: var(--terra); }
        .plan-pill.business.active { border-color: var(--green); background: var(--green-soft); color: var(--green); }
        .plan-pill-price { font-size: 0.62rem; font-weight: 400; opacity: 0.7; margin-left: 4px; }

        .plan-features-strip { background: var(--bg); border-bottom: 1px solid var(--border); padding: 10px 24px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
        .pf-item { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; }
        .pf-check { width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800; flex-shrink: 0; }
        .pf-check.yes { background: var(--green-soft); color: var(--green); border: 1px solid rgba(74,122,90,0.2); }
        .pf-check.no { background: #f5f5f5; color: #bbb; border: 1px solid #e0e0e0; }
        .pf-text.locked { color: var(--text-soft); text-decoration: line-through; }
        .pf-text.unlocked { color: var(--text-mid); }

        .demo-shell { display: flex; height: calc(100vh - 120px); overflow: hidden; }

        .demo-sidebar { width: 220px; flex-shrink: 0; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow-y: auto; }
        .sb-brand { padding: 20px 18px 16px; border-bottom: 1px solid var(--border); }
        .sb-brand-name { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--text); }
        .sb-brand-name span { color: var(--rose); }
        .sb-business { font-size: 0.68rem; color: var(--text-soft); margin-top: 2px; }
        .sb-plan-badge { display: inline-flex; align-items: center; gap: 4px; margin-top: 6px; padding: 2px 8px; border-radius: 20px; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .sb-plan-badge.free { background: #f0f2f4; color: #4a5a6a; }
        .sb-plan-badge.pro { background: #fff3e8; color: var(--terra); }
        .sb-plan-badge.business { background: var(--green-soft); color: var(--green); }
        .sb-nav { padding: 12px 0; flex: 1; }
        .sb-section { font-size: 0.6rem; font-weight: 800; color: var(--text-soft); letter-spacing: 1.5px; padding: 10px 18px 4px; text-transform: uppercase; }
        .sb-link { display: flex; align-items: center; gap: 10px; padding: 8px 18px; font-size: 0.8rem; font-weight: 500; color: var(--text-mid); cursor: pointer; transition: all 0.15s; border-left: 3px solid transparent; text-decoration: none; }
        .sb-link:hover { background: var(--rose-soft); color: var(--text); }
        .sb-link.active { background: var(--rose-soft); color: var(--rose); border-left-color: var(--rose); font-weight: 700; }
        .sb-link-icon { font-size: 0.85rem; width: 18px; text-align: center; }

        /* Free usage bar in sidebar */
        .sb-usage { margin: 10px 14px; padding: 12px 13px; background: linear-gradient(135deg, #fdf0ee, #fff8f6); border: 1px solid var(--border-md); border-radius: 10px; }
        .sb-usage-title { font-size: 0.7rem; font-weight: 700; color: var(--text); margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; }
        .sb-usage-plan { font-size: 0.58rem; color: var(--text-soft); font-weight: 600; }
        .sb-usage-track { height: 5px; background: #ead5d0; border-radius: 3px; margin-bottom: 5px; overflow: hidden; }
        .sb-usage-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--rose), var(--terra)); }
        .sb-usage-label { font-size: 0.62rem; color: var(--text-soft); margin-bottom: 8px; }
        .sb-upgrade-btn { width: 100%; padding: 7px; border-radius: 7px; border: none; background: var(--rose); color: #fff; font-size: 0.72rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; text-align: center; text-decoration: none; display: block; }
        .sb-upgrade-btn:hover { background: var(--rose-dark); }

        .demo-main { flex: 1; overflow-y: auto; background: var(--bg); }
        .demo-topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
        .demo-topbar-title { font-family: 'DM Serif Display', serif; font-size: 1.05rem; color: var(--text); }
        .demo-content { padding: 24px 28px; }
        .hamburger { flex-direction: column; justify-content: center; align-items: center; width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; gap: 5px; flex-shrink: 0; transition: all 0.15s; margin-right: 10px; }
        .hamburger:hover { background: var(--rose-soft); }
        .hamburger span { display: block; width: 16px; height: 2px; background: var(--text-mid); border-radius: 2px; }
        .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-top: 1px solid var(--border); padding: 8px 0 10px; z-index: 200; justify-content: space-around; align-items: center; }
        .bottom-nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; padding: 4px 10px; border-radius: 8px; min-width: 52px; }
        .bottom-nav-item.active .bottom-nav-icon { color: var(--rose); }
        .bottom-nav-item.active .bottom-nav-label { color: var(--rose); font-weight: 700; }
        .bottom-nav-icon { font-size: 1.1rem; color: var(--text-soft); }
        .bottom-nav-label { font-size: 0.56rem; color: var(--text-soft); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; }
        .stat-val { font-family: 'DM Serif Display', serif; font-size: 1.8rem; color: var(--text); line-height: 1; margin-bottom: 4px; }
        .stat-val.terra { color: var(--terra); }
        .stat-val.green { color: var(--green); }
        .stat-val.rose { color: var(--rose); }
        .stat-label { font-size: 0.65rem; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
        .stat-sub { font-size: 0.68rem; color: var(--text-soft); margin-top: 2px; }

        /* Free form limit banner */
        .limit-banner { background: #fff9f0; border: 1px solid #f0d8a0; border-left: 3px solid var(--terra); border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .limit-banner-txt { font-size: 0.78rem; color: var(--text-mid); line-height: 1.5; flex: 1; }

        /* Response limit bar */
        .resp-limit-bar { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .resp-limit-track { flex: 1; min-width: 80px; height: 6px; background: var(--rose-soft); border-radius: 3px; overflow: hidden; }
        .resp-limit-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--rose), var(--terra)); }

        .forms-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
        .form-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; position: relative; }
        .form-card.locked-card { opacity: 0.5; }
        .form-card-title { font-family: 'DM Serif Display', serif; font-size: 0.9rem; color: var(--text); margin-bottom: 3px; }
        .form-card-loc { font-size: 0.68rem; color: var(--text-soft); margin-bottom: 10px; }
        .form-card-stats { display: flex; gap: 14px; }
        .form-stat { font-size: 0.72rem; }
        .form-stat-val { font-weight: 700; color: var(--text); }
        .form-stat-lbl { color: var(--text-soft); }
        .form-lock-badge { position: absolute; top: 10px; right: 10px; background: var(--rose-soft); color: var(--rose); font-size: 0.6rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; border: 1px solid rgba(176,92,82,0.2); }

        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 18px; }
        .chart-card.full { grid-column: 1 / -1; }
        .chart-title { font-family: 'DM Serif Display', serif; font-size: 0.9rem; color: var(--text); margin-bottom: 3px; }
        .chart-sub { font-size: 0.68rem; color: var(--text-soft); margin-bottom: 14px; }

        .resp-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 8px; overflow: hidden; }
        .resp-top { padding: 14px 18px; cursor: pointer; display: flex; align-items: flex-start; gap: 14px; }
        .rating-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'DM Serif Display', serif; font-size: 1rem; font-weight: 700; flex-shrink: 0; border: 2px solid; }
        .rating-circle.pos { background: var(--green-soft); color: var(--green); border-color: rgba(74,122,90,0.2); }
        .rating-circle.neg { background: var(--rose-soft); color: var(--rose); border-color: rgba(176,92,82,0.2); }
        .resp-body { flex: 1; }
        .resp-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
        .resp-form-name { font-size: 0.83rem; font-weight: 700; color: var(--text); }
        .resp-time { font-size: 0.68rem; color: var(--text-soft); }
        .resp-stars { font-size: 0.85rem; color: var(--terra); margin-bottom: 5px; }
        .resp-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .resp-badge { font-size: 0.6rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; border: 1px solid; white-space: nowrap; }
        .resp-badge.pos { background: var(--green-soft); color: var(--green); border-color: rgba(74,122,90,0.2); }
        .resp-badge.neg { background: var(--rose-soft); color: var(--rose); border-color: rgba(176,92,82,0.15); }
        .resp-expand { color: var(--text-soft); font-size: 0.72rem; transition: transform 0.2s; flex-shrink: 0; }
        .resp-expand.open { transform: rotate(180deg); }
        .resp-answers { border-top: 1px solid var(--border); padding: 14px 18px; background: var(--bg); }
        .answer-row { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; margin-bottom: 7px; display: flex; gap: 10px; }
        .answer-q { font-size: 0.6rem; font-weight: 700; color: var(--rose); width: 22px; flex-shrink: 0; margin-top: 2px; }
        .answer-val { font-size: 0.8rem; font-weight: 600; color: var(--text); }
        .answer-val.stars { color: var(--terra); }
        .answer-sub { font-size: 0.65rem; color: var(--text-soft); margin-top: 2px; }

        /* AI Insights */
        .ai-insight-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px; overflow: hidden; }
        .ai-card-header { background: linear-gradient(135deg, #fdf0ee, #fff8f6); padding: 14px 18px; border-bottom: 1px solid rgba(176,92,82,0.12); display: flex; align-items: flex-start; gap: 14px; }
        .ai-card-body { padding: 16px 18px; }
        .ai-summary-box { background: var(--rose-soft); border: 1px solid var(--border); border-radius: 8px; padding: 11px 14px; margin-bottom: 12px; }
        .ai-summary-label { font-size: 0.6rem; font-weight: 700; color: var(--rose); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
        .ai-summary-text { font-size: 0.79rem; color: var(--text); line-height: 1.6; }
        .ai-reply-toggle { width: 100%; padding: 8px 12px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--bg); font-size: 0.74rem; font-weight: 600; color: var(--text-mid); cursor: pointer; font-family: 'DM Sans', sans-serif; text-align: left; display: flex; justify-content: space-between; align-items: center; transition: all 0.15s; }
        .ai-reply-toggle:hover { border-color: var(--rose); color: var(--rose); background: var(--rose-soft); }
        .ai-reply-box { margin-top: 8px; background: var(--green-soft); border: 1px solid rgba(74,122,90,0.2); border-radius: 8px; padding: 12px 14px; }
        .ai-reply-label { font-size: 0.6rem; font-weight: 700; color: var(--green); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
        .ai-reply-text { font-size: 0.78rem; color: var(--text); line-height: 1.65; }

        /* Digest */
        .digest-header { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; margin-bottom: 16px; }
        .digest-title { font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: var(--text); margin-bottom: 4px; }
        .digest-sub { font-size: 0.75rem; color: var(--text-soft); }
        .digest-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
        .digest-insight-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; }
        .digest-insight-title { font-size: 0.72rem; font-weight: 700; color: var(--rose); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .digest-insight-text { font-size: 0.8rem; color: var(--text); line-height: 1.6; }

        /* Questions */
        .q-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 12px; }
        .q-pos { width: 24px; height: 24px; border-radius: 6px; background: var(--rose-soft); display: flex; align-items: center; justify-content: center; font-size: 0.62rem; font-weight: 700; color: var(--rose); flex-shrink: 0; }
        .q-pos.custom { background: #f0eeff; color: #7a5a9a; }
        .q-body { flex: 1; }
        .q-text { font-size: 0.83rem; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .q-meta { display: flex; gap: 6px; flex-wrap: wrap; }
        .q-badge { font-size: 0.6rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; border: 1px solid; }
        .q-badge.star { background: #fff3e8; color: var(--terra); border-color: #f0d0a0; }
        .q-badge.text { background: #f0eeff; color: #7a5a9a; border-color: #d8ccf0; }
        .q-badge.choice { background: #e8f0ff; color: #5a7aaa; border-color: #c0d0f0; }
        .q-badge.yesno { background: var(--green-soft); color: var(--green); border-color: rgba(74,122,90,0.2); }
        .q-badge.preloaded { background: var(--rose-soft); color: var(--text-soft); border-color: var(--border); }
        .q-badge.custom-badge { background: #f0eeff; color: #7a5a9a; border-color: #d8ccf0; }
        .q-badge.required { background: var(--rose-soft); color: var(--rose); border-color: var(--border); }

        /* QR */
        .qr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .qr-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
        .qr-card-inner { padding: 20px; display: flex; flex-direction: column; align-items: center; }
        .qr-mock { width: 120px; height: 120px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; }
        .qr-form-name { font-family: 'DM Serif Display', serif; font-size: 0.85rem; color: var(--text); text-align: center; margin-bottom: 3px; }
        .qr-loc { font-size: 0.65rem; color: var(--text-soft); text-align: center; margin-bottom: 10px; }
        .qr-stats { display: flex; gap: 14px; margin-bottom: 12px; }
        .qr-stat { text-align: center; }
        .qr-stat-val { font-size: 0.95rem; font-weight: 700; font-family: 'DM Serif Display', serif; color: var(--text); }
        .qr-stat-val.terra { color: var(--terra); }
        .qr-stat-lbl { font-size: 0.58rem; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
        .qr-actions { display: flex; gap: 6px; width: 100%; }
        .qr-btn { flex: 1; padding: 7px; border-radius: 7px; border: 1.5px solid var(--border); background: var(--bg); font-size: 0.7rem; font-weight: 600; cursor: default; color: var(--text-mid); font-family: 'DM Sans', sans-serif; text-align: center; }
        .qr-btn.primary { background: var(--rose); border-color: var(--rose); color: #fff; }
        .qr-customize { border-top: 1px solid var(--border); padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; }
        .qr-customize-label { font-size: 0.72rem; font-weight: 600; color: var(--text-mid); }
        .qr-lock { font-size: 0.62rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
        .qr-lock.pro { background: #fff3e8; color: var(--terra); border: 1px solid #f0d0a0; }
        .qr-lock.unlocked { background: var(--green-soft); color: var(--green); border: 1px solid rgba(74,122,90,0.2); }

        /* Breakdown */
        .breakdown-list { display: flex; flex-direction: column; gap: 8px; }
        .breakdown-row { display: flex; align-items: center; gap: 10px; }
        .breakdown-label { font-size: 0.72rem; color: var(--text-mid); width: 140px; flex-shrink: 0; }
        .breakdown-track { flex: 1; height: 7px; background: var(--rose-soft); border-radius: 4px; overflow: hidden; }
        .breakdown-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--rose), var(--terra)); }
        .breakdown-count { font-size: 0.7rem; font-weight: 700; color: var(--text); width: 22px; text-align: right; flex-shrink: 0; }

        /* Locked overlay */
        .locked-overlay { background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(176,92,82,0.03) 10px, rgba(176,92,82,0.03) 20px); border: 1.5px dashed rgba(176,92,82,0.2); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 12px; }
        .locked-icon { font-size: 1.6rem; margin-bottom: 10px; }
        .locked-title { font-family: 'DM Serif Display', serif; font-size: 1rem; font-weight: 700; color: var(--text-mid); margin-bottom: 6px; }
        .locked-sub { font-size: 0.78rem; color: var(--text-soft); margin-bottom: 14px; line-height: 1.6; max-width: 380px; margin-left: auto; margin-right: auto; }
        .locked-upgrade { padding: 9px 24px; border-radius: 8px; border: none; background: var(--rose); color: #fff; font-size: 0.8rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: none; display: inline-block; }

        .section-hdr { display: flex; align-items: center; gap: 10px; margin: 20px 0 12px; }
        .section-hdr-title { font-family: 'DM Serif Display', serif; font-size: 0.95rem; color: var(--text); }
        .section-hdr-line { flex: 1; height: 1px; background: var(--border); }
        .section-hdr-count { font-size: 0.62rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; background: var(--rose-soft); color: var(--rose); }

        @media (max-width: 768px) {
          .demo-sidebar { display: none; }
          .demo-sidebar.mobile-open { display: flex; position: fixed; top: 0; left: 0; height: 100vh; z-index: 300; width: 260px; box-shadow: 4px 0 24px rgba(42,31,29,0.18); animation: slideInLeft 0.22s ease both; }
          @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
          .sb-overlay { display: block; position: fixed; inset: 0; background: rgba(42,31,29,0.45); z-index: 299; backdrop-filter: blur(2px); }
          .demo-shell { height: auto; overflow: visible; }
          .demo-main { height: auto; overflow: visible; }
          .demo-topbar { padding: 0 14px; height: 52px; }
          .demo-content { padding: 14px; }
          .hamburger { display: flex; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .stat-val { font-size: 1.5rem; }
          .charts-grid { grid-template-columns: 1fr; }
          .forms-grid { grid-template-columns: 1fr; }
          .qr-grid { grid-template-columns: 1fr; }
          .digest-stats { grid-template-columns: repeat(2, 1fr); }
          .plan-features-strip { display: none; }
          .demo-banner-text { display: none; }
          .breakdown-label { width: 100px; }
          .bottom-nav { display: flex; }
          body { padding-bottom: 60px; }
          .digest-layout { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none; }
          .bottom-nav { display: none; }
          .sb-overlay { display: none; }
        }
      `}</style>

      {/* Demo banner */}
      <div className="demo-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="demo-badge">Demo</span>
          <span className="demo-banner-text">Live interactive demo with sample data. No login required.</span>
        </div>
        <Link href="/auth/register" className="demo-signup-btn">Start Free Trial →</Link>
      </div>

      {/* Plan switcher */}
      <div className="plan-switcher">
        <span className="plan-switcher-label">Viewing as:</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['free', 'pro', 'business'] as DemoPlan[]).map(p => (
            <button key={p} className={`plan-pill ${p} ${demoPlan === p ? 'active' : ''}`} onClick={() => setDemoPlan(p)}>
              {PLAN_FEATURES[p].label}
              <span className="plan-pill-price">{PLAN_FEATURES[p].price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature strip */}
      <div className="plan-features-strip">
        {planInfo.features.slice(0, 7).map((f, i) => (
          <div key={i} className="pf-item">
            <div className={`pf-check ${f.unlocked ? 'yes' : 'no'}`}>{f.unlocked ? '✓' : '✕'}</div>
            <span className={`pf-text ${f.unlocked ? 'unlocked' : 'locked'}`}>{f.text}</span>
          </div>
        ))}
      </div>

      <div className="demo-shell">
        {/* Mobile overlay */}
        {sidebarOpen && <div className="sb-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <div className={`demo-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sb-brand">
            <div className="sb-brand-name">QRFeedback<span>.ai</span></div>
            <div className="sb-business">{DEMO_BUSINESS}</div>
            <div className={`sb-plan-badge ${demoPlan}`}>{planInfo.label} Plan</div>
          </div>
          <div className="sb-nav">
            <div className="sb-section">MAIN</div>
            {[
              { id: 'overview', label: 'Overview', icon: '⊞' },
              { id: 'responses', label: 'Responses', icon: '◈' },
              { id: 'analytics', label: 'Analytics', icon: '◉' },
            ].map(item => (
              <div key={item.id} className={`sb-link ${currentPage === item.id ? 'active' : ''}`} onClick={() => { setActivePage(item.id as DemoPage); setSidebarOpen(false) }}>
                <span className="sb-link-icon">{item.icon}</span>{item.label}
              </div>
            ))}

            {/* AI Insights — hidden for free */}
            {!isFree && (
              <div className={`sb-link ${currentPage === 'insights' ? 'active' : ''}`} onClick={() => { setActivePage('insights'); setSidebarOpen(false) }}>
                <span className="sb-link-icon">✦</span>AI Insights
              </div>
            )}

            {/* Weekly Digest — hidden for free */}
            {!isFree && (
              <div className={`sb-link ${currentPage === 'digest' ? 'active' : ''}`} onClick={() => { setActivePage('digest'); setSidebarOpen(false) }}>
                <span className="sb-link-icon">📊</span>Weekly Digest
              </div>
            )}

            <div className="sb-section">FORMS</div>
            {[
              { id: 'overview', label: 'My Forms', icon: '▤' },
              { id: 'questions', label: 'Questions', icon: '◎' },
              { id: 'qr', label: 'QR Codes', icon: '⬛' },
            ].map(item => (
              <div key={item.id + '-f'} className={`sb-link ${currentPage === item.id ? 'active' : ''}`} onClick={() => { setActivePage(item.id as DemoPage); setSidebarOpen(false) }}>
                <span className="sb-link-icon">{item.icon}</span>{item.label}
              </div>
            ))}

            <div className="sb-section">ACCOUNT</div>
            <div className="sb-link"><span className="sb-link-icon">👤</span>Profile</div>
            <div className="sb-link"><span className="sb-link-icon">⚙</span>Settings</div>
          </div>

          {/* Free plan usage card */}
          {isFree && (
            <div className="sb-usage">
              <div className="sb-usage-title">
                <span>🚀 Upgrade Plan</span>
                <span className="sb-usage-plan">Free</span>
              </div>
              <div className="sb-usage-track">
                <div className="sb-usage-fill" style={{ width: '67%' }} />
              </div>
              <div className="sb-usage-label">2 / 3 forms used</div>
              <Link href="/auth/register" className="sb-upgrade-btn">Upgrade to Pro →</Link>
            </div>
          )}
        </div>

        {/* Main */}
        <div className="demo-main">
          <div className="demo-topbar">
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <span /><span /><span />
              </button>
              <div className="demo-topbar-title">
                {currentPage === 'overview' && 'Overview'}
                {currentPage === 'responses' && 'Responses'}
                {currentPage === 'analytics' && 'Analytics'}
                {currentPage === 'insights' && 'AI Insights'}
                {currentPage === 'digest' && 'Weekly Digest'}
                {currentPage === 'questions' && 'Questions'}
                {currentPage === 'qr' && 'QR Codes'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.74rem', color: 'var(--text-mid)', background: 'var(--bg)' }}>Analytics</div>
              <div style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'var(--rose)', color: '#fff', fontSize: '0.74rem', fontWeight: 700 }}>+ New Form</div>
            </div>
          </div>

          <div className="demo-content">

            {/* ── OVERVIEW ── */}
            {currentPage === 'overview' && (
              <>
                {/* Free: response limit bar */}
                {isFree && (
                  <div className="resp-limit-bar">
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600, whiteSpace: 'nowrap' }}>This month</span>
                    <div className="resp-limit-track"><div className="resp-limit-fill" style={{ width: '84%' }} /></div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>42</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>/ 50 responses</span>
                    <button style={{ padding: '4px 12px', borderRadius: 20, border: 'none', background: 'var(--rose)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>Upgrade</button>
                  </div>
                )}

                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-val">{isFree ? '42' : '47'}</div><div className="stat-label">Total Responses</div></div>
                  <div className="stat-card"><div className="stat-val terra">4.2★</div><div className="stat-label">Avg Rating</div></div>
                  <div className="stat-card"><div className="stat-val green">{isFree ? '29' : '32'}</div><div className="stat-label">Positive Reviews</div><div className="stat-sub">68% of total</div></div>
                  <div className="stat-card"><div className="stat-val rose">{isFree ? '13' : '15'}</div><div className="stat-label">Negative Reviews</div><div className="stat-sub">32% of total</div></div>
                </div>

                {/* Free: form limit banner */}
                {isFree && (
                  <div className="limit-banner">
                    <span style={{ fontSize: '1rem' }}>🔒</span>
                    <div className="limit-banner-txt"><strong style={{ color: '#2a1f1d' }}>2 of 3 forms used</strong> on the Free plan. Upgrade to Pro for unlimited forms.</div>
                    <Link href="/auth/register" style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: 'var(--rose)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>Upgrade →</Link>
                  </div>
                )}

                <div className="section-hdr">
                  <div className="section-hdr-title">Active Forms</div>
                  <div className="section-hdr-line"></div>
                  <div className="section-hdr-count">{isFree ? '2 / 3 forms' : '3 forms'}</div>
                </div>

                <div className="forms-grid">
                  {DEMO_FORMS.map((f, i) => (
                    <div key={f.id} className={`form-card ${isFree && i === 2 ? 'locked-card' : ''}`}>
                      {isFree && i === 2 && <div className="form-lock-badge">🔒 Form limit reached</div>}
                      <div className="form-card-title">{f.title}</div>
                      <div className="form-card-loc">📍 {f.location}</div>
                      <div className="form-card-stats">
                        <div className="form-stat"><span className="form-stat-val">{f.responses}</span><span className="form-stat-lbl"> responses</span></div>
                        <div className="form-stat"><span className="form-stat-val" style={{ color: 'var(--terra)' }}>{f.avg}★</span><span className="form-stat-lbl"> avg</span></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="section-hdr">
                  <div className="section-hdr-title">Recent Responses</div>
                  <div className="section-hdr-line"></div>
                </div>
                {DEMO_RESPONSES.slice(0, 3).map(r => (
                  <div key={r.id} className="resp-card">
                    <div className="resp-top">
                      <div className={`rating-circle ${r.sentiment === 'positive' ? 'pos' : 'neg'}`}>{r.rating}</div>
                      <div className="resp-body">
                        <div className="resp-top-row"><span className="resp-form-name">{r.form}</span><span className="resp-time">{r.time}</span></div>
                        <div className="resp-stars">{starStr(r.rating)}</div>
                        <div className="resp-badges"><span className={`resp-badge ${r.sentiment === 'positive' ? 'pos' : 'neg'}`}>{r.sentiment === 'positive' ? '😊 Positive' : '⚠ Negative'}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── RESPONSES ── */}
            {currentPage === 'responses' && (
              <>
                {isFree && (
                  <div className="resp-limit-bar">
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600, whiteSpace: 'nowrap' }}>This month</span>
                    <div className="resp-limit-track"><div className="resp-limit-fill" style={{ width: '84%' }} /></div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>42</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>/ 50 responses</span>
                    <button style={{ padding: '4px 12px', borderRadius: 20, border: 'none', background: 'var(--rose)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>Upgrade</button>
                  </div>
                )}
                <div className="stats-grid" style={{ marginBottom: 16 }}>
                  <div className="stat-card"><div className="stat-val">{isFree ? '42' : '47'}</div><div className="stat-label">This Week</div></div>
                  <div className="stat-card"><div className="stat-val terra">4.2</div><div className="stat-label">Avg Rating</div></div>
                  <div className="stat-card"><div className="stat-val green">{isFree ? '29' : '32'}</div><div className="stat-label">Positive</div></div>
                  <div className="stat-card"><div className="stat-val rose">{isFree ? '13' : '15'}</div><div className="stat-label">Negative</div></div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                  {['Today', 'This Week', 'This Month', 'Pick Month'].map((p, i) => (
                    <div key={i} style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${i === 1 ? 'var(--rose)' : 'var(--border)'}`, fontSize: '0.74rem', fontWeight: 600, background: i === 1 ? 'var(--rose-soft)' : 'var(--bg)', color: i === 1 ? 'var(--rose)' : 'var(--text-mid)', cursor: 'default' }}>{p}</div>
                  ))}
                </div>
                {DEMO_RESPONSES.map(r => (
                  <div key={r.id} className="resp-card">
                    <div className="resp-top" onClick={() => setExpandedResponse(expandedResponse === r.id ? null : r.id)}>
                      <div className={`rating-circle ${r.sentiment === 'positive' ? 'pos' : 'neg'}`}>{r.rating}</div>
                      <div className="resp-body">
                        <div className="resp-top-row"><span className="resp-form-name">{r.form}</span><span className="resp-time">{r.time}</span></div>
                        <div className="resp-stars">{starStr(r.rating)}</div>
                        <div className="resp-badges"><span className={`resp-badge ${r.sentiment === 'positive' ? 'pos' : 'neg'}`}>{r.sentiment === 'positive' ? '😊 Positive' : '⚠ Negative'}</span></div>
                      </div>
                      <div className={`resp-expand ${expandedResponse === r.id ? 'open' : ''}`}>▼</div>
                    </div>
                    {expandedResponse === r.id && (
                      <div className="resp-answers">
                        {Object.entries(r.answers).map(([qId, val]) => {
                          const isNum = typeof val === 'number'
                          return (
                            <div key={qId} className="answer-row">
                              <div className="answer-q">Q{qId}</div>
                              <div>
                                <div className={`answer-val ${isNum ? 'stars' : ''}`}>{isNum ? starStr(val as number) : String(val)}</div>
                                {isNum && <div className="answer-sub">{['','Terrible','Poor','Average','Good','Excellent'][val as number]}</div>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* ── ANALYTICS ── */}
            {currentPage === 'analytics' && (
              <>
                <div className="stats-grid" style={{ marginBottom: 16 }}>
                  <div className="stat-card"><div className="stat-val">{isFree ? '42' : '47'}</div><div className="stat-label">Total</div></div>
                  <div className="stat-card"><div className="stat-val terra">4.2</div><div className="stat-label">Avg Rating</div><div className="stat-sub">★★★★☆</div></div>
                  <div className="stat-card"><div className="stat-val green">{isFree ? '29' : '32'}</div><div className="stat-label">Positive</div><div className="stat-sub">68% of total</div></div>
                  <div className="stat-card"><div className="stat-val rose">{isFree ? '13' : '15'}</div><div className="stat-label">Negative</div><div className="stat-sub">32% of total</div></div>
                </div>
                <div className="charts-grid">
                  <div className="chart-card">
                    <div className="chart-title">Ratings Over Time</div>
                    <div className="chart-sub">Daily average star rating</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={RATINGS_OVER_TIME}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#b09490' }} />
                        <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10, fill: '#b09490' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="Avg Rating" stroke={ROSE} strokeWidth={2.5} dot={{ fill: ROSE, r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-card">
                    <div className="chart-title">Sentiment Breakdown</div>
                    <div className="chart-sub">Positive vs negative</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={SENTIMENT_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                          {SENTIMENT_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.7rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-card">
                    <div className="chart-title">Response Volume</div>
                    <div className="chart-sub">Responses per day</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={VOLUME_OVER_TIME}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#b09490' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#b09490' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="Responses" fill={TERRA} radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-card">
                    <div className="chart-title">Rating by Form</div>
                    <div className="chart-sub">Average per form</div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={AVG_BY_FORM} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e0" horizontal={false} />
                        <XAxis type="number" domain={[0,5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10, fill: '#b09490' }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#b09490' }} width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="Avg Rating" radius={[0,4,4,0]}>
                          {AVG_BY_FORM.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-card full">
                    <div className="chart-title">Review Breakdown</div>
                    <div className="chart-sub">Most common responses from choice questions</div>
                    <div className="breakdown-list">
                      {BREAKDOWN_DATA.map((item, i) => (
                        <div key={i} className="breakdown-row">
                          <div className="breakdown-label">{item.name}</div>
                          <div className="breakdown-track"><div className="breakdown-fill" style={{ width: `${(item.count / BREAKDOWN_DATA[0].count) * 100}%` }} /></div>
                          <div className="breakdown-count">{item.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── AI INSIGHTS ── */}
            {currentPage === 'insights' && (
              <>
                {!canInsights ? (
                  <div className="locked-overlay">
                    <div className="locked-icon">✦</div>
                    <div className="locked-title">AI Insights — Pro & Business</div>
                    <div className="locked-sub">Every negative review is automatically analysed by AI — sentiment scoring, category classification, a plain-language summary, and a suggested owner reply. All within 15 seconds of submission.</div>
                    <Link href="/auth/register" className="locked-upgrade">Upgrade to unlock →</Link>
                  </div>
                ) : (
                  <>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>✦ AI processes every negative response automatically within 15 seconds. Results appear here.</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        <div style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--rose-soft)', color: 'var(--rose)', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(176,92,82,0.2)' }}>3 unreviewed</div>
                      </div>
                    </div>

                    {DEMO_AI_INSIGHTS.map(insight => (
                      <div key={insight.id} className="ai-insight-card">
                        <div className="ai-card-header">
                          <div className={`rating-circle neg`} style={{ width: 36, height: 36, fontSize: '0.9rem' }}>{insight.rating}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text)' }}>{insight.form}</span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-soft)' }}>{insight.time}</span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--terra)', marginBottom: 6 }}>{starStr(insight.rating)}</div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: insight.categoryBg, color: insight.categoryColor, border: `1px solid ${insight.categoryColor}30` }}>{insight.categoryLabel}</span>
                              <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid rgba(74,122,90,0.2)' }}>✦ AI Processed</span>
                            </div>
                          </div>
                        </div>
                        <div className="ai-card-body">
                          <SentimentBar score={insight.sentiment} />
                          <div style={{ marginTop: 12 }}>
                            <div className="ai-summary-box">
                              <div className="ai-summary-label">AI Summary</div>
                              <div className="ai-summary-text">{insight.summary}</div>
                            </div>
                          </div>
                          <button className="ai-reply-toggle" onClick={() => setExpandedReply(expandedReply === insight.id ? null : insight.id)}>
                            <span>💬 Suggested Reply</span>
                            <span style={{ fontSize: '0.7rem' }}>{expandedReply === insight.id ? '▲' : '▼'}</span>
                          </button>
                          {expandedReply === insight.id && (
                            <div className="ai-reply-box">
                              <div className="ai-reply-label">Suggested owner response</div>
                              <div className="ai-reply-text">{insight.suggestedReply}</div>
                              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                <button style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(74,122,90,0.3)', background: 'transparent', fontSize: '0.7rem', fontWeight: 600, color: 'var(--green)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>📋 Copy</button>
                                <button style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(58,122,154,0.3)', background: '#e8f4fb', fontSize: '0.7rem', fontWeight: 600, color: '#3a7a9a', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>✉ Send to Customer</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {/* ── WEEKLY DIGEST ── */}
            {currentPage === 'digest' && (
              <div className="digest-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 220px) 1fr', gap: 16, alignItems: 'start' }}>
                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'var(--rose)', color: '#fff', fontFamily: 'DM Sans, sans-serif', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>✦ Generate This Week's Digest</span>
                    <span style={{ fontSize: '0.62rem', opacity: 0.75 }}>30 Mar – 5 Apr</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>or custom range</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  </div>
                  <div style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-mid)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>📅 Custom Date Range</span><span style={{ fontSize: '0.75rem' }}>▼</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-soft)', padding: '4px 2px', marginTop: 4 }}>Previous Digests</div>
                  {[
                    { week: '30 Mar – 5 Apr 2026', rating: '1.0★', count: '1 reviews', active: true },
                    { week: '11 Mar – 17 Mar 2026', rating: '3.5★', count: '14 reviews', active: false },
                  ].map((item, i) => (
                    <div key={i} style={{ background: item.active ? 'var(--rose-soft)' : 'var(--surface)', border: `1.5px solid ${item.active ? 'var(--rose)' : 'var(--border)'}`, borderRadius: 10, padding: '12px 14px', cursor: 'default' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{item.week}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)', display: 'flex', gap: 10 }}>
                        <span>📉 {item.rating}</span><span>{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main digest content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Header card */}
                  <div style={{ background: 'linear-gradient(135deg, var(--rose-soft), var(--bg))', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem', color: 'var(--text)', marginBottom: 4 }}>Weekly Digest</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>30 Mar – 5 Apr 2026</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-mid)', fontSize: '0.72rem', fontWeight: 600 }}>↓ Download PDF</div>
                        <div style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--rose-soft)', color: 'var(--rose)', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(176,92,82,0.3)' }}>📉 Declining</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-soft)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>This Week's Numbers</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
                      {[
                        { val: '47', label: 'Total Reviews', cls: '', color: 'var(--text)' },
                        { val: '32', label: 'Positive', cls: 'green', color: 'var(--green)' },
                        { val: '15', label: 'Negative', cls: 'rose', color: 'var(--rose)' },
                        { val: '4.2★', label: 'Avg Rating', cls: 'amber', color: 'var(--terra)' },
                      ].map((s, i) => (
                        <div key={i} style={{ background: s.cls === 'green' ? 'var(--green-soft)' : s.cls === 'rose' ? 'var(--rose-soft)' : s.cls === 'amber' ? '#fef9ec' : 'var(--bg)', border: `1px solid ${s.cls === 'green' ? 'rgba(74,122,90,0.25)' : s.cls === 'rose' ? 'rgba(176,92,82,0.2)' : s.cls === 'amber' ? '#f0d98a' : 'var(--border)'}`, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.7rem', color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.val}</div>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: s.color }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sentiment + Top complaints */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-soft)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Sentiment Breakdown</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Donut */}
                        <svg width={80} height={80} viewBox="0 0 88 88">
                          <circle cx={44} cy={44} r={34} fill="none" stroke="#f0ebe8" strokeWidth={10} />
                          <circle cx={44} cy={44} r={34} fill="none" stroke="#4a7a5a" strokeWidth={10} strokeDasharray={`${2*Math.PI*34*0.68} ${2*Math.PI*34*0.32}`} strokeDashoffset={2*Math.PI*34*0.25} strokeLinecap="butt" />
                          <circle cx={44} cy={44} r={34} fill="none" stroke="#b05c52" strokeWidth={10} strokeDasharray={`${2*Math.PI*34*0.32} ${2*Math.PI*34*0.68}`} strokeDashoffset={2*Math.PI*34*(0.25-0.68)} strokeLinecap="butt" />
                          <text x={44} y={40} textAnchor="middle" fontSize="13" fontWeight="700" fill="#2a1f1d" fontFamily="DM Serif Display, serif">68%</text>
                          <text x={44} y={53} textAnchor="middle" fontSize="8" fill="#b09490" fontFamily="DM Sans, sans-serif">positive</text>
                        </svg>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4a7a5a' }} /><span>Positive <strong style={{ color: 'var(--green)' }}>32</strong></span></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#b05c52' }} /><span>Negative <strong style={{ color: 'var(--rose)' }}>15</strong></span></div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>47 total reviews</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--rose)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>⚠ Top Complaint Areas</div>
                      {[
                        { label: '💼 Service', count: 8, color: '#c4896a', pct: 100 },
                        { label: '⏱ Wait Time', count: 5, color: '#5a5ab0', pct: 62 },
                        { label: '🍽 Food', count: 2, color: '#b05c52', pct: 25 },
                      ].map((item, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                            <span style={{ color: '#2a1f1d', fontWeight: 600 }}>{item.label}</span>
                            <span style={{ color: item.color, fontWeight: 700 }}>{item.count} complaint{item.count !== 1 ? 's' : ''}</span>
                          </div>
                          <div style={{ height: 7, background: '#f5ede9', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 4 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--rose)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>✦ AI Summary</div>
                    <div style={{ background: 'var(--rose-soft)', borderLeft: '3px solid var(--rose)', borderRadius: '0 8px 8px 0', padding: '13px 15px', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.7 }}>
                      This week, The Golden Fork received a strong volume of feedback across all three forms. Wait time and service complaints are concentrated in Online Orders, while the Events Desk continues to be a standout performer. Positive sentiment is driven largely by food quality and ambiance at the Main Branch.
                    </div>
                  </div>

                  {/* Areas to improve + Rating trend */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    <div style={{ background: 'var(--rose-soft)', border: '1px solid rgba(176,92,82,0.15)', borderRadius: 12, padding: '18px 20px' }}>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--rose)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(176,92,82,0.15)' }}>📋 Areas to Improve</div>
                      {['Staff training and service consistency', 'Online order delivery speed', 'Response time to customer needs'].map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'var(--text)', marginBottom: 7, lineHeight: 1.5 }}>
                          <span style={{ color: 'var(--rose)', flexShrink: 0 }}>→</span><span>{a}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-soft)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>📈 Rating Trend (Week over Week)</div>
                      {/* Sparkline */}
                      <svg width="100%" height={80} viewBox="0 0 280 80" style={{ overflow: 'visible' }}>
                        <line x1={18} y1={18} x2={262} y2={18} stroke="#e8d5cf" strokeWidth={1} strokeDasharray="3,3" />
                        <line x1={18} y1={44} x2={262} y2={44} stroke="#e8d5cf" strokeWidth={1} strokeDasharray="3,3" />
                        <line x1={18} y1={62} x2={262} y2={62} stroke="#e8d5cf" strokeWidth={1} strokeDasharray="3,3" />
                        <path d="M18,28 L262,58" fill="none" stroke="#b05c52" strokeWidth={2.5} strokeLinecap="round" />
                        <path d="M18,28 L262,58 L262,62 L18,62 Z" fill="rgba(176,92,82,0.08)" />
                        <circle cx={18} cy={28} r={5} fill="#fff" stroke="#b05c52" strokeWidth={2} />
                        <circle cx={262} cy={58} r={5} fill="#fff" stroke="#b05c52" strokeWidth={2} />
                        <text x={18} y={22} textAnchor="middle" fontSize="10" fontWeight="700" fill="#2a1f1d" fontFamily="DM Sans, sans-serif">3.5★</text>
                        <text x={262} y={52} textAnchor="middle" fontSize="10" fontWeight="700" fill="#2a1f1d" fontFamily="DM Sans, sans-serif">4.2★</text>
                        <text x={18} y={78} textAnchor="middle" fontSize="9" fill="#b09490" fontFamily="DM Sans, sans-serif">11 Mar</text>
                        <text x={262} y={78} textAnchor="middle" fontSize="9" fill="#b09490" fontFamily="DM Sans, sans-serif">30 Mar</text>
                      </svg>
                    </div>
                  </div>

                  {/* Action items */}
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a07820', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>⚡ This Week's Action Items</div>
                    <div style={{ background: '#fef9ec', border: '1px solid #f0d98a', borderRadius: 10, padding: '13px 15px', fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.7 }}>
                      1. Conduct a staff meeting to address service issues and emphasise the importance of customer satisfaction. 2. Implement a training session focused on improving communication and service skills. 3. Review the Online Orders delivery process to identify bottlenecks causing wait time complaints.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── QUESTIONS ── */}
            {currentPage === 'questions' && (
              <>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business Type</span>
                  {['🍽 Restaurant', '🛍 Retail', '🏥 Healthcare', '💼 Services', '⬡ Other'].map((bt, i) => (
                    <div key={i} style={{ padding: '4px 12px', borderRadius: 20, border: `1.5px solid ${i === 0 ? 'var(--rose)' : 'var(--border)'}`, fontSize: '0.72rem', fontWeight: 600, background: i === 0 ? 'var(--rose-soft)' : 'var(--bg)', color: i === 0 ? 'var(--rose)' : 'var(--text-mid)', cursor: 'default' }}>{bt}</div>
                  ))}
                </div>
                <div className="section-hdr"><div className="section-hdr-title">Preloaded Questions</div><div className="section-hdr-line"></div><div className="section-hdr-count">8</div></div>
                {DEMO_QUESTIONS.filter(q => q.preloaded).map((q, idx) => (
                  <div key={q.id} className="q-card">
                    <div className="q-pos">{idx + 1}</div>
                    <div className="q-body">
                      <div className="q-text">{q.text}</div>
                      <div className="q-meta">
                        <span className={`q-badge ${q.type}`}>{q.type === 'star' ? '⭐ Star' : q.type === 'text' ? '✎ Text' : q.type === 'choice' ? '☰ Choice' : '✓✗ Yes/No'}</span>
                        <span className="q-badge preloaded">Preloaded</span>
                        {q.required && <span className="q-badge required">Required</span>}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="section-hdr" style={{ marginTop: 20 }}><div className="section-hdr-title">Custom Questions</div><div className="section-hdr-line"></div><div className="section-hdr-count">1</div></div>
                {DEMO_QUESTIONS.filter(q => !q.preloaded).map((q, idx) => (
                  <div key={q.id} className="q-card">
                    <div className="q-pos custom">{8 + idx + 1}</div>
                    <div className="q-body">
                      <div className="q-text">{q.text}</div>
                      <div className="q-meta">
                        <span className={`q-badge ${q.type}`}>{q.type === 'yesno' ? '✓✗ Yes/No' : q.type}</span>
                        <span className="q-badge custom-badge">Custom</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ── QR CODES ── */}
            {currentPage === 'qr' && (
              <>
                <div className="qr-grid">
                  {DEMO_FORMS.map(f => (
                    <div key={f.id} className="qr-card">
                      <div className="qr-card-inner">
                        <div className="qr-mock">
                          <svg width="100" height="100" viewBox="0 0 100 100">
                            <rect x="5" y="5" width="28" height="28" rx="3" fill="none" stroke={!isFree ? '#b05c52' : '#2a1f1d'} strokeWidth="3"/>
                            <rect x="10" y="10" width="18" height="18" rx="1" fill={!isFree ? '#b05c52' : '#2a1f1d'}/>
                            <rect x="67" y="5" width="28" height="28" rx="3" fill="none" stroke={!isFree ? '#b05c52' : '#2a1f1d'} strokeWidth="3"/>
                            <rect x="72" y="10" width="18" height="18" rx="1" fill={!isFree ? '#b05c52' : '#2a1f1d'}/>
                            <rect x="5" y="67" width="28" height="28" rx="3" fill="none" stroke={!isFree ? '#b05c52' : '#2a1f1d'} strokeWidth="3"/>
                            <rect x="10" y="72" width="18" height="18" rx="1" fill={!isFree ? '#b05c52' : '#2a1f1d'}/>
                            {[40,48,56,44,52,60,40,52].map((x,i) => (
                              <rect key={i} x={x} y={[40,40,40,52,52,52,60,60][i]} width="5" height="5" rx={isBusiness ? 2.5 : 1} fill={!isFree ? '#b05c52' : '#2a1f1d'} opacity={0.7 + (i % 3) * 0.1}/>
                            ))}
                            {[68,76,84,68,84,68,76].map((x,i) => (
                              <rect key={i} x={x} y={[40,40,40,48,48,56,56][i]} width="5" height="5" rx={isBusiness ? 2.5 : 1} fill={!isFree ? '#b05c52' : '#2a1f1d'} opacity={0.6 + (i % 3) * 0.1}/>
                            ))}
                            {[40,48,56,64,40,56].map((x,i) => (
                              <rect key={i} x={x} y={[68,68,68,68,76,76][i]} width="5" height="5" rx={isBusiness ? 2.5 : 1} fill={!isFree ? '#b05c52' : '#2a1f1d'} opacity={0.65 + (i % 3) * 0.1}/>
                            ))}
                          </svg>
                        </div>
                        {isFree && <div style={{ fontSize: '0.62rem', color: 'var(--text-soft)', marginBottom: 8, textAlign: 'center' }}>QRFeedback<span style={{ color: 'var(--rose)' }}>.ai</span></div>}
                        {isBusiness && <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-mid)', marginBottom: 8, textAlign: 'center' }}>{DEMO_BUSINESS}</div>}
                        <div className="qr-form-name">{f.title}</div>
                        <div className="qr-loc">📍 {f.location}</div>
                        <div className="qr-stats">
                          <div className="qr-stat"><div className="qr-stat-val">{f.responses}</div><div className="qr-stat-lbl">Responses</div></div>
                          <div className="qr-stat"><div className="qr-stat-val terra">{f.avg}★</div><div className="qr-stat-lbl">Avg Rating</div></div>
                        </div>
                        <div className="qr-actions">
                          <div className="qr-btn">🔗 Copy URL</div>
                          <div className="qr-btn primary">↓ Download</div>
                        </div>
                      </div>
                      <div className="qr-customize">
                        <span className="qr-customize-label">Customize QR</span>
                        {isFree ? <span className="qr-lock pro">Pro / Business</span> : <span className="qr-lock unlocked">✓ Unlocked</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {isFree && (
                  <div className="locked-overlay" style={{ marginTop: 16 }}>
                    <div className="locked-icon">🎨</div>
                    <div className="locked-title">Custom QR Designs — Pro & Business</div>
                    <div className="locked-sub">Change QR colors, dot styles, and add your business name to the QR code.</div>
                    <Link href="/auth/register" className="locked-upgrade">Upgrade to unlock →</Link>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <div className="bottom-nav">
        {[
          { id: 'overview', label: 'Overview', icon: '⊞' },
          { id: 'responses', label: 'Responses', icon: '◈' },
          { id: 'analytics', label: 'Analytics', icon: '◉' },
          ...(!isFree ? [{ id: 'insights', label: 'AI', icon: '✦' }] : []),
          { id: 'qr', label: 'QR', icon: '⬛' },
        ].map(item => (
          <div key={item.id} className={`bottom-nav-item ${currentPage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id as DemoPage)}>
            <div className="bottom-nav-icon">{item.icon}</div>
            <div className="bottom-nav-label">{item.label}</div>
          </div>
        ))}
      </div>
    </>
  )
}