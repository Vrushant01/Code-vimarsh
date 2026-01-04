import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Github, Linkedin, Save, Plus, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/api';
import { getAssetUrl } from '@/lib/apiUrl';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.username || '');
      setBio(user.bio || '');
      setSkills(user.skills || []);
      setGithub(user.github || '');
      setLinkedin(user.linkedin || '');
      if (user.profilePhoto) {
        setAvatarPreview(user.profilePhoto.startsWith('http') ? user.profilePhoto : getAssetUrl(user.profilePhoto));
      }
    }
  }, [user]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append('name', name);
      if (bio) {
        formData.append('bio', bio);
      }
      // Skills must be sent as JSON string
      formData.append('skills', JSON.stringify(skills));
      // Social links must be sent as JSON string
      const socialLinks: { github?: string; linkedin?: string } = {};
      if (github) socialLinks.github = github;
      if (linkedin) socialLinks.linkedin = linkedin;
      formData.append('socialLinks', JSON.stringify(socialLinks));
      
      // Add avatar file if selected
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const result = await updateUserProfile(formData);

      if (result.success && result.user) {
        // Refresh user data from context
        await refreshUser();
        toast({
          title: 'Profile Updated!',
          description: 'Your changes have been saved.',
        });
        setAvatarFile(null); // Clear file after successful upload
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gradient">Your Profile</h1>

            <div className="glass rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-foreground" />
                    </div>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user?.username || user?.email}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Bio</label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Skills</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1">
                        {skill}
                        <button onClick={() => removeSkill(skill)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addSkill()} />
                    <Button variant="outline" size="icon" onClick={addSkill}><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">GitHub URL</label>
                  <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/username" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">LinkedIn URL</label>
                  <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" />
                </div>
              </div>

              <Button variant="hero" onClick={handleSave} className="gap-2" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
