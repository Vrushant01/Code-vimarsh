import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Users, Calendar, Rocket, Zap, Terminal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { getEvents, Event as APIEvent } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: Code2,
    title: 'Learn Together',
    description: 'Collaborative learning environment with peer programming sessions.',
  },
  {
    icon: Rocket,
    title: 'Build Projects',
    description: 'Work on real-world projects that make a difference.',
  },
  {
    icon: Users,
    title: 'Network',
    description: 'Connect with like-minded developers and industry professionals.',
  },
  {
    icon: Calendar,
    title: 'Events',
    description: 'Regular hackathons, workshops, and tech talks.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [createdEvents, setCreatedEvents] = useState<APIEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Fetch events created by the logged-in user
  useEffect(() => {
    const fetchCreatedEvents = async () => {
      if (!isAuthenticated || !user) {
        setIsLoadingEvents(false);
        return;
      }

      try {
        setIsLoadingEvents(true);
        const result = await getEvents({
          page: 1,
          limit: 50,
          upcoming: true,
        });

        if (result.success && result.data) {
          // Filter events to show only those created by the logged-in user
          const userCreatedEvents = result.data.events.filter(
            (event) => event.organizer._id === user.id
          );
          setCreatedEvents(userCreatedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchCreatedEvents();
  }, [isAuthenticated, user]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Zap className="w-4 h-4" />
                Welcome to the future of coding
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Code. Create.
              <br />
              <span className="text-gradient">Innovate.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Join Code Vimarsh — a community of passionate developers, 
              innovators, and tech enthusiasts pushing the boundaries of what's possible.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/events">
                  <Button variant="hero" size="xl" className="gap-2">
                    Other
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button variant="hero" size="xl" className="gap-2">
                    Join Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              )}
              <Link to="/projects">
                <Button variant="glass" size="xl">
                  Explore Projects
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {[
                { value: '200+', label: 'Members' },
                { value: '50+', label: 'Projects' },
                { value: '30+', label: 'Events' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Code Snippets */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-10 hidden lg:block"
        >
          <div className="glass p-4 rounded-lg font-mono text-sm">
            <div className="text-primary">const</div>
            <div className="text-accent">future</div>
            <div className="text-muted-foreground">= code();</div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/3 right-10 hidden lg:block"
        >
          <div className="glass p-4 rounded-lg font-mono text-sm">
            <Terminal className="w-4 h-4 text-primary mb-2" />
            <div className="text-muted-foreground">$ npm run innovate</div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join Code Vimarsh?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Be part of a thriving community that's shaping the future of technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass p-6 rounded-xl hover-glow cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Events Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">My Created Events</h2>
              <p className="text-muted-foreground">Events you've created and organized.</p>
            </div>
            <Link to="/events">
              <Button variant="outline" className="gap-2">
                View All Events
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {isLoadingEvents ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : createdEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass rounded-xl overflow-hidden group"
                >
                  <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium capitalize">
                        {event.type}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {isAuthenticated 
                  ? "You haven't created any events yet." 
                  : "Please log in to see your created events."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Start Your
              <span className="text-gradient"> Coding Journey?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join hundreds of students who are already building amazing projects and learning together.
            </p>
            <Link to="/register">
              <Button variant="hero" size="xl" className="gap-2">
                Get Started Today
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
