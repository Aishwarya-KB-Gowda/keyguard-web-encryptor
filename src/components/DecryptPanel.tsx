
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { KeyRound, AlertTriangle, Info, Eye, EyeOff } from 'lucide-react';
import { importKey, decryptText, hashPassword } from '@/lib/crypto';
import { useToast } from '@/hooks/use-toast';

const DecryptPanel = () => {
  const [ciphertext, setCiphertext] = useState('');
  const [password, setPassword] = useState('');
  const [plaintext, setPlaintext] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleDecrypt = async () => {
    if (!ciphertext) {
      toast({
        title: "Input Required",
        description: "Please enter encrypted text to decrypt.",
        variant: "destructive"
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter the decryption password.",
        variant: "destructive"
      });
      return;
    }

    setIsDecrypting(true);
    setError(null);
    setPlaintext('');
    
    try {
      // Parse the ciphertext format: {encrypted data}|{encryption key}|{password hash}
      const parts = ciphertext.split('|');
      if (parts.length !== 3) {
        throw new Error("Invalid encrypted format");
      }
      
      const [encryptedData, keyData, storedPasswordHash] = parts;
      
      // Hash the entered password
      const enteredPasswordHash = await hashPassword(password);
      
      // Verify password hash
      if (enteredPasswordHash !== storedPasswordHash) {
        throw new Error("Incorrect password");
      }
      
      // Import the encryption key
      const key = await importKey(keyData);
      
      // Decrypt the data
      const decrypted = await decryptText(encryptedData, key);
      
      setPlaintext(decrypted);
      toast({
        title: "Decryption Successful",
        description: "Message successfully decrypted."
      });
    } catch (error) {
      console.error('Decryption error:', error);
      let errorMessage = "Failed to decrypt. ";
      
      if ((error as Error).message === "Incorrect password") {
        errorMessage += "The password is incorrect.";
      } else if ((error as Error).message === "Invalid encrypted format") {
        errorMessage += "Invalid encrypted text format.";
      } else {
        errorMessage += "The data may be corrupted or invalid.";
      }
      
      setError(errorMessage);
      toast({
        title: "Decryption Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
          <KeyRound className="text-secondary" size={24} />
          Decrypt Message
        </h2>
        <p className="text-muted-foreground">
          Paste the encrypted text and enter the password to reveal the original message.
        </p>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="ciphertext" className="text-sm font-medium mb-1 block">
                Encrypted Text
              </Label>
              <Textarea
                id="ciphertext"
                placeholder="Paste the encrypted text here..."
                rows={4}
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                className="w-full resize-none font-mono text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="decryptPassword" className="text-sm font-medium mb-1 block">
                Decryption Password
              </Label>
              <div className="relative">
                <Input 
                  id="decryptPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter the password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-start">
                <AlertTriangle size={18} className="text-destructive mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <Button 
              onClick={handleDecrypt} 
              className="w-full"
              disabled={isDecrypting || !ciphertext || !password}
            >
              {isDecrypting ? "Decrypting..." : "Decrypt Message"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {plaintext && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="plaintext" className="text-sm font-medium mb-1 block">
                  Decrypted Message
                </Label>
                <div className="bg-muted p-4 rounded-md">
                  <p className="whitespace-pre-wrap">{plaintext}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start dark:bg-blue-950/30 dark:border-blue-900">
                <Info size={18} className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Your message has been decrypted successfully. For security, consider clearing this page when you're done.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DecryptPanel;
