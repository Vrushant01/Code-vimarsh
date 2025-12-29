import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Clock, Plus, ThumbsUp, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getTopics, createTopic, Topic as APITopic } from '@/lib/api';

export default function Forum() {
  const [topics, setTopics] = useState<APITopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        const result = await getTopics({
          page: 1,
          limit: 50,
          sort: '-createdAt',
        });

        if (result.success && result.data) {
          setTopics(result.data.topics);
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to load topics',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load topics. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = newTags.split(',').map((t) => t.trim()).filter(Boolean);
      
      const result = await createTopic({
        title: newTitle,
        content: newContent,
        category: 'general', // Default category
        tags: tagsArray,
      });

      if (result.success && result.topic) {
        // Add new topic to the list
        setTopics([result.topic, ...topics]);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
        setShowNewTopic(false);

        toast({
          title: 'Topic Created!',
          description: 'Your topic has been posted successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create topic',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create topic. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Community <span className="text-gradient">Forum</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Ask questions, share knowledge, and connect with fellow developers.
            </p>

            {isAuthenticated && (
              <Button
                variant="hero"
                size="lg"
                onClick={() => setShowNewTopic(true)}
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Start a Discussion
              </Button>
            )}

            {!isAuthenticated && (
              <p className="text-muted-foreground text-sm">
                <a href="/login" className="text-primary hover:underline">Login</a> to create new topics
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* New Topic Form */}
      {showNewTopic && isAuthenticated && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-border"
        >
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Topic</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Topic title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="glow" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Post Topic'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewTopic(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </motion.section>
      )}

      {/* Topics List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {topics.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No topics found. Be the first to start a discussion!</p>
                </div>
              ) : (
                topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5 }}
                className="glass rounded-xl p-6 cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex flex-col items-center gap-1 text-center min-w-[60px]">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">0</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{topic.repliesCount || topic.replies?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {topic.content}
                    </p>

                    {/* Tags */}
                    {topic.tags && topic.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {topic.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-secondary text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {topic.author.username || topic.author.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(topic.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Mobile stats */}
                  <div className="flex sm:hidden gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      0
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {topic.repliesCount || topic.replies?.length || 0}
                    </span>
                  </div>
                </div>
              </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
