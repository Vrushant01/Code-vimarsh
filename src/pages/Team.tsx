import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { getTeamMembers, TeamMember } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getAssetUrl } from '@/lib/apiUrl';

const socialIcons: Record<string, typeof Github> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
};

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeam = async () => {
      setIsLoading(true);
      try {
        const result = await getTeamMembers();
        if (result.success && result.members) {
          setTeamMembers(result.members);
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to load team members',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load team members. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [toast]);
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Our <span className="text-gradient">Team</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              The passionate individuals driving Code Vimarsh forward.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No team members found.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="glass rounded-2xl p-6 text-center group"
              >
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-32 h-32 mx-auto mb-6"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 group-hover:opacity-40 blur-xl transition-opacity" />
                  <img
                    src={member.photo ? (member.photo.startsWith('http') ? member.photo : getAssetUrl(member.photo)) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'}
                    alt={member.name}
                    className="relative w-full h-full rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face';
                    }}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>

                {/* Info */}
                <h3 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                  {member.name}
                </h3>
                <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>

                {/* Social Links */}
                <div className="flex justify-center gap-3">
                  {member.socialLinks?.github && (
                    <a
                      href={member.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-secondary hover:bg-primary/20 hover:text-primary transition-all duration-300"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {member.socialLinks?.linkedin && (
                    <a
                      href={member.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-secondary hover:bg-primary/20 hover:text-primary transition-all duration-300"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.socialLinks?.twitter && (
                    <a
                      href={member.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-secondary hover:bg-primary/20 hover:text-primary transition-all duration-300"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {member.socialLinks?.email && (
                    <a
                      href={`mailto:${member.socialLinks.email}`}
                      className="p-2 rounded-lg bg-secondary hover:bg-primary/20 hover:text-primary transition-all duration-300"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Join Team CTA */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Want to Join the Team?
            </h2>
            <p className="text-muted-foreground mb-6">
              We're always looking for passionate individuals to help grow our community. 
              Apply for leadership positions or volunteer for events!
            </p>
            <a
              href="mailto:codevimarsh@college.edu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-[0_0_30px_hsl(199_89%_48%/0.5)] transition-all duration-300"
            >
              <Mail className="w-5 h-5" />
              Get in Touch
            </a>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
