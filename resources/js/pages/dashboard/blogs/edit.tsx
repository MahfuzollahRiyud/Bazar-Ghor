import MediaPickerModal, { type MediaItem } from '@/components/dashboard/MediaPickerModal';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Bold,
    Check,
    Globe,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Loader2,
    Newspaper,
    Quote,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface BlogPostItem {
    id: number;
    title: string;
    slug: string;
    category?: string | null;
    featured_image?: string | null;
    image_url?: string | null;
    excerpt?: string | null;
    content: string;
    author_name?: string | null;
    is_published: boolean;
    published_at?: string | null;
    views_count: number;
    meta_title?: string | null;
    meta_description?: string | null;
    tags?: string[] | null;
}

interface Props {
    post: BlogPostItem;
    existingCategories: string[];
}

export default function BlogEdit({ post, existingCategories }: Props) {
    const { t, language } = useAdminLanguage();

    const [title, setTitle] = useState(post.title || '');
    const [slug, setSlug] = useState(post.slug || '');
    const [category, setCategory] = useState(post.category || '');
    const [customCategory, setCustomCategory] = useState('');
    const [excerpt, setExcerpt] = useState(post.excerpt || '');
    const [content, setContent] = useState(post.content || '');
    const [authorName, setAuthorName] = useState(post.author_name || 'Bazar Ghor Team');
    const [isPublished, setIsPublished] = useState(post.is_published);
    const [tags, setTags] = useState(Array.isArray(post.tags) ? post.tags.join(', ') : '');
    const [metaTitle, setMetaTitle] = useState(post.meta_title || '');
    const [metaDescription, setMetaDescription] = useState(post.meta_description || '');

    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [mediaImagePath, setMediaImagePath] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string>(post.image_url || post.featured_image || '');
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setMediaImagePath('');
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleMediaSelect = (selected: MediaItem[]) => {
        if (selected.length > 0) {
            const item = selected[0];
            setMediaImagePath(item.file_path);
            setImageFile(null);
            setImagePreview(item.url);
            setMediaPickerOpen(false);
            toast.success(language === 'bn' ? 'ছবি নির্বাচন করা হয়েছে।' : 'Image selected from library.');
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setMediaImagePath('');
        setImagePreview('');
    };

    const insertFormatting = (before: string, after: string = '') => {
        const textarea = contentTextareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);

        const newText = text.substring(0, start) + before + selected + after + text.substring(end);
        setContent(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 10);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const formData = new FormData();
        formData.append('title', title);
        if (slug) formData.append('slug', slug);

        const finalCategory = category === 'new' ? customCategory : category;
        if (finalCategory) formData.append('category', finalCategory);

        if (excerpt) formData.append('excerpt', excerpt);
        formData.append('content', content);
        if (authorName) formData.append('author_name', authorName);
        formData.append('is_published', isPublished ? '1' : '0');
        if (tags) formData.append('tags', tags);
        if (metaTitle) formData.append('meta_title', metaTitle);
        if (metaDescription) formData.append('meta_description', metaDescription);

        if (imageFile) {
            formData.append('image', imageFile);
        } else if (mediaImagePath) {
            formData.append('featured_image', mediaImagePath);
        } else if (!imagePreview) {
            formData.append('featured_image', '');
        }

        router.post(`/dashboard/blogs/${post.id}`, formData, {
            forceFormData: true,
            onError: (errs) => {
                setErrors(errs);
                setSubmitting(false);
                toast.error(language === 'bn' ? 'অনুগ্রহ করে ফর্মের ভুলগুলো সংশোধন করুন।' : 'Please check form errors.');
            },
            onSuccess: () => {
                toast.success(language === 'bn' ? 'ব্লগ পোস্ট সফলভাবে আপডেট হয়েছে!' : 'Blog post updated successfully!');
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <>
            <Head title={language === 'bn' ? `সম্পাদনা: ${post.title} — Bazar Ghor Admin` : `Edit: ${post.title} — Bazar Ghor Admin`} />

            <div className="p-6 max-w-5xl mx-auto space-y-6">
                {/* Header & Back */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/dashboard/blogs"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-[#2d6a27] transition"
                    >
                        <ArrowLeft size={16} />
                        <span>{language === 'bn' ? 'ব্লগ তালিকায় ফিরে যান' : 'Back to Blogs'}</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        {post.is_published && (
                            <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-[#2d6a27] hover:underline flex items-center gap-1"
                            >
                                <span>{language === 'bn' ? 'লাইভ পোস্ট দেখুন' : 'View Live'}</span>
                                →
                            </a>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Editor Section (Left 2 cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Card: Basic Info */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
                                <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                                    <Newspaper size={18} className="text-[#2d6a27]" />
                                    <span>{t.editBlog}</span>
                                </h3>

                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                                        {t.blogTitle} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:border-[#2d6a27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a27]/20"
                                    />
                                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                                        {language === 'bn' ? 'ইউআরএল স্লাগ (Slug)' : 'URL Slug'}
                                    </label>
                                    <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-600 focus-within:border-[#2d6a27] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2d6a27]/20">
                                        <span className="text-gray-400 font-mono text-xs select-none">/blog/</span>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            className="w-full border-none bg-transparent p-0 text-sm font-mono text-gray-900 focus:outline-none focus:ring-0"
                                        />
                                    </div>
                                    {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
                                </div>

                                {/* Excerpt */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                                        {t.postExcerpt}
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-900 focus:border-[#2d6a27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a27]/20"
                                    />
                                    {errors.excerpt && <p className="text-xs text-red-500 mt-1">{errors.excerpt}</p>}
                                </div>
                            </div>

                            {/* Card: Rich Content Editor */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                                        {t.postContent} <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-xs text-gray-400">
                                        {content.length} {language === 'bn' ? 'অক্ষর' : 'chars'}
                                    </span>
                                </div>

                                {/* Toolbar */}
                                <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 pb-2">
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<h3>', '</h3>')}
                                        className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 font-bold text-xs"
                                        title="Heading 3"
                                    >
                                        H3
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<h4>', '</h4>')}
                                        className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 font-bold text-xs"
                                        title="Heading 4"
                                    >
                                        H4
                                    </button>
                                    <div className="h-4 w-px bg-gray-200 mx-1" />
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<strong>', '</strong>')}
                                        className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                                        title="Bold"
                                    >
                                        <Bold size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<em>', '</em>')}
                                        className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                                        title="Italic"
                                    >
                                        <Italic size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<blockquote>', '</blockquote>')}
                                        className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                                        title="Blockquote"
                                    >
                                        <Quote size={15} />
                                    </button>
                                    <div className="h-4 w-px bg-gray-200 mx-1" />
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
                                        className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                                        title="Unordered List"
                                    >
                                        <List size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<ol>\n  <li>', '</li>\n</ol>')}
                                        className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                                        title="Ordered List"
                                    >
                                        <ListOrdered size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertFormatting('<a href="https://" target="_blank">', '</a>')}
                                        className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                                        title="Hyperlink"
                                    >
                                        <LinkIcon size={15} />
                                    </button>
                                </div>

                                <textarea
                                    ref={contentTextareaRef}
                                    required
                                    rows={14}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm font-sans leading-relaxed text-gray-900 focus:border-[#2d6a27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a27]/20 font-normal"
                                />
                                {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
                            </div>

                            {/* Card: SEO Meta Settings */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
                                <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                                    <Globe size={18} className="text-blue-600" />
                                    <span>{language === 'bn' ? 'সার্চ ইঞ্জিন অপ্টিমাইজেশন (SEO)' : 'Search Engine Optimization (SEO)'}</span>
                                </h3>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                                        {t.metaTitle}
                                    </label>
                                    <input
                                        type="text"
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder={title}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm text-gray-900 focus:border-[#2d6a27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a27]/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                                        {t.metaDescription}
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        placeholder={excerpt}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-900 focus:border-[#2d6a27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a27]/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Options (Right 1 col) */}
                        <div className="space-y-6">
                            {/* Publishing Action Box */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
                                <h3 className="font-semibold text-gray-900 text-sm">
                                    {language === 'bn' ? 'পাবলিকেশন সেটিংস' : 'Publishing'}
                                </h3>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <span className="text-xs font-medium text-gray-700">{t.publishStatus}:</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isPublished}
                                            onChange={(e) => setIsPublished(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d6a27]"></div>
                                    </label>
                                </div>

                                {/* Author */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                                        {t.postAuthor}
                                    </label>
                                    <input
                                        type="text"
                                        value={authorName}
                                        onChange={(e) => setAuthorName(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:border-[#2d6a27] focus:bg-white focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d6a27] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#23531f] hover:shadow-md disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>{t.processing}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            <span>{t.update}</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Featured Image Box */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
                                <h3 className="font-semibold text-gray-900 text-sm flex items-center justify-between">
                                    <span>{t.featuredImage}</span>
                                    {imagePreview && (
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="text-xs text-red-500 hover:underline flex items-center gap-0.5"
                                        >
                                            <X size={12} /> {t.remove}
                                        </button>
                                    )}
                                </h3>

                                {imagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video">
                                        <img
                                            src={imagePreview}
                                            alt="Cover preview"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
                                        <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-xs text-gray-500">
                                            {language === 'bn' ? 'কভার ইমেজ আপলোড করুন বা লাইব্রেরি থেকে বেছে নিন' : 'Upload cover image or choose from media library'}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <label className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-2xs">
                                        <Upload size={14} />
                                        <span>{t.upload}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setMediaPickerOpen(true)}
                                        className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
                                    >
                                        <ImageIcon size={14} />
                                        <span>{language === 'bn' ? 'মিডিয়া' : 'Media'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Category Box */}
                            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
                                <h3 className="font-semibold text-gray-900 text-sm">
                                    {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                                </h3>

                                <div>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 focus:border-[#2d6a27] focus:bg-white focus:outline-none"
                                    >
                                        <option value="">{language === 'bn' ? 'ক্যাটাগরি নির্বাচন করুন' : 'Select a Category'}</option>
                                        {existingCategories.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                        <option value="new">+ {language === 'bn' ? 'নতুন ক্যাটাগরি তৈরি করুন' : 'Create New Category'}</option>
                                    </select>
                                </div>

                                {category === 'new' && (
                                    <div>
                                        <input
                                            type="text"
                                            value={customCategory}
                                            onChange={(e) => setCustomCategory(e.target.value)}
                                            placeholder={language === 'bn' ? 'নতুন ক্যাটাগরির নাম লিখুন...' : 'Enter new category name...'}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#2d6a27] focus:outline-none"
                                        />
                                    </div>
                                )}

                                {/* Tags */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                                        {language === 'bn' ? 'ট্যাগসমূহ (কমা দিয়ে আলাদা)' : 'Tags (comma separated)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="gadgets, airbuds, tips"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:border-[#2d6a27] focus:bg-white focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Media Library Picker Modal */}
            <MediaPickerModal
                isOpen={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
            />
        </>
    );
}
