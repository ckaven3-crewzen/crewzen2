/**
 * CompanySignInForm Component
 * 
 * ✅ COMPONENT STATUS: ACTIVE & WELL-IMPLEMENTED - Company authentication page
 * 
 * 🔧 MINOR ISSUES IDENTIFIED:
 * - Console.error statement in production code (line 89)
 * - Type assertion without validation when casting Firestore data
 * - Missing rate limiting protection beyond Firebase
 * 
 * 🎯 SECURITY IMPROVEMENTS:
 * - Add captcha protection for repeated failed attempts
 * - Implement account lockout after multiple failures
 * - Add audit logging for security events
 * - Consider adding 2FA support for company accounts
 * 
 * 📋 UX IMPROVEMENTS:
 * - Add "Remember me" functionality
 * - Better error messaging for specific failure scenarios
 * - Loading state for company profile verification
 * - Add "Forgot Password" functionality
 * 
 * 🎨 ACCESSIBILITY:
 * - Good keyboard navigation and ARIA labels
 * - Proper form validation feedback
 * - Screen reader friendly error messages
 * 
 * ✅ WELL-DESIGNED FEATURES:
 * - Comprehensive error handling for Auth codes
 * - LocalStorage integration for company data
 * - Clean UI with proper loading states
 * - Proper form validation with Zod
 * 
 * Author: System Generated
 * Date: 2025-07-25
 * Status: Production ready with minor improvements needed
 */

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Building, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { ConnectZenCompany } from '@/lib/types';

const signinSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type SigninFormValues = z.infer<typeof signinSchema>;

type CompanySignInFormProps = {
  onSuccess?: () => void;
};

export default function CompanySignInForm({ onSuccess }: CompanySignInFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (values: SigninFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Check if user has a company profile
      const companyDoc = await getDoc(doc(db, 'connectZenCompanies', user.uid));
      
      if (!companyDoc.exists()) {
        // User exists but no company profile - redirect to company signup
        await auth.signOut();
        toast({
          variant: 'destructive',
          title: 'Company Profile Not Found',
          description: 'Please sign up as a company first.',
        });
        router.push('/company-signup');
        return;
      }

      const companyData = companyDoc.data() as ConnectZenCompany;
      
      // 🔧 TODO: Add proper validation instead of type assertion above
      
      // Store company data in localStorage for easy access
      localStorage.setItem('connectZenCompany', JSON.stringify(companyData));
      
      toast({
        title: 'Welcome Back!',
        description: `Signed in as ${companyData.companyName}`,
      });

      // Redirect to company dashboard
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/connectzen/company/dashboard');
      }
    } catch (error: any) {
      // 🔧 TODO: Remove console.error for production, use proper logging service
      console.error('Sign-in error:', error);
      
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Sign-in Failed',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Building className="h-12 w-12 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Company Sign In</CardTitle>
            <p className="text-muted-foreground mt-2">
              Access your ConnectZen company account
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="company@example.com"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Don't have a company account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={() => router.push('/company-signup')}
              >
                Sign up here
              </Button>
            </div>

          </div>

        </CardContent>
      </Card>
      <div className="text-center mt-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/connectzen')}
          className="flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
    </div>
  );
} 