import fs from 'node:fs';

const cacheFile = 'data/seen-runs.json';

function loadSeen(): Set<string> | null {
  try {
    return new Set<string>(JSON.parse(fs.readFileSync(cacheFile, 'utf8')));
  } catch {
    return null;
  }
}

let seen = loadSeen();

async function saveSeen(ids: Set<string>) {
  await fs.promises.mkdir('data', { recursive: true });
  await fs.promises.writeFile(cacheFile + '.tmp', JSON.stringify([...ids]));
  await fs.promises.rename(cacheFile + '.tmp', cacheFile);
}

const baseUrl =
  'https://www.speedrun.com/api/v1/runs?status=new&orderBy=submitted&max=200&direction=desc&game=';

type Run = {
  id: string;
  weblink: string;
  submitted: string;
};

async function getNewRuns(gameId: string): Promise<Run[]> {
  const res = await fetch(baseUrl + gameId, {
    headers: { 'User-Agent': 'discord-speedrun-moderation-bot' },
  });

  if (!res.ok) throw new Error(`speedrun.com responded ${res.status}`);
  const body = (await res.json()) as { data: Run[] };

  return body.data;
}

export async function checkForNewRuns(gameId: string): Promise<Run[]> {
  let runs: Run[];
  try {
    runs = await getNewRuns(gameId);
  } catch (err) {
    console.error('Fetching runs failed:', err);
    return [];
  }

  const current = new Set(runs.map((r) => r.id));
  const newRuns = seen ? runs.filter((r) => !seen!.has(r.id)) : [];

  const changed = !seen || seen.size !== current.size || [...current].some((id) => !seen!.has(id));
  if (changed) await saveSeen(current);
  seen = current;

  return newRuns;
}
