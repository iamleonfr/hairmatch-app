import React, { useState } from 'react';
import supabaseApi from '../api/supabaseAdapter';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Input } from '../Components/ui/input';
import { Button } from '../Components/ui/button';
import { Label } from '../Components/ui/label';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  // no redirect needed; magic link flow will sign the user in via email link

  const handleSend = async () => {
    setStatus('sending');
    try {
      await supabaseApi.auth.signInWithEmail(email);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mt-4">
            <Button onClick={handleSend} className="w-full">Send Sign-in Link</Button>
          </div>
          {status === 'sent' && <p className="mt-4 text-green-600">Check your email for the sign-in link.</p>}
          {status === 'error' && <p className="mt-4 text-red-600">Failed to send sign-in link.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
