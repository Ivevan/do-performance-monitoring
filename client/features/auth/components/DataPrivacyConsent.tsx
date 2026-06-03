import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BrandingPanel } from "@/components/auth/BrandingPanel";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DataPrivacyConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const DataPrivacyConsent: React.FC<DataPrivacyConsentProps> = ({ onAccept, onDecline }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Monitor scroll height on mount to auto-unlock if the content is not scrollable (e.g. large screen size)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      if (el.scrollHeight <= el.clientHeight) {
        setHasReadToBottom(true);
      }
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (hasReadToBottom) return;
    const target = e.currentTarget;
    // Calculate if user reached bottom with a 15px margin buffer
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 15;
    if (isAtBottom) {
      setHasReadToBottom(true);
    }
  };

  return (
    <div className="flex flex-col h-[100svh] overflow-hidden bg-background">
      <header aria-hidden="true" className="h-0 shrink-0" />
      <main className="flex-1 grid lg:grid-cols-2 overflow-hidden">
        {/* Branding column on desktop */}
        <BrandingPanel variant="desktop" />
        <BrandingPanel variant="mobile" />

        {/* Right column: Content container */}
        <section className="relative flex items-start lg:items-center justify-center px-5 py-8 sm:px-8 lg:p-16 overflow-y-auto">
          <ThemeToggle className="absolute top-4 right-4 z-10" />

          <Card className="w-full max-w-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-elegant relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Gradient accent header line */}
            <div className="h-1 w-full bg-gradient-to-r from-dost-blue via-indigo-600 to-pink-500" />
            
            <CardHeader className="pt-6 pb-4">
              <div className="space-y-1.5">
                <CardTitle className="text-xl font-extrabold tracking-tight text-foreground">
                  Data Privacy Consent Notice
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-muted-foreground leading-normal">
                  This system uses your authorized Google account for authentication and access verification. Please review and agree to the terms below to access your workspace.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-sm leading-relaxed text-foreground">
              {/* Scrollable Document Content */}
              <div
                ref={scrollRef}
                tabIndex={0}
                onScroll={handleScroll}
                aria-label="Data Privacy Terms"
                className="space-y-4 max-h-[220px] overflow-y-auto pr-2 border border-border/50 rounded-xl p-4 bg-muted/20 scrollbar-thin focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <div className="space-y-2">
                  <h2 className="text-base font-extrabold text-foreground">
                    Compliance with Republic Act No. 10173 (Data Privacy Act of 2012)
                  </h2>
                  <p>
                    The DOST Davao Oriental Provincial Science and Technology Office (DOST-PSTO-DO) respects and protects your personal information. By signing in to this system, you consent to the collection and processing of your data for authorized system operations.
                  </p>
                </div>

                <Separator className="border-border/60" />

                <div className="space-y-2">
                  <h3 className="font-extrabold text-foreground text-sm">1. Personal Information Collected</h3>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-foreground/90">
                    <li>Full Name</li>
                    <li>Email Address</li>
                    <li>Profile Photo (Avatar)</li>
                    <li>Assigned Access Level</li>
                    <li>System Activity Logs and Audit Records</li>
                  </ul>
                </div>

                <Separator className="border-border/60" />

                <div className="space-y-2">
                  <h3 className="font-extrabold text-foreground text-sm">2. Purpose of Processing</h3>
                  <p>Your information is used to:</p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-foreground/90">
                    <li>Verify identity and authorize access</li>
                    <li>Display user profile information within the system</li>
                    <li>Record system activities and audit trails</li>
                    <li>Monitor and report performance data</li>
                    <li>Maintain system security and administration</li>
                  </ul>
                </div>

                <Separator className="border-border/60" />

                <div className="space-y-2">
                  <h3 className="font-extrabold text-foreground text-sm">3. Data Protection and Security</h3>
                  <p>
                    DOST-PSTO-DO implements reasonable organizational, physical, and technical security measures to protect personal information against unauthorized access, disclosure, alteration, loss, misuse, or destruction.
                  </p>
                  <p>
                    Access to personal information is limited to authorized personnel performing official duties.
                  </p>
                </div>

                <Separator className="border-border/60" />

                <div className="space-y-2">
                  <h3 className="font-extrabold text-foreground text-sm">4. Data Sharing and Disclosure</h3>
                  <p>
                    Personal information collected through this system shall not be sold, disclosed, or shared with unauthorized third parties except when required by law, government regulations, lawful orders, or official audit and compliance requirements.
                  </p>
                </div>

                <Separator className="border-border/60" />

                <div className="space-y-2">
                  <h3 className="font-extrabold text-foreground text-sm">5. Data Retention</h3>
                  <p>
                    Personal information and audit records shall be retained only for as long as necessary to fulfill legitimate operational, legal, and audit requirements.
                  </p>
                </div>

                <Separator className="border-border/60" />

                <div className="space-y-2">
                  <h3 className="font-extrabold text-foreground text-sm">6. Consent</h3>
                  <p>
                    By selecting <strong className="font-bold text-foreground">"I Agree"</strong> and continuing, you confirm that you have read, understood, and consent to the collection and processing of your personal information in accordance with this notice and the Data Privacy Act of 2012.
                  </p>
                  <p className="text-amber-500 dark:text-amber-400 font-bold">
                    If you do not agree to these terms, you will not be able to access the Performance Monitoring Workspace.
                  </p>
                </div>
              </div>

              {/* Interactive Checkbox Statement (Placed directly above the action buttons) */}
              <div 
                className={`flex items-start space-x-3 p-3.5 border rounded-xl select-none transition-all duration-200 ${
                  hasReadToBottom
                    ? "bg-background/50 border-border/85 hover:bg-background/80 cursor-pointer"
                    : "bg-muted/10 border-border/30 opacity-70 cursor-not-allowed"
                }`}
              >
                <Checkbox 
                  id="consent-check" 
                  checked={isChecked} 
                  disabled={!hasReadToBottom}
                  onCheckedChange={(checked) => setIsChecked(checked === true)} 
                  className="mt-0.5 border-border/80 focus-visible:ring-dost-blue/30 data-[state=checked]:bg-dost-blue data-[state=checked]:text-white data-[state=checked]:border-dost-blue"
                />
                <div className="flex-1 space-y-1">
                  <Label 
                    htmlFor="consent-check" 
                    className={`text-xs font-bold text-foreground leading-normal select-none ${
                      hasReadToBottom ? "cursor-pointer" : "cursor-not-allowed"
                    }`}
                  >
                    I have read and agree to the Data Privacy Consent Notice.
                  </Label>
                  {!hasReadToBottom && (
                    <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 animate-pulse">
                      <span>↓</span> Please scroll to the bottom of the notice to unlock this checkbox.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/80 bg-muted/10 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onDecline}
                className="w-full sm:w-auto h-9 text-xs font-bold border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200 order-2 sm:order-1"
              >
                Exit Portal
              </Button>
              
              <Button
                type="button"
                onClick={onAccept}
                disabled={!isChecked}
                className="w-full sm:w-auto h-9 text-xs font-bold bg-dost-blue text-white hover:bg-dost-blue/90 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 order-1 sm:order-2"
              >
                I Agree
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  );
};
