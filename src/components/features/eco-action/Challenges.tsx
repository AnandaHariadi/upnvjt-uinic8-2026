"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Check, Clock, Loader2, Users } from "lucide-react";
import { GREEN_ACTIONS } from "@/config/green-actions";
import { SUPPORTING_ECOPOINT_SOURCES } from "@/config/eco-points";
import {
  useEcoActionStore, challengeDaysLeft, challengeProgressPercent, type Challenge,
} from "@/store/ecoAction.store";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/utils/cn";
import { GreenActionIcon } from "@/components/common/icons";

function ChallengeCard({ challenge, joining, onJoin }: { challenge: Challenge; joining: boolean; onJoin: () => void }) {
  const action = GREEN_ACTIONS[challenge.actionType];
  const pct = challengeProgressPercent(challenge);
  const color = challenge.isCompleted ? "#10B981" : challenge.iconColor;

  return (
    <article
      className={cn(
        "flex flex-col rounded-[12px] border bg-white p-4 shadow-sm",
        challenge.isCompleted ? "border-emerald-200 bg-emerald-50/40" : "border-[#E5E7EB]"
      )}
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <GreenActionIcon type={challenge.actionType} size={24} />
        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${color}18`, color }}>
          {action.labelId}
        </span>
      </div>
      <h3 className="text-sm font-bold text-[#1A1A1A]">{challenge.title}</h3>
      <p className="mb-3 mt-1 flex-1 text-xs leading-relaxed text-gray-600">{challenge.description}</p>

      <div className="mb-1 flex justify-between text-xs">
        <span className="text-gray-500">Aksi Terverifikasi</span>
        <span className="font-semibold" style={{ color }}>{challenge.progress}/{challenge.target}</span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label={`Progres ${challenge.title}`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>

      <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Clock size={11} aria-hidden="true" /> Sisa {challengeDaysLeft(challenge)} hari</span>
        <span className="flex items-center gap-1" title="Jumlah peserta tantangan"><Users size={11} aria-hidden="true" /> {challenge.participants}</span>
        <span className="ml-auto rounded-full bg-[#7AC74F]/15 px-2 py-0.5 text-[10px] font-bold text-[#3F7A1F]">+{challenge.ecoPointsReward} EcoPoints</span>
      </div>

      {challenge.isCompleted ? (
        <p className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-700">
          <CheckCircle size={13} aria-hidden="true" /> Tantangan Selesai
        </p>
      ) : challenge.isJoined ? (
        <p className="flex items-center justify-center gap-1.5 rounded-lg bg-[#2D5F3F]/10 py-2 text-xs font-semibold text-[#2D5F3F]">
          <Check size={13} aria-hidden="true" /> Sedang Diikuti
        </p>
      ) : (
        <button
          type="button"
          onClick={onJoin}
          disabled={joining}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2D5F3F] py-2 text-xs font-semibold text-white hover:bg-[#245033] disabled:opacity-60"
        >
          {joining ? <><Loader2 size={13} className="animate-spin" aria-hidden="true" /> Mendaftar…</> : "Ikuti Tantangan"}
        </button>
      )}
    </article>
  );
}

export default function Challenges() {
  const hydrated = useHydrated();
  const challenges = useEcoActionStore((s) => s.challenges);
  const joinChallenge = useEcoActionStore((s) => s.joinChallenge);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const handleJoin = async (c: Challenge) => {
    setJoiningId(c.id);
    await new Promise((r) => setTimeout(r, 400));
    joinChallenge(c.id);
    setJoiningId(null);
    toast.success(`Berhasil bergabung di "${c.title}" (+${SUPPORTING_ECOPOINT_SOURCES.CHALLENGE_JOIN.amount} EcoPoints)`);
  };

  return (
    <section aria-labelledby="challenges-heading" className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 id="challenges-heading" className="text-base font-bold text-[#1A1A1A]">Tantangan Komunitas Aktif</h2>
        <p className="text-xs text-gray-500">Progres tantangan hanya bertambah melalui aksi hijau yang terverifikasi.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(hydrated ? challenges : []).map((c) => (
          <ChallengeCard key={c.id} challenge={c} joining={joiningId === c.id} onJoin={() => handleJoin(c)} />
        ))}
      </div>
    </section>
  );
}
