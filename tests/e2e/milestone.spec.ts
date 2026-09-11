import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    class FakeUtterance {
      text: string;
      rate = 1;
      lang = "en-US";
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: FakeUtterance,
      writable: true,
    });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        getVoices: () => [],
        speak: (u: FakeUtterance) => setTimeout(() => u.onend?.(), 50),
        cancel: () => {},
        pause: () => {},
        resume: () => {},
      },
      configurable: true,
    });
    Object.defineProperty(window, "SpeechRecognition", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: undefined,
      configurable: true,
    });
  });
});
test("home to ABC, fallback, star, B, persisted progress", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Hello, Explorer/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Learn ABC/ }).click();
  await page.getByRole("button", { name: "Start lesson" }).click();
  await expect(page.getByText("Your turn, little explorer!")).toBeVisible();
  await page.getByRole("button", { name: "Tap to speak", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Type your answer" }),
  ).toBeVisible();
  await page.getByLabel(/Or type your words/).fill("Apple");
  await page.getByRole("button", { name: "Send ↗" }).click();
  await expect(page.getByTestId("lesson-title")).toHaveText("B");
  await page.goto("/progress");
  await expect(page.getByText("1 stars")).toBeVisible();
  await expect(page.getByText("1/26")).toBeVisible();
});
test("talk renders transcript and speaks demo reply", async ({ page }) => {
  await page.goto("/talk");
  await expect(page.getByText(/Offline demo/)).toBeVisible();
  await page.getByLabel(/Or type your words/).fill("Why is the sky blue?");
  await page.getByRole("button", { name: "Send ↗" }).click();
  await expect(
    page.getByText("You said: “Why is the sky blue?”"),
  ).toBeVisible();
  await expect(page.getByText(/Air scatters blue light/).first()).toBeVisible();
  await expect(page.getByText("Your turn, little explorer!")).toBeVisible();
});
test("lesson previous, next and repeat controls", async ({ page }) => {
  await page.goto("/learn/alphabet");
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(page.getByTestId("lesson-title")).toHaveText("B");
  await page.getByRole("button", { name: "← Previous" }).click();
  await expect(page.getByTestId("lesson-title")).toHaveText("A");
  await page.getByRole("button", { name: "🔊 Repeat", exact: true }).click();
  await expect(page.getByText("Your turn, little explorer!")).toBeVisible();
});
test("voice recognition delivers Apple and avoids listening while speaking", async ({
  page,
}) => {
  await page.addInitScript(() => {
    class FakeRecognition {
      lang = "en-US";
      continuous = false;
      interimResults = false;
      onresult: ((e: { results: { transcript: string }[][] }) => void) | null =
        null;
      onerror = null;
      onend: (() => void) | null = null;
      start() {
        setTimeout(() => {
          this.onresult?.({ results: [[{ transcript: "Apple" }]] });
          this.onend?.();
        }, 50);
      }
      stop() {
        this.onend?.();
      }
      abort() {}
    }
    Object.defineProperty(window, "SpeechRecognition", {
      value: FakeRecognition,
      configurable: true,
    });
  });
  await page.goto("/learn/alphabet");
  await page.getByRole("button", { name: "Start lesson" }).click();
  await expect(page.getByText("Your turn, little explorer!")).toBeVisible();
  await page.getByRole("button", { name: "Tap to speak", exact: true }).click();
  await expect(page.getByTestId("lesson-title")).toHaveText("B");
});
