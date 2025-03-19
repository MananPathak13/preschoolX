import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { School, Users, Calendar, BookOpen, BarChart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-secondary text-primary-foreground py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <School className="h-8 w-8" />
            <h1 className="text-2xl font-bold">PreschoolPro</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="#features" className="hover:text-accent-foreground transition-colors">Features</Link>
            <Link href="#testimonials" className="hover:text-accent-foreground transition-colors">Testimonials</Link>
            <Link href="#pricing" className="hover:text-accent-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-secondary">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-muted to-background">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Simplify Your Preschool Management</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            PreschoolPro helps you manage students, staff, and daily operations with ease,
            so you can focus on what matters most - the children.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                Get Started
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="px-8">
                Watch Demo
              </Button>
            </Link>
          </div>
          <div className="mt-16 relative">
            <div className="bg-card rounded-xl shadow-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                alt="PreschoolPro Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Everything You Need to Run Your Preschool</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="Student Management"
              description="Easily add, update, and track student information, attendance, and progress."
            />
            <FeatureCard
              icon={<Calendar className="h-10 w-10" />}
              title="Staff Scheduling"
              description="Manage staff schedules, assignments, and time-off requests efficiently."
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10" />}
              title="Parent Portal"
              description="Keep parents informed with real-time updates on their child's activities and progress."
            />
            <FeatureCard
              icon={<BarChart className="h-10 w-10" />}
              title="Reporting & Analytics"
              description="Generate insightful reports on attendance, progress, and operational metrics."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-muted">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Trusted by Preschools Everywhere</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="PreschoolPro has transformed how we manage our preschool. The time we save on administrative tasks allows us to focus more on the children."
              author="Sarah Johnson"
              role="Director, Sunshine Preschool"
              image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
            />
            <TestimonialCard
              quote="The parent portal has greatly improved our communication with families. Parents love being able to see updates about their child's day."
              author="Michael Chen"
              role="Owner, Little Explorers Academy"
              image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
            />
            <TestimonialCard
              quote="The attendance tracking and reporting features save us hours each week. I can't imagine running our preschool without PreschoolPro now."
              author="Emily Rodriguez"
              role="Administrator, Kids First Preschool"
              image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-center mb-16 max-w-2xl mx-auto">Choose the plan that works best for your preschool</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Starter"
              price="$49"
              description="Perfect for small preschools just getting started"
              features={[
                "Up to 30 students",
                "Basic attendance tracking",
                "Parent portal access",
                "Email support"
              ]}
              buttonText="Get Started"
              buttonVariant="outline"
            />
            <PricingCard
              title="Professional"
              price="$99"
              description="Ideal for established preschools"
              features={[
                "Up to 100 students",
                "Advanced attendance tracking",
                "Staff scheduling",
                "Custom reporting",
                "Priority support"
              ]}
              buttonText="Get Started"
              buttonVariant="default"
              highlighted={true}
            />
            <PricingCard
              title="Enterprise"
              price="$199"
              description="For large preschools with multiple locations"
              features={[
                "Unlimited students",
                "Multiple location management",
                "Advanced analytics",
                "API access",
                "Dedicated account manager"
              ]}
              buttonText="Contact Sales"
              buttonVariant="outline"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-secondary text-secondary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Preschool?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of preschools already using PreschoolPro to simplify their operations.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">PreschoolPro</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-accent transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-accent transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">Testimonials</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-accent transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">Guides</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">API</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">Cookie Policy</Link></li>
                <li><Link href="#" className="hover:text-accent transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center">
            <p>&copy; {new Date().getFullYear()} PreschoolPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border hover:shadow-lg transition-shadow">
      <div className="text-secondary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, image }: { quote: string, author: string, role: string, image: string }) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border">
      <p className="italic mb-6">{quote}</p>
      <div className="flex items-center">
        <img src={image} alt={author} className="w-12 h-12 rounded-full mr-4 object-cover" />
        <div>
          <h4 className="font-semibold">{author}</h4>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  description,
  features,
  buttonText,
  buttonVariant = "default",
  highlighted = false
}: {
  title: string,
  price: string,
  description: string,
  features: string[],
  buttonText: string,
  buttonVariant?: "default" | "outline",
  highlighted?: boolean
}) {
  return (
    <div className={`bg-card p-8 rounded-lg border ${highlighted ? 'border-secondary shadow-lg ring-2 ring-secondary' : 'border-border shadow-md'}`}>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="flex items-baseline mb-4">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground ml-1">/month</span>
      </div>
      <p className="text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 text-secondary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Button className="w-full" variant={buttonVariant}>
        {buttonText}
      </Button>
    </div>
  );
}