import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "learning-settings",
      JSON.stringify({ voice: false, soundEffects: false }),
    );
  });
});
test("numbers, shapes, rhymes, stories all load and navigate", async ({
  page,
}) => {
  await page.goto("/learn/numbers");
  await expect(page.getByTestId("lesson-title")).toHaveText("1");
  await page.getByLabel(/Or type your words/).fill("one");
  await page.getByRole("button", { name: "Send ↗" }).click();
  await expect(page.getByTestId("lesson-title")).toHaveText("2");
  await page.goto("/learn/shapes");
  await expect(
    page.getByRole("img", { name: "circle", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next →" }).click();
  await expect(
    page.getByRole("img", { name: "square", exact: true }),
  ).toBeVisible();
  await page.goto("/learn/rhymes");
  await expect(
    page.getByRole("heading", { name: "Little Seed" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next line →" }).click();
  await page.goto("/learn/stories");
  await page.getByRole("button", { name: "Next page →" }).click();
  await expect(page.getByText(/Lulu the duck wanted/)).toBeVisible();
});
test("verbal quiz fallback scores and saves only once", async ({ page }) => {
  await page.goto("/quiz");
  for (const answer of ["c", "a", "e"]) {
    await page.getByLabel(/Or type your words/).fill(answer);
    await page.getByRole("button", { name: "Send ↗" }).click();
    await expect(page.getByText("Let me think…")).toHaveCount(0);
  }
  await expect(
    page.getByText("3 discoveries out of 3. You are growing!"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save stars", exact: true }).click();
  await expect(page.getByText("Your quiz stars are saved!")).toBeVisible();
  await page.reload();
  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "3 stars", exact: true })).toBeVisible();
});
test("teacher commands reach child tab and pause/resume lesson", async ({
  page,
  context,
}) => {
  await page.goto("/child");
  await expect(
    page.getByRole("heading", { name: /Hello, Explorer/ }),
  ).toBeVisible();
  await expect
    .poll(async () => {
      const response = await page.request.get("/api/profile");
      return response.status();
    })
    .toBe(200);
  const teacher = await context.newPage();
  await teacher.goto("/teacher");
  await expect(teacher.getByText("🟢 Classroom connected")).toBeVisible({
    timeout: 12000,
  });
  await teacher.getByRole("button", { name: "▶ Start / resume" }).click();
  await expect(page).toHaveURL(/learn\/alphabet/);
  await teacher.getByRole("button", { name: "Ⅱ Pause lesson" }).click();
  await expect(page.getByText(/Your teacher paused this lesson/)).toBeVisible();
  await teacher.getByRole("button", { name: "▶ Start / resume" }).click();
  await expect(
    page.getByRole("button", { name: "Tap to speak", exact: true }),
  ).toBeVisible();
  await teacher.getByRole("button", { name: "⭐ Give star" }).click();
  await expect(
    page.getByText("Your teacher gave you a star! ⭐"),
  ).toBeVisible();
  await teacher
    .getByRole("button", { name: "Send question", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Your human teacher" }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByLabel(/Or type your words/)
    .fill("I like apples");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Send ↗" })
    .click();
  await expect(teacher.getByText("I like apples")).toBeVisible();
  await teacher
    .getByRole("button", { name: "End session", exact: true })
    .click();
  await expect(page).toHaveURL(/child/);
  await teacher.close();
});
test("desktop and mobile home have no horizontal overflow", async ({
  page,
}) => {
  await page.goto("/child");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
});
