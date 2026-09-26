import { loadTutorialIndex } from "@/lib/tutorial-page";
import { TutorialsBrowser } from "@/components/tutorial/tutorials-browser";

export const dynamic = "force-static";

export default async function TutorialsPage() {
  const tutorials = await loadTutorialIndex();
  return <TutorialsBrowser tutorials={tutorials} />;
}
