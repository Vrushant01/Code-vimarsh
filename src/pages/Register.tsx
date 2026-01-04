import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (username.trim().length < 2) {
      toast({ 
        title: 'Validation Error', 
        description: 'Username must be at least 2 characters long', 
        variant: 'destructive' 
      });
      return;
    }

    if (password.length < 6) {
      toast({ 
        title: 'Validation Error', 
        description: 'Password must be at least 6 characters long', 
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(true);
    const result = await register(username, email, password);
    setIsLoading(false);
    if (result.success) {
      toast({ title: 'Account created!', description: 'Welcome to Code Vimarsh!' });
      navigate('/');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md mx-4">
        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg">
                <img src="/logo.svg" alt="Code Vimarsh Logo" className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-gradient">Code Vimarsh</span>
            </Link>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-muted-foreground">Join our coding community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" required />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
            </div>
            <Button type="submit" variant="hero" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
