"use client";

import { Database } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";

export default function DatabaseDocsPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                 <div className="flex items-center gap-3 mb-2">
                    <Database className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-3xl font-bold text-slate-900">Database API</h1>
                </div>
                <p className="text-lg text-slate-600">
                    Manage custom content models and records.
                </p>
            </div>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Access a Collection</h2>
                <p className="text-slate-600 mb-4">
                    Access a specific content collection by its slug.
                </p>
                <CodeBlock
                    title="Get Collection Reference"
                    code={`const posts = swat.db.collection('blog-posts');`}
                />
            </section>

             <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">List Records</h2>
                <CodeBlock
                    title="List with Filters"
                    code={`const results = await swat.db.collection('blog-posts').list({
    limit: 10,
    offset: 0,
    filter: {
        status: 'published'
    }
});`}
                />
            </section>
            
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">CRUD Operations</h2>
                <p className="text-slate-600 mb-4">
                    Create, Read, Update, and Delete records in your collections.
                </p>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Create</h3>
                         <CodeBlock
                            title="Create Record"
                            code={`const newPost = await swat.db.collection('blog-posts').create({
    title: 'Hello World',
    slug: 'hello-world',
    content: 'This is my first post with SwatBloc.'
});`}
                        />
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Get by ID</h3>
                         <CodeBlock
                            title="Get Record"
                            code={`const post = await swat.db.collection('blog-posts').get('rec_12345');`}
                        />
                    </div>

                    <div>
                         <h3 className="text-lg font-semibold text-slate-800 mb-2">Update</h3>
                         <CodeBlock
                            title="Update Record"
                            code={`const updated = await swat.db.collection('blog-posts').update('rec_12345', {
    title: 'Hello SwatBloc (Updated)'
});`}
                        />
                    </div>

                     <div>
                         <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete</h3>
                         <CodeBlock
                            title="Delete Record"
                            code={`await swat.db.collection('blog-posts').delete('rec_12345');`}
                        />
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Schema Management</h2>
                <p className="text-slate-600 mb-4">
                    Programmatically create content models.
                </p>
                 <CodeBlock
                    title="Create Content Model"
                    code={`const model = await swat.db.createModel('Authors', 'authors', [
    { name: 'full_name', type: 'text', required: true },
    { name: 'bio', type: 'long_text' },
    { name: 'avatar_url', type: 'url' }
]);`}
                />
            </section>
        </div>
    );
}
