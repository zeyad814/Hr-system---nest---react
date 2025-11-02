import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ReportFilters {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  jobStatus: string;
  interviewType: string;
  interviewStatus: string;
  applicationStatus: string;
  clientId: string;
  department: string;
  searchTerm: string;
}

interface ReportFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ReportFilters) => void;
  currentFilters: ReportFilters;
  clients?: Array<{ id: string; name: string }>;
  departments?: string[];
}

export const ReportFiltersModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
  clients = [],
  departments = []
}: ReportFiltersModalProps) => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<ReportFilters>(currentFilters);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: ReportFilters = {
      dateRange: { from: undefined, to: undefined },
      jobStatus: 'all',
      interviewType: 'all',
      interviewStatus: 'all',
      applicationStatus: 'all',
      clientId: 'all',
      department: 'all',
      searchTerm: ''
    };
    setFilters(resetFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.dateRange.from ||
      filters.dateRange.to ||
      filters.jobStatus !== 'all' ||
      filters.interviewType !== 'all' ||
      filters.interviewStatus !== 'all' ||
      filters.applicationStatus !== 'all' ||
      filters.clientId !== 'all' ||
      filters.department !== 'all' ||
      filters.searchTerm !== ''
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.jobStatus !== 'all') count++;
    if (filters.interviewType !== 'all') count++;
    if (filters.interviewStatus !== 'all') count++;
    if (filters.applicationStatus !== 'all') count++;
    if (filters.clientId !== 'all') count++;
    if (filters.department !== 'all') count++;
    if (filters.searchTerm !== '') count++;
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('hr.reports.filterReports')}
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('hr.reports.dateRange')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('hr.reports.fromDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? format(filters.dateRange.from, 'PPP') : t('hr.reports.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, from: date } }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('hr.reports.toDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? format(filters.dateRange.to, 'PPP') : t('hr.reports.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, to: date } }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Search Term */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('hr.reports.searchTerm')}</Label>
            <Input
              placeholder={t('hr.reports.searchPlaceholder')}
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
          </div>

          {/* Job Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('hr.reports.jobStatus')}</Label>
            <Select value={filters.jobStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, jobStatus: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('hr.reports.selectJobStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('hr.reports.allJobStatuses')}</SelectItem>
                <SelectItem value="OPEN">{t('hr.reports.openJobs')}</SelectItem>
                <SelectItem value="CLOSED">{t('hr.reports.closedJobs')}</SelectItem>
                <SelectItem value="HIRED">{t('hr.reports.hiredJobs')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interview Type Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('hr.reports.interviewType')}</Label>
            <Select value={filters.interviewType} onValueChange={(value) => setFilters(prev => ({ ...prev, interviewType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('hr.reports.selectInterviewType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('hr.reports.allInterviewTypes')}</SelectItem>
                <SelectItem value="PHONE">{t('hr.reports.phoneInterview')}</SelectItem>
                <SelectItem value="VIDEO">{t('hr.reports.videoInterview')}</SelectItem>
                <SelectItem value="IN_PERSON">{t('hr.reports.inPersonInterview')}</SelectItem>
                <SelectItem value="TECHNICAL">{t('hr.reports.technicalInterview')}</SelectItem>
                <SelectItem value="HR">{t('hr.reports.hrInterview')}</SelectItem>
                <SelectItem value="FINAL">{t('hr.reports.finalInterview')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interview Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('hr.reports.interviewStatus')}</Label>
            <Select value={filters.interviewStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, interviewStatus: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('hr.reports.selectInterviewStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('hr.reports.allInterviewStatuses')}</SelectItem>
                <SelectItem value="SCHEDULED">{t('hr.reports.scheduled')}</SelectItem>
                <SelectItem value="CONFIRMED">{t('hr.reports.confirmed')}</SelectItem>
                <SelectItem value="COMPLETED">{t('hr.reports.completed')}</SelectItem>
                <SelectItem value="CANCELLED">{t('hr.reports.cancelled')}</SelectItem>
                <SelectItem value="NO_SHOW">{t('hr.reports.noShow')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Application Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('hr.reports.applicationStatus')}</Label>
            <Select value={filters.applicationStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, applicationStatus: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('hr.reports.selectApplicationStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('hr.reports.allApplicationStatuses')}</SelectItem>
                <SelectItem value="PENDING">{t('hr.reports.pending')}</SelectItem>
                <SelectItem value="REVIEWED">{t('hr.reports.reviewed')}</SelectItem>
                <SelectItem value="INTERVIEW">{t('hr.reports.interview')}</SelectItem>
                <SelectItem value="OFFER">{t('hr.reports.offer')}</SelectItem>
                <SelectItem value="HIRED">{t('hr.reports.hired')}</SelectItem>
                <SelectItem value="REJECTED">{t('hr.reports.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Filter */}
          {clients.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('hr.reports.client')}</Label>
              <Select value={filters.clientId} onValueChange={(value) => setFilters(prev => ({ ...prev, clientId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('hr.reports.selectClient')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('hr.reports.allClients')}</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Department Filter */}
          {departments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('hr.reports.department')}</Label>
              <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('hr.reports.selectDepartment')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('hr.reports.allDepartments')}</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            {t('hr.reports.resetFilters')}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('hr.reports.cancel')}
            </Button>
            <Button onClick={handleApply}>
              {t('hr.reports.applyFilters')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
