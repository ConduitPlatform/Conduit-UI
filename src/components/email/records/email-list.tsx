'use client';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Eye } from 'lucide-react';
import { EmailStatus } from './email-status';
import { EmailRecord } from '@/lib/models/email';

interface EmailListProps {
  emails: EmailRecord[];
  loading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSortChange: (sort: string) => void;
  currentSort: string;
  onViewEmail: (email: EmailRecord) => void;
}

export function EmailList({
  emails,
  loading,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onSortChange,
  currentSort,
  onViewEmail,
}: Readonly<EmailListProps>) {
  const totalPages = Math.ceil(totalCount / pageSize);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    // Adjust if end page exceeds total pages
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const getSortIcon = (field: string) => {
    const isCurrentSort = currentSort === field || currentSort === `-${field}`;
    const isAscending = currentSort === field;

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          onSortChange(currentSort === field ? `-${field}` : field)
        }
        className={isCurrentSort ? 'opacity-100' : 'opacity-50'}
      >
        <ArrowUpDown
          className={`h-4 w-4 ${isCurrentSort && isAscending ? 'rotate-180' : ''}`}
        />
      </Button>
    );
  };

  return (
    <div className="bg-background border-2 border-input rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Email Records</h3>
          <div className="text-sm text-foreground-muted">
            Showing {emails.length} of {totalCount} records
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Actions</TableHead>
              <TableHead>
                Template ID
                {getSortIcon('templateId')}
              </TableHead>
              <TableHead>
                Sender
                {getSortIcon('sender')}
              </TableHead>
              <TableHead>
                Receiver
                {getSortIcon('receiver')}
              </TableHead>
              <TableHead>
                Date Sent
                {getSortIcon('createdAt')}
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : emails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No emails found
                </TableCell>
              </TableRow>
            ) : (
              emails.map(email => (
                <TableRow key={email._id}>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewEmail(email)}
                        disabled={!email.contentFile}
                        title={
                          email.contentFile
                            ? 'View Email'
                            : 'Content not available'
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{email.template as string}</TableCell>
                  <TableCell>{email.sender}</TableCell>
                  <TableCell>{email.receiver}</TableCell>
                  <TableCell>
                    {format(new Date(email.createdAt), 'PPP p')}
                  </TableCell>
                  <TableCell>
                    <EmailStatus emailId={email.messageId!} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t flex items-center justify-between">
        <div className="text-sm text-foreground-muted">
          Page {currentPage} of {totalPages || 1}
        </div>
        <div className="flex space-x-1">
          {/* First page button */}
          {currentPage > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              className="px-3"
            >
              1
            </Button>
          )}

          {/* Ellipsis if needed */}
          {currentPage > 3 && (
            <Button variant="outline" size="sm" disabled className="px-3">
              ...
            </Button>
          )}

          {/* Page numbers */}
          {getPageNumbers().map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="px-3"
            >
              {page}
            </Button>
          ))}

          {/* Ellipsis if needed */}
          {currentPage < totalPages - 2 && (
            <Button variant="outline" size="sm" disabled className="px-3">
              ...
            </Button>
          )}

          {/* Last page button */}
          {currentPage < totalPages && totalPages > 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="px-3"
            >
              {totalPages}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
