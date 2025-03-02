import fetch from "cross-fetch";

const ANKI_URL = "http://127.0.0.1:8765";

interface BasicCardPayload {
  modelName: "Basic";
  fields: {
    Front: string;
    Back: string;
  };
}

interface AddCardsProps {
  deckName: string;
  payload: BasicCardPayload; // | ClozePayload maybe in the future :)
}

async function guiAddCards({ deckName, payload }: AddCardsProps) {
  const requestPayload = {
    action: "guiAddCards",
    version: 6,
    params: {
      note: {
        deckName: deckName,
        modelName: payload.modelName,
        fields: payload.fields,
      },
    },
  };
  await fetch(ANKI_URL, { method: "POST", body: JSON.stringify(requestPayload) });
}

export const anki = { guiAddCards };
