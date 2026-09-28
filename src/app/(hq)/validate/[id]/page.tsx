import { redirect } from "next/navigation";

export default async function ValidateIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/validate?id=${id}`);
}
