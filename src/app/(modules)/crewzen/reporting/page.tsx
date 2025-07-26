// This file has been moved to the CrewZen module folder.

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { format, addDays, addMonths, startOfDay, startOfMonth, endOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { generatePdfReport } from '@/components/ui/PdfReportGenerator';

import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar as CalendarIcon, FileDown, Mail, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Employee, Project, DailyAttendanceRecord } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function ReportingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  // Reporting State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isReportDataLoading, setIsReportDataLoading] = useState(true);
  const [reportType, setReportType] = useState<'employee' | 'project'>('employee');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reportGrouping, setReportGrouping] = useState<'day' | 'fortnight' | 'month'>('day');
  const [groupingStartDate, setGroupingStartDate] = useState<Date | undefined>();
  const [reportMonth, setReportMonth] = useState<Date | undefined>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    data: (string | number)[][];
    title: string;
  } | null>(null);

  useEffect(() => {
    if (user && user.role === 'employee') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user.role !== 'employee') {
      const fetchDropdownData = async () => {
        setIsReportDataLoading(true);
        try {
          const [employeeSnapshot, projectSnapshot] = await Promise.all([
            getDocs(collection(db, 'employees')),
            getDocs(collection(db, 'projects')),
          ]);
          const employeesData = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
          employeesData.sort((a, b) => a.firstName.localeCompare(b.firstName));
          setEmployees(employeesData);

          const projectsData = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
          projectsData.sort((a, b) => a.name.localeCompare(b.name));
          setProjects(projectsData);
        } catch (error) {
          console.error('Error fetching data for reports:', error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load data for report generation.' });
        } finally {
          setIsReportDataLoading(false);
        }
      };
      fetchDropdownData();
    }
  }, [user, toast]);

  useEffect(() => {
    if (reportGrouping === 'day') {
      if (reportMonth) {
        setDateRange({ from: startOfMonth(reportMonth), to: endOfMonth(reportMonth) });
      } else {
        setDateRange(undefined);
      }
    } else if (reportGrouping === 'fortnight') {
      if (groupingStartDate) {
        setDateRange({ from: groupingStartDate, to: addDays(groupingStartDate, 13) });
      } else {
        setDateRange(undefined);
      }
    } else if (reportGrouping === 'month') {
      if (groupingStartDate) {
        const start = startOfDay(groupingStartDate);
        setDateRange({ from: start, to: endOfMonth(start) });
      } else {
        setDateRange(undefined);
      }
    }
  }, [reportGrouping, reportMonth, groupingStartDate]);

  const getPeriodKey = (recordDate: Date, grouping: 'fortnight' | 'month', anchorDate: Date): string => {
    const cleanAnchorDate = startOfDay(anchorDate);
    if (grouping === 'month') {
        return format(startOfMonth(recordDate), 'yyyy-MM-dd');
    }

    if (grouping === 'fortnight') {
        const dayDiff = Math.floor((recordDate.getTime() - cleanAnchorDate.getTime()) / (1000 * 60 * 60 * 24));
        const periodIndex = Math.floor(dayDiff / 14);
        const periodStartDate = addDays(cleanAnchorDate, periodIndex * 14);
        return format(periodStartDate, 'yyyy-MM-dd');
    }
    return '';
  };

  const generateReportData = async () => {
      if (!dateRange?.from || !dateRange?.to) throw new Error("Date range not set");
      
      const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
      const allRecords: { date: string, records: DailyAttendanceRecord[] }[] = [];
      attendanceSnapshot.forEach(doc => {
        allRecords.push({ date: doc.id, records: doc.data().records as DailyAttendanceRecord[] });
      });

      const startDate = startOfDay(dateRange.from);
      const endDate = startOfDay(dateRange.to);
      const filteredByDate = allRecords.filter(rec => {
        const recDate = startOfDay(new Date(`${rec.date}T00:00:00`));
        if (isNaN(recDate.getTime())) return false;
        return recDate >= startDate && recDate <= endDate;
      });
      
      const employeeMap = new Map(employees.map(e => [e.id, e]));
      const projectMap = new Map(projects.map(p => [p.id, p]));

      let reportData: (string | number)[][] = [];
      let headers: string[] = [];
      let total = 0;
      let title = '';
      let filenameSuffix = '';

      if (reportType === 'employee') {
        const employee = employeeMap.get(selectedEmployeeId!);
        if (!employee) throw new Error('Employee not found');
        title = `Report for ${employee.firstName} ${employee.lastName}`;
        filenameSuffix = `Employee_${employee.firstName}_${employee.lastName}`;

        if (reportGrouping === 'day') {
          headers = ["Date", "Project", "Attendance", "Daily Earnings (R)"];
          filteredByDate.sort((a,b) => a.date.localeCompare(b.date)).forEach(({ date, records }) => {
            const empRecord = records.find(r => r.employeeId === selectedEmployeeId);
            if (empRecord && (!empRecord.isAbsent || (employee.hasHelper && !empRecord.isHelperAbsent))) {
              const projectName = empRecord.projectId ? projectMap.get(empRecord.projectId)?.name || 'N/A' : 'N/A';
              let attendance = '';
              let dailyEarnings = 0;
              if (!empRecord.isAbsent) {
                attendance = 'Present';
                dailyEarnings += employee.rate;
              }
              if (employee.hasHelper && !empRecord.isHelperAbsent) {
                attendance += (attendance ? ' & Helper' : 'Helper');
                dailyEarnings += employee.helper?.rate || 0;
              }
              total += dailyEarnings;
              reportData.push([format(new Date(`${date}T12:00:00`), 'PPP'), projectName, attendance, dailyEarnings.toFixed(2)]);
            }
          });
          reportData.push(['', '', 'Total:', total.toFixed(2)]);
        } else { // Fortnightly or Monthly
            headers = ["Period Start", "Period End", "Total Earnings (R)"];
            const periodData = new Map<string, number>();
            if (!groupingStartDate) throw new Error('Start date for period grouping is not set.');

            filteredByDate.forEach(({ date, records }) => {
                const empRecord = records.find(r => r.employeeId === selectedEmployeeId);
                 if (empRecord) {
                    let dailyEarnings = 0;
                    if (!empRecord.isAbsent) dailyEarnings += employee.rate;
                    if (employee.hasHelper && !empRecord.isHelperAbsent) dailyEarnings += employee.helper?.rate || 0;
                    if (dailyEarnings > 0) {
                        const periodKey = getPeriodKey(new Date(`${date}T12:00:00`), reportGrouping, groupingStartDate);
                        periodData.set(periodKey, (periodData.get(periodKey) || 0) + dailyEarnings);
                        total += dailyEarnings;
                    }
                 }
            });
            const sortedPeriods = Array.from(periodData.keys()).sort();
            sortedPeriods.forEach(periodStartStr => {
                const periodStart = new Date(`${periodStartStr}T12:00:00`);
                const periodEnd = addDays(periodStart, reportGrouping === 'fortnight' ? 13 : endOfMonth(periodStart).getDate() - 1);
                reportData.push([format(periodStart, 'PPP'), format(periodEnd, 'PPP'), periodData.get(periodStartStr)!.toFixed(2)]);
            });
            reportData.push(['', 'Total:', total.toFixed(2)]);
        }
      } else { // Project Report
        const project = projectMap.get(selectedProjectId!);
        if (!project) throw new Error('Project not found');
        title = `Cost Report for ${project.name}`;
        filenameSuffix = `Project_${project.name.replace(/\s+/g, '_')}`;

        const calculateDailyCost = (rec: DailyAttendanceRecord): number => {
            const employee = employeeMap.get(rec.employeeId);
            if (!employee) return 0;
            let dailyCost = 0;
            if (!rec.isAbsent) dailyCost += employee.rate;
            if (employee.hasHelper && !rec.isHelperAbsent) dailyCost += employee.helper?.rate || 0;
            return dailyCost;
        };

        if (reportGrouping === 'day') {
            headers = ["Date", "Employee", "Attendance", "Daily Cost (R)"];
            filteredByDate.sort((a,b) => a.date.localeCompare(b.date)).forEach(({ date, records }) => {
              records.filter(r => r.projectId === selectedProjectId).forEach(rec => {
                  const employee = employeeMap.get(rec.employeeId);
                  if (employee) {
                      let attendance = '';
                      const dailyCost = calculateDailyCost(rec);
                      if (dailyCost > 0) {
                          if (!rec.isAbsent) attendance = 'Present';
                          if (employee.hasHelper && !rec.isHelperAbsent) attendance += (attendance ? ' & Helper' : 'Helper');
                          total += dailyCost;
                          reportData.push([format(new Date(`${date}T12:00:00`), 'PPP'), `${employee.firstName} ${employee.lastName}`, attendance, dailyCost.toFixed(2)]);
                      }
                  }
              });
            });
            reportData.push(['', '', 'Total:', total.toFixed(2)]);
        } else { // Fortnightly or Monthly
            headers = ["Period Start", "Period End", "Total Cost (R)"];
            const periodData = new Map<string, number>();
            if (!groupingStartDate) throw new Error('Start date for period grouping is not set.');

            filteredByDate.forEach(({ date, records }) => {
                records.filter(r => r.projectId === selectedProjectId).forEach(rec => {
                    const dailyCost = calculateDailyCost(rec);
                    if (dailyCost > 0) {
                        const periodKey = getPeriodKey(new Date(`${date}T12:00:00`), reportGrouping, groupingStartDate);
                        periodData.set(periodKey, (periodData.get(periodKey) || 0) + dailyCost);
                        total += dailyCost;
                    }
                });
            });
             const sortedPeriods = Array.from(periodData.keys()).sort();
            sortedPeriods.forEach(periodStartStr => {
                const periodStart = new Date(`${periodStartStr}T12:00:00`);
                const periodEnd = addDays(periodStart, reportGrouping === 'fortnight' ? 13 : endOfMonth(periodStart).getDate() - 1);
                reportData.push([format(periodStart, 'PPP'), format(periodEnd, 'PPP'), periodData.get(periodStartStr)!.toFixed(2)]);
            });
            reportData.push(['', 'Total:', total.toFixed(2)]);
        }
      }

      return { reportData, headers, title, filenameSuffix };
  };

  const handlePreviewReport = async () => {
    setIsGenerating(true);
    try {
      const data = await generateReportData();
      if (!data) throw new Error("Could not generate report data.");
      const { reportData, headers, title } = data;
      setPreviewData({ headers, data: reportData, title });
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate report preview.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCsv = async () => {
    setIsGenerating(true);
    try {
      const data = await generateReportData();
      if (!data) return;

      const { reportData, headers, filenameSuffix } = data;
      const filename = `${filenameSuffix}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      const processRow = (row: (string | number)[]) => {
          const finalVal = row
            .map(val => {
              const str = val === null || val === undefined ? '' : String(val);
              return str.includes(',') ? `"${str}"` : str;
            })
            .join(',');
          return finalVal + '\n';
        };

      const csvFile = [headers, ...reportData].map(processRow).join('');
      const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Success', description: 'Report has been downloaded.' });
    } catch(e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate CSV report.' });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleGeneratePdf = async (email: boolean = false) => {
    setIsGenerating(true);
    try {
      const data = await generateReportData();
      if (!data) throw new Error("Could not generate report data.");
      await generatePdfReport({ ...data, email });
      toast({ title: 'Success', description: email ? 'Your email client has been opened.' : 'Report has been downloaded.' });
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF report (autoTable/plugin issue?).' });
    } finally {
      setIsGenerating(false);
    }
  }

  const isReportButtonDisabled = isGenerating || !dateRange?.from || !dateRange?.to || 
    (reportType === 'employee' && !selectedEmployeeId) || 
    (reportType === 'project' && !selectedProjectId) ||
    (reportGrouping === 'day' && !reportMonth) ||
    ((reportGrouping === 'fortnight' || reportGrouping === 'month') && !groupingStartDate);

  if (!user || user.role === 'employee') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8" suppressHydrationWarning>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Reporting</h1>
        </div>
        <div className="grid gap-8">
           <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>Generate and export reports for employees and projects over a specified time frame.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isReportDataLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <div className="flex justify-end gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Report Type</Label>
                      <RadioGroup value={reportType} onValueChange={(value: 'employee' | 'project') => setReportType(value)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="employee" id="r1" />
                          <Label htmlFor="r1">Employee</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="project" id="r2" />
                          <Label htmlFor="r2">Project</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>{reportType === 'employee' ? 'Select Employee' : 'Select Project'}</Label>
                      {reportType === 'employee' ? (
                        <Select value={selectedEmployeeId ?? ''} onValueChange={setSelectedEmployeeId}>
                          <SelectTrigger><SelectValue placeholder="Select an employee..." /></SelectTrigger>
                          <SelectContent>
                            {employees.map(emp => (
                              <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.companyNumber})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select value={selectedProjectId ?? ''} onValueChange={setSelectedProjectId}>
                          <SelectTrigger><SelectValue placeholder="Select a project..." /></SelectTrigger>
                          <SelectContent>
                            {projects.map(proj => (
                              <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                      <Label>Pay Period</Label>
                      <Select value={reportGrouping} onValueChange={(value) => setReportGrouping(value as any)}>
                          <SelectTrigger><SelectValue placeholder="Select pay period..." /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="day">Daily</SelectItem>
                              <SelectItem value="fortnight">Fortnightly (14 days)</SelectItem>
                              <SelectItem value="month">Monthly</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {reportGrouping === 'day' ? 'Report Month' : 'Pay Period Start Date'}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              ((reportGrouping === 'day' && !reportMonth) || (reportGrouping !== 'day' && !groupingStartDate)) && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {reportGrouping === 'day'
                              ? (reportMonth ? format(reportMonth, 'MMMM yyyy') : <span>Pick a month</span>)
                              : (groupingStartDate ? format(groupingStartDate, 'PPP') : <span>Pick a date</span>)
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={reportGrouping === 'day' ? reportMonth : groupingStartDate}
                            onSelect={reportGrouping === 'day' ? setReportMonth : setGroupingStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {reportGrouping === 'day' && <p className="text-sm text-muted-foreground">A daily report will be generated for the selected month.</p>}
                      {reportGrouping === 'month' && <p className="text-sm text-muted-foreground">The report will cover the full calendar month of the selected start date.</p>}
                      {reportGrouping === 'fortnight' && <p className="text-sm text-muted-foreground">The report will cover 14-day periods starting from the selected date.</p>}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <Button variant="outline" onClick={handlePreviewReport} disabled={isReportButtonDisabled}>
                      {isGenerating ? <Loader2 className="animate-spin" /> : <Eye />}
                      Preview Report
                    </Button>
                    <Button variant="outline" onClick={handleDownloadCsv} disabled={isReportButtonDisabled}>
                      {isGenerating ? <Loader2 className="animate-spin" /> : <FileDown />}
                      Generate CSV
                    </Button>
                    <Button onClick={() => handleGeneratePdf(false)} disabled={isReportButtonDisabled}>
                      {isGenerating ? <Loader2 className="animate-spin" /> : <FileDown />}
                      Generate PDF
                    </Button>
                    <Button onClick={() => handleGeneratePdf(true)} disabled={isReportButtonDisabled}>
                      {isGenerating ? <Loader2 className="animate-spin" /> : <Mail />}
                      Email PDF
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              {previewData?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            {previewData && (
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewData.headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>
                          {typeof cell === 'number' ? cell.toFixed(2) : cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
