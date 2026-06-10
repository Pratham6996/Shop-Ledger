import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">App information and configuration</p>
      </div>

      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> ShopLedger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>A simple transaction ledger for tracking money received and sent by your business.</p>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <div>
              <p className="text-gray-400 font-medium">Version</p>
              <p>1.0.0</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Database</p>
              <p>Supabase / PostgreSQL</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Currency</p>
              <p>Indian Rupees (₹)</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Built with</p>
              <p>Next.js 15 + Tailwind</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Supabase Configuration</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            Connection is configured via environment variables. To update your Supabase project,
            edit the <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">.env.local</code> file:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...`}
          </pre>
          <p className="text-xs text-gray-400">
            For Vercel / Netlify deployment, add these as environment variables in your hosting dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
