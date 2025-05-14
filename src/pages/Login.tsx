
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For demonstration purposes - in a real app, you'd validate against a backend
    setTimeout(() => {
      if (username === 'admin' && password === 'password') {
        // Set a simple token in localStorage
        localStorage.setItem('auth', JSON.stringify({ 
          isAuthenticated: true, 
          username: 'admin',
          name: 'Franziska Oberländer'
        }));
        navigate('/admin');
        toast({
          title: "Erfolgreich angemeldet",
          description: "Willkommen im Management Dashboard.",
        });
      } else {
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: "Bitte überprüfen Sie Ihren Benutzernamen und Ihr Passwort.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <img 
            src="/messe-muenchen-logo.png" 
            alt="Messe München Logo" 
            className="h-16 mb-8" 
          />
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Management Login</CardTitle>
              <CardDescription>
                Geben Sie Ihre Anmeldedaten ein, um auf das Management Dashboard zuzugreifen.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Benutzername</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Zurück
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <p className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} MMG-Messegelände München Riem
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
