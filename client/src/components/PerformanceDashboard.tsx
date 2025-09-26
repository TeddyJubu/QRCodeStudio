import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePerformanceMonitoring, PerformanceReport } from '@/lib/performance';
import { Activity, BarChart3, Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  threshold: { good: number; poor: number };
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, threshold, icon }) => {
  const getStatus = () => {
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const status = getStatus();
  const statusColors = {
    good: 'bg-green-100 text-green-800',
    'needs-improvement': 'bg-yellow-100 text-yellow-800',
    poor: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toFixed(2)} {unit}
        </div>
        <Badge className={`mt-2 ${statusColors[status]}`}>
          {status === 'good' && <CheckCircle className="w-3 h-3 mr-1" />}
          {status === 'needs-improvement' && <AlertTriangle className="w-3 h-3 mr-1" />}
          {status === 'poor' && <AlertTriangle className="w-3 h-3 mr-1" />}
          {status.replace('-', ' ')}
        </Badge>
      </CardContent>
    </Card>
  );
};

export const PerformanceDashboard: React.FC = () => {
  const { getLatestReport, getPerformanceScore, getAllReports, clearReports } =
    usePerformanceMonitoring();
  const [latestReport, setLatestReport] = useState<PerformanceReport | null>(null);
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      setLatestReport(getLatestReport());
      setPerformanceScore(getPerformanceScore());
    };

    // Update metrics immediately
    updateMetrics();

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [getLatestReport, getPerformanceScore]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  if (!latestReport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Dashboard
          </CardTitle>
          <CardDescription>Waiting for performance metrics to be collected...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Dashboard
          </CardTitle>
          <CardDescription>Real-time performance metrics and Web Vitals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-3xl font-bold">
                <span className={getScoreColor(performanceScore)}>{performanceScore}</span>
                <span className="text-lg text-gray-500">/100</span>
              </div>
              <div className="text-sm text-gray-600">
                Overall Performance Score - {getScoreLabel(performanceScore)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
                <BarChart3 className="w-4 h-4 mr-2" />
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
              <Button variant="outline" onClick={clearReports}>
                Clear Reports
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Largest Contentful Paint"
              value={latestReport.metrics.lcp}
              unit="ms"
              threshold={{ good: 2500, poor: 4000 }}
              icon={<Clock className="w-4 h-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Interaction to Next Paint"
              value={latestReport.metrics.inp}
              unit="ms"
              threshold={{ good: 100, poor: 300 }}
              icon={<Zap className="w-4 h-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Cumulative Layout Shift"
              value={latestReport.metrics.cls}
              unit=""
              threshold={{ good: 0.1, poor: 0.25 }}
              icon={<BarChart3 className="w-4 h-4 text-muted-foreground" />}
            />
            <MetricCard
              title="First Contentful Paint"
              value={latestReport.metrics.fcp}
              unit="ms"
              threshold={{ good: 1800, poor: 3000 }}
              icon={<Clock className="w-4 h-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Time to First Byte"
              value={latestReport.metrics.ttfb}
              unit="ms"
              threshold={{ good: 600, poor: 1300 }}
              icon={<Zap className="w-4 h-4 text-muted-foreground" />}
            />
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Details</CardTitle>
            <CardDescription>
              Detailed information about the latest performance report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Page Information</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>URL:</strong> {latestReport.url}
                  </div>
                  <div>
                    <strong>Timestamp:</strong> {new Date(latestReport.timestamp).toLocaleString()}
                  </div>
                  <div>
                    <strong>User Agent:</strong> {latestReport.userAgent.substring(0, 100)}...
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Device Information</h4>
                <div className="space-y-1 text-sm">
                  {latestReport.connectionType && (
                    <div>
                      <strong>Connection Type:</strong> {latestReport.connectionType}
                    </div>
                  )}
                  {latestReport.deviceMemory && (
                    <div>
                      <strong>Device Memory:</strong> {latestReport.deviceMemory} GB
                    </div>
                  )}
                  {latestReport.hardwareConcurrency && (
                    <div>
                      <strong>CPU Cores:</strong> {latestReport.hardwareConcurrency}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
