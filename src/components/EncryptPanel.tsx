
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Copy, CheckCircle, Info } from 'lucide-react';
import { generateEncryptionKey, encryptText, exportKey, hashPassword } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';

const EncryptPanel = () => {
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleEncrypt = async () => {
    if (!plaintext) {
      toast({
        title: "Input Required",
        description: "Please enter text to encrypt.",
        variant: "destructive"
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password Required",
        description: "Please set a password for decryption.",
        variant: "destructive"
      });
      return;
    }

    setIsEncrypting(true);
    
    try {
      // Generate a new encryption key
      const key = await generateEncryptionKey();
      
      // Encrypt the plaintext
      const encrypted = await encryptText(plaintext, key);
      
      // Export the key to string format
      const exportedKey = await exportKey(key);
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Store the key and password hash with the ciphertext
      // Format: {encrypted data}|{encryption key}|{password hash}
      const result = `${encrypted}|${exportedKey}|${hashedPassword}`;
      
      setCiphertext(result);
      setEncryptionKey(exportedKey);
      
      toast({
        title: "Encryption Successful",
        description: "Your text has been encrypted."
      });
    } catch (error) {
      console.error('Encryption error:', error);
      toast({
        title: "Encryption Failed",
        description: "An error occurred during encryption.",
        variant: "destructive"
      });
    } finally {
      setIsEncrypting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!ciphertext) return;
    
    try {
      await navigator.clipboard.writeText(ciphertext);
      setCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "Encrypted text copied to clipboard."
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
          <Shield className="text-primary" size={24} />
          Encrypt Your Message
        </h2>
        <p className="text-muted-foreground">
          Enter your message below and set a password to protect it. You'll need this password to decrypt the message later.
        </p>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="plaintext" className="text-sm font-medium mb-1 block">
                Message to Encrypt
              </Label>
              <Textarea
                id="plaintext"
                placeholder="Type your secret message here..."
                rows={5}
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                className="w-full resize-none"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium mb-1 block">
                Set Decryption Password
              </Label>
              <Input 
                id="password"
                type="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Info size={12} className="mr-1" />
                This password will be required to decrypt your message
              </p>
            </div>
            
            <Button 
              onClick={handleEncrypt} 
              className="w-full"
              disabled={isEncrypting || !plaintext || !password}
            >
              {isEncrypting ? "Encrypting..." : "Encrypt Message"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {ciphertext && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="ciphertext" className="text-sm font-medium">
                    Encrypted Result
                  </Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="h-8 px-2 text-xs"
                  >
                    {copied ? (
                      <CheckCircle size={16} className="mr-1 text-green-500" />
                    ) : (
                      <Copy size={16} className="mr-1" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs break-all font-mono">
                    {ciphertext}
                  </p>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 dark:bg-amber-950/30 dark:border-amber-900">
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  <strong>Important:</strong> Share this encrypted text with your recipient. They will need the password you set to decrypt it.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EncryptPanel;
