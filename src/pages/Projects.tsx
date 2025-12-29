import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Search, Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, Project } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getAssetUrl } from '@/lib/apiUrl';

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const params: { page?: number; limit?: number; search?: string; technology?: string } = {
          page: 1,
          limit: 100, // Get more projects for filtering
        };

        if (searchQuery) {
          params.search = searchQuery;
        }

        if (selectedTags.length > 0) {
          params.technology = selectedTags.join(',');
        }

        const result = await getProjects(params);
        
        if (result.success && result.data) {
          setProjects(result.data.projects || []);
          
          // Extract all unique technologies/tags
          const tags = [...new Set((result.data.projects || []).flatMap((p) => p.technologies || []))];
          setAllTags(tags);
        } else {
          setProjects([]);
          setAllTags([]);
          toast({
            title: 'Error',
            description: result.error || 'Failed to load projects',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
        setAllTags([]);
        toast({
          title: 'Error',
          description: 'Failed to load projects. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedTags]);

  const filteredProjects = (projects || []).filter((project) => {
    if (!project) return false;
    
    const matchesSearch =
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.author?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 || 
      selectedTags.some((tag) => project.technologies?.includes(tag));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
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
              Member <span className="text-gradient">Projects</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Explore amazing projects built by our community members.
            </p>

            {isAuthenticated && (
              <Link to="/add-project">
                <Button variant="hero" size="lg">
                  Submit Your Project
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" /> Filter:
              </span>
              {allTags.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => {
                if (!project || !project._id) return null;
                return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass rounded-xl overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-secondary">
                  {project.image ? (
                    <img
                      src={project.image.startsWith('http') ? project.image : getAssetUrl(project.image)}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <Github className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  
                  {/* Quick Links */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg glass hover:bg-primary/20 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.liveLink && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg glass hover:bg-primary/20 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {project.title || 'Untitled Project'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {project.description || 'No description available'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-md bg-secondary text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>by {project.author?.username || project.author?.name || 'Unknown'}</span>
                    <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
                );
              })}
            </div>
          )}

          {!isLoading && filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No projects found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
