import { ReportForm } from "@/components/report/report-form";
import { getRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Registrar Denúncia — LinhaMap",
};

/** Cadastro de denúncia colaborativa (Seção 6.4). */
export default async function DenunciaPage({
  searchParams,
}: {
  searchParams: { segment?: string };
}) {
  const repo = getRepository();
  const segments = (await repo.listSegments()).map((s) => ({
    id: s.id,
    name: s.name,
    rural_line: s.rural_line,
  }));

  return (
    <div className="container max-w-2xl py-12">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Registrar denúncia</h1>
        <p className="text-muted-foreground">
          Relate um problema em uma linha vicinal. Sua contribuição atualiza o risco do
          trecho e ajuda a Secretaria a priorizar a manutenção.
        </p>
      </div>
      <ReportForm segments={segments} preselectedSegmentId={searchParams.segment} />
    </div>
  );
}
