<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('about');
    }

    public function contact(): Response
    {
        return Inertia::render('contact');
    }

    public function cart(): Response
    {
        return Inertia::render('cart');
    }
}
