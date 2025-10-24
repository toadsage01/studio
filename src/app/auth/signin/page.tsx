"use client";
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard-layout';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });
    if (res?.error) {
      setError('Invalid username or password.');
      setLoading(false);
      return;
    }
    // Success: NextAuth may return a url, else go home
    if (res?.url) {
      router.push(res.url);
    } else {
      router.push('/');
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Sign in" description="Use your username and password to continue" />
      <div className="p-4 lg:p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user-1 or Admin User" />
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="demo or set DEMO_PASSWORD" />
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Username: user id or full name (e.g., "user-1" or "Admin User"). Password: DEMO_PASSWORD from your .env (default "demo").
            </p>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
