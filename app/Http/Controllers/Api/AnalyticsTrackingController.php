<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitorLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsTrackingController extends Controller
{
    public function logPageView(Request $request): JsonResponse
    {
        // Don't track admin users or dashboard internal calls
        if ($request->user() && $request->user()->isAdmin()) {
            return response()->json(['status' => 'ignored_admin']);
        }

        $path = '/' . ltrim((string) $request->input('page_path', '/'), '/');
        if (str_starts_with($path, '/dashboard') || str_starts_with($path, '/api')) {
            return response()->json(['status' => 'ignored_internal']);
        }

        $visitorId = substr(trim((string) $request->input('visitor_id')), 0, 64);
        $sessionId = substr(trim((string) $request->input('session_id')), 0, 64);

        if (!$visitorId || !$sessionId) {
            return response()->json(['status' => 'missing_tokens'], 422);
        }

        $ua = $request->userAgent();
        $agentInfo = self::parseUserAgent($ua);

        $referer = (string) $request->input('referer', '');
        if ($referer && strlen($referer) > 255) {
            $referer = substr($referer, 0, 255);
        }

        $pageTitle = substr(trim((string) $request->input('page_title', '')), 0, 255);

        $log = VisitorLog::create([
            'visitor_id' => $visitorId,
            'session_id' => $sessionId,
            'page_path' => substr($path, 0, 255),
            'page_title' => $pageTitle ?: null,
            'device_type' => $agentInfo['device_type'],
            'browser' => $agentInfo['browser'],
            'platform' => $agentInfo['platform'],
            'referer' => $referer ?: null,
            'duration_seconds' => 0,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'status' => 'success',
            'log_id' => $log->id,
        ]);
    }

    public function heartbeat(Request $request): JsonResponse
    {
        $logId = (int) $request->input('log_id');
        $duration = min(3600, max(0, (int) $request->input('duration_seconds', 0)));

        if ($logId > 0 && $duration > 0) {
            $log = VisitorLog::find($logId);
            if ($log && $duration > $log->duration_seconds) {
                $log->update(['duration_seconds' => $duration]);
            }
        }

        return response()->json(['status' => 'ok']);
    }

    public static function parseUserAgent(?string $ua): array
    {
        $ua = $ua ?: '';
        $device = 'desktop';
        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i', $ua)) {
            $device = 'tablet';
        } elseif (preg_match('/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i', $ua)) {
            $device = 'mobile';
        }

        $platform = 'Unknown';
        if (preg_match('/windows nt/i', $ua)) $platform = 'Windows';
        elseif (preg_match('/android/i', $ua)) $platform = 'Android';
        elseif (preg_match('/iphone|ipad|ipod/i', $ua)) $platform = 'iOS';
        elseif (preg_match('/macintosh|mac os x/i', $ua)) $platform = 'macOS';
        elseif (preg_match('/linux/i', $ua)) $platform = 'Linux';

        $browser = 'Unknown';
        if (preg_match('/edg/i', $ua)) $browser = 'Edge';
        elseif (preg_match('/chrome|crios/i', $ua)) $browser = 'Chrome';
        elseif (preg_match('/firefox|fxios/i', $ua)) $browser = 'Firefox';
        elseif (preg_match('/safari/i', $ua)) $browser = 'Safari';
        elseif (preg_match('/opera|opr/i', $ua)) $browser = 'Opera';

        return [
            'device_type' => $device,
            'platform' => $platform,
            'browser' => $browser,
        ];
    }
}
