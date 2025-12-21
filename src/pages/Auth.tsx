import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

type AuthView = 'login' | 'signup' | 'forgot-password';

const Auth = () => {
  const [view, setView] = useState<AuthView>('login');

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
        <div className="container max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-2xl p-8 card-shadow"
          >
            {/* Header */}
            {view !== 'forgot-password' && (
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold">
                  {view === 'login' ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {view === 'login'
                    ? 'Sign in to your account to continue'
                    : 'Sign up to start shopping with us'}
                </p>
              </div>
            )}

            {/* Tabs (only for login/signup) */}
            {view !== 'forgot-password' && (
              <div className="flex bg-muted rounded-lg p-1 mb-6">
                <button
                  onClick={() => setView('login')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    view === 'login'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setView('signup')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    view === 'signup'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Forms */}
            <AnimatePresence mode="wait">
              {view === 'login' && (
                <LoginForm
                  key="login"
                  onForgotPassword={() => setView('forgot-password')}
                  onSwitchToSignUp={() => setView('signup')}
                />
              )}
              {view === 'signup' && (
                <SignUpForm
                  key="signup"
                  onSwitchToLogin={() => setView('login')}
                />
              )}
              {view === 'forgot-password' && (
                <ForgotPasswordForm
                  key="forgot"
                  onBackToLogin={() => setView('login')}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
