import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MatchLens AI – Smart Stadium Operations for FIFA World Cup 2026',
};

export default function HomePage() {
  return (
    <main className="min-h-screen fifa-gradient text-white" role="main">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-8"
            aria-label="FIFA World Cup 2026 Official Platform"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true" />
            FIFA World Cup 2026 – Official Volunteer Operations Platform
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            MatchLens{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
              AI
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-4 font-light">
            Volunteer Copilot
          </p>

          <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            AI-powered stadium operations platform. Real-time incident management, multilingual
            assistance, crowd safety monitoring, and medical emergency coordination — all in one
            intelligent dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center" role="group" aria-label="Get started options">
            <Link
              href="/login"
              className="bg-white text-blue-900 hover:bg-white/90 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900"
            >
              Sign In to Dashboard
            </Link>
            <Link
              href="/register"
              className="border-2 border-white/40 hover:border-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900"
            >
              Register as Volunteer
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-24 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200"
              role="article"
            >
              <div
                className="text-3xl mb-4"
                aria-hidden="true"
                role="img"
              >
                {feature.icon}
              </div>
              <h2 className="text-xl font-bold mb-2">{feature.title}</h2>
              <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Role Cards */}
        <div className="mt-20 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Built for Every Role</h2>
          <p className="text-white/60 mb-10">
            Separate dashboards and permissions for each team member
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {roles.map((role) => (
              <div
                key={role.title}
                className="bg-white/10 border border-white/20 rounded-xl p-4 text-center"
                role="listitem"
              >
                <div className="text-2xl mb-2" aria-hidden="true">{role.icon}</div>
                <div className="text-sm font-medium">{role.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-white/40 text-sm">
          <p>© 2026 MatchLens AI – FIFA World Cup Volunteer Operations Platform</p>
          <p className="mt-1">Built with Google Gemini AI · Next.js · Node.js</p>
        </div>
      </footer>
    </main>
  );
}

const features = [
  {
    icon: '👶',
    title: 'Lost Child Assistant',
    description:
      'AI-powered search protocols, multilingual announcements, and real-time coordination to reunite lost children with families.',
  },
  {
    icon: '🏥',
    title: 'Medical Emergency',
    description:
      'Instant emergency type detection, nearest medical station routing, crowd diversion planning, and staff notification.',
  },
  {
    icon: '👥',
    title: 'Crowd Management',
    description:
      'Real-time congestion analysis, alternative route suggestions, volunteer deployment recommendations, and flow predictions.',
  },
  {
    icon: '♿',
    title: 'Accessibility Guide',
    description:
      'Personalized route planning for wheelchair users, elderly visitors, visually and hearing impaired fans, and families.',
  },
  {
    icon: '🌍',
    title: 'Translation Assistant',
    description:
      'Real-time multilingual support in 8 languages: English, Spanish, French, Portuguese, Arabic, Hindi, Japanese, German.',
  },
  {
    icon: '🤖',
    title: 'AI Knowledge Base',
    description:
      'RAG-powered assistant with stadium SOPs, emergency procedures, volunteer handbook, and FIFA operational rules.',
  },
];

const roles = [
  { icon: '🦺', title: 'Volunteer' },
  { icon: '🛡️', title: 'Security' },
  { icon: '⚕️', title: 'Medical' },
  { icon: '📋', title: 'Organizer' },
  { icon: '⚙️', title: 'Admin' },
];
