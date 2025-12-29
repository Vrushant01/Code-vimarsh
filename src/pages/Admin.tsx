import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2, Plus, Search, Loader2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAssetUrl } from '@/lib/apiUrl';
import { useToast } from '@/hooks/use-toast';
import { 
  getAllUsers, 
  createUserAsAdmin, 
  deleteProject, 
  deleteTopic, 
  deleteEvent, 
  createEvent,
  getProjects, 
  getTopics, 
  getEvents,
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  User as APIUser,
  Project,
  Topic,
  Event,
  TeamMember
} from '@/lib/api';

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('members');

  // Members state
  const [members, setMembers] = useState<APIUser[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({ username: '', email: '', password: '', role: 'user' });

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Topics state
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    type: 'workshop',
    registrationLink: '',
    maxParticipants: '',
  });
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  
  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    bio: '',
    github: '',
    linkedin: '',
    twitter: '',
    email: '',
    order: '0',
  });
  const [teamPhotoFile, setTeamPhotoFile] = useState<File | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'admin') {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You must be an admin to access this page.',
        variant: 'destructive',
      });
      return;
    }
  }, [isAuthenticated, user, navigate, toast]);

  // Fetch members
  useEffect(() => {
    if (activeTab === 'members' && user?.role === 'admin') {
      fetchMembers();
    }
  }, [activeTab, memberSearch]);

  // Fetch projects
  useEffect(() => {
    if (activeTab === 'projects' && user?.role === 'admin') {
      fetchProjects();
    }
  }, [activeTab]);

  // Fetch topics
  useEffect(() => {
    if (activeTab === 'topics' && user?.role === 'admin') {
      fetchTopics();
    }
  }, [activeTab]);

  // Fetch events
  useEffect(() => {
    if (activeTab === 'events' && user?.role === 'admin') {
      fetchEvents();
    }
  }, [activeTab]);

  // Fetch team members
  useEffect(() => {
    if (activeTab === 'team' && user?.role === 'admin') {
      fetchTeamMembers();
    }
  }, [activeTab]);

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const result = await getAllUsers({ search: memberSearch || undefined, limit: 100 });
      if (result.success && result.data) {
        setMembers(result.data.users);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load members',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load members',
        variant: 'destructive',
      });
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const result = await getProjects({ limit: 100 });
      if (result.success && result.data) {
        setProjects(result.data.projects);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load projects',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchTopics = async () => {
    setTopicsLoading(true);
    try {
      const result = await getTopics({ limit: 100 });
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
        description: 'Failed to load topics',
        variant: 'destructive',
      });
    } finally {
      setTopicsLoading(false);
    }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const result = await getEvents({ limit: 100 });
      if (result.success && result.data) {
        setEvents(result.data.events);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load events',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setEventsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.username || !newMember.email || !newMember.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createUserAsAdmin(newMember);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Member added successfully',
        });
        setIsAddMemberOpen(false);
        setNewMember({ username: '', email: '', password: '', role: 'user' });
        fetchMembers();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add member',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const result = await deleteProject(projectId);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Project deleted successfully',
        });
        fetchProjects();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete project',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      const result = await deleteTopic(topicId);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Topic deleted successfully',
        });
        fetchTopics();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete topic',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete topic',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const result = await deleteEvent(eventId);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Event deleted successfully',
        });
        fetchEvents();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete event',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.location) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('date', newEvent.date);
      if (newEvent.endDate) {
        formData.append('endDate', newEvent.endDate);
      }
      formData.append('location', newEvent.location);
      formData.append('type', newEvent.type);
      if (newEvent.registrationLink) {
        formData.append('registrationLink', newEvent.registrationLink);
      }
      if (newEvent.maxParticipants) {
        formData.append('maxParticipants', newEvent.maxParticipants);
      }
      if (eventImageFile) {
        formData.append('image', eventImageFile);
      }

      const result = await createEvent(formData);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Event created successfully',
        });
        setIsAddEventOpen(false);
        setNewEvent({
          title: '',
          description: '',
          date: '',
          endDate: '',
          location: '',
          type: 'workshop',
          registrationLink: '',
          maxParticipants: '',
        });
        setEventImageFile(null);
        fetchEvents();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create event',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    }
  };

  const fetchTeamMembers = async () => {
    setTeamLoading(true);
    try {
      const result = await getAllTeamMembers();
      if (result.success && result.members) {
        setTeamMembers(result.members);
      } else {
        setTeamMembers([]);
        toast({
          title: 'Error',
          description: result.error || 'Failed to load team members',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    } finally {
      setTeamLoading(false);
    }
  };

  const handleAddTeamMember = async () => {
    if (!newTeamMember.name || !newTeamMember.role) {
      toast({
        title: 'Validation Error',
        description: 'Name and role are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newTeamMember.name);
      formData.append('role', newTeamMember.role);
      formData.append('bio', newTeamMember.bio);
      formData.append('order', newTeamMember.order);
      formData.append('socialLinks', JSON.stringify({
        github: newTeamMember.github,
        linkedin: newTeamMember.linkedin,
        twitter: newTeamMember.twitter,
        email: newTeamMember.email,
      }));
      if (teamPhotoFile) {
        formData.append('photo', teamPhotoFile);
      }

      const result = await createTeamMember(formData);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Team member added successfully',
        });
        setIsAddTeamOpen(false);
        setNewTeamMember({
          name: '',
          role: '',
          bio: '',
          github: '',
          linkedin: '',
          twitter: '',
          email: '',
          order: '0',
        });
        setTeamPhotoFile(null);
        fetchTeamMembers();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add team member',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add team member',
        variant: 'destructive',
      });
    }
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member);
    setNewTeamMember({
      name: member.name,
      role: member.role,
      bio: member.bio || '',
      github: member.socialLinks?.github || '',
      linkedin: member.socialLinks?.linkedin || '',
      twitter: member.socialLinks?.twitter || '',
      email: member.socialLinks?.email || '',
      order: member.order?.toString() || '0',
    });
    setIsEditTeamOpen(true);
  };

  const handleUpdateTeamMember = async () => {
    if (!editingTeamMember || !newTeamMember.name || !newTeamMember.role) {
      toast({
        title: 'Validation Error',
        description: 'Name and role are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newTeamMember.name);
      formData.append('role', newTeamMember.role);
      formData.append('bio', newTeamMember.bio);
      formData.append('order', newTeamMember.order);
      formData.append('socialLinks', JSON.stringify({
        github: newTeamMember.github,
        linkedin: newTeamMember.linkedin,
        twitter: newTeamMember.twitter,
        email: newTeamMember.email,
      }));
      if (teamPhotoFile) {
        formData.append('photo', teamPhotoFile);
      }

      const result = await updateTeamMember(editingTeamMember._id, formData);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Team member updated successfully',
        });
        setIsEditTeamOpen(false);
        setEditingTeamMember(null);
        setNewTeamMember({
          name: '',
          role: '',
          bio: '',
          github: '',
          linkedin: '',
          twitter: '',
          email: '',
          order: '0',
        });
        setTeamPhotoFile(null);
        fetchTeamMembers();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update team member',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update team member',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTeamMember = async (memberId: string) => {
    try {
      const result = await deleteTeamMember(memberId);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Team member deleted successfully',
        });
        fetchTeamMembers();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete team member',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete team member',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Admin Panel</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage members, projects, discussions, events, and team
            </p>
          </motion.div>
        </div>
      </section>

      {/* Admin Tabs */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manage Members</CardTitle>
                      <CardDescription>Add and manage community members</CardDescription>
                    </div>
                    <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Member</DialogTitle>
                          <DialogDescription>
                            Create a new member account
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={newMember.username}
                              onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
                              placeholder="Enter username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newMember.email}
                              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                              placeholder="Enter email"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={newMember.password}
                              onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                              placeholder="Enter password"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddMember}>Add Member</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search members..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {membersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{member.username || member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                            <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                              {member.role || 'user'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {members.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No members found
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Projects</CardTitle>
                  <CardDescription>Delete projects from the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {projectsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {projects.map((project) => {
                        if (!project || !project._id) return null;
                        return (
                        <div
                          key={project._id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{project.title || 'Untitled Project'}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {project.description || 'No description'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              by {project.author?.username || project.author?.name || 'Unknown'}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{project.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProject(project._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        );
                      })}
                      {projects.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No projects found
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Topics Tab */}
            <TabsContent value="topics" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Topics</CardTitle>
                  <CardDescription>Delete discussion topics from the forum</CardDescription>
                </CardHeader>
                <CardContent>
                  {topicsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topics.map((topic) => (
                        <div
                          key={topic._id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{topic.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {topic.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              by {topic.author.username || topic.author.name}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{topic.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTopic(topic._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                      {topics.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No topics found
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manage Events</CardTitle>
                      <CardDescription>Create and delete events from the platform</CardDescription>
                    </div>
                    <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Event
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Event</DialogTitle>
                          <DialogDescription>
                            Add a new event to the platform
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="event-title">Title *</Label>
                            <Input
                              id="event-title"
                              value={newEvent.title}
                              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                              placeholder="Enter event title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-description">Description *</Label>
                            <textarea
                              id="event-description"
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={newEvent.description}
                              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                              placeholder="Enter event description"
                              rows={4}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="event-date">Date *</Label>
                              <Input
                                id="event-date"
                                type="datetime-local"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="event-end-date">End Date</Label>
                              <Input
                                id="event-end-date"
                                type="datetime-local"
                                value={newEvent.endDate}
                                onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-location">Location *</Label>
                            <Input
                              id="event-location"
                              value={newEvent.location}
                              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                              placeholder="Enter location (e.g., Online, Room 101)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-type">Type *</Label>
                            <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="workshop">Workshop</SelectItem>
                                <SelectItem value="hackathon">Hackathon</SelectItem>
                                <SelectItem value="meetup">Meetup</SelectItem>
                                <SelectItem value="competition">Competition</SelectItem>
                                <SelectItem value="webinar">Webinar</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-registration-link">Registration Link</Label>
                            <Input
                              id="event-registration-link"
                              type="url"
                              value={newEvent.registrationLink}
                              onChange={(e) => setNewEvent({ ...newEvent, registrationLink: e.target.value })}
                              placeholder="https://example.com/register"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-max-participants">Max Participants</Label>
                            <Input
                              id="event-max-participants"
                              type="number"
                              value={newEvent.maxParticipants}
                              onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: e.target.value })}
                              placeholder="Leave empty for unlimited"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="event-image">Event Image</Label>
                            <Input
                              id="event-image"
                              type="file"
                              accept="image/*"
                              onChange={(e) => setEventImageFile(e.target.files?.[0] || null)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddEvent}>Create Event</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {eventsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {events.map((event) => (
                        <div
                          key={event._id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {event.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(event.date).toLocaleDateString()} • {event.location}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{event.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEvent(event._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                      {events.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No events found
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manage Team</CardTitle>
                      <CardDescription>Add, edit, and delete team members</CardDescription>
                    </div>
                    <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Team Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add Team Member</DialogTitle>
                          <DialogDescription>
                            Add a new team member to display on the team page
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="team-name">Name *</Label>
                            <Input
                              id="team-name"
                              value={newTeamMember.name}
                              onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                              placeholder="Enter name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="team-role">Role *</Label>
                            <Input
                              id="team-role"
                              value={newTeamMember.role}
                              onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                              placeholder="e.g., President, Vice President"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="team-bio">Bio</Label>
                            <textarea
                              id="team-bio"
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={newTeamMember.bio}
                              onChange={(e) => setNewTeamMember({ ...newTeamMember, bio: e.target.value })}
                              placeholder="Enter bio"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="team-github">GitHub URL</Label>
                              <Input
                                id="team-github"
                                type="url"
                                value={newTeamMember.github}
                                onChange={(e) => setNewTeamMember({ ...newTeamMember, github: e.target.value })}
                                placeholder="https://github.com/username"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="team-linkedin">LinkedIn URL</Label>
                              <Input
                                id="team-linkedin"
                                type="url"
                                value={newTeamMember.linkedin}
                                onChange={(e) => setNewTeamMember({ ...newTeamMember, linkedin: e.target.value })}
                                placeholder="https://linkedin.com/in/username"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="team-twitter">Twitter URL</Label>
                              <Input
                                id="team-twitter"
                                type="url"
                                value={newTeamMember.twitter}
                                onChange={(e) => setNewTeamMember({ ...newTeamMember, twitter: e.target.value })}
                                placeholder="https://twitter.com/username"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="team-email">Email</Label>
                              <Input
                                id="team-email"
                                type="email"
                                value={newTeamMember.email}
                                onChange={(e) => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                                placeholder="email@example.com"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="team-order">Display Order</Label>
                            <Input
                              id="team-order"
                              type="number"
                              value={newTeamMember.order}
                              onChange={(e) => setNewTeamMember({ ...newTeamMember, order: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="team-photo">Photo</Label>
                            <Input
                              id="team-photo"
                              type="file"
                              accept="image/*"
                              onChange={(e) => setTeamPhotoFile(e.target.files?.[0] || null)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddTeamOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddTeamMember}>Add Member</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {teamLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {member.photo ? (
                              <img
                                src={member.photo.startsWith('http') ? member.photo : getAssetUrl(member.photo)}
                                alt={member.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTeamMember(member)}
                            >
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{member.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTeamMember(member._id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                      {teamMembers.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No team members found
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Team Member Dialog */}
              <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Team Member</DialogTitle>
                    <DialogDescription>
                      Update team member information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-team-name">Name *</Label>
                      <Input
                        id="edit-team-name"
                        value={newTeamMember.name}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-team-role">Role *</Label>
                      <Input
                        id="edit-team-role"
                        value={newTeamMember.role}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                        placeholder="e.g., President, Vice President"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-team-bio">Bio</Label>
                      <textarea
                        id="edit-team-bio"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={newTeamMember.bio}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, bio: e.target.value })}
                        placeholder="Enter bio"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-team-github">GitHub URL</Label>
                        <Input
                          id="edit-team-github"
                          type="url"
                          value={newTeamMember.github}
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, github: e.target.value })}
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-team-linkedin">LinkedIn URL</Label>
                        <Input
                          id="edit-team-linkedin"
                          type="url"
                          value={newTeamMember.linkedin}
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-team-twitter">Twitter URL</Label>
                        <Input
                          id="edit-team-twitter"
                          type="url"
                          value={newTeamMember.twitter}
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, twitter: e.target.value })}
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-team-email">Email</Label>
                        <Input
                          id="edit-team-email"
                          type="email"
                          value={newTeamMember.email}
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-team-order">Display Order</Label>
                      <Input
                        id="edit-team-order"
                        type="number"
                        value={newTeamMember.order}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, order: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-team-photo">Photo (leave empty to keep current)</Label>
                      <Input
                        id="edit-team-photo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setTeamPhotoFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsEditTeamOpen(false);
                      setEditingTeamMember(null);
                      setTeamPhotoFile(null);
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateTeamMember}>Update Member</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}

