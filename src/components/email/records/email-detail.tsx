'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Send } from 'lucide-react';
import { EmailStatus } from './email-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFileUrl } from '@/lib/api/storage';
import { reSendEmail } from '@/lib/api/email';
import { EmailRecord } from '@/lib/models/email';

interface EmailDetailProps {
  email: EmailRecord;
  isOpen: boolean;
  onClose: () => void;
}

export interface EmailContent {
  body: string;
  subject: string;
  email: string;
  sender: string;
  attachments?: string[];
}

export function EmailDetail({ email, isOpen, onClose }: EmailDetailProps) {
  const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen && email.contentFile) {
      setLoading(true);
      getFileUrl(email.contentFile)
        .then(res => {
          // Fetch the email content
          return fetch(res.result);
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(text => {
          setEmailContent(JSON.parse(text));
        })
        .catch(error => {
          console.error('Failed to fetch email content:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, email]);

  const handleResend = async () => {
    if (!email.contentFile) return;

    setResending(true);
    setResendSuccess(null);

    try {
      const result = await reSendEmail(email._id);
      setResendSuccess(result.success);
    } catch (error) {
      console.error('Failed to resend email:', error);
      setResendSuccess(false);
    } finally {
      setResending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Email Details</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="content"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList>
            <TabsTrigger value="content">Email Content</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            {emailContent?.attachments &&
              emailContent.attachments.length > 0 && (
                <TabsTrigger value="attachments">
                  Attachments ({emailContent.attachments.length})
                </TabsTrigger>
              )}
          </TabsList>

          <TabsContent
            value="content"
            className="flex-1 overflow-auto space-y-4"
          >
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !email.contentFile ? (
              <div className="flex h-96 items-center justify-center text-foreground-muted">
                Email content is not available
              </div>
            ) : emailContent ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">
                          {emailContent.subject}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          From:{' '}
                          <span className="font-medium">
                            {emailContent.sender}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          To:{' '}
                          <span className="font-medium">
                            {emailContent.email}
                          </span>
                        </div>
                      </div>
                      <EmailStatus emailId={email._id} />
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-sm font-medium">
                      Email Body
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="border rounded-md h-[400px]">
                      <iframe
                        srcDoc={emailContent.body}
                        title="Email Content"
                        className="w-full h-full"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex h-96 items-center justify-center text-foreground-muted">
                Failed to load email content
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-foreground-muted">
                  Template ID
                </h3>
                <p>{email.template as string}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground-muted">
                  Message ID
                </h3>
                <p>{email.messageId ?? 'N/A'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground-muted">
                  Sender
                </h3>
                <p>{email.sender}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground-muted">
                  Receiver
                </h3>
                <p>{email.receiver}</p>
              </div>

              {email.cc && email.cc.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-muted">
                    CC
                  </h3>
                  <p>{email.cc.join(', ')}</p>
                </div>
              )}

              {email.replyTo && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-muted">
                    Reply To
                  </h3>
                  <p>{email.replyTo}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-foreground-muted">
                  Created At
                </h3>
                <p>{format(new Date(email.createdAt), 'PPP p')}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground-muted">
                  Updated At
                </h3>
                <p>{format(new Date(email.updatedAt), 'PPP p')}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground-muted">
                  Status
                </h3>
                <EmailStatus emailId={email._id} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <div>
            {resendSuccess !== null && (
              <span
                className={
                  resendSuccess
                    ? 'text-status-healthy'
                    : 'text-status-critical'
                }
              >
                {resendSuccess
                  ? 'Email resent successfully'
                  : 'Failed to resend email'}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {email.contentFile && (
              <Button onClick={handleResend} disabled={resending}>
                {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Resend Email
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
