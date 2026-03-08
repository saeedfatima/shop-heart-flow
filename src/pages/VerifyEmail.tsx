import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await api.get<any>(`/auth/verify-email?token=${encodeURIComponent(token)}`);

        if (data?.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');

          // If tokens were returned, store them and refresh user
          if (data.tokens) {
            localStorage.setItem('accessToken', data.tokens.access_token);
            if (data.tokens.refresh_token) {
              localStorage.setItem('refreshToken', data.tokens.refresh_token);
            }
            await refreshUser();
          }
        } else {
          setStatus('error');
          setMessage(error || 'Verification failed.');
        }
      } catch {
        setStatus('error');
        setMessage('Could not connect to the server. Please try again later.');
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail) {
      toast({ title: 'Enter your email', description: 'Please enter your email address.', variant: 'destructive' });
      return;
    }
    setIsResending(true);
    try {
      const { data } = await api.post<any>('/auth/resend-verification', { email: resendEmail });
      toast({
        title: 'Check your inbox',
        description: data?.message || 'If your email is registered, a verification link has been sent.',
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to resend. Please try again.', variant: 'destructive' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
        <div className="container max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-2xl p-8 card-shadow text-center"
          >
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                <h1 className="text-2xl font-semibold mb-2">Verifying your email...</h1>
                <p className="text-muted-foreground">Please wait while we verify your email address.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h1 className="text-2xl font-semibold mb-2">Email Verified!</h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => navigate('/shop')}>
                    Start Shopping
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <h1 className="text-2xl font-semibold mb-2">Verification Failed</h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                    />
                    <Button onClick={handleResend} disabled={isResending}>
                      {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend'}
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth">Back to Sign In</Link>
                  </Button>
                </div>
              </>
            )}

            {status === 'no-token' && (
              <>
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-2xl font-semibold mb-2">Check Your Email</h1>
                <p className="text-muted-foreground mb-6">
                  We sent a verification link to your email. Click the link to verify your account.
                </p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email to resend"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                    />
                    <Button onClick={handleResend} disabled={isResending}>
                      {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend'}
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth">Back to Sign In</Link>
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;
