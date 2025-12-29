import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { getEvents, Event as APIEvent, registerForEvent } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const typeColors: Record<string, string> = {
  workshop: 'bg-primary/10 text-primary border-primary/20',
  hackathon: 'bg-accent/10 text-accent border-accent/20',
  meetup: 'bg-green-500/10 text-green-400 border-green-500/20',
  talk: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  conference: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState<APIEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<APIEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Fetch upcoming events
        const upcomingResult = await getEvents({
          page: 1,
          limit: 50,
          upcoming: true,
        });

        // Fetch past events
        const pastResult = await getEvents({
          page: 1,
          limit: 50,
          upcoming: false,
        });

        if (upcomingResult.success && upcomingResult.data) {
          setUpcomingEvents(upcomingResult.data.events);
        }

        if (pastResult.success && pastResult.data) {
          setPastEvents(pastResult.data.events);
        }

        if (!upcomingResult.success || !pastResult.success) {
          toast({
            title: 'Error',
            description: 'Failed to load some events',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load events. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  const handleRegister = async (eventId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to register for events',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await registerForEvent(eventId);
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message || 'Successfully registered for event',
        });
        // Refresh events to update participant count
        const refreshResult = await getEvents({ page: 1, limit: 50, upcoming: true });
        if (refreshResult.success && refreshResult.data) {
          setUpcomingEvents(refreshResult.data.events);
        }
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to register for event',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to register for event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatEventTime = (dateString: string, endDateString?: string) => {
    const start = new Date(dateString);
    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    if (endDateString) {
      const end = new Date(endDateString);
      const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `${startTime} - ${endTime}`;
    }
    
    return startTime;
  };

  const getParticipantCount = (event: APIEvent) => {
    if (Array.isArray(event.participants)) {
      return event.participants.length;
    }
    return 0;
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Events</span> & Activities
            </h1>
            <p className="text-muted-foreground text-lg">
              Join our workshops, hackathons, and meetups to learn, build, and connect with fellow developers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-8 flex items-center gap-3"
          >
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            Upcoming Events
          </motion.h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No upcoming events scheduled.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => {
                const participantCount = getParticipantCount(event);
                const maxParticipants = event.maxParticipants || 0;
                const isFull = maxParticipants > 0 && participantCount >= maxParticipants;
                
                return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass rounded-xl overflow-hidden group"
              >
                <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${typeColors[event.type.toLowerCase()] || typeColors.workshop}`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {participantCount}{maxParticipants > 0 && `/${maxParticipants}`}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      {formatEventDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      {formatEventTime(event.date, event.endDate)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      {event.location}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {maxParticipants > 0 && (
                    <div className="mb-4">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                          style={{ width: `${(participantCount / maxParticipants) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {maxParticipants - participantCount} spots left
                      </p>
                    </div>
                  )}

                  {event.registrationLink ? (
                    <Button variant="glow" className="w-full" asChild>
                      <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                        Register Now
                      </a>
                    </Button>
                  ) : (
                    <Button 
                      variant="glow" 
                      className="w-full" 
                      onClick={() => handleRegister(event._id)}
                      disabled={isFull}
                    >
                      {isFull ? 'Event Full' : 'Register Now'}
                    </Button>
                  )}
                </div>
              </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold mb-8"
          >
            Past Events
          </motion.h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : pastEvents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No past events.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event, index) => {
                const participantCount = getParticipantCount(event);
                
                return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${typeColors[event.type.toLowerCase()] || typeColors.workshop}`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {participantCount} attended
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
