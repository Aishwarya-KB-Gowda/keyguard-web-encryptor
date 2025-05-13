
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, KeyRound } from "lucide-react";
import EncryptPanel from './EncryptPanel';
import DecryptPanel from './DecryptPanel';

const CryptoApp = () => {
  const [activeTab, setActiveTab] = useState('encrypt');

  return (
    <div className="container py-8 max-w-3xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">KeyGuard</h1>
        <p className="text-xl text-muted-foreground">
          Secure Web Encryption Tool
        </p>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="text-center">Protect Your Sensitive Data</CardTitle>
          <CardDescription className="text-center">
            Encrypt messages with secure AES-256-GCM encryption and password protection
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs
            defaultValue="encrypt"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="encrypt" className="flex items-center gap-1">
                <Lock size={16} />
                <span>Encrypt</span>
              </TabsTrigger>
              <TabsTrigger value="decrypt" className="flex items-center gap-1">
                <KeyRound size={16} />
                <span>Decrypt</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="encrypt">
              <EncryptPanel />
            </TabsContent>
            
            <TabsContent value="decrypt">
              <DecryptPanel />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <footer className="mt-10 text-center text-sm text-muted-foreground">
        <p>
          KeyGuard uses AES-256-GCM encryption with client-side password protection.
          <br />
          Your data never leaves your browser - all encryption happens locally.
        </p>
      </footer>
    </div>
  );
};

export default CryptoApp;
