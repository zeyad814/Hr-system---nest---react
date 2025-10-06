import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  Users,
  Briefcase,
  TrendingUp,
  Shield,
  Clock,
  MessageSquare,
  Star,
  ArrowRight,
  CheckCircle,
  LayoutDashboard
} from 'lucide-react'

const Homepage = () => {
  const { t, isRTL } = useLanguage()
  const { isAuthenticated, user } = useAuth()

  const features = [
    {
      icon: Users,
      title: t('homepage.features.hrManagement'),
      description: t('homepage.features.hrManagementDesc')
    },
    {
      icon: Briefcase,
      title: t('homepage.features.salesTracking'),
      description: t('homepage.features.salesTrackingDesc')
    },
    {
      icon: TrendingUp,
      title: t('homepage.features.analytics'),
      description: t('homepage.features.analyticsDesc')
    },
    {
      icon: Shield,
      title: t('homepage.features.security'),
      description: t('homepage.features.securityDesc')
    },
    {
      icon: Clock,
      title: t('homepage.features.timeline'),
      description: t('homepage.features.timelineDesc')
    },
    {
      icon: MessageSquare,
      title: t('homepage.features.whatsapp'),
      description: t('homepage.features.whatsappDesc')
    }
  ]

  const stats = [
    { number: '500+', label: t('homepage.stats.companies') },
    { number: '10K+', label: t('homepage.stats.candidates') },
    { number: '95%', label: t('homepage.stats.satisfaction') },
    { number: '24/7', label: t('homepage.stats.support') }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">
                {t('homepage.title')}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
              {isAuthenticated ? (
                <Link to={`/${user?.role?.toLowerCase() || 'dashboard'}`}>
                  <Button variant="outline">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    الداشبورد
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="outline">
                    {t('auth.login')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {t('homepage.hero.title')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('homepage.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                {t('homepage.hero.getStarted')}
                <ArrowRight className={`ml-2 h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            <Link to="/partners">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t('homepage.hero.viewPartners')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              {t('homepage.features.title')}
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('homepage.features.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            {t('homepage.cta.title')}
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('homepage.cta.subtitle')}
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              {t('homepage.cta.button')}
              <ArrowRight className={`ml-2 h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">
                {t('homepage.title')}
              </h4>
              <p className="text-muted-foreground">
                {t('homepage.footer.description')}
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">{t('homepage.footer.product')}</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/partners" className="hover:text-foreground">{t('nav.partners')}</Link></li>
                <li><Link to="/login" className="hover:text-foreground">{t('auth.login')}</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">{t('homepage.footer.company')}</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">{t('homepage.footer.about')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('homepage.footer.contact')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('homepage.footer.privacy')}</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">{t('homepage.footer.support')}</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">{t('homepage.footer.help')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('homepage.footer.docs')}</a></li>
                <li><a href="#" className="hover:text-foreground">{t('homepage.footer.community')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 {t('homepage.title')}. {t('homepage.footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Homepage