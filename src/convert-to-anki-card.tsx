import { Action, ActionPanel, AI, Detail, Form, getSelectedText, List, showToast } from "@raycast/api";
import { showFailureToast, usePromise } from "@raycast/utils";

function preparePrompt(selectedText: string) {
  return `
    You are an expert for spaced repetition based learning. You will convert the following information, 
    which may also be in german, to one or more learning cards optimized for spaced repitition.

    The following criteria are of utmost importance for the cards:
      1. Keep the language the same as the input
      2. Cards should be self-contained. All context required to answer the question NEEDS to be in the question itself.
      3. Cards should be atomic, meaning they should be as small as possible and only ask for ONE specific piece of knowledge
    
    Please return the cards as a JSON array in the following format:
    [{"question": "my question 1?", "answer": "my answer 1"}]

    NOW FOLLOWS THE SELECTED TEXT:

    ${selectedText}
  `;
}

function extractJsonFromMarkdown(markdown: string) {
  const jsonRegex = /(```json((.|\n)*)```)/g;
  const matches = markdown.match(jsonRegex);

  const match = matches?.[0];
  return match?.replace(/```json|```/g, "").trim();
}

interface AnkiCard {
  question: string;
  answer: string;
}

async function ankiCardFromSelection(): Promise<AnkiCard[]> {
  const selectedText = await getSelectedText();

  if (selectedText == null) {
    await showToast({
      title: "No selected text found",
    });
    return [];
  }

  const prompt = preparePrompt(selectedText);
  const aiResponse = await AI.ask(prompt).then((t) => extractJsonFromMarkdown(t));

  if (aiResponse == null) {
    console.log(prompt);
    showFailureToast(prompt, {
      message: "unable to parse AI response as JSON",
    });
    return [];
  }

  return JSON.parse(aiResponse) as unknown as AnkiCard[];
}

function cardToMarkdown(card: AnkiCard) {
  return `# Frage: \n${card.question} \n\n# Antwort:\n${card.answer}`;
}

export default function Command() {
  const cards = usePromise(ankiCardFromSelection);

  return (
    <List isShowingDetail={true} isLoading={cards.isLoading}>
      {cards.data &&
        cards.data.map((c, i) => (
          <List.Item
            key={i}
            title={c.question}
            detail={<List.Item.Detail markdown={cardToMarkdown(c)}></List.Item.Detail>}
          />
        ))}
    </List>
  );
}
