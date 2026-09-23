<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CodeSnippet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CodeSnippetController extends Controller
{
    /**
     * Display a listing of code snippets.
     */
    public function index(Request $request): Response
    {
        $snippets = CodeSnippet::query()
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        $counts = [
            'all' => $snippets->count(),
            'active' => $snippets->where('is_active', true)->count(),
            'header' => $snippets->where('location', 'header')->count(),
            'body' => $snippets->where('location', 'body')->count(),
            'footer' => $snippets->where('location', 'footer')->count(),
        ];

        return Inertia::render('dashboard/snippets/index', [
            'snippets' => $snippets,
            'counts' => $counts,
        ]);
    }

    /**
     * Store a newly created code snippet in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'location' => ['required', 'in:header,body,footer'],
            'code' => ['required', 'string'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        CodeSnippet::create([
            'title' => $validated['title'],
            'location' => $validated['location'],
            'code' => $validated['code'],
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->back()->with('success', 'Code snippet created successfully.');
    }

    /**
     * Update the specified code snippet in storage.
     */
    public function update(Request $request, CodeSnippet $snippet): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'location' => ['required', 'in:header,body,footer'],
            'code' => ['required', 'string'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $snippet->update([
            'title' => $validated['title'],
            'location' => $validated['location'],
            'code' => $validated['code'],
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->back()->with('success', 'Code snippet updated successfully.');
    }

    /**
     * Remove the specified code snippet from storage.
     */
    public function destroy(CodeSnippet $snippet): RedirectResponse
    {
        $snippet->delete();

        return redirect()->back()->with('success', 'Code snippet deleted successfully.');
    }

    /**
     * Toggle snippet active status.
     */
    public function toggle(CodeSnippet $snippet): RedirectResponse
    {
        $snippet->update([
            'is_active' => !$snippet->is_active,
        ]);

        return redirect()->back()->with('success', 'Status updated successfully.');
    }
}
