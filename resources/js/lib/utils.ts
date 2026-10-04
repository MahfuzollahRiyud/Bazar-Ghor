import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Preserves paragraphs and line breaks for plain text descriptions,
 * while leaving rich HTML markup intact if already formatted.
 */
export function formatRichText(content: string | null | undefined): string {
    if (!content) return '';

    // If content already contains block HTML tags (<p, <div, <h1-6, <ul, <ol, <li, <table, <blockquote, <br, etc.)
    const hasHtmlBlocks = /<\/?(p|div|h[1-6]|ul|ol|li|table|blockquote|br|hr|pre|section|article)\b/i.test(content);
    if (hasHtmlBlocks) {
        return content;
    }

    // Split plain text by double newlines into distinct paragraphs, and replace single newlines with <br />
    const paragraphs = content
        .trim()
        .split(/\r?\n\s*\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean);

    if (paragraphs.length === 0) return '';

    return paragraphs
        .map((para) => `<p>${para.replace(/\r?\n/g, '<br />')}</p>`)
        .join('');
}

