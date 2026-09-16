'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, User, CheckCircle2, Loader2, Receipt, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileNav from './MobileNav';
import LogoutButton from '@/components/LogoutButton';
import { useUser } from '@/context/UserContext';
import { globalSearch, SearchResultItem } from '@/app/actions/search';

export default function Header() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { profile, loading, mounted } = useUser();

  // Search States
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // CHANGED: Extracted input handling into a direct handler function.
  // Clearing search results synchronously here prevents triggering cascading renders inside useEffect.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    // CHANGED: If user deletes text under 2 chars, reset dropdown state immediately outside of an effect
    if (val.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
    }
  };

  // CHANGED: Cleaned up useEffect to strictly handle the async debounced search API call.
  // Removed synchronous setState calls from the top of the effect body.
  useEffect(() => {
    if (query.trim().length < 2) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const data = await globalSearch(query);
      setResults(data);
      setIsSearching(false);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(url);
  };

  const displayName = profile?.full_name || 'Member';
  const displayRole = profile?.role || 'Member';

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Open Mobile Menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Dynamic Search Component */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={query}
                /* CHANGED: Swapped inline setQuery for handleInputChange */
                onChange={handleInputChange}
                onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
                placeholder="Search member, receipt..."
                className="pl-9 pr-8 py-2 text-sm bg-slate-100 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all border border-transparent focus:border-emerald-500"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>

            {/* Results Dropdown */}
            {isOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 py-1">
                {results.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500 italic text-center">
                    {isSearching ? 'Searching database...' : 'No matching results found.'}
                  </div>
                ) : (
                  results.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelect(item.url)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b last:border-0 border-slate-100"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        {item.type === 'member' ? (
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Receipt className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>M-Pesa Live Sync</span>
          </div>

          <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm ring-2 ring-slate-100 uppercase">
              {!mounted || loading ? (
                <User className="h-5 w-5 text-slate-400" />
              ) : (
                displayName.charAt(0)
              )}
            </div>
            <div className="hidden sm:block text-left">
              {!mounted || loading ? (
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-slate-200 animate-pulse rounded" />
                  <div className="h-2 w-12 bg-slate-100 animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-900 leading-none">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 capitalize">
                    {displayRole}
                  </p>
                </>
              )}
            </div>
            <div className="pl-1">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <MobileNav isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </>
  );
}