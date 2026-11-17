import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { Plus, Trash2, RotateCcw, Save } from 'lucide-react';
import { getApiError } from '../../utils/apiError';

/* ================= TYPES ================= */

type Milestone = { days: string; coins: string };
type Tier = { minAmount: string; coins: string };

type RewardsForm = {
    coinsPerRupee: string;
    welcomeCoins: string;
    referrerCoins: string;
    refereeCoins: string;
    gymVisitCoins: string;
    coinExpiryDays: string;
    streakMilestones: Milestone[];
    rechargeTiers: Tier[];
};

type RewardsApi = {
    coinsPerRupee: number;
    welcomeCoins: number;
    referrerCoins: number;
    refereeCoins: number;
    gymVisitCoins: number;
    coinExpiryDays: number;
    streakMilestones: { days: number; coins: number }[];
    rechargeTiers: { minAmount: number; coins: number }[];
    updatedAt: string | null;
};

const API = `${import.meta.env.VITE_API_LIVEHOST}/v1/admin/settings/rewards`;
const MAX_ROWS = 10;

const toForm = (r: RewardsApi): RewardsForm => ({
    coinsPerRupee: String(r.coinsPerRupee),
    welcomeCoins: String(r.welcomeCoins),
    referrerCoins: String(r.referrerCoins),
    refereeCoins: String(r.refereeCoins),
    gymVisitCoins: String(r.gymVisitCoins),
    coinExpiryDays: String(r.coinExpiryDays),
    streakMilestones: r.streakMilestones.map((m) => ({ days: String(m.days), coins: String(m.coins) })),
    rechargeTiers: r.rechargeTiers.map((t) => ({ minAmount: String(t.minAmount), coins: String(t.coins) })),
});

// Number('') is 0, so empty boxes are caught here instead of being saved as 0
const toWhole = (value: string): number | null => {
    if (value.trim() === '') return null;
    const n = Number(value);
    return Number.isInteger(n) ? n : null;
};

const formatRupees = (coins: number, rate: number) => {
    if (!rate || rate <= 0 || !Number.isFinite(coins)) return '—';
    const value = coins / rate;
    return `₹${Number.isInteger(value) ? value : value.toFixed(2)}`;
};

/* ================= SMALL UI PIECES ================= */

const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-[#1b2e4b] rounded-lg border border-gray-200 dark:border-[#253b5c] p-5">
        <h2 className="text-lg font-semibold text-[#113354] dark:text-white">{title}</h2>
        {hint && <p className="text-sm text-gray-500 mt-1">{hint}</p>}
        <div className="mt-4">{children}</div>
    </div>
);

const NumberField = ({
    label,
    value,
    onChange,
    suffix,
    helper,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    suffix?: string;
    helper?: string;
}) => (
    <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <div className="mt-1 flex items-center border border-gray-300 dark:border-[#253b5c] rounded focus-within:border-[#113354]">
            <input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className="w-full px-3 py-2 bg-transparent outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {suffix && <span className="px-3 text-sm text-gray-500 whitespace-nowrap">{suffix}</span>}
        </div>
        {helper && <span className="text-xs text-gray-500 mt-1 block">{helper}</span>}
    </label>
);

/* ================= PAGE ================= */

export default function RewardSettings() {
    const [form, setForm] = useState<RewardsForm | null>(null);
    const [saved, setSaved] = useState<RewardsForm | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const { data } = await axios.get(API, { headers: { token: Cookies.get('token') } });
            const next = toForm(data.data);
            setForm(next);
            setSaved(next);
            setUpdatedAt(data.data.updatedAt);
        } catch (err) {
            setLoadError(getApiError(err, 'Could not load reward settings'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const rate = toWhole(form?.coinsPerRupee ?? '') ?? 0;
    const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
    const rateChanged = form && saved && form.coinsPerRupee !== saved.coinsPerRupee;

    if (loading) {
        return <div className="p-6 text-gray-500">Loading reward settings…</div>;
    }

    if (loadError || !form) {
        return (
            <div className="p-6">
                <p className="text-red-600">{loadError}</p>
                <button className="mt-3 px-4 py-2 rounded bg-[#113354] text-white" onClick={load}>
                    Try again
                </button>
            </div>
        );
    }

    const setField = (key: keyof RewardsForm) => (value: string) => setForm({ ...form, [key]: value });

    const updateMilestone = (i: number, key: keyof Milestone, value: string) =>
        setForm({
            ...form,
            streakMilestones: form.streakMilestones.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)),
        });

    const updateTier = (i: number, key: keyof Tier, value: string) =>
        setForm({
            ...form,
            rechargeTiers: form.rechargeTiers.map((t, idx) => (idx === i ? { ...t, [key]: value } : t)),
        });

    // Mirrors the backend checks so the admin sees the problem before saving
    const buildPayload = (): { payload?: Omit<RewardsApi, 'updatedAt'>; error?: string } => {
        const fields: [keyof RewardsForm, string, number, number][] = [
            ['coinsPerRupee', 'Coins per ₹1', 1, 1000],
            ['welcomeCoins', 'Welcome bonus', 0, 100000],
            ['referrerCoins', 'Referrer reward', 0, 100000],
            ['refereeCoins', 'New user referral reward', 0, 100000],
            ['gymVisitCoins', 'Gym visit coins', 0, 100000],
            ['coinExpiryDays', 'Coin expiry days', 1, 3650],
        ];

        const out: any = {};
        for (const [key, label, min, max] of fields) {
            const n = toWhole(form[key] as string);
            if (n === null || n < min || n > max) {
                return { error: `${label} must be a whole number between ${min} and ${max}` };
            }
            out[key] = n;
        }

        const days = new Set<number>();
        out.streakMilestones = [];
        for (const m of form.streakMilestones) {
            const d = toWhole(m.days);
            const c = toWhole(m.coins);
            if (d === null || d < 1 || d > 365) return { error: 'Streak days must be a whole number between 1 and 365' };
            if (c === null || c < 0 || c > 100000) return { error: 'Streak coins must be a whole number between 0 and 100000' };
            if (days.has(d)) return { error: `Streak milestone for day ${d} is listed twice` };
            days.add(d);
            out.streakMilestones.push({ days: d, coins: c });
        }

        const amounts = new Set<number>();
        out.rechargeTiers = [];
        for (const t of form.rechargeTiers) {
            const a = toWhole(t.minAmount);
            const c = toWhole(t.coins);
            if (a === null || a < 1 || a > 100000) return { error: 'Recharge amount must be a whole number between 1 and 100000' };
            if (c === null || c < 0 || c > 100000) return { error: 'Recharge coins must be a whole number between 0 and 100000' };
            if (amounts.has(a)) return { error: `Recharge tier for ₹${a} is listed twice` };
            amounts.add(a);
            out.rechargeTiers.push({ minAmount: a, coins: c });
        }

        return { payload: out };
    };

    const save = async () => {
        const { payload, error } = buildPayload();
        if (error) {
            toast.error(error);
            return;
        }

        setSaving(true);
        try {
            const { data } = await axios.put(API, payload, { headers: { token: Cookies.get('token') } });
            const next = toForm(data.data);
            setForm(next);
            setSaved(next);
            setUpdatedAt(data.data.updatedAt);
            toast.success('Reward settings saved. New rewards use these values from now on.');
        } catch (err) {
            toast.error(getApiError(err, 'Could not save reward settings'));
        } finally {
            setSaving(false);
        }
    };

    // Not re-sorted while typing (rows would jump); the server returns them sorted after a save
    const sortedTiers = form.rechargeTiers.map((t, i) => ({ ...t, i }));
    const sortedMilestones = form.streakMilestones.map((m, i) => ({ ...m, i }));

    return (
        <div className="p-6 bg-gray-50 dark:bg-transparent min-h-screen">
            <div className="flex flex-wrap gap-3 justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#113354] dark:text-white">Coins & Rewards</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        How many coins users earn for each action, and what a coin is worth.
                        {updatedAt && <> Last saved {new Date(updatedAt).toLocaleString()}.</>}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 disabled:opacity-50"
                        disabled={!isDirty || saving}
                        onClick={() => setForm(saved)}
                    >
                        <RotateCcw size={16} /> Discard changes
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded bg-[#113354] text-white disabled:opacity-50"
                        disabled={!isDirty || saving}
                        onClick={save}
                    >
                        <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </div>

            <div className="space-y-5 max-w-4xl">
                {/* ================= COIN VALUE ================= */}
                <Section title="Coin value" hint="How many coins are worth ₹1. The app shows this rate and the ₹ value of each user's balance.">
                    <div className="grid sm:grid-cols-2 gap-4 items-end">
                        <NumberField label="Coins per ₹1" value={form.coinsPerRupee} onChange={setField('coinsPerRupee')} suffix="coins = ₹1" />
                        <div className="text-sm text-gray-600 dark:text-gray-300 pb-2">
                            1 coin = {formatRupees(1, rate)} &nbsp;·&nbsp; 1,000 coins = {formatRupees(1000, rate)}
                        </div>
                    </div>
                    {rateChanged && (
                        <p className="mt-3 text-sm rounded bg-amber-50 text-amber-800 border border-amber-200 px-3 py-2">
                            Changing the rate changes the ₹ value of every coin users already hold, not just new ones.
                        </p>
                    )}
                </Section>

                {/* ================= ONE-TIME & PER-VISIT ================= */}
                <Section title="Bonuses" hint="Set any bonus to 0 to turn it off.">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <NumberField
                            label="Welcome bonus (new signup)"
                            value={form.welcomeCoins}
                            onChange={setField('welcomeCoins')}
                            suffix="coins"
                            helper={`Worth ${formatRupees(toWhole(form.welcomeCoins) ?? NaN, rate)}`}
                        />
                        <NumberField
                            label="Gym visit (per day, first payment)"
                            value={form.gymVisitCoins}
                            onChange={setField('gymVisitCoins')}
                            suffix="coins"
                            helper={`Worth ${formatRupees(toWhole(form.gymVisitCoins) ?? NaN, rate)}`}
                        />
                        <NumberField
                            label="Referral: person who shared the code"
                            value={form.referrerCoins}
                            onChange={setField('referrerCoins')}
                            suffix="coins"
                            helper={`Worth ${formatRupees(toWhole(form.referrerCoins) ?? NaN, rate)} · paid when the friend first tops up or pays a gym`}
                        />
                        <NumberField
                            label="Referral: new user who used the code"
                            value={form.refereeCoins}
                            onChange={setField('refereeCoins')}
                            suffix="coins"
                            helper={`Worth ${formatRupees(toWhole(form.refereeCoins) ?? NaN, rate)} · paid at the same time`}
                        />
                    </div>
                </Section>

                {/* ================= STREAK ================= */}
                <Section title="Streak milestones" hint="Extra coins when a user visits a gym this many days in a row. Each milestone is paid once per user.">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="py-2 pr-3 font-medium">Days in a row</th>
                                    <th className="py-2 pr-3 font-medium">Coins</th>
                                    <th className="py-2 pr-3 font-medium">Worth</th>
                                    <th className="py-2 w-10" />
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMilestones.map((m) => (
                                    <tr key={m.i} className="border-b last:border-0">
                                        <td className="py-2 pr-3">
                                            <input type="number" min={1} className="w-28 border rounded px-2 py-1 bg-transparent" value={m.days} onChange={(e) => updateMilestone(m.i, 'days', e.target.value)} />
                                        </td>
                                        <td className="py-2 pr-3">
                                            <input type="number" min={0} className="w-28 border rounded px-2 py-1 bg-transparent" value={m.coins} onChange={(e) => updateMilestone(m.i, 'coins', e.target.value)} />
                                        </td>
                                        <td className="py-2 pr-3 text-gray-600">{formatRupees(toWhole(m.coins) ?? NaN, rate)}</td>
                                        <td className="py-2">
                                            <button
                                                className="text-gray-400 hover:text-red-600"
                                                title="Remove milestone"
                                                onClick={() => setForm({ ...form, streakMilestones: form.streakMilestones.filter((_, idx) => idx !== m.i) })}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {form.streakMilestones.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-3 text-gray-500">No streak milestones. Streak bonuses are off.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <button
                        className="mt-3 flex items-center gap-1 text-sm text-[#113354] dark:text-blue-300 disabled:opacity-50"
                        disabled={form.streakMilestones.length >= MAX_ROWS}
                        onClick={() => setForm({ ...form, streakMilestones: [...form.streakMilestones, { days: '', coins: '' }] })}
                    >
                        <Plus size={16} /> Add milestone
                    </button>
                </Section>

                {/* ================= RECHARGE ================= */}
                <Section title="Recharge bonus" hint="Coins for a wallet top-up. A top-up gets the bonus of the highest tier it reaches; below the lowest tier it gets nothing.">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="py-2 pr-3 font-medium">Top-up of at least</th>
                                    <th className="py-2 pr-3 font-medium">Coins</th>
                                    <th className="py-2 pr-3 font-medium">Worth</th>
                                    <th className="py-2 pr-3 font-medium">Cashback</th>
                                    <th className="py-2 w-10" />
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTiers.map((t) => {
                                    const amount = toWhole(t.minAmount);
                                    const coins = toWhole(t.coins);
                                    const cashback = amount && coins !== null && rate ? ((coins / rate / amount) * 100).toFixed(1) + '%' : '—';
                                    return (
                                        <tr key={t.i} className="border-b last:border-0">
                                            <td className="py-2 pr-3">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-500">₹</span>
                                                    <input type="number" min={1} className="w-28 border rounded px-2 py-1 bg-transparent" value={t.minAmount} onChange={(e) => updateTier(t.i, 'minAmount', e.target.value)} />
                                                </div>
                                            </td>
                                            <td className="py-2 pr-3">
                                                <input type="number" min={0} className="w-28 border rounded px-2 py-1 bg-transparent" value={t.coins} onChange={(e) => updateTier(t.i, 'coins', e.target.value)} />
                                            </td>
                                            <td className="py-2 pr-3 text-gray-600">{formatRupees(coins ?? NaN, rate)}</td>
                                            <td className="py-2 pr-3 text-gray-600">{cashback}</td>
                                            <td className="py-2">
                                                <button
                                                    className="text-gray-400 hover:text-red-600"
                                                    title="Remove tier"
                                                    onClick={() => setForm({ ...form, rechargeTiers: form.rechargeTiers.filter((_, idx) => idx !== t.i) })}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {form.rechargeTiers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-3 text-gray-500">No tiers. Recharge bonuses are off.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <button
                        className="mt-3 flex items-center gap-1 text-sm text-[#113354] dark:text-blue-300 disabled:opacity-50"
                        disabled={form.rechargeTiers.length >= MAX_ROWS}
                        onClick={() => setForm({ ...form, rechargeTiers: [...form.rechargeTiers, { minAmount: '', coins: '' }] })}
                    >
                        <Plus size={16} /> Add tier
                    </button>
                </Section>

                {/* ================= EXPIRY ================= */}
                <Section title="Coin expiry" hint="Saved on each new coin reward. Expired coins are not removed automatically yet.">
                    <div className="max-w-xs">
                        <NumberField label="Coins expire after" value={form.coinExpiryDays} onChange={setField('coinExpiryDays')} suffix="days" />
                    </div>
                </Section>

                <p className="text-xs text-gray-500">
                    Changes apply to coins earned after you save. Coins users already earned stay as they are. The servers pick up new values within about a minute.
                </p>
            </div>
        </div>
    );
}
