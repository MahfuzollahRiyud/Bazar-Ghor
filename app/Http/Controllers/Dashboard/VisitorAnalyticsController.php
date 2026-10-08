<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\VisitorLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VisitorAnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->input('period', 'last_7_days');
        $now = now();
        $startDate = null;
        $endDate = null;

        switch ($period) {
            case 'today':
                $startDate = $now->copy()->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;
            case 'yesterday':
                $startDate = $now->copy()->subDay()->startOfDay();
                $endDate = $now->copy()->subDay()->endOfDay();
                break;
            case 'last_7_days':
                $startDate = $now->copy()->subDays(6)->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;
            case 'this_month':
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                break;
            case 'last_month':
                $startDate = $now->copy()->subMonth()->startOfMonth();
                $endDate = $now->copy()->subMonth()->endOfMonth();
                break;
            case 'this_year':
                $startDate = $now->copy()->startOfYear();
                $endDate = $now->copy()->endOfYear();
                break;
            case 'custom':
                if ($request->filled('start_date')) {
                    $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
                }
                if ($request->filled('end_date')) {
                    $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
                }
                break;
            case 'all_time':
            default:
                if ($period === 'all_time') {
                    $startDate = null;
                    $endDate = null;
                } else {
                    $startDate = $now->copy()->subDays(6)->startOfDay();
                    $endDate = $now->copy()->endOfDay();
                    $period = 'last_7_days';
                }
                break;
        }

        $baseQuery = VisitorLog::query();
        if ($startDate) {
            $baseQuery->where('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $baseQuery->where('created_at', '<=', $endDate);
        }

        // Summary Statistics
        $totalPageViews = (clone $baseQuery)->count();
        $uniqueVisitors = (clone $baseQuery)->distinct('visitor_id')->count('visitor_id');
        $totalSessions = (clone $baseQuery)->distinct('session_id')->count('session_id');
        $avgDuration = (clone $baseQuery)->where('duration_seconds', '>', 0)->avg('duration_seconds') ?: 0;

        // Active right now (in last 5 minutes)
        $activeNow = VisitorLog::where('created_at', '>=', $now->copy()->subMinutes(5))
            ->distinct('visitor_id')
            ->count('visitor_id');

        // Traffic trend
        $trafficTrend = [];
        $driver = DB::connection()->getDriverName();
        $hourExpr = $driver === 'sqlite' ? "CAST(strftime('%H', created_at) AS INTEGER)" : 'HOUR(created_at)';
        $dateExpr = $driver === 'sqlite' ? "strftime('%Y-%m-%d', created_at)" : 'DATE(created_at)';

        if ($period === 'today' || $period === 'yesterday') {
            // Hourly breakdown
            $hourlyData = (clone $baseQuery)
                ->select([
                    DB::raw("{$hourExpr} as hour_num"),
                    DB::raw('COUNT(*) as total_views'),
                    DB::raw('COUNT(DISTINCT visitor_id) as total_visitors'),
                ])
                ->groupBy(DB::raw($hourExpr))
                ->orderBy('hour_num')
                ->get()
                ->keyBy('hour_num');

            for ($h = 0; $h < 24; $h++) {
                $item = $hourlyData->get($h);
                $formattedHour = date('g A', strtotime("$h:00"));
                $trafficTrend[] = [
                    'label' => $formattedHour,
                    'views' => $item ? (int) $item->total_views : 0,
                    'visitors' => $item ? (int) $item->total_visitors : 0,
                ];
            }
        } else {
            // Daily breakdown
            $dailyData = (clone $baseQuery)
                ->select([
                    DB::raw("{$dateExpr} as date_val"),
                    DB::raw('COUNT(*) as total_views'),
                    DB::raw('COUNT(DISTINCT visitor_id) as total_visitors'),
                ])
                ->groupBy(DB::raw($dateExpr))
                ->orderBy('date_val')
                ->get()
                ->keyBy('date_val');

            $loopStart = $startDate ? $startDate->copy() : $now->copy()->subDays(29)->startOfDay();
            $loopEnd = $endDate ? $endDate->copy() : $now->copy()->endOfDay();

            while ($loopStart <= $loopEnd) {
                $dateKey = $loopStart->format('Y-m-d');
                $item = $dailyData->get($dateKey);
                $trafficTrend[] = [
                    'label' => $loopStart->format('d M'),
                    'views' => $item ? (int) $item->total_views : 0,
                    'visitors' => $item ? (int) $item->total_visitors : 0,
                ];
                $loopStart = $loopStart->copy()->addDay();
            }
        }

        // Top Visited Pages
        $topPages = (clone $baseQuery)
            ->select([
                'page_path',
                DB::raw('MAX(page_title) as page_title'),
                DB::raw('COUNT(*) as views_count'),
                DB::raw('COUNT(DISTINCT visitor_id) as unique_visitors'),
                DB::raw('ROUND(AVG(duration_seconds)) as avg_duration'),
            ])
            ->groupBy('page_path')
            ->orderByDesc('views_count')
            ->limit(12)
            ->get();

        // Devices
        $deviceData = (clone $baseQuery)
            ->select('device_type', DB::raw('COUNT(*) as count'))
            ->groupBy('device_type')
            ->get();

        $devices = [
            'mobile' => (int) ($deviceData->firstWhere('device_type', 'mobile')?->count ?? 0),
            'desktop' => (int) ($deviceData->firstWhere('device_type', 'desktop')?->count ?? 0),
            'tablet' => (int) ($deviceData->firstWhere('device_type', 'tablet')?->count ?? 0),
        ];

        // Top Browsers
        $topBrowsers = (clone $baseQuery)
            ->select('browser', DB::raw('COUNT(*) as count'))
            ->whereNotNull('browser')
            ->where('browser', '!=', 'Unknown')
            ->groupBy('browser')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Recent 15 visitor events
        $recentVisitors = (clone $baseQuery)
            ->latest()
            ->limit(15)
            ->get(['id', 'page_path', 'page_title', 'device_type', 'browser', 'platform', 'duration_seconds', 'created_at'])
            ->map(fn($v) => [
                'id' => $v->id,
                'page_path' => $v->page_path,
                'page_title' => $v->page_title ?: $v->page_path,
                'device_type' => $v->device_type,
                'browser' => $v->browser ?: 'Browser',
                'platform' => $v->platform ?: 'OS',
                'duration_seconds' => $v->duration_seconds,
                'time_ago' => $v->created_at->diffForHumans(),
            ]);

        return Inertia::render('dashboard/analytics/index', [
            'metrics' => [
                'total_views' => $totalPageViews,
                'unique_visitors' => $uniqueVisitors,
                'total_sessions' => $totalSessions,
                'avg_duration_seconds' => round($avgDuration),
                'active_now' => $activeNow,
            ],
            'trafficTrend' => $trafficTrend,
            'topPages' => $topPages,
            'devices' => $devices,
            'topBrowsers' => $topBrowsers,
            'recentVisitors' => $recentVisitors,
            'currentPeriod' => $period,
            'dateRange' => [
                'start' => $startDate ? $startDate->format('Y-m-d') : null,
                'end' => $endDate ? $endDate->format('Y-m-d') : null,
            ],
        ]);
    }
}
