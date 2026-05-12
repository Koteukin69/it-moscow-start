import SpecialtyCard from "@/components/parent/specialty-card";
import { prisma } from "@/lib/db/prisma";
import {mergeWithDefaults} from "@/lib/merge-specialties";

export default async function ParentDirections() {
  const docs = await prisma.specialty.findMany();
  const specialties = mergeWithDefaults(docs as never);

  return (
    <section id="directions" className="mx-auto max-w-6xl px-10 py-20 sm:px-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Какое направление выбрать ребёнку?
        </h2>
        <p className="mx-auto max-w-3xl text-muted-foreground">
          13 востребованных специальностей и профессий с трудоустройством в ведущие компании страны
        </p>
      </div>

      <div className="grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {specialties.map((specialtyData) => (
          <SpecialtyCard key={specialtyData.id} specialtyData={specialtyData}/>
        ))}
      </div>
    </section>
  );
}
