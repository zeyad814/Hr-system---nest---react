import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export interface CustomReportConfig {
  reportName: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  reportType: 'summary' | 'detailed' | 'analytics';
  includeSections: {
    jobs: boolean;
    applications: boolean;
    interviews: boolean;
    candidates: boolean;
    clients: boolean;
    revenue: boolean;
  };
  format: 'pdf' | 'excel' | 'csv';
  filters: {
    jobStatus: string;
    interviewType: string;
    applicationStatus: string;
    clientId: string;
  };
  description?: string;
}

interface CustomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateReport: (config: CustomReportConfig) => void;
  clients?: Array<{ id: string; name: string }>;
}

export const CustomReportModal = ({
  isOpen,
  onClose,
  onGenerateReport,
  clients = []
}: CustomReportModalProps) => {
  const { t } = useLanguage();
  const [config, setConfig] = useState<CustomReportConfig>({
    reportName: '',
    dateRange: { from: undefined, to: undefined },
    reportType: 'summary',
    includeSections: {
      jobs: true,
      applications: true,
      interviews: true,
      candidates: true,
      clients: false,
      revenue: false,
    },
    format: 'pdf',
    filters: {
      jobStatus: 'all',
      interviewType: 'all',
      applicationStatus: 'all',
      clientId: 'all',
    },
    description: ''
  });

  const handleGenerate = () => {
    if (!config.reportName.trim()) {
      return;
    }
    onGenerateReport(config);
    onClose();
  };

  const handleReset = () => {
    setConfig({
      reportName: '',
      dateRange: { from: undefined, to: undefined },
      reportType: 'summary',
      includeSections: {
        jobs: true,
        applications: true,
        interviews: true,
        candidates: true,
        clients: false,
        revenue: false,
      },
      format: 'pdf',
      filters: {
        jobStatus: 'all',
        interviewType: 'all',
        applicationStatus: 'all',
        clientId: 'all',
      },
      description: ''
    });
  };

  const getSelectedSectionsCount = () => {
    return Object.values(config.includeSections).filter(Boolean).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('hr.reports.customReport')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('hr.reports.reportName')} *</Label>
            <Input
              placeholder={t('hr.reports.enterReportName')}
              value={config.reportName}
              onChange={(e) => setConfig(prev => ({ ...prev, reportName: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('hr.reports.description')}</Label>
            <Textarea
              placeholder={t('hr.reports.enterDescription')}
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Date Range */}
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
                      {config.dateRange.from ? format(config.dateRange.from, 'PPP') : t('hr.reports.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={config.dateRange.from}
                      onSelect={(date) => setConfig(prev => ({ ...prev, dateRange: { ...prev.dateRange, from: date } }))}
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
                      {config.dateRange.to ? format(config.dateRange.to, 'PPP') : t('hr.reports.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={config.dateRange.to}
                      onSelect={(date) => setConfig(prev => ({ ...prev, dateRange: { ...prev.dateRange, to: date } }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('hr.reports.reportType')}</Label>
            <Select value={config.reportType} onValueChange={(value: 'summary' | 'detailed' | 'analytics') => setConfig(prev => ({ ...prev, reportType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('hr.reports.selectReportType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">{t('hr.reports.summaryReport')}</SelectItem>
                <SelectItem value="detailed">{t('hr.reports.detailedReport')}</SelectItem>
                <SelectItem value="analytics">{t('hr.reports.analyticsReport')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Sections */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {t('hr.reports.includeSections')} ({getSelectedSectionsCount()})
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(config.includeSections).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      includeSections: { ...prev.includeSections, [key]: checked }
                    }))}
                  />
                  <Label htmlFor={key} className="text-sm">
                    {t(`hr.reports.${key}`)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('hr.reports.exportFormat')}</Label>
            <Select value={config.format} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setConfig(prev => ({ ...prev, format: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('hr.reports.selectFormat')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">{t('hr.reports.filters')}</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Status Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('hr.reports.jobStatus')}</Label>
                <Select value={config.filters.jobStatus} onValueChange={(value) => setConfig(prev => ({ ...prev, filters: { ...prev.filters, jobStatus: value } }))}>
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
                <Label className="text-xs text-muted-foreground">{t('hr.reports.interviewType')}</Label>
                <Select value={config.filters.interviewType} onValueChange={(value) => setConfig(prev => ({ ...prev, filters: { ...prev.filters, interviewType: value } }))}>
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

              {/* Application Status Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('hr.reports.applicationStatus')}</Label>
                <Select value={config.filters.applicationStatus} onValueChange={(value) => setConfig(prev => ({ ...prev, filters: { ...prev.filters, applicationStatus: value } }))}>
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
                  <Label className="text-xs text-muted-foreground">{t('hr.reports.client')}</Label>
                  <Select value={config.filters.clientId} onValueChange={(value) => setConfig(prev => ({ ...prev, filters: { ...prev.filters, clientId: value } }))}>
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
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            {t('hr.reports.reset')}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('hr.reports.cancel')}
            </Button>
            <Button onClick={handleGenerate} disabled={!config.reportName.trim()}>
              <Download className="h-4 w-4 mr-2" />
              {t('hr.reports.generateReport')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
