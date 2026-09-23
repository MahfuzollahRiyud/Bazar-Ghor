<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="light">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Always enforce clean light mode across storefront and admin panel --}}
        <script>
            (function() {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            })();
        </script>

        <style>
            html {
                background-color: #ffffff;
            }
        </style>

        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>

        @php
            $isStorefront = !request()->is('dashboard*') && !request()->is('admin*');
            $snippets = $isStorefront ? \App\Models\CodeSnippet::getActiveGrouped() : null;
        @endphp

        {{-- Custom Storefront Header Code Snippets (e.g. Facebook Pixel, GTM, Meta Tags) --}}
        @if($isStorefront && !empty($snippets['header']))
            @foreach($snippets['header'] as $snippet)
                {!! is_string($snippet) ? $snippet : (is_array($snippet) ? ($snippet['code'] ?? '') : ($snippet->code ?? '')) !!}
            @endforeach
        @endif
    </head>
    <body class="font-sans antialiased">
        {{-- Custom Storefront Body Code Snippets (e.g. GTM / FB noscript, tracking widgets) --}}
        @if($isStorefront && !empty($snippets['body']))
            @foreach($snippets['body'] as $snippet)
                {!! is_string($snippet) ? $snippet : (is_array($snippet) ? ($snippet['code'] ?? '') : ($snippet->code ?? '')) !!}
            @endforeach
        @endif

        <x-inertia::app />

        {{-- Custom Storefront Footer Code Snippets (e.g. Chat widgets, analytics scripts) --}}
        @if($isStorefront && !empty($snippets['footer']))
            @foreach($snippets['footer'] as $snippet)
                {!! is_string($snippet) ? $snippet : (is_array($snippet) ? ($snippet['code'] ?? '') : ($snippet->code ?? '')) !!}
            @endforeach
        @endif
    </body>
</html>
